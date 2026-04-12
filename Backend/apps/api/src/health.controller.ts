import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@shared/auth';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'hupulse-stakeholder-api',
    };
  }
}
