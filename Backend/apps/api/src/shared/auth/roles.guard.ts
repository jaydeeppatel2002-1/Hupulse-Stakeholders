import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const supabaseUserId = request.user?.supabaseUserId;
    if (!supabaseUserId) return false;

    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId },
      select: { role: true },
    });

    return !!user && requiredRoles.includes(user.role);
  }
}
