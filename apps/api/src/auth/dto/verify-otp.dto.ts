import { IsEnum, IsString, Length, Matches } from 'class-validator';

// Only allow public-facing roles — never 'admin' from the client
export enum PublicRole {
  customer = 'customer',
  executor = 'executor',
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Phone must be a valid Uzbek number (+998XXXXXXXXX)' })
  phone: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'OTP must contain only digits' })
  code: string;

  @IsEnum(PublicRole, { message: 'Role must be customer or executor' })
  role: PublicRole;
}
