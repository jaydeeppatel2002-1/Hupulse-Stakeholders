import { IsString, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SentimentType } from '@prisma/client';

export class SubmitResponseDto {
  @ApiProperty()
  @IsString()
  stakeholderId: string;

  @ApiProperty({ description: 'JSON object with question answers' })
  @IsObject()
  answers: any;

  @ApiPropertyOptional({ enum: SentimentType })
  @IsOptional()
  @IsEnum(SentimentType)
  sentiment?: SentimentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  score?: number;
}
