import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

const MIN_START_MINUTES = 30;

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(customerId: string, dto: CreateTaskDto, photoUrls: string[]) {
    const startAt = new Date(dto.startAt);
    const minStart = new Date(Date.now() + MIN_START_MINUTES * 60 * 1000);

    if (startAt < minStart) {
      throw new BadRequestException(
        'Vazifa boshlanish vaqti kamida 30 daqiqa bo\'lishi kerak!',
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
          select: { id: true, phone: true, fullName: true, avatarUrl: true },
        },
      },
    });

    return this.serialize(task);
  }

  async findOne(id: string, requesterId?: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        category: true,
        customer: {
          select: { id: true, phone: true, fullName: true, avatarUrl: true },
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
      },
    });

    if (!task) throw new NotFoundException('Vazifa topilmadi');
    return this.serialize(task);
  }

  async findByCustomer(customerId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { customerId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map(this.serialize);
  }

  private serialize(task: any) {
    return {
      ...task,
      budgetUzs: task.budgetUzs !== null ? Number(task.budgetUzs) : null,
      latA: task.latA !== null ? Number(task.latA) : null,
      lngA: task.lngA !== null ? Number(task.lngA) : null,
    };
  }
}
