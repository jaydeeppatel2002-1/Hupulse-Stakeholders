import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { CreateCourseDto, UpdateCourseDto, AssignCourseDto, UpdateProgressDto, QueryCourseDto } from './dto';
import { OrgId, UserId } from '@shared/decorators';

@ApiTags('Learning')
@ApiBearerAuth()
@Controller('courses')
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get()
  @ApiOperation({ summary: 'List courses' })
  findAll(@OrgId() orgId: string, @Query() query: QueryCourseDto) {
    return this.service.findAllCourses(orgId, query);
  }

  @Get('team-progress')
  @ApiOperation({ summary: 'Get team learning progress by department' })
  getTeamProgress(@OrgId() orgId: string) {
    return this.service.getTeamProgress(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course detail' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneCourse(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a course' })
  create(@OrgId() orgId: string, @Body() dto: CreateCourseDto) {
    return this.service.createCourse(orgId, dto);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign a course to a stakeholder' })
  assign(
    @OrgId() orgId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignCourseDto,
  ) {
    return this.service.assignCourse(orgId, id, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.service.updateCourse(orgId, id, dto);
  }

  @Put('assignments/:assignmentId/progress')
  @ApiOperation({ summary: 'Update assignment progress' })
  updateProgress(
    @OrgId() orgId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.service.updateProgress(orgId, assignmentId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.removeCourse(orgId, id);
  }
}
