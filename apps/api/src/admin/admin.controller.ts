import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole, ExecutorBadge } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

const ALLOWED_ROLES  = new Set<string>(Object.values(UserRole));
const ALLOWED_BADGES = new Set<string>(Object.values(ExecutorBadge));

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  // Stats
  @Get('stats')
  stats() {
    return this.admin.getStats();
  }

  // Categories
  @Get('categories')
  getCategories() {
    return this.admin.getCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: UpsertCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: Partial<UpsertCategoryDto>) {
    return this.admin.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.admin.deleteCategory(id);
  }

  // Users
  @Get('users')
  getUsers(@Query('page') page?: string, @Query('search') search?: string) {
    const safePage = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const safeSearch = search ? search.slice(0, 100) : undefined;
    return this.admin.getUsers(safePage, safeSearch);
  }

  @Patch('users/:id/active')
  setActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.admin.setUserActive(id, isActive);
  }

  @Patch('users/:id/role')
  setRole(@Param('id') id: string, @Body('role') role: string) {
    if (!ALLOWED_ROLES.has(role)) throw new BadRequestException('Invalid role');
    return this.admin.setUserRole(id, role as UserRole);
  }

  @Patch('users/:id/badge')
  setBadge(@Param('id') id: string, @Body('badge') badge: string) {
    if (!ALLOWED_BADGES.has(badge)) throw new BadRequestException('Invalid badge');
    return this.admin.setExecutorBadge(id, badge as ExecutorBadge);
  }

  // Disputes
  @Get('disputes')
  getDisputes(@Query('status') status?: string) {
    return this.admin.getDisputes(status);
  }

  @Patch('disputes/:id/resolve')
  resolveDispute(
    @Param('id') id: string,
    @Body('adminNotes') adminNotes: string,
    @Body('resolution') resolution: 'resolved_customer' | 'resolved_executor' | 'resolved_split',
  ) {
    return this.admin.resolveDispute(id, adminNotes, resolution);
  }
}
