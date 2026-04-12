import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateTagDto } from './dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.tag.findMany({
      where: { organizationId: orgId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { stakeholders: true } } },
    });
  }

  async create(orgId: string, dto: CreateTagDto) {
    return this.prisma.tag.create({
      data: { ...dto, organizationId: orgId },
    });
  }

  async update(orgId: string, id: string, dto: CreateTagDto) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!tag) throw new NotFoundException('Tag not found');

    return this.prisma.tag.update({ where: { id }, data: dto });
  }

  async remove(orgId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!tag) throw new NotFoundException('Tag not found');

    return this.prisma.tag.delete({ where: { id } });
  }
}
