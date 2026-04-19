import { useState, useMemo } from "react";
import React from "react";
import {
  TrendingUp, TrendingDown, Users, Building2, Layers, AlertTriangle,
  Brain, Target, Activity, ArrowUpRight, ArrowDownRight, BarChart3,
  MessageSquare, CheckCircle, Clock, Star, Zap, Shield,
  Calendar, FileText, Phone, Mail, Video, ChevronRight,
  ExternalLink, RefreshCcw, BookOpen,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useNavigate } from "react-router";
import {
  useAppContext, clients, programs, RBACGuard, personaMeta,
  type Client, type Program,
} from "../../contexts/AppContext";

// ── Shared components ───────────────────────────────────────
const KPICard = ({ label, value, change, icon: Icon, color, trend }: { label: string; value: string | number; change?: number; icon: React.ElementType; color: string; trend?: "up" | "down" | "stable" }) => (
  <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={17} style={{ color }} />
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: change >= 0 ? "#10B981" : "#EF4444" }}>
          {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{label}</div>
    </div>
  </div>
);

const HealthBadge = ({ health }: { health: string }) => {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    healthy: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "Healthy" },
    on_track: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "On Track" },
    at_risk: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", label: "At Risk" },
    critical: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Critical" },
    delayed: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Delayed" },
  };
  const c = config[health] || config.healthy;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
};

const SectionHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Chart data ──────────────────────────────────────────────
const sentimentTrend = [
  { month: "Oct", positive: 42, neutral: 38, negative: 20 },
  { month: "Nov", positive: 45, neutral: 35, negative: 20 },
  { month: "Dec", positive: 48, neutral: 32, negative: 20 },
  { month: "Jan", positive: 52, neutral: 30, negative: 18 },
  { month: "Feb", positive: 56, neutral: 28, negative: 16 },
  { month: "Mar", positive: 61, neutral: 25, negative: 14 },
  { month: "Apr", positive: 64, neutral: 23, negative: 13 },
];

const clientComparison = clients.map((c) => ({
  name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
  nps: c.nps,
  sentiment: c.sentiment,
  stakeholders: c.stakeholderCount,
}));

const engagementByClient = clients.map((c) => ({
  name: c.name.length > 10 ? c.name.slice(0, 10) + "…" : c.name,
  engagement: c.sentiment,
  fill: c.health === "healthy" ? "#10B981" : c.health === "at_risk" ? "#F59E0B" : "#EF4444",
}));

const riskHeatmapData = [
  { client: "Acme Corp", program: "Digital Trans.", risk: 12, impact: "Low" },
  { client: "Acme Corp", program: "CRM Migration", risk: 45, impact: "Medium" },
  { client: "GlobalTech", program: "Cloud Infra", risk: 62, impact: "High" },
  { client: "GlobalTech", program: "Security Comp.", risk: 78, impact: "Critical" },
  { client: "Meridian", program: "Patient Portal", risk: 8, impact: "Low" },
  { client: "Meridian", program: "Data Analytics", risk: 22, impact: "Low" },
  { client: "Atlas Fin.", program: "Risk Platform", risk: 88, impact: "Critical" },
  { client: "NovaStar", program: "Smart Grid", risk: 15, impact: "Low" },
  { client: "NovaStar", program: "Sustainability", risk: 28, impact: "Low" },
  { client: "Pinnacle", program: "Omnichannel", risk: 55, impact: "High" },
];

const aiInsights = [
  { title: "Atlas Financial: Renewal Risk", desc: "Health score dropped 40% in 30 days. CFO sentiment resistant. Renewal in 3 weeks — schedule executive escalation immediately.", confidence: 94, severity: "critical", color: "#EF4444" },
  { title: "GlobalTech Security: Stakeholder Gap", desc: "Security Compliance program has no executive sponsor mapped. Historical pattern shows 3x failure rate without C-level buy-in.", confidence: 87, severity: "high", color: "#F59E0B" },
  { title: "Meridian Patient Portal: Champion Opportunity", desc: "Dr. Patricia Wong's engagement up 35%. Consider activating as internal champion — could unlock +20% program adoption.", confidence: 82, severity: "opportunity", color: "#10B981" },
  { title: "Acme CRM Migration: Timeline Slip", desc: "Based on velocity, CRM Migration will miss Sep deadline by 4 weeks. Recommend scope adjustment or resource reallocation.", confidence: 79, severity: "high", color: "#F59E0B" },
];

