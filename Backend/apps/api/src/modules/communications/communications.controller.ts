import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { CreateCommunicationDto, UpdateCommunicationDto, QueryCommunicationDto } from './dto';
import { OrgId, UserId } from '@shared/decorators';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Get()
  @ApiOperation({ summary: 'List communications' })
  findAll(@OrgId() orgId: string, @Query() query: QueryCommunicationDto) {
    return this.service.findAll(orgId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get communication statistics' })
  getStats(@OrgId() orgId: string) {
    return this.service.getStats(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication detail' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Log a new communication' })
  create(
    @OrgId() orgId: string,
    @UserId() userId: string,
    @Body() dto: CreateCommunicationDto,
  ) {
    return this.service.create(orgId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a communication' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommunicationDto,
  ) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a communication' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(orgId, id);
  }
}
