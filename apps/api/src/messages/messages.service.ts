import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getThread(taskId: string, userId: string, partnerId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        bids: { select: { executor: { select: { userId: true } } } },
      },
    });
    if (!task) throw new NotFoundException();

    const bidderUserIds = new Set(task.bids.map((b) => b.executor.userId));
    const isCustomer = task.customerId === userId;

    // Caller must be a participant: the task's customer or an actual bidder
    if (!isCustomer && !bidderUserIds.has(userId)) {
      throw new ForbiddenException();
    }

    // Partner must also be a participant on THIS task — otherwise any caller
    // could read/mark-read threads with arbitrary user ids.
    const partnerIsParticipant =
      partnerId !== userId &&
      (partnerId === task.customerId || bidderUserIds.has(partnerId));
    if (!partnerIsParticipant) {
      throw new ForbiddenException();
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

  // All unique conversations for a user (grouped by task + partner).
  // Uses Postgres DISTINCT ON so only the latest message per thread is
  // fetched, instead of loading the user's entire message history into memory.
  async getConversations(userId: string) {
    const rows = await this.prisma.$queryRaw<
      Array<{
        task_id: string;
        partner_id: string;
        content: string | null;
        sender_id: string;
        is_read: boolean;
        created_at: Date;
      }>
    >`
      SELECT DISTINCT ON (m.task_id, m.partner_id)
             m.task_id, m.partner_id, m.content, m.sender_id, m.is_read, m.created_at
      FROM (
        SELECT task_id, content, sender_id, is_read, created_at,
               CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS partner_id
        FROM messages
        WHERE sender_id = ${userId} OR recipient_id = ${userId}
      ) m
      ORDER BY m.task_id, m.partner_id, m.created_at DESC
    `;

    if (rows.length === 0) return [];

    const taskIds = [...new Set(rows.map((r) => r.task_id))];
    const partnerIds = [...new Set(rows.map((r) => r.partner_id))];

    const [tasks, partners] = await Promise.all([
      this.prisma.task.findMany({
        where: { id: { in: taskIds } },
        select: { id: true, title: true, status: true },
      }),
      this.prisma.user.findMany({
        where: { id: { in: partnerIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      }),
    ]);
    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const partnerMap = new Map(partners.map((p) => [p.id, p]));

    return rows
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .map((r) => ({
        taskId: r.task_id,
        task: taskMap.get(r.task_id) ?? null,
        partner: partnerMap.get(r.partner_id) ?? null,
        lastMessage: r.content,
        lastMessageAt: r.created_at,
        isRead: r.sender_id === userId || r.is_read,
      }));
  }
}
