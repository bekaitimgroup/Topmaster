import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from './messages.service';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messages.getConversations(req.user.id);
  }

  @Get('task/:taskId/partner/:partnerId')
  getThread(
    @Param('taskId') taskId: string,
    @Param('partnerId') partnerId: string,
    @Request() req: any,
  ) {
    return this.messages.getThread(taskId, req.user.id, partnerId);
  }

  @Get('unread')
  getUnread(@Request() req: any) {
    return this.messages.getUnreadCount(req.user.id);
  }
}
