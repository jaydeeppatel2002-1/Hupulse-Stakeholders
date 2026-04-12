import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findBySupabaseId(supabaseUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId },
      include: { organization: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAllInOrg(orgId: string) {
    return this.prisma.user.findMany({
      where: { organizationId: orgId },
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });
  }

  async findOne(orgId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId: orgId },
      include: { organization: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(orgId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('User with this email already exists');

    return this.prisma.user.create({
      data: { ...dto, organizationId: orgId },
    });
  }

  async update(orgId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(orgId, id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async syncLogin(supabaseUserId: string) {
    return this.prisma.user.update({
      where: { supabaseUserId },
      data: { lastLoginAt: new Date() },
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
  }
}
