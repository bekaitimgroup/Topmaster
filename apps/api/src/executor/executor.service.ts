import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecutorDto } from './dto/create-executor.dto';

// Free trial: 90 days unlimited bids
const TRIAL_DAYS = 90;

// Subscription plan multipliers relative to category base price
export const PLANS = [
  { id: 'base_25',      label: 'Base S',       bids: 25,   days: 30, multiplier: 1.0 },
  { id: 'base_50',      label: 'Base M',       bids: 50,   days: 30, multiplier: 1.67 },
  { id: 'base_100',     label: 'Base L',       bids: 100,  days: 30, multiplier: 2.67 },
  { id: 'unlimited_15', label: 'Unlimited 15', bids: null, days: 15, multiplier: 1.25 },
  { id: 'unlimited_30', label: 'Unlimited 30', bids: null, days: 30, multiplier: 2.08 },
  { id: 'unlimited_90', label: 'Unlimited 90', bids: null, days: 90, multiplier: 5.0  },
];

@Injectable()
export class ExecutorService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, dto: CreateExecutorDto, portfolioUrls: string[]) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const existing = await this.prisma.executorProfile.findUnique({
      where: { userId },
    });
    if (existing) throw new BadRequestException('Profil allaqachon mavjud');

    const categories = await this.prisma.category.findMany({
      where: { id: { in: dto.categoryIds }, isActive: true },
    });
    if (categories.length !== dto.categoryIds.length) {
      throw new BadRequestException('Noto\'g\'ri kategoriya');
    }
    if (categories.length < 1 || categories.length > 3) {
      throw new BadRequestException('1 dan 3 tagacha kategoriya tanlang');
    }

    // Update user with name, email, role
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        email: dto.email,
        role: 'executor',
      },
    });

    // Create executor profile
    const profile = await this.prisma.executorProfile.create({
      data: {
        userId,
        bio: dto.bio,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        city: dto.city,
        badge: 'registered',
      },
    });

    // Persist portfolio photo URLs
    if (portfolioUrls.length > 0) {
      await this.prisma.portfolioPhoto.createMany({
        data: portfolioUrls.map((url) => ({ executorId: userId, url })),
      });
    }

    // Create free trial subscriptions for each selected category
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.subscription.createMany({
      data: dto.categoryIds.map((categoryId) => ({
        executorId: profile.id,
        categoryId,
        planType: 'unlimited_90',
        bidsTotal: 999999,
        bidsUsed: 0,
        priceUzs: 0n,
        startsAt: now,
        expiresAt,
        isActive: true,
      })),
    });

    return this.getProfile(userId);
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.executorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            portfolio: {
              select: { id: true, url: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        subscriptions: {
          where: { isActive: true },
          include: { category: true },
          orderBy: { expiresAt: 'desc' },
        },
      },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');
    return {
      ...profile,
      rating: Number(profile.rating),
      portfolio: profile.user.portfolio,
    };
  }

  async getPublicProfile(userId: string) {
    const profile = await this.prisma.executorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            portfolio: {
              select: { id: true, url: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        subscriptions: {
          where: { isActive: true },
          include: { category: { select: { id: true, nameUz: true, nameRu: true } } },
        },
      },
    });
    if (!profile) throw new NotFoundException('Profil topilmadi');

    const categories = [
      ...new Map(profile.subscriptions.map((s) => [s.category.id, s.category])).values(),
    ];

    return {
      userId: profile.user.id,
      fullName: profile.user.fullName,
      avatarUrl: profile.user.avatarUrl,
      bio: profile.bio,
      city: profile.city,
      badge: profile.badge,
      idVerified: profile.idVerified,
      rating: Number(profile.rating),
      reviewCount: profile.reviewCount,
      completedTaskCount: profile.completedTaskCount,
      categories,
      portfolio: profile.user.portfolio,
    };
  }

  getPlansForCategory(basePrice: number) {
    return PLANS.map((p) => ({
      ...p,
      priceUzs: Math.round((basePrice * p.multiplier) / 1000) * 1000,
    }));
  }

  async getPlans(categoryId: string) {
    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException();
    return this.getPlansForCategory(Number(cat.subscriptionPriceUzs));
  }
}
