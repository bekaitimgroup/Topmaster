import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  // Customer: create payment for a task with safe_deal method
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Request() req: any, @Body('taskId') taskId: string) {
    return this.payments.initiate(req.user.id, taskId);
  }

  // Payme calls this endpoint with JSON-RPC 2.0
  // No JWT — Payme uses its own Basic Auth
  @Post('payme')
  paymeWebhook(
    @Headers('authorization') auth: string,
    @Body() body: any,
  ) {
    return this.payments.handleWebhook(auth, body);
  }

  // Check payment status for a task
  @Get('task/:taskId')
  @UseGuards(JwtAuthGuard)
  taskPayment(@Param('taskId') taskId: string, @Request() req: any) {
    return this.payments.getTaskPayment(taskId, req.user.id);
  }
}
