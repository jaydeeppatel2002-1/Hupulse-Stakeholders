import { PartialType } from '@nestjs/swagger';
import { CreateSurveyDto } from './create-survey.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyStatus } from '@prisma/client';

export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
  @ApiPropertyOptional({ enum: SurveyStatus })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;
}
