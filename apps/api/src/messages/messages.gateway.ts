import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';

const MAX_MESSAGE_LENGTH = 2000;
// Allow at most 10 messages per 10 seconds per socket
const RATE_WINDOW_MS = 10_000;
const RATE_MAX_MSGS  = 10;

@WebSocketGateway({
  cors: {
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
  },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private messages: MessagesService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const cookieHeader = socket.handshake.headers?.cookie ?? '';
      const cookieToken = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('token='))
        ?.slice('token='.length);

      const token =
        cookieToken ??
        (socket.handshake.auth?.token as string | undefined) ??
        (socket.handshake.query?.token as string | undefined);

      if (!token) return socket.disconnect();
      const payload = this.jwt.verify<{ sub: string }>(token);
      socket.data.userId = payload.sub;
      // Rate-limit state: message timestamps in the current window
      socket.data.msgTimestamps = [] as number[];
    } catch {
      socket.disconnect();
    }
  }

  @SubscribeMessage('join_chat')
  async joinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { taskId: string; partnerId: string },
  ) {
    if (!isValidUuid(data.taskId) || !isValidUuid(data.partnerId)) return;

    const room = chatRoom(data.taskId, socket.data.userId, data.partnerId);
    socket.join(room);
    socket.data.activeRoom = room;
    socket.data.partnerId = data.partnerId;
    socket.data.taskId = data.taskId;

    await this.messages.markRead(data.taskId, socket.data.userId, data.partnerId);
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { content: string; attachmentUrl?: string },
  ) {
    const { userId, taskId, partnerId, activeRoom } = socket.data;
    if (!taskId || !partnerId) return;

    // Per-socket rate limiting
    const now = Date.now();
    const timestamps: number[] = socket.data.msgTimestamps ?? [];
    const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX_MSGS) return;
    socket.data.msgTimestamps = [...recent, now];

    if (!data.content || typeof data.content !== 'string') return;
    const content = data.content.trim();
    if (content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return;

    const attachmentUrl =
      data.attachmentUrl && /^\/api\/files\/[a-f0-9]+\.(jpg|jpeg|png|webp|gif)$/i.test(data.attachmentUrl)
        ? data.attachmentUrl
        : undefined;

    const message = await this.messages.create(taskId, userId, partnerId, content, attachmentUrl);

    this.server.to(activeRoom).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { isTyping: boolean },
  ) {
    if (!socket.data.activeRoom) return;
    socket.to(socket.data.activeRoom).emit('partner_typing', { isTyping: !!data.isTyping });
  }

  pushMessage(taskId: string, senderId: string, recipientId: string, message: object) {
    const room = chatRoom(taskId, senderId, recipientId);
    this.server.to(room).emit('new_message', message);
  }
}

function chatRoom(taskId: string, a: string, b: string): string {
  const sorted = [a, b].sort().join(':');
  return `chat:${taskId}:${sorted}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(v: string): boolean {
  return UUID_RE.test(v);
}
