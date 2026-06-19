import { IsEnum, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Phone must be a valid Uzbek number (+998XXXXXXXXX)' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  code: string;

  @IsEnum(UserRole)
  role: UserRole;
}
