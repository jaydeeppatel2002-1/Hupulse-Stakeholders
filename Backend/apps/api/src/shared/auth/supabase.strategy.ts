import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  aud?: string;
}

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(config: ConfigService) {
    const jwtSecret = config.get<string>('SUPABASE_JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return { supabaseUserId: payload.sub, email: payload.email };
  }
}
