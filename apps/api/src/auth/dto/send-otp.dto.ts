import { IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, { message: 'Phone must be a valid Uzbek number (+998XXXXXXXXX)' })
  phone: string;
}
