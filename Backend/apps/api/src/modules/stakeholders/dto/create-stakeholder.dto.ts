import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StakeholderType, StakeholderStatus, SentimentType } from '@prisma/client';

export class CreateStakeholderDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ enum: StakeholderType })
  @IsOptional()
  @IsEnum(StakeholderType)
  type?: StakeholderType;

  @ApiPropertyOptional({ enum: StakeholderStatus })
  @IsOptional()
  @IsEnum(StakeholderStatus)
  status?: StakeholderStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  powerScore?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  interestScore?: number;

  @ApiPropertyOptional({ enum: SentimentType })
  @IsOptional()
  @IsEnum(SentimentType)
  sentiment?: SentimentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];
}
