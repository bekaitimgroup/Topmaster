import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  getMakes() {
    return this.prisma.carMake.findMany({
      orderBy: [{ isLocal: 'desc' }, { sortOrder: 'asc' }],
      select: { id: true, name: true, isLocal: true, sortOrder: true },
    });
  }

  getModels(makeId: string) {
    return this.prisma.carModel.findMany({
      where: { makeId },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, yearFrom: true, yearTo: true },
    });
  }
}
