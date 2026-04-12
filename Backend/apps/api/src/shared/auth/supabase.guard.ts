import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class SupabaseGuard extends AuthGuard('supabase') {
  private readonly isDev: boolean;

  constructor(
    private reflector: Reflector,
    private config: ConfigService,
  ) {
    super();
    this.isDev = this.config.get<string>('NODE_ENV') === 'development';
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // In development, allow requests without a JWT token
    if (this.isDev) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers?.authorization;
      if (!authHeader) return true;
    }

    return super.canActivate(context);
  }
}
