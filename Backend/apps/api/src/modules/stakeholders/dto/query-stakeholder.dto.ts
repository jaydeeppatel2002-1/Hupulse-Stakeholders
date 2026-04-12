import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StakeholderType, StakeholderStatus, SentimentType } from '@prisma/client';
import { PaginationDto } from '@shared/dto';

export class QueryStakeholderDto extends PaginationDto {
  @ApiPropertyOptional({ enum: StakeholderType })
  @IsOptional()
  @IsEnum(StakeholderType)
  type?: StakeholderType;

  @ApiPropertyOptional({ enum: StakeholderStatus })
  @IsOptional()
  @IsEnum(StakeholderStatus)
  status?: StakeholderStatus;

  @ApiPropertyOptional({ enum: SentimentType })
  @IsOptional()
  @IsEnum(SentimentType)
  sentiment?: SentimentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ enum: ['name', 'powerScore', 'interestScore', 'createdAt'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
