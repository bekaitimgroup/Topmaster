import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class CreateTaskDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressA?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressB?: string;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latA?: number;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  lngA?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRemote?: boolean;

  @IsISO8601()
  startAt: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10_000_000_000)
  @Type(() => Number)
  budgetUzs?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  privateInfo?: string;

  @IsOptional()
  @IsUUID()
  carMakeId?: string;

  @IsOptional()
  @IsUUID()
  carModelId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2100)
  @Type(() => Number)
  carYear?: number;
}
