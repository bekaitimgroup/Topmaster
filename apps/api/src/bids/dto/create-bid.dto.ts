import { IsISO8601, IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidDto {
  @IsUUID()
  taskId: string;

  @IsNumber()
  @Min(1000)
  @Type(() => Number)
  priceUzs: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Type(() => Number)
  estimatedDurationMins?: number;

  @IsOptional()
  @IsISO8601()
  availableFrom?: string;
}
