import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksGateway } from './tasks.gateway';

const MIN_START_MINUTES = 30;

export interface FeedQuery {
  categoryId?: string;
  district?: string;
  budgetMin?: number;
  budgetMax?: number;
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

    const task = await this.prisma.task.create({
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
        status: 'published',
      },
      include: {
        category: true,
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    const serialized = this.serializeFeedTask(task);
    // Broadcast to all executors subscribed to this category
    this.gateway.broadcastNewTask(dto.categoryId, serialized);

    return serialized;
  }

  async getFeed(userId: string, query: FeedQuery) {
    const { page = 1, limit = 20, categoryId, district, budgetMin, budgetMax } = query;

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
    if (subscribedCategoryIds.length === 0) return { tasks: [], total: 0 };

    const where: any = {
      status: { in: ['published', 'bids_received'] },
      categoryId: categoryId
        ? { in: [categoryId].filter((id) => subscribedCategoryIds.includes(id)) }
        : { in: subscribedCategoryIds },
    };

    if (district) {
      where.addressA = { contains: district, mode: 'insensitive' };
    }
    if (budgetMin !== undefined) {
      where.budgetUzs = { ...where.budgetUzs, gte: BigInt(budgetMin) };
    }
    if (budgetMax !== undefined) {
      where.budgetUzs = { ...where.budgetUzs, lte: BigInt(budgetMax) };
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          category: { select: { id: true, nameUz: true, nameRu: true } },
          customer: { select: { id: true, fullName: true, avatarUrl: true } },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks: tasks.map(this.serializeFeedTask),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
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
        _count: { select: { bids: true } },
      },
    });

    if (!task) throw new NotFoundException('Vazifa topilmadi');
    return this.serialize(task);
  }

  async findByCustomer(customerId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { customerId },
      include: {
        category: true,
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
