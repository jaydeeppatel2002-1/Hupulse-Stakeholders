import { IsString, IsOptional, IsEnum, IsUUID, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunicationChannel, CommunicationDirection, SentimentType } from '@prisma/client';

export class CreateCommunicationDto {
  @ApiProperty({ enum: CommunicationChannel })
  @IsEnum(CommunicationChannel)
  channel: CommunicationChannel;

  @ApiPropertyOptional({ enum: CommunicationDirection })
  @IsOptional()
  @IsEnum(CommunicationDirection)
  direction?: CommunicationDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ enum: SentimentType })
  @IsOptional()
  @IsEnum(SentimentType)
  sentiment?: SentimentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  stakeholderIds: string[];
}
