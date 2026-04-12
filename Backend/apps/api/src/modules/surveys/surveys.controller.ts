import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, UpdateSurveyDto, SubmitResponseDto, QuerySurveyDto } from './dto';
import { OrgId, UserId } from '@shared/decorators';

@ApiTags('Surveys')
@ApiBearerAuth()
@Controller('surveys')
export class SurveysController {
  constructor(private readonly service: SurveysService) {}

  @Get()
  @ApiOperation({ summary: 'List surveys' })
  findAll(@OrgId() orgId: string, @Query() query: QuerySurveyDto) {
    return this.service.findAll(orgId, query);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get feedback alerts' })
  getAlerts(@OrgId() orgId: string) {
    return this.service.getAlerts(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get survey detail' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(orgId, id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get survey results' })
  getResults(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getResults(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a survey' })
  create(@OrgId() orgId: string, @UserId() userId: string, @Body() dto: CreateSurveyDto) {
    return this.service.create(orgId, userId, dto);
  }

  @Post(':id/responses')
  @ApiOperation({ summary: 'Submit a survey response' })
  submitResponse(
    @OrgId() orgId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.service.submitResponse(orgId, id, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a survey' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSurveyDto,
  ) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a survey' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(orgId, id);
  }
}
