import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  const prefix = config.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:5173');

  // Global prefix
  app.setGlobalPrefix(prefix);

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HuPulse Stakeholder API')
    .setDescription('Production API for HuPulse Stakeholder Management Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Health', 'Health check endpoints')
    .addTag('Stakeholders', 'Stakeholder management')
    .addTag('Communications', 'Communication logging')
    .addTag('Surveys', 'Surveys and feedback')
    .addTag('Learning', 'Learning management')
    .addTag('Analytics', 'Analytics and insights')
    .addTag('Notifications', 'User notifications')
    .addTag('Users', 'User management')
    .addTag('Tags', 'Tag management')
    .addTag('Organizations', 'Organization settings')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`🚀 HuPulse Stakeholder API running on http://localhost:${port}/${prefix}`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/${prefix}/docs`);
}

bootstrap();
