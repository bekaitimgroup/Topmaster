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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExecutorService } from './executor.service';
import { CreateExecutorDto } from './dto/create-executor.dto';

@Controller('executor')
@UseGuards(JwtAuthGuard)
export class ExecutorController {
  constructor(private executor: ExecutorService) {}

  @Post('register')
  @UseInterceptors(
    FilesInterceptor('portfolio', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) =>
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  register(
    @Request() req: any,
    @Body() dto: CreateExecutorDto,
    @UploadedFiles() portfolio: Express.Multer.File[] = [],
  ) {
    const portfolioUrls = (portfolio ?? []).map((f) => `/uploads/${f.filename}`);
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
}
