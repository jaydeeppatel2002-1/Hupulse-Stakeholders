import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, PieChart, Pie,
} from "recharts";
import {
  TrendingUp, TrendingDown, Brain, Zap, AlertTriangle,
  BarChart3, Activity, Users, Target, ArrowUpRight, ArrowDownRight,
  Download, RefreshCcw, Calendar, Filter, Building2, Layers,
} from "lucide-react";
import { analyticsApi } from "../../api";
import { useAppContext, clients, programs } from "../../contexts/AppContext";

const engagementTrend = [
  { month: "Sep", overall: 62, communication: 55, sentiment: 70, actions: 45 },
  { month: "Oct", overall: 65, communication: 60, sentiment: 68, actions: 52 },
  { month: "Nov", overall: 60, communication: 58, sentiment: 64, actions: 50 },
  { month: "Dec", overall: 68, communication: 65, sentiment: 72, actions: 60 },
  { month: "Jan", overall: 72, communication: 70, sentiment: 75, actions: 65 },
  { month: "Feb", overall: 79, communication: 76, sentiment: 80, actions: 72 },
  { month: "Mar", overall: 87, communication: 84, sentiment: 88, actions: 80 },
];

const riskScoring = [
  { name: "Sarah Chen", risk: 8, influence: 92, dept: "Marketing" },
  { name: "Marcus J.", risk: 12, influence: 88, dept: "Engineering" },
  { name: "Elena R.", risk: 35, influence: 76, dept: "Operations" },
  { name: "Richard H.", risk: 78, influence: 22, dept: "Finance" },
  { name: "Patricia W.", risk: 58, influence: 41, dept: "Operations" },
  { name: "David K.", risk: 82, influence: 18, dept: "IT" },
  { name: "Amanda F.", risk: 15, influence: 84, dept: "HR" },
  { name: "James P.", risk: 20, influence: 79, dept: "Strategy" },
];

const deptEngagement = [
  { dept: "Marketing", score: 88, change: 8 },
  { dept: "Engineering", score: 82, change: 6 },
  { dept: "HR", score: 85, change: 11 },
  { dept: "Strategy", score: 79, change: 5 },
  { dept: "Operations", score: 61, change: -4 },
  { dept: "Finance", score: 38, change: -12 },
  { dept: "IT", score: 42, change: -8 },
];

const communicationVelocity = [
  { week: "W1", initiated: 18, responded: 14, followedUp: 10 },
  { week: "W2", initiated: 24, responded: 20, followedUp: 15 },
  { week: "W3", initiated: 20, responded: 16, followedUp: 12 },
  { week: "W4", initiated: 30, responded: 26, followedUp: 22 },
  { week: "W5", initiated: 28, responded: 24, followedUp: 20 },
  { week: "W6", initiated: 35, responded: 32, followedUp: 28 },
];

const predictiveInsights = [
  {
    title: "Finance Alignment: Critical Risk",
    prediction: "Based on current sentiment trajectory, Finance department will reach critical resistance threshold in 12 days without intervention.",
    confidence: 91,
    impact: "high",
    color: "#EF4444",
    action: "Schedule executive escalation",
  },
  {
    title: "Operations: Improvement Trajectory",
    prediction: "Operations engagement declining at -4 points/month. If current communication frequency maintained, neutral threshold breach in 3 weeks.",
    confidence: 78,
    impact: "medium",
    color: "#F59E0B",
    action: "Increase communication cadence",
  },
  {
    title: "Marketing Champions Effect",
    prediction: "Sarah Chen's advocacy has measurably improved sentiment in 3 adjacent teams. Expanding her ambassador role could unlock +15% org-wide engagement.",
    confidence: 84,
    impact: "opportunity",
    color: "#10B981",
    action: "Activate champion program",
  },
];

const channelEffectiveness = [
  { channel: "Executive 1:1", effectiveness: 92, volume: 12 },
  { channel: "Town Hall", effectiveness: 78, volume: 4 },
  { channel: "Email Campaign", effectiveness: 52, volume: 48 },
  { channel: "Team Briefing", effectiveness: 85, volume: 18 },
  { channel: "Video Update", effectiveness: 71, volume: 22 },
  { channel: "Slack/Chat", effectiveness: 44, volume: 120 },
];

