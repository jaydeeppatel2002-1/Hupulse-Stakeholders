import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to PostgreSQL...');
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      this.logger.warn('Failed to connect to PostgreSQL — running without database');
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from PostgreSQL...');
    await this.$disconnect();
  }
}
