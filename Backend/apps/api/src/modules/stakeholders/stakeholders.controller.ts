import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StakeholdersService } from './stakeholders.service';
import { CreateStakeholderDto, UpdateStakeholderDto, QueryStakeholderDto } from './dto';
import { OrgId } from '@shared/decorators';

@ApiTags('Stakeholders')
@ApiBearerAuth()
@Controller('stakeholders')
export class StakeholdersController {
  constructor(private readonly service: StakeholdersService) {}

  @Get()
  @ApiOperation({ summary: 'List stakeholders with pagination and filters' })
  findAll(@OrgId() orgId: string, @Query() query: QueryStakeholderDto) {
    return this.service.findAll(orgId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get stakeholder statistics' })
  getStats(@OrgId() orgId: string) {
    return this.service.getStats(orgId);
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get power-interest matrix data' })
  getMatrix(@OrgId() orgId: string) {
    return this.service.getMatrix(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stakeholder detail' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(orgId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new stakeholder' })
  create(@OrgId() orgId: string, @Body() dto: CreateStakeholderDto) {
    return this.service.create(orgId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a stakeholder' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStakeholderDto,
  ) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stakeholder' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(orgId, id);
  }
}