// Per-client engagement data for drilldowns
const clientEngagementData: Record<string, { month: string; engagement: number; nps: number; sentiment: number }[]> = {
  acme: [
    { month: "Sep", engagement: 72, nps: 42, sentiment: 68 },
    { month: "Oct", engagement: 75, nps: 44, sentiment: 70 },
    { month: "Nov", engagement: 78, nps: 46, sentiment: 74 },
    { month: "Dec", engagement: 80, nps: 48, sentiment: 76 },
    { month: "Jan", engagement: 84, nps: 52, sentiment: 80 },
    { month: "Feb", engagement: 88, nps: 56, sentiment: 84 },
    { month: "Mar", engagement: 92, nps: 58, sentiment: 88 },
  ],
  globaltech: [
    { month: "Sep", engagement: 68, nps: 38, sentiment: 65 },
    { month: "Oct", engagement: 70, nps: 40, sentiment: 68 },
    { month: "Nov", engagement: 72, nps: 42, sentiment: 70 },
    { month: "Dec", engagement: 76, nps: 44, sentiment: 72 },
    { month: "Jan", engagement: 80, nps: 48, sentiment: 78 },
    { month: "Feb", engagement: 83, nps: 50, sentiment: 80 },
    { month: "Mar", engagement: 86, nps: 52, sentiment: 82 },
  ],
  meridian: [
    { month: "Sep", engagement: 58, nps: 30, sentiment: 55 },
    { month: "Oct", engagement: 56, nps: 28, sentiment: 52 },
    { month: "Nov", engagement: 60, nps: 32, sentiment: 58 },
    { month: "Dec", engagement: 64, nps: 36, sentiment: 62 },
    { month: "Jan", engagement: 68, nps: 40, sentiment: 66 },
    { month: "Feb", engagement: 72, nps: 44, sentiment: 70 },
    { month: "Mar", engagement: 76, nps: 46, sentiment: 74 },
  ],
};

const clientComparisonData = clients.map(c => ({
  name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
  fullName: c.name,
  nps: c.nps,
  health: c.health === "healthy" ? 90 : c.health === "at_risk" ? 55 : 25,
  stakeholders: c.stakeholderCount,
  sentiment: c.sentiment,
}));

const CustomTooltipDark = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <p className="text-white mb-1 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

type AnalyticsTab = "engagement" | "risk" | "communication" | "predictive";

