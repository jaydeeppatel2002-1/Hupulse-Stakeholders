import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationChannel, SentimentType } from '@prisma/client';
import { PaginationDto } from '@shared/dto';

export class QueryCommunicationDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CommunicationChannel })
  @IsOptional()
  @IsEnum(CommunicationChannel)
  channel?: CommunicationChannel;

  @ApiPropertyOptional({ enum: SentimentType })
  @IsOptional()
  @IsEnum(SentimentType)
  sentiment?: SentimentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stakeholderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
