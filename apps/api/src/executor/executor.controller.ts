import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutorService } from './executor.service';
import { CreateExecutorDto } from './dto/create-executor.dto';
import { fileUrl, imageUploadOptions } from '../common/multer.config';

@Controller('executor')
@UseGuards(JwtAuthGuard)
export class ExecutorController {
  constructor(private executor: ExecutorService) {}

  @Post('register')
  @UseInterceptors(FilesInterceptor('portfolio', 10, imageUploadOptions(10, 'portfolio')))
  register(
    @Request() req: any,
    @Body() dto: CreateExecutorDto,
    @UploadedFiles() portfolio: Express.Multer.File[] = [],
  ) {
    const portfolioUrls = (portfolio ?? []).map(fileUrl);
    return this.executor.register(req.user.id, dto, portfolioUrls);
  }

  @Get('me')
  getMe(@Request() req: any) {
    return this.executor.getProfile(req.user.id);
  }

  @Get('plans')
  getPlans(@Query('categoryId') categoryId: string) {
    return this.executor.getPlans(categoryId);
  }

  @Get(':userId/public')
  getPublicProfile(@Param('userId') userId: string) {
    return this.executor.getPublicProfile(userId);
  }
}
