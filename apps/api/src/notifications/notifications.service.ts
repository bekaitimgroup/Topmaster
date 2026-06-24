import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private app: App | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const credPath = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
    if (!credPath) {
      this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not set — push notifications disabled');
      return;
    }
    try {
      if (getApps().length > 0) { this.app = getApps()[0]; return; }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(credPath);
      this.app = initializeApp({ credential: cert(serviceAccount) });
      this.logger.log('Firebase Admin initialized');
    } catch (e) {
      this.logger.error(`Firebase init failed: ${e}`);
    }
  }

  async saveFcmToken(userId: string, token: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { fcmToken: token } });
  }

  async send(userId: string, payload: { title: string; body: string; data?: Record<string, string> }) {
    if (!this.app) return;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { fcmToken: true } });
    if (!user?.fcmToken) return;

    try {
      await getMessaging(this.app).send({
        token: user.fcmToken,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      });
    } catch (e: any) {
      if (e.code === 'messaging/registration-token-not-registered') {
        await this.prisma.user.update({ where: { id: userId }, data: { fcmToken: null } });
      } else {
        this.logger.error(`FCM send failed for user ${userId}: ${e.message}`);
      }
    }
  }

  async sendToMany(userIds: string[], payload: { title: string; body: string; data?: Record<string, string> }) {
    await Promise.allSettled(userIds.map((uid) => this.send(uid, payload)));
  }
}
