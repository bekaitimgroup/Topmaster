import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PLANS } from '../executor/executor.service';

@Injectable()
export class SubscriptionsService {
  private readonly merchantId: string;
  private readonly testMode: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.merchantId = config.get('PAYME_MERCHANT_ID') ?? '';
    this.testMode = config.get('PAYME_TEST_MODE') === 'true';
  }

  async getMySubscriptions(userId: string) {
    const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const subs = await this.prisma.subscription.findMany({
      where: { executorId: profile.id },
      include: { category: { select: { id: true, nameUz: true } } },
      orderBy: [{ isActive: 'desc' }, { expiresAt: 'desc' }],
    });

    return subs.map((s) => this.serialize(s));
  }

  async getPlansForCategory(userId: string, categoryId: string) {
    const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException();

    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException();

    const basePrice = Number(cat.subscriptionPriceUzs);

    // Find current active subscription for this category
    const current = await this.prisma.subscription.findFirst({
      where: {
        executorId: profile.id,
        categoryId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });

    return {
      categoryId,
      categoryName: cat.nameUz,
      current: current ? this.serialize(current) : null,
      plans: PLANS.map((p) => ({
        id: p.id,
        label: p.label,
        bids: p.bids,
        days: p.days,
        priceUzs: Math.round((basePrice * p.multiplier) / 1000) * 1000,
      })),
    };
  }

  async initiatePurchase(userId: string, categoryId: string, planId: string) {
    const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
    if (!profile) throw new ForbiddenException();

    const cat = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) throw new NotFoundException('Kategoriya topilmadi');

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) throw new BadRequestException("Noto'g'ri tarif");

    const basePrice = Number(cat.subscriptionPriceUzs);
    const priceUzs = Math.round((basePrice * plan.multiplier) / 1000) * 1000;

    if (priceUzs === 0) throw new BadRequestException("Bu kategoriya uchun obuna bepul emas");

    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + plan.days * 24 * 60 * 60 * 1000);

    // Create the subscription in pending state (isActive: false until payment completes)
    const subscription = await this.prisma.subscription.create({
      data: {
        executorId: profile.id,
        categoryId,
        planType: planId as any,
        bidsTotal: plan.bids ?? 999999,
        bidsUsed: 0,
        priceUzs: BigInt(priceUzs),
        startsAt,
        expiresAt,
        isActive: false,
      },
    });

    // Create a payment record linked to this subscription
    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        payerId: userId,
        payeeId: userId, // platform fee — no separate payee for subscriptions
        amountUzs: BigInt(priceUzs),
        commissionUzs: BigInt(priceUzs), // entire amount is platform revenue
        paymentMethod: 'payme',
        status: 'pending',
      },
    });

    const checkoutUrl = this.buildPaymeUrl(payment.id, priceUzs);
    return { paymentId: payment.id, subscriptionId: subscription.id, checkoutUrl, priceUzs };
  }

  private serialize(s: any) {
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((new Date(s.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = new Date(s.expiresAt) < now;
    const isUnlimited = s.planType.startsWith('unlimited');

    return {
      id: s.id,
      categoryId: s.categoryId,
      category: s.category ?? undefined,
      planType: s.planType,
      bidsTotal: s.bidsTotal,
      bidsUsed: s.bidsUsed,
      bidsRemaining: isUnlimited ? null : s.bidsTotal - s.bidsUsed,
      priceUzs: Number(s.priceUzs),
      startsAt: s.startsAt,
      expiresAt: s.expiresAt,
      isActive: s.isActive,
      isExpired,
      daysLeft,
      isUnlimited,
    };
  }

  private buildPaymeUrl(paymentId: string, amountUzs: number): string {
    const amountTiyn = amountUzs * 100;
    const params = `m=${this.merchantId};ac.subscription_payment_id=${paymentId};a=${amountTiyn}`;
    const encoded = Buffer.from(params).toString('base64');
    const base = this.testMode ? 'https://test.paycom.uz' : 'https://checkout.paycom.uz';
    return `${base}/${encoded}`;
  }
}
