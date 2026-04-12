import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaFallbackInterceptor } from '@shared/interceptors/prisma-fallback.interceptor';

// Shared
import { DatabaseModule } from '@shared/database';
import { AuthModule, SupabaseGuard, RolesGuard } from '@shared/auth';
import { OrgResolverMiddleware, DevAuthMiddleware } from '@shared/middleware';

// Feature modules
import { StakeholdersModule } from '@modules/stakeholders/stakeholders.module';
import { CommunicationsModule } from '@modules/communications/communications.module';
import { SurveysModule } from '@modules/surveys/surveys.module';
import { LearningModule } from '@modules/learning/learning.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { UsersModule } from '@modules/users/users.module';
import { TagsModule } from '@modules/tags/tags.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
    }]),

    // Core
    DatabaseModule,
    AuthModule,

    // Feature modules
    StakeholdersModule,
    CommunicationsModule,
    SurveysModule,
    LearningModule,
    AnalyticsModule,
    NotificationsModule,
    UsersModule,
    TagsModule,
    OrganizationsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: SupabaseGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: PrismaFallbackInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DevAuthMiddleware, OrgResolverMiddleware).forRoutes('*');
  }
}
