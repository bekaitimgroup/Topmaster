import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async submit(userId: string, dto: CreateBidDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: { category: true },
    });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (!['published', 'bids_received'].includes(task.status)) {
      throw new BadRequestException('Bu vazifaga taklif berish mumkin emas');
    }
    if (task.customerId === userId) {
      throw new BadRequestException('O\'z vazifangizga taklif bera olmaysiz');
    }

    const profile = await this.prisma.executorProfile.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: {
            // Match subscription to this subcategory OR its parent category
            categoryId: { in: [task.categoryId, task.category.parentId].filter(Boolean) as string[] },
            isActive: true,
            expiresAt: { gt: new Date() },
          },
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
      },
    });
    if (!profile) throw new ForbiddenException('Avval usta sifatida ro\'yxatdan o\'ting');

    const sub = profile.subscriptions[0];
    if (!sub) throw new ForbiddenException('Bu kategoriya uchun faol obunangiz yo\'q');

    // Check & deduct bid credit for base plans
    const isUnlimited = sub.planType.startsWith('unlimited');
    if (!isUnlimited) {
      const remaining = sub.bidsTotal - sub.bidsUsed;
      if (remaining <= 0) throw new BadRequestException('Takliflar soni tugadi. Obunani yangilang');
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { bidsUsed: { increment: 1 } },
      });
    }

    // Prevent double-bidding
    const existing = await this.prisma.bid.findFirst({
      where: { taskId: dto.taskId, executorId: profile.id, status: 'pending' },
    });
    if (existing) throw new BadRequestException('Siz allaqachon taklif bergansiz');

    const bid = await this.prisma.bid.create({
      data: {
        taskId: dto.taskId,
        executorId: profile.id,
        priceUzs: BigInt(dto.priceUzs),
        message: dto.message,
        estimatedDurationMins: dto.estimatedDurationMins,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      },
      include: {
        executor: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
      },
    });

    // Bump task status to bids_received
    if (task.status === 'published') {
      await this.prisma.task.update({
        where: { id: dto.taskId },
        data: { status: 'bids_received' },
      });
    }

    // Notify customer: new bid arrived
    this.notifications.send(task.customerId, {
      title: 'Yangi taklif! 📨',
      body: `"${task.title}" uchun yangi taklif keldi`,
      data: { taskId: task.id, type: 'new_bid' },
    });

    return this.serializeBid(bid);
  }

  async accept(customerId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { task: true },
    });
    if (!bid) throw new NotFoundException();
    if (bid.task.customerId !== customerId) throw new ForbiddenException();
    if (bid.status !== 'pending') throw new BadRequestException('Bu taklif allaqachon o\'zgartirilgan');

    // Accept this bid, decline all others
    await this.prisma.$transaction([
      this.prisma.bid.update({ where: { id: bidId }, data: { status: 'accepted' } }),
      this.prisma.bid.updateMany({
        where: { taskId: bid.taskId, id: { not: bidId }, status: 'pending' },
        data: { status: 'declined' },
      }),
      this.prisma.task.update({
        where: { id: bid.taskId },
        data: {
          status: 'executor_selected',
          selectedExecutorId: bid.executorId,
        },
      }),
    ]);

    // Notify executor: bid accepted
    const executor = await this.prisma.executorProfile.findUnique({
      where: { id: bid.executorId },
      select: { userId: true },
    });
    if (executor) {
      this.notifications.send(executor.userId, {
        title: 'Taklifingiz qabul qilindi! ✅',
        body: `"${bid.task.title}" vazifasi uchun tanlandingiz`,
        data: { taskId: bid.taskId, type: 'bid_accepted' },
      });
    }

    return { success: true };
  }

  async decline(customerId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { task: true },
    });
    if (!bid) throw new NotFoundException();
    if (bid.task.customerId !== customerId) throw new ForbiddenException();

    await this.prisma.bid.update({ where: { id: bidId }, data: { status: 'declined' } });
    return { success: true };
  }

  async withdraw(userId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { executor: true },
    });
    if (!bid) throw new NotFoundException();
    if (bid.executor.userId !== userId) throw new ForbiddenException();
    if (bid.status !== 'pending') throw new BadRequestException();

    await this.prisma.bid.update({ where: { id: bidId }, data: { status: 'withdrawn' } });
    return { success: true };
  }

  async getTaskBids(taskId: string, requesterId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException();

    const isCustomer = task.customerId === requesterId;

    const bids = await this.prisma.bid.findMany({
      where: {
        taskId,
        ...(isCustomer ? {} : {
          executor: { userId: requesterId },
        }),
      },
      include: {
        executor: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
        },
      },
      orderBy: { priceUzs: 'asc' },
    });

    return bids.map(this.serializeBid);
  }

  async getMyBids(userId: string) {
    const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const bids = await this.prisma.bid.findMany({
      where: { executorId: profile.id },
      include: {
        task: {
          include: { category: { select: { id: true, nameUz: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bids.map((b) => ({
      ...this.serializeBid(b),
      task: {
        id: b.task.id,
        title: b.task.title,
        status: b.task.status,
        startAt: b.task.startAt,
        category: b.task.category,
      },
    }));
  }

  private serializeBid(bid: any) {
    return {
      id: bid.id,
      taskId: bid.taskId,
      priceUzs: Number(bid.priceUzs),
      message: bid.message,
      estimatedDurationMins: bid.estimatedDurationMins,
      availableFrom: bid.availableFrom,
      status: bid.status,
      createdAt: bid.createdAt,
      executor: bid.executor
        ? {
            id: bid.executor.id,
            userId: bid.executor.userId,
            badge: bid.executor.badge,
            rating: Number(bid.executor.rating),
            reviewCount: bid.executor.reviewCount,
            completedTaskCount: bid.executor.completedTaskCount,
            user: bid.executor.user,
          }
        : undefined,
    };
  }
}
