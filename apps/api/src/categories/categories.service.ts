import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: { id: true, nameUz: true, nameRu: true, sortOrder: true },
        },
      },
    });

    // Attach live executor count per category
    const counts = await this.prisma.executorProfile.groupBy({
      by: ['id'],
      _count: true,
    });
    const totalExecutors = counts.length;

    // Count active subscriptions per category
    const subCounts = await this.prisma.subscription.groupBy({
      by: ['categoryId'],
      where: { isActive: true },
      _count: { categoryId: true },
    });
    const countMap = Object.fromEntries(
      subCounts.map((s) => [s.categoryId, s._count.categoryId]),
    );

    return categories.map((cat) => ({
      ...cat,
      subscriptionPriceUzs: Number(cat.subscriptionPriceUzs),
      executorCount: countMap[cat.id] ?? 0,
      totalExecutors,
    }));
  }
}
