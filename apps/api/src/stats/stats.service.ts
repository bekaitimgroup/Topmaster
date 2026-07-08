import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [executorCount, taskCount, ratingAgg, cities] = await Promise.all([
      // Users registered as executors
      this.prisma.user.count({ where: { role: 'executor' } }),
      // Completed tasks
      this.prisma.task.count({ where: { status: 'completed' } }),
      // Average rating across executors that have at least one review
      this.prisma.executorProfile.aggregate({
        where: { reviewCount: { gt: 0 } },
        _avg: { rating: true },
      }),
      // Distinct cities where executors operate (Task has no city field)
      this.prisma.executorProfile.findMany({
        where: { city: { not: null } },
        distinct: ['city'],
        select: { city: true },
      }),
    ]);

    const avgRating = ratingAgg._avg.rating
      ? Math.round(Number(ratingAgg._avg.rating) * 10) / 10
      : 0;

    return {
      executorCount,
      taskCount,
      avgRating,
      cityCount: cities.length > 0 ? cities.length : 1,
    };
  }
}
