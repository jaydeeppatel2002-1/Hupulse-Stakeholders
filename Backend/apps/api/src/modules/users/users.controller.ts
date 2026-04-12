import {
  Controller, Get, Post, Put,
  Body, Param, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { OrgId, UserId } from '@shared/decorators';
import { Roles } from '@shared/auth';
import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@UserId() userId: string) {
    return this.service.getProfile(userId);
  }

  @Get()
  @ApiOperation({ summary: 'List organization users' })
  findAll(@OrgId() orgId: string) {
    return this.service.findAllInOrg(orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail' })
  findOne(@OrgId() orgId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(orgId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a user (Admin only)' })
  create(@OrgId() orgId: string, @Body() dto: CreateUserDto) {
    return this.service.create(orgId, dto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  update(
    @OrgId() orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(orgId, id, dto);
  }
}
