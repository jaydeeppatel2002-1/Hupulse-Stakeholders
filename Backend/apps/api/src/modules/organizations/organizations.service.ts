import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { users: true, stakeholders: true } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }
}
