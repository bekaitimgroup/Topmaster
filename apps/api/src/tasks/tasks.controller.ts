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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) =>
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @Request() req: any,
    @Body() dto: CreateTaskDto,
    @UploadedFiles() photos: Express.Multer.File[] = [],
  ) {
    const photoUrls = (photos ?? []).map((f) => `/uploads/${f.filename}`);
    return this.tasks.create(req.user.id, dto, photoUrls);
  }

  @Get('feed')
  getFeed(
    @Request() req: any,
    @Query('categoryId') categoryId?: string,
    @Query('district') district?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('page') page?: string,
  ) {
    return this.tasks.getFeed(req.user.id, {
      categoryId,
      district,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      page: page ? Number(page) : 1,
    });
  }

  @Get('my')
  myTasks(@Request() req: any) {
    return this.tasks.findByCustomer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasks.findOne(id);
  }
}
