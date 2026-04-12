import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateCommunicationDto, UpdateCommunicationDto, QueryCommunicationDto } from './dto';
import { PaginatedResult } from '@shared/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: QueryCommunicationDto) {
    const where: Prisma.CommunicationWhereInput = {
      organizationId: orgId,
      ...(query.channel && { channel: query.channel }),
      ...(query.sentiment && { sentiment: query.sentiment }),
      ...(query.stakeholderId && {
        stakeholders: { some: { stakeholderId: query.stakeholderId } },
      }),
      ...(query.dateFrom || query.dateTo
        ? {
            occurredAt: {
              ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
              ...(query.dateTo && { lte: new Date(query.dateTo) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { subject: { contains: query.search, mode: 'insensitive' } },
          { body: { contains: query.search, mode: 'insensitive' } },
          { summary: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
          stakeholders: {
            include: {
              stakeholder: {
                select: { id: true, firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
          attachments: true,
        },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOne(orgId: string, id: string) {
    const comm = await this.prisma.communication.findFirst({
      where: { id, organizationId: orgId },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
        stakeholders: {
          include: { stakeholder: true },
        },
        attachments: true,
      },
    });
    if (!comm) throw new NotFoundException('Communication not found');
    return comm;
  }

  async create(orgId: string, userId: string, dto: CreateCommunicationDto) {
    const { stakeholderIds, occurredAt, ...data } = dto;

    return this.prisma.communication.create({
      data: {
        ...data,
        organizationId: orgId,
        createdById: userId,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        stakeholders: {
          create: stakeholderIds.map((stakeholderId) => ({ stakeholderId })),
        },
      },
      include: {
        createdBy: { select: { id: true, fullName: true, avatarUrl: true } },
        stakeholders: { include: { stakeholder: true } },
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateCommunicationDto) {
    await this.findOne(orgId, id);
    const { stakeholderIds, occurredAt, ...data } = dto;

    if (stakeholderIds) {
      await this.prisma.communicationStakeholder.deleteMany({
        where: { communicationId: id },
      });
    }

    return this.prisma.communication.update({
      where: { id },
      data: {
        ...data,
        ...(occurredAt && { occurredAt: new Date(occurredAt) }),
        ...(stakeholderIds && {
          stakeholders: {
            create: stakeholderIds.map((stakeholderId) => ({ stakeholderId })),
          },
        }),
      },
      include: {
        stakeholders: { include: { stakeholder: true } },
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.communication.delete({ where: { id } });
  }

  async getStats(orgId: string) {
    const [total, bySentiment, byChannel, recentWeekly] = await Promise.all([
      this.prisma.communication.count({ where: { organizationId: orgId } }),
      this.prisma.communication.groupBy({
        by: ['sentiment'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
      this.prisma.communication.groupBy({
        by: ['channel'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
      this.prisma.$queryRaw<Array<{ week: string; channel: string; count: bigint }>>`
        SELECT
          to_char(date_trunc('week', occurred_at), 'YYYY-MM-DD') as week,
          channel,
          COUNT(*)::bigint as count
        FROM communications
        WHERE organization_id = ${orgId}::uuid
          AND occurred_at >= NOW() - INTERVAL '8 weeks'
        GROUP BY week, channel
        ORDER BY week
      `,
    ]);

    return {
      totalInteractions: total,
      bySentiment: bySentiment.map((g) => ({ sentiment: g.sentiment, count: g._count.id })),
      channelBreakdown: byChannel.map((g) => ({ channel: g.channel, count: g._count.id })),
      weeklyActivity: recentWeekly.map((r) => ({
        week: r.week,
        channel: r.channel,
        count: Number(r.count),
      })),
    };
  }
}
