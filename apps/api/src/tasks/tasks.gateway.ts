import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    credentials: true,
  },
  namespace: '/tasks',
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake.auth?.token as string) ??
        (socket.handshake.query?.token as string);

      const payload = this.jwt.verify<{ sub: string }>(token);

      const profile = await this.prisma.executorProfile.findUnique({
        where: { userId: payload.sub },
        include: {
          subscriptions: {
            where: { isActive: true, expiresAt: { gt: new Date() } },
            select: { categoryId: true },
          },
        },
      });

      if (!profile) {
        socket.disconnect();
        return;
      }

      // Join one room per subscribed category
      for (const sub of profile.subscriptions) {
        socket.join(`category:${sub.categoryId}`);
      }

      socket.data.executorId = profile.id;
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(_socket: Socket) {}

  // Called by TasksService when a new task is published
  broadcastNewTask(categoryId: string, task: object) {
    this.server.to(`category:${categoryId}`).emit('new_task', task);
  }
}
