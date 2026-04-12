import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProgressStatus } from '@prisma/client';

export class AssignCourseDto {
  @ApiProperty()
  @IsString()
  stakeholderId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProgressDto {
  @ApiPropertyOptional({ enum: ProgressStatus })
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  progress?: number;
}
