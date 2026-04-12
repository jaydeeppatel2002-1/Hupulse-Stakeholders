import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto, SubmitResponseDto, QuerySurveyDto } from './dto';
import { PaginatedResult } from '@shared/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: QuerySurveyDto) {
    const where: Prisma.SurveyWhereInput = {
      organizationId: orgId,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          createdBy: { select: { id: true, fullName: true } },
          _count: { select: { responses: true } },
        },
      }),
      this.prisma.survey.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOne(orgId: string, id: string) {
    const survey = await this.prisma.survey.findFirst({
      where: { id, organizationId: orgId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { responses: true } },
      },
    });
    if (!survey) throw new NotFoundException('Survey not found');
    return survey;
  }

  async create(orgId: string, userId: string, dto: CreateSurveyDto) {
    return this.prisma.survey.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        questions: dto.questions,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        organizationId: orgId,
        createdById: userId,
      },
    });
  }

  async update(orgId: string, id: string, dto: UpdateSurveyDto) {
    await this.findOne(orgId, id);
    const { startsAt, endsAt, ...rest } = dto;

    return this.prisma.survey.update({
      where: { id },
      data: {
        ...rest,
        ...(startsAt && { startsAt: new Date(startsAt) }),
        ...(endsAt && { endsAt: new Date(endsAt) }),
      },
    });
  }

  async remove(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.survey.delete({ where: { id } });
  }

  async submitResponse(orgId: string, surveyId: string, userId: string, dto: SubmitResponseDto) {
    await this.findOne(orgId, surveyId);

    return this.prisma.surveyResponse.create({
      data: {
        surveyId,
        stakeholderId: dto.stakeholderId,
        submittedById: userId,
        answers: dto.answers,
        sentiment: dto.sentiment,
        score: dto.score,
      },
    });
  }

  async getResults(orgId: string, surveyId: string) {
    await this.findOne(orgId, surveyId);

    const responses = await this.prisma.surveyResponse.findMany({
      where: { surveyId },
      include: {
        stakeholder: {
          select: { id: true, firstName: true, lastName: true, department: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const totalResponses = responses.length;
    const avgScore =
      totalResponses > 0
        ? responses.reduce((acc, r) => acc + (r.score ?? 0), 0) / totalResponses
        : 0;

    const sentimentBreakdown = responses.reduce(
      (acc, r) => {
        if (r.sentiment) {
          acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalResponses,
      avgScore: Math.round(avgScore * 100) / 100,
      sentimentBreakdown,
      responses,
    };
  }

  async getAlerts(orgId: string) {
    // Find surveys with low or declining sentiment
    const recentResponses = await this.prisma.surveyResponse.findMany({
      where: {
        survey: { organizationId: orgId },
        submittedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      include: {
        stakeholder: { select: { department: true } },
      },
    });

    const alerts: Array<{
      severity: string;
      department: string;
      message: string;
      time: string;
    }> = [];

    // Group by department, check for low scores
    const byDept = new Map<string, number[]>();
    for (const r of recentResponses) {
      const dept = r.stakeholder.department ?? 'Unknown';
      if (!byDept.has(dept)) byDept.set(dept, []);
      if (r.score != null) byDept.get(dept)!.push(r.score);
    }

    for (const [dept, scores] of byDept) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 3) {
        alerts.push({
          severity: 'critical',
          department: dept,
          message: `${dept} average satisfaction score is ${avg.toFixed(1)}/10`,
          time: new Date().toISOString(),
        });
      } else if (avg < 5) {
        alerts.push({
          severity: 'high',
          department: dept,
          message: `${dept} satisfaction declining - average ${avg.toFixed(1)}/10`,
          time: new Date().toISOString(),
        });
      }
    }

    return alerts;
  }
}
