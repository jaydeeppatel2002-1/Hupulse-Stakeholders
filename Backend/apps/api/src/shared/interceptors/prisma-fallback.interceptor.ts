import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Intercepts Prisma connection / initialisation errors and returns
 * sensible empty payloads so the frontend receives 200 instead of 500
 * when the database is unavailable (e.g. placeholder credentials).
 */
@Injectable()
export class PrismaFallbackInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PrismaFallbackInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (!this.isPrismaConnectionError(error)) {
          throw error;
        }

        const req = context.switchToHttp().getRequest<Request>();
        const method = req.method;
        const url = req.url;

        this.logger.warn(
          `Database unavailable – returning fallback for ${method} ${url}`,
        );

        if (method !== 'GET') {
          throw new ServiceUnavailableException('Database is not available');
        }

        // Stats / dashboard / matrix / team-progress / engagement etc.
        const singleObjectPaths = [
          '/stats',
          '/dashboard',
          '/matrix',
          '/team-progress',
          '/engagement',
          '/risk',
          '/departments',
          '/analytics/communication',
          '/predictive',
        ];

        const urlPath = url.split('?')[0];
        if (singleObjectPaths.some((p) => urlPath.endsWith(p))) {
          return of({});
        }

        // Alert-style list endpoints that return plain arrays
        if (url.includes('/alerts') || url.includes('/results')) {
          return of([]);
        }

        // Default: paginated list
        return of({ data: [], total: 0, page: 1, limit: 20 });
      }),
    );
  }

  private isPrismaConnectionError(error: any): boolean {
    const name = error?.constructor?.name ?? error?.name ?? '';
    if (
      name === 'PrismaClientInitializationError' ||
      name === 'PrismaClientKnownRequestError' ||
      name === 'PrismaClientUnknownRequestError'
    ) {
      return true;
    }
    const msg = (error?.message ?? '').toLowerCase();
    return (
      msg.includes("can't reach database") ||
      msg.includes('connection refused') ||
      msg.includes('prisma') && msg.includes('connect')
    );
  }
}
