import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SurveyStatus, SurveyType } from '@prisma/client';
import { PaginationDto } from '@shared/dto';

export class QuerySurveyDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SurveyStatus })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiPropertyOptional({ enum: SurveyType })
  @IsOptional()
  @IsEnum(SurveyType)
  type?: SurveyType;
}
