import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto';
import { OrgId } from '@shared/decorators';

@ApiTags('Tags')
@ApiBearerAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags for the organization' })
  findAll(@OrgId() orgId: string) {
    return this.service.findAll(orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  create(@OrgId() orgId: string, @Body() dto: CreateTagDto) {
    return this.service.create(orgId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tag' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTagDto,
  ) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(orgId, id);
  }
}
