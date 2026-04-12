import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { OrgId } from '@shared/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  getDashboard(@OrgId() orgId: string) {
    return this.service.getDashboardStats(orgId);
  }

  @Get('engagement')
  @ApiOperation({ summary: 'Get engagement trends' })
  getEngagement(@OrgId() orgId: string) {
    return this.service.getEngagementTrends(orgId);
  }

  @Get('risk')
  @ApiOperation({ summary: 'Get risk scoring data' })
  getRisk(@OrgId() orgId: string) {
    return this.service.getRiskScoring(orgId);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get department engagement scores' })
  getDepartments(@OrgId() orgId: string) {
    return this.service.getDepartmentEngagement(orgId);
  }

  @Get('communication')
  @ApiOperation({ summary: 'Get communication analytics' })
  getCommunication(@OrgId() orgId: string) {
    return this.service.getCommunicationAnalytics(orgId);
  }

  @Get('predictive')
  @ApiOperation({ summary: 'Get AI predictive insights' })
  getPredictive(@OrgId() orgId: string) {
    return this.service.getPredictiveInsights(orgId);
  }
}