const consultantTasks = [
  { id: 1, title: "Follow up with Sarah Chen on Q2 roadmap", client: "Acme Corp", due: "Today", priority: "high", done: false },
  { id: 2, title: "Review GlobalTech cloud architecture feedback", client: "GlobalTech", due: "Today", priority: "high", done: false },
  { id: 3, title: "Prepare Meridian Patient Portal demo", client: "Meridian Health", due: "Tomorrow", priority: "medium", done: false },
  { id: 4, title: "Send weekly status report to Acme stakeholders", client: "Acme Corp", due: "Apr 8", priority: "medium", done: false },
  { id: 5, title: "Update CRM Migration risk register", client: "Acme Corp", due: "Apr 9", priority: "low", done: true },
  { id: 6, title: "Schedule Atlas Financial executive review", client: "Atlas Financial", due: "Apr 10", priority: "high", done: false },
];

const recentComms = [
  { type: "meeting", stakeholder: "Sarah Chen", subject: "Q2 Change Roadmap Alignment", date: "2h ago", sentiment: "positive" },
  { type: "email", stakeholder: "Richard Harmon", subject: "Budget Concerns — Risk Platform", date: "4h ago", sentiment: "negative" },
  { type: "call", stakeholder: "Patricia Wong", subject: "Patient Portal UAT Feedback", date: "6h ago", sentiment: "positive" },
  { type: "email", stakeholder: "Marcus Johnson", subject: "Cloud Infra Sprint Review Notes", date: "1d ago", sentiment: "neutral" },
  { type: "meeting", stakeholder: "James Park", subject: "Strategy Alignment — NovaStar", date: "1d ago", sentiment: "positive" },
];

