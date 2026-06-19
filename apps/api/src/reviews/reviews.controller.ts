import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviews.create(req.user.id, dto);
  }

  @Patch(':id/reply')
  reply(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reply') reply: string,
  ) {
    return this.reviews.replyToReview(req.user.id, id, reply);
  }

  @Get('task/:taskId')
  taskReviews(@Param('taskId') taskId: string) {
    return this.reviews.getTaskReviews(taskId);
  }

  @Get('executor/:userId')
  executorReviews(
    @Param('userId') userId: string,
    @Query('page') page?: string,
  ) {
    return this.reviews.getExecutorReviews(userId, page ? Number(page) : 1);
  }
}
