import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, AlertSeverity } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ enum: AlertSeverity })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}