export function AnalyticsPage() {
  const { hierarchy } = useAppContext();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("engagement");
  const [dateRange, setDateRange] = useState("6M");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, any>>({});

  const scopeClient = hierarchy.clientId ? clients.find(c => c.id === hierarchy.clientId) : null;
  const scopeProgram = hierarchy.programId ? programs.find(p => p.id === hierarchy.programId) : null;
  const scopeLabel = scopeProgram ? scopeProgram.name : scopeClient ? scopeClient.name : "All Clients (Company-wide)";

  useEffect(() => {
    analyticsApi.engagement().then((data: any) => {
      if (data && Object.keys(data).length > 0) setLiveMetrics(prev => ({ ...prev, engagement: data }));
    }).catch(() => {});
    analyticsApi.risk().then((data: any) => {
      if (data && Object.keys(data).length > 0) setLiveMetrics(prev => ({ ...prev, risk: data }));
    }).catch(() => {});
    analyticsApi.communication().then((data: any) => {
      if (data && Object.keys(data).length > 0) setLiveMetrics(prev => ({ ...prev, communication: data }));
    }).catch(() => {});
    analyticsApi.predictive().then((data: any) => {
      if (data && Object.keys(data).length > 0) setLiveMetrics(prev => ({ ...prev, predictive: data }));
    }).catch(() => {});
  }, [dateRange]);

  const showAction = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleExport = () => {
    const rows = [
      ["Metric", "Value", "Change"],
      ["Overall Engagement Score", "87.4", "+12%"],
      ["Avg Sentiment Score", "7.2/10", "+0.8"],
      ["Risk Index", "24/100", "-8"],
      ["Communication Velocity", "35/wk", "+40%"],
      [],
      ["Department", "Score", "Change"],
      ...deptEngagement.map((d) => [d.dept, String(d.score), `${d.change > 0 ? "+" : ""}${d.change}%`]),
      [],
      ["Stakeholder", "Risk Score", "Influence", "Department"],
      ...riskScoring.map((s) => [s.name, String(s.risk), String(s.influence), s.dept]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAction("Analytics report downloaded");
  };

  const tabs: { id: AnalyticsTab; label: string; icon: React.ElementType }[] = [
    { id: "engagement", label: "Engagement Trends", icon: TrendingUp },
    { id: "risk", label: "Risk Scoring", icon: AlertTriangle },
    { id: "communication", label: "Communication Analytics", icon: BarChart3 },
    { id: "predictive", label: "Predictive Insights", icon: Brain },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Action toast */}
      {actionMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium text-white animate-in slide-in-from-top-2" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 30px rgba(99,102,241,0.3)" }}>
          {actionMsg}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics & Intelligence</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm" style={{ color: "#64748B" }}>
              Deep stakeholder intelligence · AI-powered
            </p>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: scopeClient ? "rgba(99,102,241,0.15)" : "rgba(100,116,139,0.15)", color: scopeClient ? "#818CF8" : "#94A3B8" }}>
              {scopeLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {["1M", "3M", "6M", "1Y"].map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: dateRange === r ? "rgba(99,102,241,0.2)" : "#0C0C22",
                color: dateRange === r ? "#818CF8" : "#64748B",
                border: "1px solid #1A1A38",
              }}
            >
              {r}
            </button>
          ))}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#64748B" }}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Overall Engagement Score", value: "87.4", change: "+12%", positive: true, color: "#6366F1", icon: Activity },
          { label: "Avg. Sentiment Score", value: "7.2/10", change: "+0.8", positive: true, color: "#10B981", icon: TrendingUp },
          { label: "Risk Index", value: "24/100", change: "-8", positive: true, color: "#F59E0B", icon: AlertTriangle },
          { label: "Communication Velocity", value: "35/wk", change: "+40%", positive: true, color: "#8B5CF6", icon: Zap },
        ].map((k, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "#64748B" }}>{k.label}</span>
              <k.icon size={14} style={{ color: k.color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: k.color }}>{k.value}</div>
            <span
              className="flex items-center gap-0.5 text-xs"
              style={{ color: k.positive ? "#10B981" : "#EF4444" }}
            >
              {k.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {k.change} <span style={{ color: "#475569" }}>&nbsp;vs last period</span>
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === tab.id ? "#818CF8" : "#64748B",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Engagement Trends */}
      {activeTab === "engagement" && (
        <div className="space-y-4">
          {/* Client Comparison (company-wide scope) */}
          {!scopeClient && (
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Client Portfolio Comparison</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>NPS and health scores across all clients</p>
                </div>
                <div className="flex gap-3 text-xs">
                  {[["NPS", "#6366F1"], ["Health", "#10B981"]].map(([k, c]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded" style={{ background: c }} />
                      <span style={{ color: "#64748B" }}>{k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={clientComparisonData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                  <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Bar dataKey="nps" name="NPS" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="health" name="Health" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Client-specific engagement trend (when drilled into a client) */}
          {scopeClient && clientEngagementData[scopeClient.id] && (
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">{scopeClient.name} — Engagement Trend</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Client-specific metrics over time</p>
                </div>
                <div className="flex gap-4 text-xs">
                  {[["Engagement", "#6366F1"], ["NPS", "#8B5CF6"], ["Sentiment", "#10B981"]].map(([k, c]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-0.5 rounded" style={{ background: c }} />
                      <span style={{ color: "#64748B" }}>{k}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={clientEngagementData[scopeClient.id]}>
                  <defs>
                    <linearGradient id="grad_client_eng" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad_client_nps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                  <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltipDark />} />
                  <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#6366F1" fill="url(#grad_client_eng)" strokeWidth={2} />
                  <Area type="monotone" dataKey="nps" name="NPS" stroke="#8B5CF6" fill="url(#grad_client_nps)" strokeWidth={2} />
                  <Area type="monotone" dataKey="sentiment" name="Sentiment" stroke="#10B981" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Multi-Dimensional Engagement Trend</h3>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>7-month performance across engagement dimensions</p>
              </div>
              <div className="flex gap-4 text-xs">
                {[["Overall", "#6366F1"], ["Communication", "#8B5CF6"], ["Sentiment", "#10B981"], ["Actions", "#06B6D4"]].map(([k, c]) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 rounded" style={{ background: c }} />
                    <span style={{ color: "#64748B" }}>{k}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={engagementTrend}>
                <defs>
                  {[["overall", "#6366F1"], ["communication", "#8B5CF6"], ["sentiment", "#10B981"], ["actions", "#06B6D4"]].map(([key, color]) => (
                    <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} domain={[40, 100]} />
                <Tooltip content={<CustomTooltipDark />} />
                <Area type="monotone" dataKey="overall" name="Overall" stroke="#6366F1" fill="url(#grad_overall)" strokeWidth={2} />
                <Area type="monotone" dataKey="communication" name="Communication" stroke="#8B5CF6" fill="url(#grad_communication)" strokeWidth={2} />
                <Area type="monotone" dataKey="sentiment" name="Sentiment" stroke="#10B981" fill="url(#grad_sentiment)" strokeWidth={2} />
                <Area type="monotone" dataKey="actions" name="Actions" stroke="#06B6D4" fill="url(#grad_actions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department engagement */}
          <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <h3 className="text-sm font-semibold text-white mb-1">Engagement by Department</h3>
            <p className="text-xs mb-4" style={{ color: "#64748B" }}>Current score with month-over-month change</p>
            <div className="space-y-3">
              {deptEngagement.sort((a, b) => b.score - a.score).map((dept) => (
                <div key={dept.dept} className="flex items-center gap-4">
                  <div className="w-24 text-xs text-white flex-shrink-0">{dept.dept}</div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${dept.score}%`,
                        background: dept.score >= 70 ? "#10B981" : dept.score >= 50 ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-semibold text-white">{dept.score}</div>
                  <div
                    className="flex items-center gap-0.5 text-xs w-14"
                    style={{ color: dept.change > 0 ? "#10B981" : "#EF4444" }}
                  >
                    {dept.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(dept.change)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk Scoring */}
      {activeTab === "risk" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Scatter chart */}
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white mb-1">Risk vs Influence Matrix</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Each dot represents a stakeholder</p>
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                  <XAxis
                    type="number"
                    dataKey="risk"
                    name="Risk Score"
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Risk Score →", position: "insideBottom", offset: -5, fill: "#475569", fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="influence"
                    name="Influence"
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: "Influence ↑", angle: -90, position: "insideLeft", fill: "#475569", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
                  />
                  <Scatter data={riskScoring} fill="#6366F1">
                    {riskScoring.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.risk > 60 ? "#EF4444" : entry.risk > 35 ? "#F59E0B" : "#10B981"}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Risk table */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
              <div className="px-5 py-4" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
                <h3 className="text-sm font-semibold text-white">Stakeholder Risk Scores</h3>
              </div>
              <div style={{ background: "#07071A" }}>
                {riskScoring.sort((a, b) => b.risk - a.risk).map((s, i) => {
                  const riskColor = s.risk > 60 ? "#EF4444" : s.risk > 35 ? "#F59E0B" : "#10B981";
                  const riskLabel = s.risk > 60 ? "High" : s.risk > 35 ? "Medium" : "Low";

                  return (
                    <div
                      key={s.name}
                      className="flex items-center px-5 py-3 hover:bg-[#0C0C22] transition-colors"
                      style={{ borderBottom: i < riskScoring.length - 1 ? "1px solid #1A1A38" : "none" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-3"
                        style={{ background: "#111128", color: "#94A3B8" }}
                      >
                        {s.name.split(" ").map(x => x[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{s.name}</div>
                        <div className="text-xs" style={{ color: "#64748B" }}>{s.dept}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: riskColor }}>{s.risk}</div>
                          <div className="text-xs" style={{ color: riskColor }}>{riskLabel} Risk</div>
                        </div>
                        <div className="w-16 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                          <div className="h-full rounded-full" style={{ width: `${s.risk}%`, background: riskColor }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Analytics */}
      {activeTab === "communication" && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Velocity */}
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white mb-1">Communication Velocity</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Weekly interaction funnel</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={communicationVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                  <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="initiated" name="Initiated" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: "#6366F1" }} />
                  <Line type="monotone" dataKey="responded" name="Responded" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: "#8B5CF6" }} />
                  <Line type="monotone" dataKey="followedUp" name="Followed Up" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Channel effectiveness */}
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white mb-1">Channel Effectiveness</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Sentiment improvement per channel type</p>
              <div className="space-y-3">
                {channelEffectiveness.sort((a, b) => b.effectiveness - a.effectiveness).map((ch) => (
                  <div key={ch.channel} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-white flex-shrink-0">{ch.channel}</div>
                    <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ch.effectiveness}%`,
                          background: ch.effectiveness >= 80 ? "#10B981" : ch.effectiveness >= 60 ? "#6366F1" : "#64748B",
                        }}
                      />
                    </div>
                    <div className="w-8 text-right text-xs font-semibold text-white flex-shrink-0">{ch.effectiveness}%</div>
                    <div className="w-16 text-right text-xs flex-shrink-0" style={{ color: "#475569" }}>{ch.volume} interactions</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictive Insights */}
      {activeTab === "predictive" && (
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <Brain size={20} style={{ color: "#A78BFA" }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: "#A78BFA" }}>HuPulse AI Predictive Engine</div>
              <div className="text-xs" style={{ color: "#64748B" }}>
                Powered by 180+ data points across sentiment, communication, and engagement history. Updated every 4 hours.
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: "#A78BFA" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#8B5CF6" }} />
              Live Analysis
            </div>
          </div>

          {predictiveInsights.map((insight, i) => (
            <div
              key={i}
              className="p-5 rounded-xl"
              style={{ background: "#0C0C22", border: `1px solid ${insight.color}20` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${insight.color}20` }}
                >
                  {insight.impact === "high" ? (
                    <AlertTriangle size={18} style={{ color: insight.color }} />
                  ) : insight.impact === "opportunity" ? (
                    <TrendingUp size={18} style={{ color: insight.color }} />
                  ) : (
                    <Activity size={18} style={{ color: insight.color }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full uppercase tracking-wide font-semibold"
                      style={{
                        background: `${insight.color}15`,
                        color: insight.color,
                      }}
                    >
                      {insight.impact === "opportunity" ? "Opportunity" : `${insight.impact.toUpperCase()} RISK`}
                    </span>
                  </div>
                  <p className="text-sm mb-3 leading-relaxed" style={{ color: "#94A3B8" }}>{insight.prediction}</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs mb-1" style={{ color: "#64748B" }}>AI Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${insight.confidence}%`, background: insight.color }}
                          />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: insight.color }}>{insight.confidence}%</span>
                      </div>
                    </div>
                    <button
                      className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${insight.color}, ${insight.color}99)` }}
                      onClick={() => {
                        if (insight.action.toLowerCase().includes("schedule")) {
                          window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(insight.title)}&details=${encodeURIComponent(insight.prediction)}`, '_blank');
                        } else {
                          showAction(`Action initiated: ${insight.action}`);
                        }
                      }}
                    >
                      {insight.action}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Scenario modeling */}
          <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} style={{ color: "#6366F1" }} />
              <h3 className="text-sm font-semibold text-white">Scenario Modeling</h3>
              <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                Beta
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: "#64748B" }}>
              See how different intervention strategies affect your projected 90-day engagement score.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { scenario: "Current Trajectory", projection: 82, change: -5, color: "#F59E0B", desc: "No interventions applied" },
                { scenario: "High Communication", projection: 88, change: +6, color: "#6366F1", desc: "2× communication frequency" },
                { scenario: "Executive Escalation", projection: 93, change: +11, color: "#10B981", desc: "C-suite engagement program" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl text-center"
                  style={{ background: "#111128", border: `1px solid ${s.color}20` }}
                >
                  <div className="text-xs mb-2" style={{ color: "#64748B" }}>{s.scenario}</div>
                  <div className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.projection}</div>
                  <div className="text-xs mb-2" style={{ color: s.change > 0 ? "#10B981" : "#EF4444" }}>
                    {s.change > 0 ? "+" : ""}{s.change} vs current
                  </div>
                  <div className="text-xs" style={{ color: "#475569" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}