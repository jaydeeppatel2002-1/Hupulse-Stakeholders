import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationHours?: number;

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
