import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExecutorDto {
  @IsString()
  @MaxLength(255)
  fullName: string;

  @IsString()
  city: string;

  @IsDateString()
  dateOfBirth: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID(undefined, { each: true })
  categoryIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  experienceYears?: number;
}
