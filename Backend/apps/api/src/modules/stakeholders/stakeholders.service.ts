import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateStakeholderDto, UpdateStakeholderDto, QueryStakeholderDto } from './dto';
import { PaginatedResult } from '@shared/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StakeholdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: QueryStakeholderDto) {
    const where: Prisma.StakeholderWhereInput = {
      organizationId: orgId,
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.sentiment && { sentiment: query.sentiment }),
      ...(query.department && { department: query.department }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' } },
          { lastName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { company: { contains: query.search, mode: 'insensitive' } },
          { jobTitle: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const sortField = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const orderBy: Prisma.StakeholderOrderByWithRelationInput =
      ['firstName', 'powerScore', 'interestScore', 'createdAt'].includes(sortField)
        ? { [sortField]: sortOrder } as Prisma.StakeholderOrderByWithRelationInput
        : { createdAt: sortOrder };

    const [data, total] = await Promise.all([
      this.prisma.stakeholder.findMany({
        where,
        orderBy,
        skip: query.skip,
        take: query.limit,
        include: {
          tags: { include: { tag: true } },
          engagementScores: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.stakeholder.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOne(orgId: string, id: string) {
    const stakeholder = await this.prisma.stakeholder.findFirst({
      where: { id, organizationId: orgId },
      include: {
        tags: { include: { tag: true } },
        communications: {
          include: { communication: true },
          orderBy: { communication: { occurredAt: 'desc' } },
          take: 10,
        },
        surveyResponses: {
          include: { survey: true },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        },
        courseAssignments: {
          include: { course: true },
          orderBy: { createdAt: 'desc' },
        },
        engagementScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 12,
        },
      },
    });

    if (!stakeholder) throw new NotFoundException('Stakeholder not found');
    return stakeholder;
  }

  async create(orgId: string, dto: CreateStakeholderDto) {
    const { tagIds, ...data } = dto;

    return this.prisma.stakeholder.create({
      data: {
        ...data,
        organizationId: orgId,
        ...(tagIds?.length && {
          tags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async update(orgId: string, id: string, dto: UpdateStakeholderDto) {
    await this.findOne(orgId, id);
    const { tagIds, ...data } = dto;

    if (tagIds) {
      await this.prisma.stakeholderTag.deleteMany({
        where: { stakeholderId: id },
      });
    }

    return this.prisma.stakeholder.update({
      where: { id },
      data: {
        ...data,
        ...(tagIds && {
          tags: {
            create: tagIds.map((tagId) => ({ tagId })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.stakeholder.delete({ where: { id } });
  }

  async getMatrix(orgId: string) {
    const stakeholders = await this.prisma.stakeholder.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        powerScore: true,
        interestScore: true,
        sentiment: true,
        type: true,
        department: true,
      },
    });
    return stakeholders;
  }

  async getStats(orgId: string) {
    const [total, byType, bySentiment, byStatus] = await Promise.all([
      this.prisma.stakeholder.count({ where: { organizationId: orgId } }),
      this.prisma.stakeholder.groupBy({
        by: ['type'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
      this.prisma.stakeholder.groupBy({
        by: ['sentiment'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
      this.prisma.stakeholder.groupBy({
        by: ['status'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      byType: byType.map((g) => ({ type: g.type, count: g._count.id })),
      bySentiment: bySentiment.map((g) => ({ sentiment: g.sentiment, count: g._count.id })),
      byStatus: byStatus.map((g) => ({ status: g.status, count: g._count.id })),
    };
  }
}
