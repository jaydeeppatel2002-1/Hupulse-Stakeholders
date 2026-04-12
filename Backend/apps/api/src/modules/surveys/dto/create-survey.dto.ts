import { IsString, IsOptional, IsEnum, IsDateString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyType, SurveyStatus } from '@prisma/client';

export class CreateSurveyDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: SurveyType })
  @IsOptional()
  @IsEnum(SurveyType)
  type?: SurveyType;

  @ApiProperty({ description: 'JSON array of question objects' })
  @IsObject()
  questions: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;
}
