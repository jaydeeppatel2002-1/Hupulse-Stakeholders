import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

/**
 * In development mode, if no valid JWT is provided, this middleware
 * injects a mock user context so API endpoints can be exercised
 * without a running Supabase auth backend.
 *
 * Activated only when NODE_ENV === 'development'.
 */
@Injectable()
export class DevAuthMiddleware implements NestMiddleware {
  private readonly isDev: boolean;

  constructor(private config: ConfigService) {
    this.isDev = this.config.get<string>('NODE_ENV') === 'development';
  }

  use(req: Request, _res: Response, next: NextFunction) {
    if (!this.isDev) return next();

    // Only inject when the guard already let the request through as
    // "unauthenticated" (i.e. no JWT was supplied).
    if (!(req as any).user) {
      (req as any).user = { supabaseUserId: 'dev-user-000' };
    }

    next();
  }
}
