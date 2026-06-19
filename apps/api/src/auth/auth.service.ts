import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EskizService } from './eskiz.service';

const OTP_TTL = 5 * 60;       // 5 minutes
const COOLDOWN_TTL = 60;       // 60-second resend cooldown

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private eskiz: EskizService,
  ) {}

  async sendOtp(phone: string): Promise<{ message: string }> {
    const cooldownKey = `otp_cooldown:${phone}`;
    if (await this.redis.exists(cooldownKey)) {
      throw new HttpException(
        'Iltimos, 60 soniya kutib qayta urinib ko\'ring',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const otpKey = `otp:${phone}`;

    await this.redis.set(otpKey, code, OTP_TTL);
    await this.redis.set(cooldownKey, '1', COOLDOWN_TTL);

    await this.eskiz.sendOtp(phone, code);

    return { message: 'Tasdiqlash kodi yuborildi' };
  }

  async verifyOtp(
    phone: string,
    code: string,
    role: UserRole,
  ): Promise<{ accessToken: string; isNewUser: boolean }> {
    const otpKey = `otp:${phone}`;
    const stored = await this.redis.get(otpKey);

    if (!stored || stored !== code) {
      throw new BadRequestException('Noto\'g\'ri yoki muddati o\'tgan kod');
    }

    await this.redis.del(otpKey);

    let isNewUser = false;
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, role, isPhoneVerified: true },
      });
      isNewUser = true;
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true },
      });
    }

    const accessToken = this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      role: user.role,
    });

    return { accessToken, isNewUser };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isPhoneVerified: true,
        createdAt: true,
        executorProfile: {
          select: {
            id: true,
            badge: true,
            rating: true,
            reviewCount: true,
            completedTaskCount: true,
          },
        },
      },
    });
  }
}
