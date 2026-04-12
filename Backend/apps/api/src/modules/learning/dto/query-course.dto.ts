import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CourseStatus } from '@prisma/client';
import { PaginationDto } from '@shared/dto';

export class QueryCourseDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
