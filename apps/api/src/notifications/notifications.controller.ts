import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Post('token')
  saveToken(@Request() req: any, @Body('token') token: string) {
    if (!token || typeof token !== 'string') return { ok: false };
    return this.notifications.saveFcmToken(req.user.id, token).then(() => ({ ok: true }));
  }
}
