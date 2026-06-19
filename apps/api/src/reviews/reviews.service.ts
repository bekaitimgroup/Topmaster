import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: { selectedExecutor: true },
    });

    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.status !== 'completed') {
      throw new BadRequestException('Faqat yakunlangan vazifalar uchun baho qoldirish mumkin');
    }

    const isCustomer = task.customerId === reviewerId;
    const isExecutor = task.selectedExecutor?.userId === reviewerId;

    if (!isCustomer && !isExecutor) throw new ForbiddenException();

    // Resolve the reviewee's user id
    let resolvedRevieweeId: string;
    if (isCustomer) {
      // Customer reviews executor — need executor's userId
      if (!task.selectedExecutor) throw new BadRequestException('Tanlangan usta yo\'q');
      resolvedRevieweeId = task.selectedExecutor.userId;
    } else {
      // Executor reviews customer
      resolvedRevieweeId = task.customerId;
    }

    // Prevent double review
    const existing = await this.prisma.review.findFirst({
      where: { taskId: dto.taskId, reviewerId },
    });
    if (existing) throw new BadRequestException('Siz allaqachon baho qoldirdingiz');

    const review = await this.prisma.review.create({
      data: {
        taskId: dto.taskId,
        reviewerId,
        revieweeId: resolvedRevieweeId,
        rating: dto.rating,
        text: dto.text,
      },
      include: {
        reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });

    // Update executor rating when customer reviews executor
    if (isCustomer && task.selectedExecutor) {
      const ep = await this.prisma.executorProfile.findUnique({
        where: { id: task.selectedExecutor.id },
        select: { rating: true, reviewCount: true },
      });
      if (ep) {
        const oldRating = Number(ep.rating);
        const oldCount = ep.reviewCount;
        const newRating = (oldRating * oldCount + dto.rating) / (oldCount + 1);
        await this.prisma.executorProfile.update({
          where: { id: task.selectedExecutor.id },
          data: {
            rating: newRating,
            reviewCount: { increment: 1 },
          },
        });
      }
    }

    return review;
  }

  async replyToReview(executorUserId: string, reviewId: string, reply: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { reviewee: true },
    });
    if (!review) throw new NotFoundException();
    if (review.reviewee.id !== executorUserId) throw new ForbiddenException();
    if (review.executorReply) throw new BadRequestException('Javob allaqachon berilgan');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { executorReply: reply },
    });
  }

  async getTaskReviews(taskId: string) {
    return this.prisma.review.findMany({
      where: { taskId },
      include: {
        reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getExecutorReviews(executorUserId: string, page = 1) {
    const take = 20;
    const skip = (page - 1) * take;

    const profile = await this.prisma.executorProfile.findUnique({
      where: { userId: executorUserId },
    });
    if (!profile) return { reviews: [], rating: 0, total: 0 };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { revieweeId: executorUserId },
        include: {
          reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where: { revieweeId: executorUserId } }),
    ]);

    return {
      reviews,
      rating: Number(profile.rating),
      reviewCount: profile.reviewCount,
      total,
      page,
    };
  }
}