// ── EXECUTIVE DASHBOARD ─────────────────────────────────────
function ExecutiveDashboard() {
  const navigate = useNavigate();
  const totalStakeholders = clients.reduce((s, c) => s + c.stakeholderCount, 0);
  const activePrograms = programs.filter((p) => p.status === "active").length;
  const avgNPS = Math.round(clients.reduce((s, c) => s + c.nps, 0) / clients.length);
  const healthyPct = Math.round((clients.filter((c) => c.health === "healthy").length / clients.length) * 100);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate("/app/clients")}>
          <KPICard label="Total Clients" value={clients.length} change={8} icon={Building2} color="#6366F1" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/programs")}>
          <KPICard label="Active Programs" value={activePrograms} change={12} icon={Layers} color="#8B5CF6" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/stakeholders")}>
          <KPICard label="Total Stakeholders" value={totalStakeholders} change={5} icon={Users} color="#06B6D4" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/analytics")}>
          <KPICard label="Avg NPS Score" value={avgNPS} change={-3} icon={Target} color="#10B981" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sentiment Trend */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Sentiment Trend — All Clients" subtitle="Stakeholder sentiment distribution over time" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={sentimentTrend}>
              <defs>
                <linearGradient id="gPositive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                <linearGradient id="gNeutral" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="95%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                <linearGradient id="gNegative" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 12, color: "#E2E8F0" }} />
              <Area type="monotone" dataKey="positive" stroke="#10B981" fillOpacity={1} fill="url(#gPositive)" strokeWidth={2} />
              <Area type="monotone" dataKey="neutral" stroke="#F59E0B" fillOpacity={1} fill="url(#gNeutral)" strokeWidth={2} />
              <Area type="monotone" dataKey="negative" stroke="#EF4444" fillOpacity={1} fill="url(#gNegative)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="AI Insights" subtitle="Predictive recommendations" action={<Brain size={15} style={{ color: "#8B5CF6" }} />} />
          <div className="space-y-3">
            {aiInsights.slice(0, 3).map((insight, i) => (
              <div key={i} className="rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all" style={{ background: `${insight.color}08`, border: `1px solid ${insight.color}20` }} onClick={() => navigate("/app/analytics")}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={13} style={{ color: insight.color }} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-white">{insight.title}</div>
                    <div className="text-[10px] mt-1 leading-relaxed" style={{ color: "#94A3B8" }}>{insight.desc}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${insight.color}15`, color: insight.color }}>{insight.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Heatmap */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Risk Heatmap" subtitle="Program-level risk across all clients" />
          <div className="space-y-1.5">
            {riskHeatmapData.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer" onClick={() => navigate("/app/analytics")}>
                <div className="w-20 text-[10px] truncate" style={{ color: "#94A3B8" }}>{r.client}</div>
                <div className="w-28 text-[10px] truncate text-white">{r.program}</div>
                <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${r.risk}%`, background: r.risk > 70 ? "#EF4444" : r.risk > 40 ? "#F59E0B" : "#10B981" }} />
                </div>
                <span className="text-[10px] w-8 text-right font-medium" style={{ color: r.risk > 70 ? "#EF4444" : r.risk > 40 ? "#F59E0B" : "#10B981" }}>{r.risk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Client Comparison */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Client Comparison" subtitle="NPS & Sentiment scores" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clientComparison} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
              <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
              <Bar dataKey="nps" fill="#6366F1" radius={[4, 4, 0, 0]} name="NPS" />
              <Bar dataKey="sentiment" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Sentiment" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Portfolio Table */}
      <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <SectionHeader title="Client Portfolio" subtitle="All clients at a glance" action={
          <button onClick={() => navigate("/app/clients")} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            View All <ChevronRight size={12} />
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                {["Client", "Industry", "Health", "Programs", "Stakeholders", "NPS", "ARR", "CSM", "Renewal"].map((h) => (
                  <th key={h} className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-[#111128] transition-colors cursor-pointer" style={{ borderBottom: "1px solid #0F0F28" }} onClick={() => navigate(`/app/clients/${c.id}`)}>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{c.logo}</div>
                      <span className="text-xs font-medium text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{c.industry}</td>
                  <td className="py-2.5 px-3"><HealthBadge health={c.health} /></td>
                  <td className="py-2.5 px-3 text-xs text-white">{c.programCount}</td>
                  <td className="py-2.5 px-3 text-xs text-white">{c.stakeholderCount}</td>
                  <td className="py-2.5 px-3 text-xs font-medium" style={{ color: c.nps >= 60 ? "#10B981" : c.nps >= 40 ? "#F59E0B" : "#EF4444" }}>{c.nps}</td>
                  <td className="py-2.5 px-3 text-xs text-white">{c.arr}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{c.csm}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{c.renewalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── MANAGER DASHBOARD ───────────────────────────────────────
function ManagerDashboard() {
  const navigate = useNavigate();
  const { hierarchy } = useAppContext();
  const filteredClients = hierarchy.clientId ? clients.filter((c) => c.id === hierarchy.clientId) : clients;
  const filteredPrograms = hierarchy.clientId ? programs.filter((p) => p.clientId === hierarchy.clientId) : programs;
  const activePrograms = filteredPrograms.filter((p) => p.status === "active");

  const programTrend = [
    { month: "Jan", onTrack: 8, atRisk: 3, delayed: 1 },
    { month: "Feb", onTrack: 9, atRisk: 2, delayed: 1 },
    { month: "Mar", onTrack: 10, atRisk: 3, delayed: 2 },
    { month: "Apr", onTrack: 8, atRisk: 4, delayed: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate("/app/clients")}>
          <KPICard label="My Clients" value={filteredClients.length} change={0} icon={Building2} color="#6366F1" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/programs")}>
          <KPICard label="Active Programs" value={activePrograms.length} change={15} icon={Layers} color="#8B5CF6" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/programs")}>
          <KPICard label="At-Risk Programs" value={filteredPrograms.filter((p) => p.health === "at_risk" || p.health === "delayed").length} change={-10} icon={AlertTriangle} color="#F59E0B" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/analytics")}>
          <KPICard label="Avg Completion" value={`${Math.round(activePrograms.reduce((s, p) => s + p.progress, 0) / (activePrograms.length || 1))}%`} change={7} icon={Target} color="#10B981" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Client-wise drilldown */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Client Overview" subtitle="Performance by client" />
          <div className="space-y-2">
            {filteredClients.map((c) => {
              const cProgs = programs.filter((p) => p.clientId === c.id);
              return (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer" onClick={() => navigate(`/app/clients/${c.id}`)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{c.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{c.name}</span>
                      <HealthBadge health={c.health} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px]" style={{ color: "#64748B" }}>{cProgs.length} programs</span>
                      <span className="text-[10px]" style={{ color: "#64748B" }}>{c.stakeholderCount} stakeholders</span>
                      <span className="text-[10px]" style={{ color: "#64748B" }}>NPS {c.nps}</span>
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: "#64748B" }}>Sentiment</span>
                      <span className="font-medium" style={{ color: c.sentiment >= 70 ? "#10B981" : c.sentiment >= 50 ? "#F59E0B" : "#EF4444" }}>{c.sentiment}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                      <div className="h-full rounded-full" style={{ width: `${c.sentiment}%`, background: c.sentiment >= 70 ? "#10B981" : c.sentiment >= 50 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: "#475569" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Program Health Trend */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Program Health Trend" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={programTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
              <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
              <Bar dataKey="onTrack" fill="#10B981" radius={[3, 3, 0, 0]} name="On Track" stackId="a" />
              <Bar dataKey="atRisk" fill="#F59E0B" radius={[0, 0, 0, 0]} name="At Risk" stackId="a" />
              <Bar dataKey="delayed" fill="#EF4444" radius={[3, 3, 0, 0]} name="Delayed" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Programs Table */}
      <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <SectionHeader title="Program Analytics" subtitle="Detailed program status across clients" action={
          <button onClick={() => navigate("/app/programs")} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            View Programs <ChevronRight size={12} />
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                {["Program", "Client", "Status", "Health", "Progress", "Stakeholders", "Owner", "End Date"].map((h) => (
                  <th key={h} className="py-2 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPrograms.slice(0, 8).map((p) => {
                const cl = clients.find((c) => c.id === p.clientId);
                return (
                  <tr key={p.id} className="hover:bg-[#111128] transition-colors cursor-pointer" style={{ borderBottom: "1px solid #0F0F28" }} onClick={() => navigate("/app/programs")}>
                    <td className="py-2.5 px-3 text-xs font-medium text-white">{p.name}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{cl?.name}</td>
                    <td className="py-2.5 px-3"><span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>{p.status}</span></td>
                    <td className="py-2.5 px-3"><HealthBadge health={p.health} /></td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.progress >= 60 ? "#10B981" : p.progress >= 30 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-[10px] text-white w-7 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-white">{p.stakeholderCount}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{p.owner}</td>
                    <td className="py-2.5 px-3 text-xs" style={{ color: "#94A3B8" }}>{p.endDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <SectionHeader title="Engagement Metrics by Client" subtitle="Stakeholder engagement comparison" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementByClient} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
            <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <YAxis dataKey="name" type="category" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
            <Bar dataKey="engagement" radius={[0, 4, 4, 0]}>
              {engagementByClient.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── CONSULTANT DASHBOARD ────────────────────────────────────
function ConsultantDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(consultantTasks);

  const toggleTask = (id: number) => setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t));

  const commIcon = (type: string) => {
    if (type === "meeting") return <Video size={13} style={{ color: "#8B5CF6" }} />;
    if (type === "email") return <Mail size={13} style={{ color: "#6366F1" }} />;
    return <Phone size={13} style={{ color: "#06B6D4" }} />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="My Tasks" value={tasks.filter((t) => !t.done).length} icon={CheckCircle} color="#6366F1" />
        <div className="cursor-pointer" onClick={() => navigate("/app/clients")}>
          <KPICard label="Assigned Clients" value={2} icon={Building2} color="#8B5CF6" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate("/app/communication")}>
          <KPICard label="Open Communications" value={12} change={20} icon={MessageSquare} color="#06B6D4" />
        </div>
        <KPICard label="Pending Alerts" value={3} icon={AlertTriangle} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task List */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="My Tasks" subtitle="Action items and follow-ups" />
          <div className="space-y-1.5">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#111128] transition-colors">
                <button onClick={() => toggleTask(task.id)} className="mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0" style={{ borderColor: task.done ? "#10B981" : "#1A1A38", background: task.done ? "#10B981" : "transparent" }}>
                  {task.done && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium ${task.done ? "line-through" : ""}`} style={{ color: task.done ? "#475569" : "#E2E8F0" }}>{task.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: "#64748B" }}>{task.client}</span>
                    <span className="text-[10px]" style={{ color: task.due === "Today" ? "#EF4444" : "#64748B" }}>{task.due}</span>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded capitalize" style={{ background: task.priority === "high" ? "rgba(239,68,68,0.12)" : task.priority === "medium" ? "rgba(245,158,11,0.12)" : "rgba(99,102,241,0.12)", color: task.priority === "high" ? "#EF4444" : task.priority === "medium" ? "#F59E0B" : "#818CF8" }}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Communication Log */}
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <SectionHeader title="Recent Communications" subtitle="Latest stakeholder interactions" action={
            <button onClick={() => navigate("/app/communication")} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
              View All <ChevronRight size={12} />
            </button>
          } />
          <div className="space-y-2">
            {recentComms.map((comm, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer" onClick={() => navigate("/app/communication")}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128" }}>
                  {commIcon(comm.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white">{comm.subject}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>{comm.stakeholder}</span>
                    <span className="text-[10px]" style={{ color: "#475569" }}>{comm.date}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: comm.sentiment === "positive" ? "#10B981" : comm.sentiment === "negative" ? "#EF4444" : "#F59E0B" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholder Quick View */}
      <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <SectionHeader title="My Stakeholders" subtitle="Quick updates on assigned stakeholders" action={
          <button onClick={() => navigate("/app/stakeholders")} className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
            View Full List <ChevronRight size={12} />
          </button>
        } />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: "Sarah Chen", role: "CMO", sentiment: "supportive", lastContact: "2h ago", engagement: 92, trend: "up" },
            { name: "Marcus Johnson", role: "VP Engineering", sentiment: "supportive", lastContact: "1d ago", engagement: 88, trend: "up" },
            { name: "Richard Harmon", role: "CFO", sentiment: "resistant", lastContact: "3d ago", engagement: 22, trend: "down" },
            { name: "Elena Rodriguez", role: "COO", sentiment: "neutral", lastContact: "6h ago", engagement: 76, trend: "stable" },
            { name: "David Klein", role: "Head of IT", sentiment: "resistant", lastContact: "5d ago", engagement: 18, trend: "down" },
            { name: "Patricia Wong", role: "VP Ops", sentiment: "neutral", lastContact: "1d ago", engagement: 41, trend: "down" },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer" style={{ border: "1px solid #1A1A38" }} onClick={() => navigate("/app/stakeholders")}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>{s.name.split(" ").map((n) => n[0]).join("")}</div>
                <div>
                  <div className="text-xs font-medium text-white">{s.name}</div>
                  <div className="text-[10px]" style={{ color: "#64748B" }}>{s.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: s.sentiment === "supportive" ? "rgba(16,185,129,0.12)" : s.sentiment === "resistant" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)", color: s.sentiment === "supportive" ? "#10B981" : s.sentiment === "resistant" ? "#EF4444" : "#F59E0B" }}>{s.sentiment}</span>
                <div className="flex items-center gap-1">
                  {s.trend === "up" ? <TrendingUp size={11} style={{ color: "#10B981" }} /> : s.trend === "down" ? <TrendingDown size={11} style={{ color: "#EF4444" }} /> : <Activity size={11} style={{ color: "#F59E0B" }} />}
                  <span className="text-[10px] font-medium text-white">{s.engagement}%</span>
                </div>
              </div>
              <div className="text-[9px] mt-2" style={{ color: "#475569" }}>Last contact: {s.lastContact}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        <SectionHeader title="Active Alerts" />
        <div className="space-y-2">
          {aiInsights.filter((a) => a.severity !== "opportunity").slice(0, 3).map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#111128] transition-colors cursor-pointer" style={{ background: `${alert.color}06`, border: `1px solid ${alert.color}15` }} onClick={() => navigate("/app/analytics")}>
              <AlertTriangle size={14} style={{ color: alert.color }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-white">{alert.title}</div>
                <div className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{alert.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── END STAKEHOLDER DASHBOARD ───────────────────────────────
function StakeholderDashboard() {
  const navigate = useNavigate();

  const stakeholder = {
    initials: "JD",
    name: "John Doe",
    role: "External Stakeholder",
    company: "Acme Corporation",
    status: "Supportive",
    sentiment: "Your feedback is being heard",
    nextMeeting: "Apr 16, 2026",
    nextAction: "Review Q2 summary and confirm milestone alignment",
    primaryProgram: {
      name: "Digital Transformation",
      stage: "Adoption",
      health: "on_track",
      progress: 78,
      owner: "Sarah Parker",
      nextUpdate: "Apr 18, 2026",
    },
    csm: {
      name: "Sarah Parker",
      title: "Customer Success Manager",
      email: "s.parker@hupulse.io",
      phone: "+1 555 0123",
    },
  };

  const tips = [
    "Your input guides the next executive steering session.",
    "Complete one survey this week to keep the program on track.",
    "Use the quick update card to see what matters now.",
  ];

  const actions = [
    { title: "Complete Q2 Satisfaction Survey", due: "Apr 10", icon: FileText },
    { title: "Confirm milestone timeline", due: "Apr 16", icon: Calendar },
    { title: "Review latest release notes", due: "Apr 18", icon: ExternalLink },
  ];

  const updates = [
    { title: "New program update is available", time: "2h ago", desc: "Digital Transformation progress moved to 78%." },
    { title: "Your feedback was acknowledged", time: "1d ago", desc: "CSM Sarah Parker reviewed your onboarding survey responses." },
    { title: "Upcoming stakeholder review", time: "3d ago", desc: "Next alignment call scheduled for Apr 16." },
  ];

  const resources = [
    { title: "What to expect as a stakeholder", type: "Guide" },
    { title: "How we protect your data", type: "Policy" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-3xl p-6 bg-[#0C0C22] border border-[#1A1A38] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white">{stakeholder.initials}</div>
            <div>
              <div className="text-xl font-semibold text-white">{stakeholder.name}</div>
              <div className="text-sm mt-1" style={{ color: "#94A3B8" }}>{stakeholder.role} · {stakeholder.company}</div>
              <div className="mt-3 text-sm" style={{ color: "#A5B4FC" }}>{stakeholder.sentiment}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-2xl p-3 bg-[#111128] border border-[#1A1A38]">
              <div className="text-sm font-semibold text-white">{stakeholder.primaryProgram.name}</div>
              <div className="mt-1" style={{ color: "#94A3B8" }}>Current Program</div>
            </div>
            <div className="rounded-2xl p-3 bg-[#111128] border border-[#1A1A38]">
              <div className="text-sm font-semibold text-white">{stakeholder.nextMeeting}</div>
              <div className="mt-1" style={{ color: "#94A3B8" }}>Next Check-in</div>
            </div>
            <div className="rounded-2xl p-3 bg-[#111128] border border-[#1A1A38]">
              <div className="text-sm font-semibold text-white">{stakeholder.status}</div>
              <div className="mt-1" style={{ color: "#94A3B8" }}>Engagement Status</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-[#111128] border border-[#1A1A38] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">What you need to do next</div>
              <div className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>{stakeholder.nextAction}</div>
            </div>
            <button onClick={() => navigate("/app/feedback")} className="px-4 py-2 rounded-2xl text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              Share Feedback
            </button>
          </div>
          <div className="mt-5 h-2 rounded-full bg-[#0C0C22] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${stakeholder.primaryProgram.progress}%`, background: "#10B981" }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: "#94A3B8" }}>
            <span>Program progress</span>
            <span>{stakeholder.primaryProgram.progress}% complete</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
          <SectionHeader title="What matters most to you" subtitle="Your top stakeholder priorities" />
          <ul className="space-y-3">
            {tips.map((tip, index) => (
              <li key={index} className="rounded-2xl p-4 bg-[#111128] border border-[#1A1A38] text-sm" style={{ color: "#E2E8F0" }}>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
                  <span>{tip}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
          <SectionHeader title="Your next actions" subtitle="Quick items for you" />
          <div className="space-y-3">
            {actions.map((action, index) => (
              <button key={index} onClick={() => navigate(index === 0 ? "/app/feedback" : "/app/clients")} className="w-full rounded-2xl p-4 bg-[#111128] border border-[#1A1A38] text-left hover:border-[#6366F1] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-[#16162B] text-[#818CF8]">
                    <action.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{action.title}</div>
                    <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>Due {action.due}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
        <SectionHeader title="Program snapshot" subtitle="Your active engagement at a glance" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl p-4 bg-[#111128] border border-[#1A1A38]">
            <div className="text-xs uppercase tracking-[0.2em] text-[#818CF8]">Program</div>
            <div className="text-lg font-semibold text-white mt-2">{stakeholder.primaryProgram.name}</div>
            <div className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>Stage: {stakeholder.primaryProgram.stage}</div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Owner</div>
                <div className="text-sm text-white">{stakeholder.primaryProgram.owner}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Next update</div>
                <div className="text-sm text-white">{stakeholder.primaryProgram.nextUpdate}</div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl p-4 bg-[#111128] border border-[#1A1A38]">
            <div className="text-xs uppercase tracking-[0.2em] text-[#818CF8]">Contact</div>
            <div className="text-sm font-semibold text-white mt-2">{stakeholder.csm.name}</div>
            <div className="text-[10px] mt-1" style={{ color: "#94A3B8" }}>{stakeholder.csm.title}</div>
            <div className="mt-4 space-y-2 text-sm text-white">
              <div>Email: {stakeholder.csm.email}</div>
              <div>Phone: {stakeholder.csm.phone}</div>
            </div>
            <button onClick={() => navigate("/app/communication")} className="mt-4 w-full rounded-2xl px-4 py-2 text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              Message your CSM
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
          <SectionHeader title="Pending surveys" subtitle="Your input matters" />
          <div className="space-y-3">
            <button onClick={() => navigate("/app/feedback")} className="w-full rounded-2xl p-4 bg-[#111128] border border-[#1A1A38] text-left hover:border-[#6366F1] transition-colors">
              <div className="text-sm font-medium text-white">Q2 Satisfaction Survey</div>
              <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>Due Apr 10</div>
            </button>
            <button onClick={() => navigate("/app/feedback")} className="w-full rounded-2xl p-4 bg-[#111128] border border-[#1A1A38] text-left hover:border-[#6366F1] transition-colors">
              <div className="text-sm font-medium text-white">Digital Transformation Feedback</div>
              <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>Due Apr 15</div>
            </button>
          </div>
        </div>

        <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
          <SectionHeader title="Helpful resources" subtitle="Easy reference for stakeholders" />
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <div key={index} className="rounded-2xl p-4 bg-[#111128] border border-[#1A1A38] text-sm text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div>{resource.title}</div>
                    <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>{resource.type}</div>
                  </div>
                  <BookOpen size={16} style={{ color: "#8B5CF6" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl p-5 bg-[#0C0C22] border border-[#1A1A38]">
        <SectionHeader title="Recent updates" subtitle="Latest changes in your engagement" />
        <div className="space-y-3">
          {updates.map((update, index) => (
            <div key={index} className="rounded-2xl p-4 bg-[#111128] border border-[#1A1A38]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">{update.title}</div>
                  <div className="text-[10px] mt-1" style={{ color: "#64748B" }}>{update.desc}</div>
                </div>
                <span className="text-[10px]" style={{ color: "#94A3B8" }}>{update.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ─────────────────────────────────────────────
export function Dashboard() {
  const { persona, hierarchy } = useAppContext();
  const meta = personaMeta[persona];

  const dashboardTitle = {
    customer_head: "Executive Overview",
    manager: "Engagement Dashboard",
    consultant: "Operations Dashboard",
    stakeholder: "My Dashboard",
  }[persona];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{dashboardTitle}</h1>
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>
            {hierarchy.clientName ? `${hierarchy.clientName}` : "All Clients"} · {hierarchy.programName || "All Programs"} · Updated just now
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}20` }}>
            <Shield size={13} style={{ color: meta.color }} />
            <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>
            <RefreshCcw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Render persona-specific dashboard */}
      {persona === "customer_head" && <ExecutiveDashboard />}
      {persona === "manager" && <ManagerDashboard />}
      {persona === "consultant" && <ConsultantDashboard />}
      {persona === "stakeholder" && <StakeholderDashboard />}
    </div>
  );
}
