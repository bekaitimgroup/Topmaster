import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { sanitizeDistrict } from '../common/sanitize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksGateway } from './tasks.gateway';

const MIN_START_MINUTES = 30;

export interface FeedQuery {
  categoryId?: string;
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
  search?: string;
  sortBy?: 'newest' | 'budget_high' | 'budget_low';
  page?: number;
  limit?: number;
}

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TasksGateway))
    private gateway: TasksGateway,
  ) {}

  async create(customerId: string, dto: CreateTaskDto, photoUrls: string[]) {
    const startAt = new Date(dto.startAt);
    const minStart = new Date(Date.now() + MIN_START_MINUTES * 60 * 1000);

    if (startAt < minStart) {
      throw new BadRequestException(
        "Vazifa boshlanish vaqti kamida 30 daqiqa bo'lishi kerak!",
      );
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');

    const task = await this.prisma.$transaction(async (tx) => {
      const created = await tx.task.create({
        data: {
          customerId,
          categoryId: dto.categoryId,
          title: dto.title,
          description: dto.description,
          addressA: dto.addressA,
          addressB: dto.addressB,
          latA: dto.latA ? String(dto.latA) : undefined,
          lngA: dto.lngA ? String(dto.lngA) : undefined,
          isRemote: dto.isRemote ?? false,
          startAt,
          budgetUzs: dto.budgetUzs ? BigInt(dto.budgetUzs) : null,
          paymentMethod: dto.paymentMethod,
          privateInfo: dto.privateInfo,
          carMakeId: dto.carMakeId,
          carModelId: dto.carModelId,
          carYear: dto.carYear,
          status: 'published',
        },
      });

      // Persist uploaded photo URLs
      if (photoUrls.length > 0) {
        await tx.taskPhoto.createMany({
          data: photoUrls.map((url) => ({ taskId: created.id, url })),
        });
      }

      return tx.task.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          category: true,
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          photos: { select: { id: true, url: true } },
        },
      });
    });

    const serialized = this.serializeFeedTask(task);
    // Broadcast to executors subscribed to this subcategory AND to its parent
    // category — executors subscribe to parent category IDs, while tasks are
    // usually posted with subcategory IDs.
    this.gateway.broadcastNewTask(task.categoryId, serialized);
    if (task.category?.parentId && task.category.parentId !== task.categoryId) {
      this.gateway.broadcastNewTask(task.category.parentId, serialized);
    }

    return serialized;
  }

  async cancel(customerId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.customerId !== customerId) throw new ForbiddenException();
    if (!['published', 'bids_received', 'executor_selected'].includes(task.status)) {
      throw new BadRequestException('Bu vazifani bekor qilib bo\'lmaydi');
    }

    await this.prisma.task.update({
      where: { id: taskId },
      data: { status: 'cancelled' },
    });

    return { success: true };
  }

  async getFeed(userId: string, query: FeedQuery) {
    const { categoryId, district, budgetMin, budgetMax, search, sortBy } = query;
    const page = Math.max(Math.floor(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Math.floor(query.limit ?? 20), 1), 50);

    // Get executor's subscribed categories
    const profile = await this.prisma.executorProfile.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: { isActive: true, expiresAt: { gt: new Date() } },
          select: { categoryId: true },
        },
      },
    });
    if (!profile) throw new NotFoundException('Executor profili topilmadi');

    const subscribedCategoryIds = profile.subscriptions.map((s) => s.categoryId);
    if (subscribedCategoryIds.length === 0) {
      return { data: [], tasks: [], total: 0, page, totalPages: 0 };
    }

    // Match tasks whose category is subscribed, OR whose category's parent is subscribed
    // (executors subscribe to parent categories; tasks are posted with subcategory IDs)
    const categoryWhere = {
      OR: [
        { id: { in: subscribedCategoryIds } },
        { parentId: { in: subscribedCategoryIds } },
      ],
      ...(categoryId ? { id: categoryId } : {}),
    };

    const where: any = {
      status: { in: ['published', 'bids_received'] },
      category: categoryWhere,
    };

    if (district) {
      const safe = sanitizeDistrict(district);
      if (safe) where.addressA = { contains: safe, mode: 'insensitive' };
    }
    if (budgetMin !== undefined && Number.isFinite(budgetMin) && budgetMin >= 0) {
      where.budgetUzs = { ...where.budgetUzs, gte: BigInt(Math.floor(budgetMin)) };
    }
    if (budgetMax !== undefined && Number.isFinite(budgetMax) && budgetMax >= 0) {
      where.budgetUzs = { ...where.budgetUzs, lte: BigInt(Math.floor(budgetMax)) };
    }
    if (search) {
      const safe = search.trim().slice(0, 100);
      if (safe) {
        where.OR = [
          { title: { contains: safe, mode: 'insensitive' } },
          { description: { contains: safe, mode: 'insensitive' } },
        ];
      }
    }

    const orderBy =
      sortBy === 'budget_high' ? { budgetUzs: 'desc' as const } :
      sortBy === 'budget_low'  ? { budgetUzs: 'asc' as const } :
      { createdAt: 'desc' as const };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          category: { select: { id: true, nameUz: true, nameRu: true } },
          customer: { select: { id: true, fullName: true, avatarUrl: true } },
          photos: { select: { id: true, url: true } },
          _count: { select: { bids: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    const serialized = tasks.map(this.serializeFeedTask);
    return {
      // `data` is the canonical paginated payload; `tasks` kept for
      // backward compatibility with existing web/mobile clients.
      data: serialized,
      tasks: serialized,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, requesterId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        bids: {
          include: {
            executor: {
              include: {
                user: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { priceUzs: 'asc' },
        },
        photos: { select: { id: true, url: true } },
        _count: { select: { bids: true } },
      },
    });

    if (!task) throw new NotFoundException('Vazifa topilmadi');

    // Authorization: only the task owner or an executor who has bid can see full details
    const isCustomer = task.customerId === requesterId;
    const hasBid = task.bids.some((b) => b.executor?.userId === requesterId);
    const isSelectedExecutor = task.selectedExecutorId
      ? task.bids.some((b) => b.executor?.userId === requesterId && b.status === 'accepted')
      : false;

    if (!isCustomer && !hasBid && !isSelectedExecutor) {
      // Feed tasks (published/bids_received) are viewable by any authenticated executor
      if (!['published', 'bids_received'].includes(task.status)) {
        throw new ForbiddenException('Bu vazifani ko\'rishga ruxsatingiz yo\'q');
      }
      // Return a limited view without private info or full bid list
      return this.serializeFeedTask(task);
    }

    return this.serialize(task);
  }

  async complete(customerId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { selectedExecutor: true },
    });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    if (task.customerId !== customerId) throw new ForbiddenException();
    if (task.status !== 'in_progress') {
      throw new BadRequestException('Vazifa hali jarayonda emas');
    }

    await this.prisma.$transaction([
      this.prisma.task.update({ where: { id: taskId }, data: { status: 'completed' } }),
      ...(task.selectedExecutorId
        ? [this.prisma.executorProfile.update({
            where: { id: task.selectedExecutorId },
            data: { completedTaskCount: { increment: 1 } },
          })]
        : []),
    ]);

    return { success: true };
  }

  async findByCustomer(customerId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { customerId },
      include: {
        category: true,
        photos: { select: { id: true, url: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(this.serialize);
  }

  // Safe version for feed — no private info, no full address
  private serializeFeedTask(task: any) {
    const district = task.isRemote
      ? 'Masofadan'
      : task.addressA?.split(',')[0]?.trim() ?? null;
    return {
      id: task.id,
      title: task.title,
      categoryId: task.categoryId,
      category: task.category,
      district,
      isRemote: task.isRemote,
      startAt: task.startAt,
      budgetUzs: task.budgetUzs !== null ? Number(task.budgetUzs) : null,
      paymentMethod: task.paymentMethod,
      status: task.status,
      photos: task.photos?.map((p: any) => ({ id: p.id, url: p.url })) ?? [],
      bidCount: task._count?.bids ?? 0,
      customer: task.customer
        ? { id: task.customer.id, fullName: task.customer.fullName, avatarUrl: task.customer.avatarUrl }
        : null,
      createdAt: task.createdAt,
    };
  }

  private serialize(task: any) {
    return {
      ...task,
      budgetUzs: task.budgetUzs !== null ? Number(task.budgetUzs) : null,
      latA: task.latA !== null ? Number(task.latA) : null,
      lngA: task.lngA !== null ? Number(task.lngA) : null,
      bidCount: task._count?.bids ?? 0,
    };
  }
}
