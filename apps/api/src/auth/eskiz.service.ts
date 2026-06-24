import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const ESKIZ_BASE = 'https://notify.eskiz.uz/api';

@Injectable()
export class EskizService {
  private readonly logger = new Logger(EskizService.name);
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private config: ConfigService) {}

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    const email = this.config.get<string>('ESKIZ_EMAIL');
    const password = this.config.get<string>('ESKIZ_PASSWORD');

    if (!email || !password) return '';

    const res = await axios.post(`${ESKIZ_BASE}/auth/login`, { email, password });
    this.token = res.data?.data?.token ?? null;
    // Eskiz tokens are valid for 30 days; refresh after 25
    this.tokenExpiresAt = Date.now() + 25 * 24 * 60 * 60 * 1000;
    return this.token ?? '';
  }

  async sendOtp(phone: string, code: string): Promise<void> {
    const token = await this.getToken();

    if (!token) {
      // Dev mode: Eskiz not configured — write OTP only to a local file, never to logs
      const fs = await import('fs');
      const line = `${new Date().toISOString()}  ${phone}  ${code}\n`;
      fs.appendFileSync('/tmp/topmaster_dev_otp.txt', line);
      this.logger.warn(`[DEV] OTP written to /tmp/topmaster_dev_otp.txt (Eskiz not configured)`);
      return;
    }

    const message = `topmaster.uz tasdiqlash kodi: ${code}. Hech kimga bermang.`;

    await axios.post(
      `${ESKIZ_BASE}/message/sms/send`,
      {
        mobile_phone: phone.replace('+', ''),
        message,
        from: '4546',
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  }
}
