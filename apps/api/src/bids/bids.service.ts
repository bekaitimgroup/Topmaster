import {
  BadRequestException,
  ConflictException,
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

    // Prevent double-bidding — checked BEFORE any credit is consumed
    const existing = await this.prisma.bid.findFirst({
      where: { taskId: dto.taskId, executorId: profile.id },
    });
    if (existing) throw new BadRequestException('Siz allaqachon taklif bergansiz');

    const isUnlimited = sub.planType.startsWith('unlimited');

    let bid;
    try {
      bid = await this.prisma.$transaction(async (tx) => {
        // Atomic credit deduction for base plans: the conditional updateMany
        // guarantees the counter can never exceed bidsTotal under concurrency.
        if (!isUnlimited) {
          const deducted = await tx.subscription.updateMany({
            where: {
              id: sub.id,
              isActive: true,
              bidsUsed: { lt: sub.bidsTotal },
            },
            data: { bidsUsed: { increment: 1 } },
          });
          if (deducted.count === 0) {
            throw new BadRequestException('Takliflar soni tugadi. Obunani yangilang');
          }
        }

        const created = await tx.bid.create({
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
          await tx.task.update({
            where: { id: dto.taskId },
            data: { status: 'bids_received' },
          });
        }

        return created;
      });
    } catch (e: any) {
      // Unique constraint on (taskId, executorId): concurrent duplicate bid.
      // The transaction rolled back, so the credit deduction was undone too.
      if (e?.code === 'P2002') {
        throw new BadRequestException('Siz allaqachon taklif bergansiz');
      }
      throw e;
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
    // Fast-path check for a friendly error; the authoritative check is the
    // conditional updateMany inside the transaction below.
    if (bid.status !== 'pending') throw new BadRequestException('Bu taklif allaqachon o\'zgartirilgan');

    const ACCEPTABLE_TASK_STATUSES = ['published', 'bids_received'] as const;

    await this.prisma.$transaction(async (tx) => {
      // Re-fetch the task inside the transaction — the pre-check above can be
      // stale under concurrent accepts / cancellations.
      const task = await tx.task.findUnique({ where: { id: bid.taskId } });
      if (!task || !ACCEPTABLE_TASK_STATUSES.includes(task.status as any)) {
        throw new BadRequestException('Bu vazifa uchun taklif qabul qilib bo\'lmaydi');
      }

      // For safe_deal tasks the executor is selected and the task waits for the
      // escrow payment (Payme webhook moves it to in_progress). For direct/b2b
      // (cash) tasks there is no payment step — go straight to in_progress so
      // the task can later be completed and reviewed.
      const nextStatus =
        task.paymentMethod === 'safe_deal' ? 'executor_selected' : 'in_progress';

      // Conditional update: only flips the bid if it is STILL pending. Two
      // concurrent accepts of the same bid — only one sees count === 1.
      const accepted = await tx.bid.updateMany({
        where: { id: bidId, status: 'pending' },
        data: { status: 'accepted' },
      });
      if (accepted.count !== 1) {
        throw new ConflictException('Bid no longer available');
      }

      // Decline all other pending bids
      await tx.bid.updateMany({
        where: { taskId: bid.taskId, id: { not: bidId }, status: 'pending' },
        data: { status: 'declined' },
      });

      // Conditional task update closes the remaining race: two concurrent
      // accepts of DIFFERENT bids on the same task. Only one transaction can
      // move the task out of an acceptable status; the loser rolls back.
      const taskUpdated = await tx.task.updateMany({
        where: { id: bid.taskId, status: { in: [...ACCEPTABLE_TASK_STATUSES] } },
        data: {
          status: nextStatus,
          selectedExecutorId: bid.executorId,
        },
      });
      if (taskUpdated.count !== 1) {
        throw new ConflictException('Bid no longer available');
      }
    });

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
