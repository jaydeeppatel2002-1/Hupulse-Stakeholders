import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseStrategy, SupabaseGuard, RolesGuard],
  exports: [SupabaseStrategy, SupabaseGuard, RolesGuard],
})
export class AuthModule {}
