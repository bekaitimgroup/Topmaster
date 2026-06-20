import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHmac, timingSafeEqual } from 'crypto';
import { PublicRole } from './dto/verify-otp.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EskizService } from './eskiz.service';

const OTP_TTL       = 5 * 60;  // 5 min
const COOLDOWN_TTL  = 60;       // 60 s resend cooldown
const MAX_ATTEMPTS  = 5;        // lockout after 5 wrong codes
const LOCKOUT_TTL   = 30 * 60; // 30 min lockout

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

    const lockKey = `otp_lock:${phone}`;
    if (await this.redis.exists(lockKey)) {
      throw new HttpException(
        'Ko\'p marta noto\'g\'ri kod kiritildi. 30 daqiqadan keyin urinib ko\'ring',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    // Store HMAC of the code, not plaintext
    const hashed = this.hashCode(phone, code);
    const otpKey = `otp:${phone}`;

    await this.redis.set(otpKey, hashed, OTP_TTL);
    await this.redis.set(cooldownKey, '1', COOLDOWN_TTL);
    // Reset failed attempts on new send
    await this.redis.del(`otp_fails:${phone}`);

    await this.eskiz.sendOtp(phone, code);

    return { message: 'Tasdiqlash kodi yuborildi' };
  }

  async verifyOtp(
    phone: string,
    code: string,
    role: PublicRole,
  ): Promise<{ accessToken: string; isNewUser: boolean }> {
    // Check lockout first
    const lockKey = `otp_lock:${phone}`;
    if (await this.redis.exists(lockKey)) {
      throw new HttpException(
        'Ko\'p marta noto\'g\'ri kod kiritildi. 30 daqiqadan keyin urinib ko\'ring',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpKey  = `otp:${phone}`;
    const failKey = `otp_fails:${phone}`;
    const stored  = await this.redis.get(otpKey);

    if (!stored) {
      throw new BadRequestException('Kod muddati o\'tgan yoki yuborilmagan');
    }

    // Timing-safe comparison of HMAC
    const expected = this.hashCode(phone, code);
    const match = timingSafeEqual(Buffer.from(stored), Buffer.from(expected));

    if (!match) {
      const fails = await this.redis.incr(failKey);
      if (fails === 1) await this.redis.expire(failKey, OTP_TTL);

      if (fails >= MAX_ATTEMPTS) {
        await this.redis.set(lockKey, '1', LOCKOUT_TTL);
        await this.redis.del(otpKey);
        await this.redis.del(failKey);
        throw new HttpException(
          'Ko\'p marta noto\'g\'ri kod kiritildi. 30 daqiqadan keyin urinib ko\'ring',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      const remaining = MAX_ATTEMPTS - fails;
      throw new BadRequestException(
        `Noto\'g\'ri kod. ${remaining} ta urinish qoldi`,
      );
    }

    // Code is correct — clean up
    await this.redis.del(otpKey);
    await this.redis.del(failKey);

    let isNewUser = false;
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (user && !user.isActive) {
      throw new HttpException('Hisobingiz bloklangan', HttpStatus.FORBIDDEN);
    }

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
      role: user.role,  // always from DB, not from request
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

  private hashCode(phone: string, code: string): string {
    const secret = process.env.JWT_SECRET ?? 'otp-secret';
    return createHmac('sha256', secret).update(`${phone}:${code}`).digest('hex');
  }
}
