import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private subs: SubscriptionsService) {}

  @Get('my')
  mySubscriptions(@Request() req: any) {
    return this.subs.getMySubscriptions(req.user.id);
  }

  @Get('plans')
  plans(@Request() req: any, @Query('categoryId') categoryId: string) {
    return this.subs.getPlansForCategory(req.user.id, categoryId);
  }

  @Post('purchase')
  purchase(
    @Request() req: any,
    @Body('categoryId') categoryId: string,
    @Body('planId') planId: string,
  ) {
    return this.subs.initiatePurchase(req.user.id, categoryId, planId);
  }
}
