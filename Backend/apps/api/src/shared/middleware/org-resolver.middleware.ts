import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class OrgResolverMiddleware implements NestMiddleware {
  private readonly isDev: boolean;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.isDev = this.config.get<string>('NODE_ENV') === 'development';
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const supabaseUserId = (req as any).user?.supabaseUserId;
    if (!supabaseUserId) return next();

    try {
      const user = await this.prisma.user.findUnique({
        where: { supabaseUserId },
        select: { id: true, organizationId: true, role: true },
      });

      if (user) {
        (req as any).userId = user.id;
        (req as any).organizationId = user.organizationId;
        (req as any).userRole = user.role;
        return next();
      }
    } catch {
      // Database may not be reachable in development
    }

    // In development, inject mock context so endpoints are testable
    if (this.isDev) {
      (req as any).userId = 'dev-user-id';
      (req as any).organizationId = 'dev-org-id';
      (req as any).userRole = 'ADMIN';
      return next();
    }

    throw new UnauthorizedException('User not found');
  }
}
