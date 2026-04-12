import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getEngagementTrends(orgId: string) {
    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where: {
        organizationId: orgId,
        metricType: { in: ['engagement_overall', 'engagement_communication', 'engagement_sentiment', 'engagement_actions'] },
      },
      orderBy: { snapshotDate: 'asc' },
    });

    // Group by month
    const grouped = new Map<string, Record<string, number>>();
    for (const s of snapshots) {
      const month = s.snapshotDate.toISOString().slice(0, 7);
      if (!grouped.has(month)) grouped.set(month, {});
      const key = s.metricType.replace('engagement_', '');
      grouped.get(month)![key] = s.metricValue;
    }

    return Array.from(grouped.entries()).map(([month, metrics]) => ({
      month,
      overall: metrics['overall'] ?? 0,
      communication: metrics['communication'] ?? 0,
      sentiment: metrics['sentiment'] ?? 0,
      actions: metrics['actions'] ?? 0,
    }));
  }

  async getRiskScoring(orgId: string) {
    const stakeholders = await this.prisma.stakeholder.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        powerScore: true,
        interestScore: true,
        sentiment: true,
        engagementScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    return stakeholders.map((s) => {
      // Risk = high power + low engagement + negative sentiment
      const latestScore = s.engagementScores[0]?.score ?? 50;
      const sentimentFactor =
        s.sentiment === 'RESISTANT' ? 30 : s.sentiment === 'NEUTRAL' ? 15 : 0;
      const risk = Math.min(
        100,
        Math.max(0, (s.powerScore * 10) - latestScore + sentimentFactor),
      );

      return {
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        risk: Math.round(risk),
        influence: s.powerScore * 10,
        department: s.department ?? 'Unknown',
      };
    });
  }

  async getDepartmentEngagement(orgId: string) {
    const stakeholders = await this.prisma.stakeholder.findMany({
      where: { organizationId: orgId, status: 'ACTIVE' },
      select: {
        department: true,
        engagementScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 2,
        },
      },
    });

    const byDept = new Map<string, { scores: number[]; prevScores: number[] }>();

    for (const s of stakeholders) {
      const dept = s.department ?? 'Unknown';
      if (!byDept.has(dept)) byDept.set(dept, { scores: [], prevScores: [] });
      const d = byDept.get(dept)!;
      if (s.engagementScores[0]) d.scores.push(s.engagementScores[0].score);
      if (s.engagementScores[1]) d.prevScores.push(s.engagementScores[1].score);
    }

    return Array.from(byDept.entries()).map(([department, data]) => {
      const avg = data.scores.length
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : 0;
      const prevAvg = data.prevScores.length
        ? data.prevScores.reduce((a, b) => a + b, 0) / data.prevScores.length
        : avg;
      const change = prevAvg > 0 ? ((avg - prevAvg) / prevAvg) * 100 : 0;

      return {
        department,
        score: Math.round(avg),
        change: Math.round(change * 10) / 10,
      };
    });
  }

  async getCommunicationAnalytics(orgId: string) {
    const velocity = await this.prisma.$queryRaw<
      Array<{ week: string; direction: string; count: bigint }>
    >`
      SELECT
        to_char(date_trunc('week', occurred_at), 'YYYY-MM-DD') as week,
        direction,
        COUNT(*)::bigint as count
      FROM communications
      WHERE organization_id = ${orgId}::uuid
        AND occurred_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY week, direction
      ORDER BY week
    `;

    const channelEffectiveness = await this.prisma.$queryRaw<
      Array<{ channel: string; count: bigint; positive: bigint }>
    >`
      SELECT
        channel,
        COUNT(*)::bigint as count,
        COUNT(*) FILTER (WHERE sentiment = 'SUPPORTIVE')::bigint as positive
      FROM communications
      WHERE organization_id = ${orgId}::uuid
      GROUP BY channel
    `;

    return {
      velocity: velocity.map((r) => ({
        week: r.week,
        direction: r.direction,
        count: Number(r.count),
      })),
      channelEffectiveness: channelEffectiveness.map((r) => ({
        channel: r.channel,
        volume: Number(r.count),
        effectiveness: Number(r.count) > 0
          ? Math.round((Number(r.positive) / Number(r.count)) * 100)
          : 0,
      })),
    };
  }

  async getPredictiveInsights(orgId: string) {
    // Compute insights from current data patterns
    const [atRiskCount, resistantCount, lowEngagement] = await Promise.all([
      this.prisma.stakeholder.count({
        where: { organizationId: orgId, status: 'AT_RISK' },
      }),
      this.prisma.stakeholder.count({
        where: { organizationId: orgId, sentiment: 'RESISTANT' },
      }),
      this.prisma.stakeholder.count({
        where: {
          organizationId: orgId,
          engagementScores: { some: { score: { lt: 30 } } },
        },
      }),
    ]);

    const insights: Array<{
      title: string;
      prediction: string;
      confidence: number;
      impact: string;
      action: string;
    }> = [];

    if (atRiskCount > 0) {
      insights.push({
        title: 'At-Risk Stakeholders',
        prediction: `${atRiskCount} stakeholder(s) flagged at-risk may disengage within 30 days`,
        confidence: 78,
        impact: 'high',
        action: 'Schedule 1:1 check-ins with at-risk stakeholders',
      });
    }

    if (resistantCount > 2) {
      insights.push({
        title: 'Sentiment Decline',
        prediction: `Growing resistance detected across ${resistantCount} stakeholders`,
        confidence: 72,
        impact: 'high',
        action: 'Conduct a focused listening session to address concerns',
      });
    }

    if (lowEngagement > 0) {
      insights.push({
        title: 'Engagement Opportunity',
        prediction: `${lowEngagement} stakeholder(s) with low engagement scores detected`,
        confidence: 85,
        impact: 'opportunity',
        action: 'Launch targeted engagement campaign for low-scoring stakeholders',
      });
    }

    // Always return at least one insight
    if (insights.length === 0) {
      insights.push({
        title: 'Positive Trajectory',
        prediction: 'Overall stakeholder engagement is trending positively',
        confidence: 80,
        impact: 'opportunity',
        action: 'Continue current engagement strategies',
      });
    }

    return insights;
  }

  async getDashboardStats(orgId: string) {
    const [
      totalStakeholders,
      activeStakeholders,
      totalCommunications,
      totalSurveys,
      recentComms,
      sentimentDist,
    ] = await Promise.all([
      this.prisma.stakeholder.count({ where: { organizationId: orgId } }),
      this.prisma.stakeholder.count({
        where: { organizationId: orgId, status: 'ACTIVE' },
      }),
      this.prisma.communication.count({ where: { organizationId: orgId } }),
      this.prisma.survey.count({ where: { organizationId: orgId } }),
      this.prisma.communication.count({
        where: {
          organizationId: orgId,
          occurredAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.stakeholder.groupBy({
        by: ['sentiment'],
        where: { organizationId: orgId },
        _count: { id: true },
      }),
    ]);

    return {
      totalStakeholders,
      activeStakeholders,
      totalCommunications,
      communicationsThisWeek: recentComms,
      totalSurveys,
      sentimentDistribution: sentimentDist.map((g) => ({
        sentiment: g.sentiment,
        count: g._count.id,
      })),
    };
  }
}
