import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  addressA?: string;

  @IsOptional()
  @IsString()
  addressB?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latA?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lngA?: number;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsISO8601()
  startAt: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budgetUzs?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  privateInfo?: string;

  @IsOptional()
  @IsBoolean()
  collectMoney?: boolean;
}
