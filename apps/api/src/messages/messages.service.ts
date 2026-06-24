import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getThread(taskId: string, userId: string, partnerId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException();

    const isCustomer = task.customerId === userId;

    if (!isCustomer) {
      // Executor must have an actual bid on this specific task
      const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
      if (!profile) throw new ForbiddenException();

      const hasBid = await this.prisma.bid.findFirst({
        where: { taskId, executorId: profile.id },
      });
      if (!hasBid) throw new ForbiddenException();
    } else {
      // Customer must own this task
      if (task.customerId !== userId) throw new ForbiddenException();
    }

    const messages = await this.prisma.message.findMany({
      where: {
        taskId,
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await this.markRead(taskId, userId, partnerId);

    return messages;
  }

  async create(
    taskId: string,
    senderId: string,
    recipientId: string,
    content: string,
    attachmentUrl?: string,
  ) {
    const message = await this.prisma.message.create({
      data: { taskId, senderId, recipientId, content, attachmentUrl },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
    return message;
  }

  async markRead(taskId: string, userId: string, partnerId: string) {
    await this.prisma.message.updateMany({
      where: { taskId, senderId: partnerId, recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  // All unique conversations for a user (grouped by task + partner)
  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      include: {
        task: { select: { id: true, title: true, status: true } },
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
        recipient: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Deduplicate to one entry per task+partner pair
    const seen = new Set<string>();
    const conversations: any[] = [];
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const key = `${msg.taskId}:${partnerId}`;
      if (!seen.has(key)) {
        seen.add(key);
        conversations.push({
          taskId: msg.taskId,
          task: msg.task,
          partner: msg.senderId === userId ? msg.recipient : msg.sender,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          isRead: msg.senderId === userId || msg.isRead,
        });
      }
    }
    return conversations;
  }
}
