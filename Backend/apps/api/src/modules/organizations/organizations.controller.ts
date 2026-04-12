import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto';
import { OrgId } from '@shared/decorators';
import { Roles } from '@shared/auth';
import { UserRole } from '@prisma/client';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current organization' })
  getCurrent(@OrgId() orgId: string) {
    return this.service.findOne(orgId);
  }

  @Put('current')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update current organization (Admin only)' })
  update(@OrgId() orgId: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(orgId, dto);
  }
}
