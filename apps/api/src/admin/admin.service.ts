import { Injectable, NotFoundException } from '@nestjs/common';
import { ExecutorBadge, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard stats ──────────────────────────────────────────────────────────

  async getStats() {
    const [
      totalUsers,
      totalExecutors,
      totalTasks,
      activeTasks,
      completedTasks,
      openDisputes,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.executorProfile.count(),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: { in: ['published', 'bids_received', 'executor_selected', 'in_progress'] } } }),
      this.prisma.task.count({ where: { status: 'completed' } }),
      this.prisma.dispute.count({ where: { status: 'open' } }),
      this.prisma.payment.aggregate({ where: { status: 'released' }, _sum: { commissionUzs: true } }),
    ]);

    return {
      totalUsers,
      totalExecutors,
      totalTasks,
      activeTasks,
      completedTasks,
      openDisputes,
      totalCommissionUzs: Number(totalRevenue._sum.commissionUzs ?? 0),
    };
  }

  // ── Category management ──────────────────────────────────────────────────────

  async getCategories() {
    const cats = await this.prisma.category.findMany({
      include: {
        _count: { select: { tasks: true, subscriptions: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { nameUz: 'asc' }],
    });
    return cats.map((c) => ({
      ...c,
      subscriptionPriceUzs: Number(c.subscriptionPriceUzs),
      taskCount: c._count.tasks,
      subscriptionCount: c._count.subscriptions,
    }));
  }

  async createCategory(dto: UpsertCategoryDto) {
    const cat = await this.prisma.category.create({
      data: {
        nameUz: dto.nameUz,
        nameRu: dto.nameRu,
        parentId: dto.parentId,
        subscriptionPriceUzs: dto.subscriptionPriceUzs ? BigInt(dto.subscriptionPriceUzs) : 0n,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return { ...cat, subscriptionPriceUzs: Number(cat.subscriptionPriceUzs) };
  }

  async updateCategory(id: string, dto: Partial<UpsertCategoryDto>) {
    const cat = await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.nameUz !== undefined && { nameUz: dto.nameUz }),
        ...(dto.nameRu !== undefined && { nameRu: dto.nameRu }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId }),
        ...(dto.subscriptionPriceUzs !== undefined && { subscriptionPriceUzs: BigInt(dto.subscriptionPriceUzs) }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
    return { ...cat, subscriptionPriceUzs: Number(cat.subscriptionPriceUzs) };
  }

  async deleteCategory(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  // ── User management ──────────────────────────────────────────────────────────

  async getUsers(page = 1, search?: string) {
    const take = 30;
    const skip = (page - 1) * take;
    const where = search
      ? {
          OR: [
            { phone: { contains: search } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          executorProfile: { select: { rating: true, reviewCount: true, completedTaskCount: true, badge: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page };
  }

  async setUserActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    await this.prisma.user.update({ where: { id }, data: { isActive } });
    return { success: true };
  }

  async setUserRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    await this.prisma.user.update({ where: { id }, data: { role } });
    return { success: true };
  }

  async setExecutorBadge(userId: string, badge: ExecutorBadge) {
    const profile = await this.prisma.executorProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Usta profili topilmadi');
    await this.prisma.executorProfile.update({ where: { userId }, data: { badge } });
    return { success: true };
  }

  // ── Dispute management ────────────────────────────────────────────────────────

  async getDisputes(status?: string) {
    return this.prisma.dispute.findMany({
      where: status ? { status: status as any } : {},
      include: {
        task: { select: { id: true, title: true, status: true } },
        openedBy: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveDispute(
    id: string,
    adminNotes: string,
    resolution: 'resolved_customer' | 'resolved_executor' | 'resolved_split',
  ) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException();

    return this.prisma.dispute.update({
      where: { id },
      data: { status: resolution, adminNotes, resolvedAt: new Date() },
    });
  }
}
