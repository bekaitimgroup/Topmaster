import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { TelegramAuthDto, GoogleAuthDto } from './dto/social-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('send-otp')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  sendOtp(@Body() dto: SendOtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.verifyOtp(dto.phone, dto.code, dto.role);
    // Set token as httpOnly cookie — JS cannot read it
    res.cookie('token', result.accessToken, COOKIE_OPTIONS);
    // Return without the token so it never touches the client JS
    return { isNewUser: result.isNewUser };
  }

  // Mobile clients cannot use httpOnly cookies — return the token in the body.
  @Post('verify-otp/mobile')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async verifyOtpMobile(@Body() dto: VerifyOtpDto) {
    const result = await this.auth.verifyOtp(dto.phone, dto.code, dto.role);
    return { accessToken: result.accessToken, isNewUser: result.isNewUser };
  }

  @Post('telegram')
  async telegramAuth(
    @Body() dto: TelegramAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.loginWithTelegram(dto);
    res.cookie('token', result.accessToken, COOKIE_OPTIONS);
    return { isNewUser: result.isNewUser };
  }

  // Mobile: Telegram auth returns token in body
  @Post('telegram/mobile')
  async telegramAuthMobile(@Body() dto: TelegramAuthDto) {
    const result = await this.auth.loginWithTelegram(dto);
    return { accessToken: result.accessToken, isNewUser: result.isNewUser };
  }

  // Mobile: Telegram OAuth redirect — validates data, redirects to app deep link
  @Get('telegram/mobile-redirect')
  async telegramMobileRedirect(
    @Request() req: any,
    @Res() res: Response,
  ) {
    // app_redirect is the mobile app's deep link URI (e.g. exp+topmaster://auth/telegram in dev)
    const appRedirect = (req.query.app_redirect as string) ?? 'topmaster://auth/telegram';
    try {
      // Strip app_redirect before passing to loginWithTelegram — it's not part of TG's signed payload
      const { app_redirect, ...tgData } = req.query;
      const result = await this.auth.loginWithTelegram(tgData as TelegramAuthDto);
      const params = new URLSearchParams({ accessToken: result.accessToken, isNewUser: String(result.isNewUser) });
      return res.redirect(`${appRedirect}?${params.toString()}`);
    } catch {
      return res.redirect(`${appRedirect}?error=auth_failed`);
    }
  }

  @Post('google')
  async googleAuth(
    @Body() dto: GoogleAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.loginWithGoogle(dto.accessToken);
    res.cookie('token', result.accessToken, COOKIE_OPTIONS);
    return { isNewUser: result.isNewUser };
  }

  // Mobile: Google auth returns token in body
  @Post('google/mobile')
  async googleAuthMobile(@Body() dto: GoogleAuthDto) {
    const result = await this.auth.loginWithGoogle(dto.accessToken);
    return { accessToken: result.accessToken, isNewUser: result.isNewUser };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { path: '/' });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: any) {
    return this.auth.getMe(req.user.id);
  }
}
