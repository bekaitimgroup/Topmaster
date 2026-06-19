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

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private messages: MessagesService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake.auth?.token as string) ??
        (socket.handshake.query?.token as string);
      const payload = this.jwt.verify<{ sub: string }>(token);
      socket.data.userId = payload.sub;
    } catch {
      socket.disconnect();
    }
  }

  @SubscribeMessage('join_chat')
  async joinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { taskId: string; partnerId: string },
  ) {
    const room = chatRoom(data.taskId, socket.data.userId, data.partnerId);
    socket.join(room);
    socket.data.activeRoom = room;
    socket.data.partnerId = data.partnerId;
    socket.data.taskId = data.taskId;

    // Mark messages as read when joining
    await this.messages.markRead(data.taskId, socket.data.userId, data.partnerId);
  }

  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { content: string; attachmentUrl?: string },
  ) {
    const { userId, taskId, partnerId, activeRoom } = socket.data;
    if (!taskId || !partnerId) return;

    const message = await this.messages.create(
      taskId,
      userId,
      partnerId,
      data.content,
      data.attachmentUrl,
    );

    this.server.to(activeRoom).emit('new_message', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { isTyping: boolean },
  ) {
    if (!socket.data.activeRoom) return;
    socket.to(socket.data.activeRoom).emit('partner_typing', { isTyping: data.isTyping });
  }

  // Called externally to push a message into a chat room
  pushMessage(taskId: string, senderId: string, recipientId: string, message: object) {
    const room = chatRoom(taskId, senderId, recipientId);
    this.server.to(room).emit('new_message', message);
  }
}

// Deterministic room key — same for both participants
function chatRoom(taskId: string, a: string, b: string): string {
  const sorted = [a, b].sort().join(':');
  return `chat:${taskId}:${sorted}`;
}
