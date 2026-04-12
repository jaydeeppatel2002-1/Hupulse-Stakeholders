import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateCourseDto, UpdateCourseDto, AssignCourseDto, UpdateProgressDto, QueryCourseDto } from './dto';
import { PaginatedResult } from '@shared/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async findAllCourses(orgId: string, query: QueryCourseDto) {
    const where: Prisma.CourseWhereInput = {
      organizationId: orgId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
        include: {
          _count: { select: { assignments: true } },
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findOneCourse(orgId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, organizationId: orgId },
      include: {
        assignments: {
          include: {
            stakeholder: {
              select: { id: true, firstName: true, lastName: true, department: true },
            },
          },
        },
        _count: { select: { assignments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async createCourse(orgId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, organizationId: orgId },
    });
  }

  async updateCourse(orgId: string, id: string, dto: UpdateCourseDto) {
    await this.findOneCourse(orgId, id);
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async removeCourse(orgId: string, id: string) {
    await this.findOneCourse(orgId, id);
    return this.prisma.course.delete({ where: { id } });
  }

  async assignCourse(orgId: string, courseId: string, userId: string, dto: AssignCourseDto) {
    await this.findOneCourse(orgId, courseId);

    return this.prisma.courseAssignment.create({
      data: {
        courseId,
        stakeholderId: dto.stakeholderId,
        assignedById: userId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        notes: dto.notes,
      },
      include: {
        course: true,
        stakeholder: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateProgress(orgId: string, assignmentId: string, dto: UpdateProgressDto) {
    const assignment = await this.prisma.courseAssignment.findFirst({
      where: { id: assignmentId },
      include: { course: { select: { organizationId: true } } },
    });
    if (!assignment || assignment.course.organizationId !== orgId) {
      throw new NotFoundException('Assignment not found');
    }

    const data: any = { ...dto };
    if (dto.status === 'IN_PROGRESS' && !assignment.startedAt) {
      data.startedAt = new Date();
    }
    if (dto.status === 'COMPLETED') {
      data.completedAt = new Date();
      data.progress = 100;
    }

    return this.prisma.courseAssignment.update({
      where: { id: assignmentId },
      data,
    });
  }

  async getTeamProgress(orgId: string) {
    const assignments = await this.prisma.courseAssignment.findMany({
      where: { course: { organizationId: orgId } },
      include: {
        stakeholder: { select: { department: true } },
      },
    });

    const byDept = new Map<string, { completed: number; in_progress: number; not_started: number }>();

    for (const a of assignments) {
      const dept = a.stakeholder.department ?? 'Unknown';
      if (!byDept.has(dept)) byDept.set(dept, { completed: 0, in_progress: 0, not_started: 0 });
      const d = byDept.get(dept)!;
      if (a.status === 'COMPLETED') d.completed++;
      else if (a.status === 'IN_PROGRESS') d.in_progress++;
      else d.not_started++;
    }

    return Array.from(byDept.entries()).map(([name, stats]) => ({
      name,
      ...stats,
    }));
  }
}
