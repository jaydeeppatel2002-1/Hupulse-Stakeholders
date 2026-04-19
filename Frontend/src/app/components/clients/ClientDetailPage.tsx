import { useState, useMemo } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Building2, Target, Users, Layers, Calendar, Clock,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Shield,
  Mail, Phone, Video, MessageSquare, ChevronDown, ChevronRight,
  Search, Filter, CheckCircle, AlertTriangle, BarChart3, Star,
  FileText, Activity, ExternalLink, BookOpen, GraduationCap,
  Briefcase, Globe, MapPin, Hash, Link2, Server, User2,
  Plus, MoreVertical, Play, Pause, X, Zap, Eye, Network,
  GitBranch, CircleDot, Crosshair, Radar, Grid3X3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import {
  useAppContext, clients, programs,
  type Client, type Program,
} from "../../contexts/AppContext";

// ── Helpers ─────────────────────────────────────────────────
const HealthBadge = ({ health }: { health: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    healthy: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "Healthy" },
    on_track: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "On Track" },
    at_risk: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", label: "At Risk" },
    critical: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Critical" },
    delayed: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Delayed" },
  };
  const c = map[health] || map.healthy;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string }> = {
    Open: { bg: "rgba(239,68,68,0.12)", text: "#EF4444" },
    "In Progress": { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
    Discuss: { bg: "rgba(6,182,212,0.12)", text: "#06B6D4" },
    Done: { bg: "rgba(16,185,129,0.12)", text: "#10B981" },
    Closed: { bg: "rgba(100,116,139,0.12)", text: "#64748B" },
  };
  const c = map[status] || map.Open;
  return <span className="text-[10px] px-2 py-0.5 rounded font-medium" style={{ background: c.bg, color: c.text }}>{status}</span>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, { color: string }> = {
    High: { color: "#EF4444" },
    Medium: { color: "#F59E0B" },
    Low: { color: "#06B6D4" },
  };
  const c = map[priority] || map.Low;
  return <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: c.color }}>! {priority}</span>;
};

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-xl p-5 ${className}`} style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>{children}</div>
);

// ── Mock Data for Client Detail ─────────────────────────────
function getClientAttributes(client: Client) {
  const attrMap: Record<string, Record<string, unknown>> = {
    "cl-1": {
      contractedARR: "USD 1.20M", invoicedARR: "USD 1.18M", blendedPEPM: "4.12",
      transitionToCSDate: "15/3/2025", marqueeClient: true, backupAMCSM: "Lisa Wong",
      tenantId: 101, tenantName: "Acme Corporation", tenantURL: "acme.hupulse.io",
      serverLocation: "US-East", activeHeadcount: 2400, billableType: "Billable",
      serverName: "Prod-US1", subDomain: "acmecorp", customerMarketCategory: "Enterprise",
      parentName: "Acme Holdings", region: "North America", customerCity: "San Francisco",
      rcsd: "Sarah Parker", csd: "Mike Chen", associateDirector: "James Wilson",
      csm: "Sarah Parker", accountManager: "David Brown", regionalKAMHead: "Robert Lee",
      keyAccountManager: "Emily Zhang", ucc: "USAcme101",
    },
    "cl-2": {
      contractedARR: "USD 860K", invoicedARR: "USD 845K", blendedPEPM: "3.28",
      transitionToCSDate: "10/6/2025", marqueeClient: false, backupAMCSM: "---",
      tenantId: 102, tenantName: "GlobalTech Inc", tenantURL: "globaltech.hupulse.io",
      serverLocation: "EU-West", activeHeadcount: 1800, billableType: "Billable",
      serverName: "Prod-EU1", subDomain: "globaltech", customerMarketCategory: "Growth",
      parentName: "---", region: "Europe", customerCity: "London",
      rcsd: "Mike Chen", csd: "Elena Rodriguez", associateDirector: "---",
      csm: "Mike Chen", accountManager: "Anna Kelly", regionalKAMHead: "Tom Harris",
      keyAccountManager: "James Park", ucc: "EUGlob102",
    },
  };
  return attrMap[client.id] || {
    contractedARR: client.arr, invoicedARR: client.arr, blendedPEPM: "2.50",
    transitionToCSDate: "1/1/2025", marqueeClient: false, backupAMCSM: "---",
    tenantId: Math.floor(Math.random() * 900) + 100, tenantName: client.name, tenantURL: `${client.name.toLowerCase().replace(/\s+/g, "")}.hupulse.io`,
    serverLocation: "US-West", activeHeadcount: client.stakeholderCount * 80, billableType: "Billable",
    serverName: "Prod-US2", subDomain: client.name.toLowerCase().replace(/\s+/g, ""), customerMarketCategory: "Growth",
    parentName: "---", region: "North America", customerCity: "New York",
    rcsd: client.csm, csd: client.csm, associateDirector: "---",
    csm: client.csm, accountManager: "TBD", regionalKAMHead: "TBD",
    keyAccountManager: "TBD", ucc: `US${client.logo}${Math.floor(Math.random() * 100)}`,
  };
}

function getClientTimeline(client: Client) {
  return [
    { id: "t1", type: "Meeting", title: `${client.name} | Governance Call MOM`, note: `Hi Team,\n\nPlease find below points discussed in today's meeting:\n\n1. Reviewed current project milestones and progress\n2. Discussed resource allocation for next quarter\n3. Addressed pending escalations\n4. Good feedback on the new dashboard feature\n5. AI integration - Discussed capability and roadmap`, activityType: "Governance", createdBy: client.csm, createdByInitials: client.csm.split(" ").map(n => n[0]).join(""), date: "25/3/2026 12:47 PM", comments: 1, hasAttachment: false },
    { id: "t2", type: "Automated Program", title: "Quarterly Business Review Forward", note: `This is part of this automated program can be viewed in this activity.`, activityType: "QBR", createdBy: "System Administrator", createdByInitials: "SA", date: "30/3/2026 11:09 AM", comments: 0, hasAttachment: false },
    { id: "t3", type: "Email", title: `RE: ${client.name} - Monthly Status Update`, note: `Shared the monthly progress report with key stakeholders. All milestones on track for Q2.`, activityType: "Status Update", createdBy: client.csm, createdByInitials: client.csm.split(" ").map(n => n[0]).join(""), date: "28/3/2026 3:15 PM", comments: 2, hasAttachment: true },
    { id: "t4", type: "Call", title: `Escalation Follow-up - ${client.name}`, note: `Followed up on the escalation raised last week regarding API performance. Engineering team confirmed fix will be deployed by EOW.`, activityType: "Escalation", createdBy: client.csm, createdByInitials: client.csm.split(" ").map(n => n[0]).join(""), date: "27/3/2026 10:30 AM", comments: 0, hasAttachment: false },
    { id: "t5", type: "Milestone", title: `Phase 2 Go-Live Completed`, note: `Successfully completed Phase 2 go-live for ${client.name}. All acceptance criteria met. Moving to Phase 3 planning.`, activityType: "Milestone", createdBy: "System Administrator", createdByInitials: "SA", date: "26/3/2026 9:00 AM", comments: 3, hasAttachment: false },
    { id: "t6", type: "Update", title: `Stakeholder Mapping Updated`, note: `Updated the stakeholder map with 3 new contacts from the ${client.industry} division. Power-Interest matrix refreshed.`, activityType: "Update", createdBy: client.csm, createdByInitials: client.csm.split(" ").map(n => n[0]).join(""), date: "24/3/2026 4:20 PM", comments: 0, hasAttachment: false },
    { id: "t7", type: "Account Transition", title: `CSM Transition Completed`, note: `Account transitioned to new CSM successfully. All documentation and context transferred.`, activityType: "Transition", createdBy: "System Administrator", createdByInitials: "SA", date: "20/3/2026 11:00 AM", comments: 1, hasAttachment: false },
  ];
}

function getClientTasks(client: Client) {
  const taskLists = [
    {
      name: "Implementation Phase 2",
      progress: 45,
      tasks: [
        { id: `${client.logo}-T1001`, name: "Requirements gathering review", status: "Done", priority: "High", completion: 100 },
        { id: `${client.logo}-T1002`, name: "API integration testing", status: "In Progress", priority: "High", completion: 70 },
        { id: `${client.logo}-T1003`, name: "User acceptance testing", status: "Open", priority: "High", completion: 20 },
        { id: `${client.logo}-T1004`, name: "Documentation update", status: "Open", priority: "Medium", completion: 0 },
        { id: `${client.logo}-T1005`, name: "Performance benchmarking", status: "In Progress", priority: "Medium", completion: 50 },
      ],
    },
    {
      name: "Onboarding & Training",
      progress: 33,
      tasks: [
        { id: `${client.logo}-T1010`, name: "Admin training session", status: "Done", priority: "High", completion: 100 },
        { id: `${client.logo}-T1011`, name: "End-user training materials", status: "In Progress", priority: "Medium", completion: 60 },
        { id: `${client.logo}-T1012`, name: "Configuration walkthrough", status: "Open", priority: "Low", completion: 10 },
        { id: `${client.logo}-T1013`, name: "SSO setup & verification", status: "Discuss", priority: "High", completion: 30 },
        { id: `${client.logo}-T1014`, name: "Data migration validation", status: "Open", priority: "Low", completion: 0 },
      ],
    },
  ];
  return taskLists;
}

function getClientStakeholders(client: Client) {
  const names = [
    { first: "Sarah", last: "Chen", position: "VP Engineering", type: "Champion", influence: "High", sentiment: 85, email: "sarah.chen@example.com", phone: "+1-555-0101", interest: 90, impact: 85, criticality: 75, effort: 80, power: 80, lastInteraction: "2d ago" },
    { first: "Marcus", last: "Johnson", position: "CTO", type: "Decision Maker", influence: "Very High", sentiment: 72, email: "marcus.j@example.com", phone: "+1-555-0102", interest: 65, impact: 95, criticality: 90, effort: 40, power: 95, lastInteraction: "1w ago" },
    { first: "Patricia", last: "Wong", position: "Program Director", type: "Influencer", influence: "High", sentiment: 90, email: "p.wong@example.com", phone: "+1-555-0103", interest: 88, impact: 70, criticality: 65, effort: 85, power: 60, lastInteraction: "3d ago" },
    { first: "Richard", last: "Harmon", position: "CFO", type: "Decision Maker", influence: "Very High", sentiment: 45, email: "r.harmon@example.com", phone: "+1-555-0104", interest: 30, impact: 90, criticality: 85, effort: 20, power: 92, lastInteraction: "2w ago" },
    { first: "Elena", last: "Rodriguez", position: "Project Manager", type: "User", influence: "Medium", sentiment: 68, email: "elena.r@example.com", phone: "+1-555-0105", interest: 75, impact: 50, criticality: 45, effort: 90, power: 35, lastInteraction: "1d ago" },
    { first: "James", last: "Park", position: "IT Director", type: "Influencer", influence: "High", sentiment: 78, email: "j.park@example.com", phone: "+1-555-0106", interest: 70, impact: 75, criticality: 70, effort: 55, power: 70, lastInteraction: "5d ago" },
    { first: "Amanda", last: "Foster", position: "HR Head", type: "User", influence: "Medium", sentiment: 82, email: "a.foster@example.com", phone: "+1-555-0107", interest: 80, impact: 40, criticality: 35, effort: 70, power: 30, lastInteraction: "4d ago" },
    { first: "David", last: "Klein", position: "Operations Lead", type: "User", influence: "Low", sentiment: 60, email: "d.klein@example.com", phone: "+1-555-0108", interest: 55, impact: 30, criticality: 25, effort: 65, power: 20, lastInteraction: "1w ago" },
  ];
  return names.slice(0, client.stakeholderCount > 8 ? 8 : client.stakeholderCount);
}

const learningResources = [
  { id: "lr1", title: "Platform Fundamentals", type: "Course", duration: "2h 30m", progress: 85, modules: 12, status: "In Progress" },
  { id: "lr2", title: "Advanced Analytics Workshop", type: "Workshop", duration: "4h", progress: 100, modules: 8, status: "Completed" },
  { id: "lr3", title: "API Integration Guide", type: "Documentation", duration: "1h 15m", progress: 40, modules: 5, status: "In Progress" },
  { id: "lr4", title: "Security Best Practices", type: "Course", duration: "1h 45m", progress: 0, modules: 6, status: "Not Started" },
  { id: "lr5", title: "Admin Configuration Training", type: "Video Series", duration: "3h", progress: 60, modules: 10, status: "In Progress" },
  { id: "lr6", title: "Stakeholder Engagement Playbook", type: "Playbook", duration: "45m", progress: 100, modules: 3, status: "Completed" },
];

// ── Tab Definitions ─────────────────────────────────────────
const TABS = [
  { id: "summary", label: "Account Summary" },
  { id: "attributes", label: "Account Attributes" },
  { id: "timeline", label: "Timeline" },
  { id: "activity", label: "Activity View" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "learning", label: "Learning" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ═══════════════════════════════════════════════════════════
// TAB: Account Summary
// ═══════════════════════════════════════════════════════════
function AccountSummaryTab({ client }: { client: Client }) {
  const clientPrograms = programs.filter((p) => p.clientId === client.id);
  const activePrograms = clientPrograms.filter((p) => p.status === "active");
  const avgProgress = activePrograms.length ? Math.round(activePrograms.reduce((s, p) => s + p.progress, 0) / activePrograms.length) : 0;

  const engagementTrend = [
    { month: "Oct", score: Math.max(20, client.sentiment - 25) },
    { month: "Nov", score: Math.max(20, client.sentiment - 20) },
    { month: "Dec", score: Math.max(20, client.sentiment - 12) },
    { month: "Jan", score: Math.max(20, client.sentiment - 8) },
    { month: "Feb", score: Math.max(20, client.sentiment - 5) },
    { month: "Mar", score: client.sentiment },
  ];

  const healthDistribution = [
    { name: "On Track", value: clientPrograms.filter(p => p.health === "on_track").length, color: "#10B981" },
    { name: "At Risk", value: clientPrograms.filter(p => p.health === "at_risk").length, color: "#F59E0B" },
    { name: "Delayed", value: clientPrograms.filter(p => p.health === "delayed").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Health Score", value: client.health === "healthy" ? "Good" : client.health === "at_risk" ? "At Risk" : "Critical", icon: Shield, color: client.health === "healthy" ? "#10B981" : client.health === "at_risk" ? "#F59E0B" : "#EF4444" },
          { label: "NPS Score", value: client.nps, icon: Target, color: client.nps >= 60 ? "#10B981" : client.nps >= 40 ? "#F59E0B" : "#EF4444" },
          { label: "Sentiment", value: `${client.sentiment}%`, icon: Activity, color: client.sentiment >= 70 ? "#10B981" : client.sentiment >= 50 ? "#F59E0B" : "#EF4444" },
          { label: "Stakeholders", value: client.stakeholderCount, icon: Users, color: "#6366F1" },
          { label: "Active Programs", value: activePrograms.length, icon: Layers, color: "#8B5CF6" },
        ].map((kpi, i) => (
          <SectionCard key={i}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                <kpi.icon size={15} style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{kpi.label}</div>
          </SectionCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Engagement Trend */}
        <div className="lg:col-span-2">
          <SectionCard>
            <div className="text-sm font-semibold text-white mb-4">Engagement Trend</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={engagementTrend}>
                <defs>
                  <linearGradient id="gEngDetail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 12, color: "#E2E8F0" }} />
                <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#gEngDetail)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Program Health Distribution */}
        <SectionCard>
          <div className="text-sm font-semibold text-white mb-4">Program Health</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={healthDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                {healthDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {healthDistribution.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[10px]" style={{ color: "#94A3B8" }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Key Info & Programs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Info */}
        <SectionCard>
          <div className="text-sm font-semibold text-white mb-4">Account Overview</div>
          <div className="space-y-3">
            {[
              { label: "Industry", value: client.industry },
              { label: "ARR", value: client.arr },
              { label: "CSM", value: client.csm },
              { label: "Renewal Date", value: client.renewalDate },
              { label: "Last Activity", value: client.lastActivity },
              { label: "Avg Program Progress", value: `${avgProgress}%` },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < 5 ? "1px solid #111128" : "none" }}>
                <span className="text-xs" style={{ color: "#64748B" }}>{item.label}</span>
                <span className="text-xs font-medium text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Programs List */}
        <SectionCard>
          <div className="text-sm font-semibold text-white mb-4">Programs ({clientPrograms.length})</div>
          <div className="space-y-2">
            {clientPrograms.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#111128] transition-colors" style={{ border: "1px solid #1A1A38" }}>
                <Layers size={14} style={{ color: "#8B5CF6" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{p.name}</span>
                    <HealthBadge health={p.health} />
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{p.status} · {p.owner}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.health === "on_track" ? "#10B981" : p.health === "at_risk" ? "#F59E0B" : "#EF4444" }} />
                  </div>
                  <span className="text-[10px] text-white w-8 text-right">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* CSM Card */}
      <SectionCard>
        <div className="text-sm font-semibold text-white mb-4">Customer Success Manager</div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
            {client.csm.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{client.csm}</div>
            <div className="text-xs" style={{ color: "#64748B" }}>Customer Success Manager</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
              <Mail size={14} style={{ color: "#818CF8" }} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
              <Phone size={14} style={{ color: "#818CF8" }} />
            </button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Account Attributes
// ═══════════════════════════════════════════════════════════
function AccountAttributesTab({ client }: { client: Client }) {
  const attrs = getClientAttributes(client);

  const MetricField = ({ label, value, isLink }: { label: string; value: unknown; isLink?: boolean }) => (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>{label}</div>
      {typeof value === "boolean" ? (
        <div className="flex items-center gap-1">
          <input type="checkbox" checked={value} readOnly className="w-3.5 h-3.5 rounded accent-indigo-500" />
        </div>
      ) : isLink ? (
        <a href="#" className="text-sm font-medium" style={{ color: "#818CF8" }}>{String(value)}</a>
      ) : (
        <div className="text-sm font-semibold text-white">{String(value) || "---"}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* CS Metrics */}
      <SectionCard>
        <div className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#818CF8" }}>CS Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <MetricField label="Contracted ARR" value={attrs.contractedARR} />
          <MetricField label="Invoiced ARR" value={attrs.invoicedARR} />
          <MetricField label="Blended PEPM" value={attrs.blendedPEPM} />
          <MetricField label="Transition to CS Date" value={attrs.transitionToCSDate} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricField label="Marquee Client" value={attrs.marqueeClient} />
          <MetricField label="Backup AM/CSM" value={attrs.backupAMCSM} />
        </div>
      </SectionCard>

      {/* Basic Details */}
      <SectionCard>
        <div className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: "#818CF8" }}>Basic Details</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <MetricField label="Tenant Id" value={attrs.tenantId} />
          <MetricField label="Tenant Name" value={attrs.tenantName} />
          <MetricField label="Tenant URL" value={attrs.tenantURL} isLink />
          <MetricField label="Server Location" value={attrs.serverLocation} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <MetricField label="Active Headcount" value={(attrs.activeHeadcount as number).toLocaleString()} />
          <MetricField label="Billable/Tenant/Internal" value={attrs.billableType} />
          <MetricField label="Server Name" value={attrs.serverName} />
          <MetricField label="Sub Domain" value={attrs.subDomain} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <MetricField label="Customer Market Category" value={attrs.customerMarketCategory} />
          <MetricField label="Parent Name" value={attrs.parentName} />
          <MetricField label="Region" value={attrs.region} />
          <MetricField label="Customer City" value={attrs.customerCity} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <MetricField label="Regional Customer Success Director" value={attrs.rcsd} />
          <MetricField label="Customer Success Director" value={attrs.csd} />
          <MetricField label="Associate Director" value={attrs.associateDirector} />
          <MetricField label="CSM" value={attrs.csm} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricField label="Account Manager" value={attrs.accountManager} />
          <MetricField label="Regional KAM Head" value={attrs.regionalKAMHead} />
          <MetricField label="Key Account Manager" value={attrs.keyAccountManager} />
          <MetricField label="UCC" value={attrs.ucc} />
        </div>
      </SectionCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Timeline
// ═══════════════════════════════════════════════════════════
const ACTIVITY_TYPES = ["Update", "Call", "Meeting", "Email", "Milestone", "Automated Program", "Account Transition"] as const;

function TimelineTab({ client }: { client: Client }) {
  const allTimeline = getClientTimeline(client);
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set(ACTIVITY_TYPES));
  const [typeDropdown, setTypeDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allTimeline.filter(item => {
      if (!typeFilter.has(item.type)) return false;
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.note.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTimeline, typeFilter, search]);

  const toggleType = (type: string) => {
    setTypeFilter(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const toggleAll = () => {
    if (typeFilter.size === ACTIVITY_TYPES.length) setTypeFilter(new Set());
    else setTypeFilter(new Set(ACTIVITY_TYPES));
  };

  const typeIcon = (type: string) => {
    const map: Record<string, React.ReactNode> = {
      Meeting: <Video size={14} style={{ color: "#8B5CF6" }} />,
      Call: <Phone size={14} style={{ color: "#06B6D4" }} />,
      Email: <Mail size={14} style={{ color: "#F59E0B" }} />,
      Update: <FileText size={14} style={{ color: "#6366F1" }} />,
      Milestone: <Star size={14} style={{ color: "#10B981" }} />,
      "Automated Program": <Activity size={14} style={{ color: "#64748B" }} />,
      "Account Transition": <ArrowUpRight size={14} style={{ color: "#818CF8" }} />,
    };
    return map[type] || <FileText size={14} style={{ color: "#64748B" }} />;
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Activity Type Dropdown */}
        <div className="relative">
          <button onClick={() => setTypeDropdown(!typeDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
            Activity Type: {typeFilter.size === ACTIVITY_TYPES.length ? "All" : `${typeFilter.size} selected`}
            <ChevronDown size={12} />
          </button>
          {typeDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 rounded-lg p-2 w-64 shadow-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <div className="px-2 pb-2 mb-2" style={{ borderBottom: "1px solid #1A1A38" }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={typeFilter.size === ACTIVITY_TYPES.length} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-indigo-500" />
                  <span className="text-xs text-white font-medium">SELECT ALL</span>
                  <span className="text-[10px] ml-auto" style={{ color: "#64748B" }}>{typeFilter.size} / {ACTIVITY_TYPES.length} SELECTED</span>
                </label>
              </div>
              {ACTIVITY_TYPES.map(t => (
                <label key={t} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#111128] cursor-pointer">
                  <input type="checkbox" checked={typeFilter.has(t)} onChange={() => toggleType(t)} className="w-3.5 h-3.5 rounded accent-indigo-500" />
                  <span className="text-xs text-white">{t}</span>
                </label>
              ))}
              <div className="flex items-center gap-2 mt-3 px-2 pt-2" style={{ borderTop: "1px solid #1A1A38" }}>
                <button onClick={() => { setTypeFilter(new Set()); setTypeDropdown(false); }} className="flex-1 py-1.5 rounded-lg text-xs" style={{ border: "1px solid #1A1A38", color: "#94A3B8" }}>Cancel</button>
                <button onClick={() => setTypeDropdown(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "#6366F1" }}>Apply</button>
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
          Activity Date: All <Calendar size={12} />
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ border: "1px solid #6366F1", color: "#818CF8" }}>
          <Filter size={12} /> Advanced Filters
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: "#64748B" }}>Content</span>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="pl-8 pr-3 py-2 rounded-lg text-xs outline-none w-48" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
          </div>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3">
        {filtered.map(item => (
          <SectionCard key={item.id}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#111128" }}>
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </div>
                <div className="text-xs leading-relaxed mt-2 whitespace-pre-line" style={{ color: "#94A3B8" }}>
                  {expandedItem === item.id ? item.note : item.note.length > 150 ? item.note.slice(0, 150) + "..." : item.note}
                  {item.note.length > 150 && (
                    <button onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)} className="ml-1 text-[10px]" style={{ color: "#818CF8" }}>
                      {expandedItem === item.id ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#111128" }}>
                    <MessageSquare size={12} style={{ color: "#64748B" }} />
                  </button>
                  {item.comments > 0 && <span className="text-[10px]" style={{ color: "#64748B" }}>{item.comments}</span>}
                  <button className="w-7 h-7 rounded flex items-center justify-center" style={{ background: "#111128" }}>
                    <MoreVertical size={12} style={{ color: "#64748B" }} />
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[10px] mb-0.5" style={{ color: "#475569" }}>Activity Type</div>
                  <div className="text-xs font-medium text-white">{item.activityType}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] mb-0.5" style={{ color: "#475569" }}>Created By</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
                      {item.createdByInitials}
                    </div>
                    <span className="text-xs text-white">{item.createdBy}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] mb-0.5" style={{ color: "#475569" }}>Activity Date</div>
                  <div className="text-xs text-white">{item.date}</div>
                </div>
              </div>
            </div>
          </SectionCard>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-sm" style={{ color: "#64748B" }}>No activities match the current filters</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Activity View (Projects & Tasks)
// ═══════════════════════════════════════════════════════════
// ── Gantt helpers ────────────────────────────────────────
const GANTT_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const GANTT_TOTAL_MONTHS = 12;

function getGanttTasks(client: Client) {
  const clientProgs = programs.filter(p => p.clientId === client.id);
  return [
    ...clientProgs.map((p, idx) => ({
      id: p.id,
      name: p.name,
      category: "Program",
      startMonth: GANTT_MONTH_LABELS.indexOf(p.startDate.split(" ")[0]),
      durationMonths: Math.max(1, GANTT_MONTH_LABELS.indexOf(p.endDate.split(" ")[0]) - GANTT_MONTH_LABELS.indexOf(p.startDate.split(" ")[0]) + 1),
      progress: p.progress,
      health: p.health,
      owner: p.owner,
      isCritical: p.health === "delayed" || p.health === "at_risk",
      dependsOn: null as string | null,
    })),
    { id: "gt-1", name: "Requirements & Discovery", category: "Phase", startMonth: 0, durationMonths: 2, progress: 100, health: "on_track" as const, owner: client.csm, isCritical: false, dependsOn: null as string | null },
    { id: "gt-2", name: "Design & Architecture", category: "Phase", startMonth: 1, durationMonths: 3, progress: 85, health: "on_track" as const, owner: client.csm, isCritical: false, dependsOn: "gt-1" },
    { id: "gt-3", name: "Implementation Sprint 1-3", category: "Phase", startMonth: 3, durationMonths: 4, progress: 60, health: "at_risk" as const, owner: client.csm, isCritical: true, dependsOn: "gt-2" },
    { id: "gt-4", name: "UAT & QA", category: "Phase", startMonth: 6, durationMonths: 2, progress: 20, health: "on_track" as const, owner: client.csm, isCritical: true, dependsOn: "gt-3" },
    { id: "gt-5", name: "Go-Live & Hypercare", category: "Phase", startMonth: 8, durationMonths: 2, progress: 0, health: "on_track" as const, owner: client.csm, isCritical: true, dependsOn: "gt-4" },
    { id: "gt-6", name: "Post Go-Live Optimization", category: "Phase", startMonth: 10, durationMonths: 2, progress: 0, health: "on_track" as const, owner: client.csm, isCritical: false, dependsOn: "gt-5" },
  ];
}

const GANTT_COLORS: Record<string, { bar: string; bg: string }> = {
  on_track: { bar: "#10B981", bg: "rgba(16,185,129,0.18)" },
  at_risk: { bar: "#F59E0B", bg: "rgba(245,158,11,0.18)" },
  delayed: { bar: "#EF4444", bg: "rgba(239,68,68,0.18)" },
};

function ActivityViewTab({ client }: { client: Client }) {
  const clientPrograms = programs.filter(p => p.clientId === client.id);
  const taskLists = getClientTasks(client);
  const [activeView, setActiveView] = useState<"tasks" | "milestones" | "kanban" | "gantt">("tasks");
  const [expandedTaskList, setExpandedTaskList] = useState<number | null>(null);

  const toggleTaskList = (index: number) => {
    setExpandedTaskList(prev => (prev === index ? null : index));
  };

  const milestones = [
    { name: "Phase 1 Complete", date: "Jan 2026", status: "Done", program: clientPrograms[0]?.name || "N/A" },
    { name: "Phase 2 Kickoff", date: "Mar 2026", status: "Done", program: clientPrograms[0]?.name || "N/A" },
    { name: "UAT Sign-off", date: "May 2026", status: "In Progress", program: clientPrograms[0]?.name || "N/A" },
    { name: "Go-Live", date: "Jul 2026", status: "Upcoming", program: clientPrograms[0]?.name || "N/A" },
    { name: "Post Go-Live Review", date: "Aug 2026", status: "Upcoming", program: clientPrograms[0]?.name || "N/A" },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        {(["tasks", "milestones", "kanban", "gantt"] as const).map(v => (
          <button key={v} onClick={() => setActiveView(v)} className="px-4 py-2 rounded-md text-xs font-medium capitalize transition-colors" style={{ background: activeView === v ? "#111128" : "transparent", color: activeView === v ? "#818CF8" : "#64748B" }}>
            {v === "gantt" ? "Gantt Chart" : v}
          </button>
        ))}
      </div>

      {activeView === "tasks" && (
        <div className="space-y-4">
          {taskLists.map((list, li) => (
            <SectionCard key={li}>
              {(() => {
                const isOpen = expandedTaskList === li;
                const linkedProgram = clientPrograms[li] || null;
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleTaskList(li)}
                      className="w-full flex items-center gap-3"
                    >
                      {isOpen ? <ChevronDown size={14} style={{ color: "#818CF8" }} /> : <ChevronRight size={14} style={{ color: "#64748B" }} />}
                      <span className="text-sm font-semibold text-white">{list.name}</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-24 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                          <div className="h-full rounded-full" style={{ width: `${list.progress}%`, background: "#10B981" }} />
                        </div>
                        <span className="text-[10px]" style={{ color: "#10B981" }}>{list.progress}%</span>
                      </div>
                    </button>

                    {isOpen && (
                      <>
                        <div className="mt-4 rounded-lg p-3" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                          <div className="text-[10px] mb-2" style={{ color: "#64748B" }}>Program Details</div>
                          {linkedProgram ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div>
                                <div className="text-[10px]" style={{ color: "#475569" }}>Program</div>
                                <div className="text-xs text-white font-medium">{linkedProgram.name}</div>
                              </div>
                              <div>
                                <div className="text-[10px]" style={{ color: "#475569" }}>Owner</div>
                                <div className="text-xs text-white">{linkedProgram.owner}</div>
                              </div>
                              <div>
                                <div className="text-[10px]" style={{ color: "#475569" }}>Timeline</div>
                                <div className="text-xs text-white">{linkedProgram.startDate} - {linkedProgram.endDate}</div>
                              </div>
                              <div>
                                <div className="text-[10px]" style={{ color: "#475569" }}>Health</div>
                                <HealthBadge health={linkedProgram.health} />
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs" style={{ color: "#94A3B8" }}>No linked program found for this activity entry.</div>
                          )}
                        </div>

                        <div className="overflow-x-auto mt-4">
                          <table className="w-full text-left">
                            <thead>
                              <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                                {["#", "Task", "Status", "Priority", "% Complete"].map(h => (
                                  <th key={h} className="py-2 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {list.tasks.map((task, ti) => (
                                <tr key={ti} className="hover:bg-[#111128] transition-colors" style={{ borderBottom: "1px solid #0F0F28" }}>
                                  <td className="py-2.5 px-3 text-[10px] font-mono" style={{ color: "#64748B" }}>{task.id}</td>
                                  <td className="py-2.5 px-3 text-xs text-white">{task.name}</td>
                                  <td className="py-2.5 px-3"><StatusBadge status={task.status} /></td>
                                  <td className="py-2.5 px-3"><PriorityBadge priority={task.priority} /></td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${task.completion}%`, background: task.completion === 100 ? "#10B981" : task.completion > 50 ? "#F59E0B" : "#6366F1" }} />
                                      </div>
                                      <span className="text-[10px] text-white">{task.completion}%</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid #1A1A38" }}>
                          <button className="text-[10px] flex items-center gap-1" style={{ color: "#818CF8" }}><Plus size={10} /> Add Task</button>
                          <button className="text-[10px] flex items-center gap-1" style={{ color: "#818CF8" }}><Plus size={10} /> Add Task List</button>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </SectionCard>
          ))}
        </div>
      )}

      {activeView === "milestones" && (
        <SectionCard>
          <div className="text-sm font-semibold text-white mb-4">Milestones</div>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: m.status === "Done" ? "rgba(16,185,129,0.12)" : m.status === "In Progress" ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.12)" }}>
                  {m.status === "Done" ? <CheckCircle size={14} style={{ color: "#10B981" }} /> : m.status === "In Progress" ? <Play size={14} style={{ color: "#F59E0B" }} /> : <Clock size={14} style={{ color: "#64748B" }} />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{m.name}</div>
                  <div className="text-[10px]" style={{ color: "#64748B" }}>{m.program}</div>
                </div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>{m.date}</div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {activeView === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Open", "In Progress", "Discuss", "Done"].map(status => {
            const tasks = taskLists.flatMap(l => l.tasks).filter(t => t.status === status);
            const colorMap: Record<string, string> = { Open: "#EF4444", "In Progress": "#F59E0B", Discuss: "#06B6D4", Done: "#10B981" };
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: colorMap[status] }} />
                  <span className="text-xs font-semibold text-white">{status}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#111128", color: "#64748B" }}>{tasks.length}</span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                      <div className="text-xs text-white mb-1">{task.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono" style={{ color: "#475569" }}>{task.id}</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <div className="rounded-lg p-4 text-center" style={{ background: "#0C0C22", border: "1px dashed #1A1A38" }}>
                      <span className="text-[10px]" style={{ color: "#475569" }}>No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeView === "gantt" && (() => {
        const ganttTasks = getGanttTasks(client);
        const today = new Date();
        const currentMonthIdx = today.getMonth(); // 0-based (Apr = 3)
        const criticalCount = ganttTasks.filter(t => t.isCritical).length;
        const depCount = ganttTasks.filter(t => t.dependsOn).length;
        return (
          <div className="space-y-4">
            {/* Legend & Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                {[{ label: "On Track", color: "#10B981" }, { label: "At Risk", color: "#F59E0B" }, { label: "Delayed", color: "#EF4444" }].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background: l.color }} />
                    <span className="text-[10px]" style={{ color: "#94A3B8" }}>{l.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "#818CF8" }} />
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border-2" style={{ borderColor: "#EF4444", background: "transparent" }} />
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>Critical Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitBranch size={11} style={{ color: "#A78BFA" }} />
                  <span className="text-[10px]" style={{ color: "#94A3B8" }}>Dependency ({depCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>{criticalCount} Critical</span>
                <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>2026 Timeline</span>
              </div>
            </div>

            <SectionCard>
              <div className="overflow-x-auto">
                <div style={{ minWidth: 1050 }}>
                  {/* Month headers */}
                  <div className="flex" style={{ borderBottom: "1px solid #1A1A38" }}>
                    <div className="flex-shrink-0" style={{ width: 240 }}>
                      <div className="py-2 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Task / Phase</div>
                    </div>
                    <div className="flex-shrink-0" style={{ width: 80 }}>
                      <div className="py-2 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Owner</div>
                    </div>
                    <div className="flex-1 flex">
                      {GANTT_MONTH_LABELS.map((m, i) => (
                        <div key={m} className="flex-1 text-center py-2 text-[10px] font-semibold uppercase tracking-wider relative" style={{ color: i === currentMonthIdx ? "#818CF8" : "#475569", borderLeft: "1px solid #0F0F28", background: i === currentMonthIdx ? "rgba(99,102,241,0.04)" : "transparent" }}>
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gantt rows */}
                  {ganttTasks.map((task, idx) => {
                    const colors = GANTT_COLORS[task.health] || GANTT_COLORS.on_track;
                    const leftPct = (task.startMonth / GANTT_TOTAL_MONTHS) * 100;
                    const widthPct = (task.durationMonths / GANTT_TOTAL_MONTHS) * 100;
                    const progressWidthPct = widthPct * (task.progress / 100);
                    // Find dependency source row index
                    const depIdx = task.dependsOn ? ganttTasks.findIndex(t => t.id === task.dependsOn) : -1;
                    const depTask = depIdx >= 0 ? ganttTasks[depIdx] : null;
                    return (
                      <div key={task.id} className="flex items-center hover:bg-[#111128] transition-colors relative" style={{ borderBottom: "1px solid #0F0F28", minHeight: 48, borderLeft: task.isCritical ? "3px solid #EF4444" : "3px solid transparent" }}>
                        {/* Label column */}
                        <div className="flex-shrink-0 py-2 px-3" style={{ width: 237 }}>
                          <div className="flex items-center gap-1.5">
                            {task.isCritical && <Zap size={10} style={{ color: "#EF4444" }} />}
                            <span className="text-xs text-white font-medium truncate">{task.name}</span>
                          </div>
                          <div className="text-[9px] flex items-center gap-2 mt-0.5" style={{ color: "#64748B" }}>
                            <span className="px-1.5 py-px rounded" style={{ background: task.category === "Program" ? "rgba(99,102,241,0.12)" : "rgba(139,92,246,0.12)", color: task.category === "Program" ? "#818CF8" : "#A78BFA" }}>{task.category}</span>
                            <span>{task.progress}%</span>
                            {task.dependsOn && <span className="flex items-center gap-0.5" style={{ color: "#A78BFA" }}><GitBranch size={8} /> dep</span>}
                          </div>
                        </div>
                        {/* Owner column */}
                        <div className="flex-shrink-0 py-2 px-2" style={{ width: 80 }}>
                          <div className="text-[10px] text-white truncate">{task.owner.split(" ")[0]}</div>
                        </div>
                        {/* Bar column */}
                        <div className="flex-1 relative" style={{ height: 48 }}>
                          {/* Month grid lines + current month highlight */}
                          {GANTT_MONTH_LABELS.map((_, i) => (
                            <div key={i} className="absolute top-0 bottom-0" style={{ left: `${(i / GANTT_TOTAL_MONTHS) * 100}%`, width: i === currentMonthIdx ? `${100 / GANTT_TOTAL_MONTHS}%` : 1, background: i === currentMonthIdx ? "rgba(99,102,241,0.04)" : "#0F0F28" }} />
                          ))}
                          {/* Today marker */}
                          <div className="absolute top-0 bottom-0 z-10" style={{ left: `${((currentMonthIdx + today.getDate() / 30) / GANTT_TOTAL_MONTHS) * 100}%`, width: 2, background: "#818CF8", opacity: 0.6 }} />
                          {/* Dependency arrow */}
                          {depTask && (() => {
                            const depEndPct = ((depTask.startMonth + depTask.durationMonths) / GANTT_TOTAL_MONTHS) * 100;
                            return (
                              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-5" style={{ overflow: "visible" }}>
                                <line x1={`${depEndPct}%`} y1="-10" x2={`${leftPct}%`} y2="24" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="4 2" markerEnd="url(#arrowhead)" />
                                <defs>
                                  <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                                    <polygon points="0 0, 6 2, 0 4" fill="#A78BFA" />
                                  </marker>
                                </defs>
                              </svg>
                            );
                          })()}
                          {/* Background bar */}
                          <div className="absolute top-3.5 rounded-md" style={{ left: `${leftPct}%`, width: `${widthPct}%`, height: 22, background: colors.bg, border: task.isCritical ? `1px dashed ${colors.bar}` : "none" }} />
                          {/* Progress bar */}
                          {task.progress > 0 && (
                            <div className="absolute top-3.5 rounded-md rounded-r-none" style={{ left: `${leftPct}%`, width: `${progressWidthPct}%`, height: 22, background: colors.bar, opacity: 0.85 }}>
                              {task.progress >= 15 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white drop-shadow-sm">{task.progress}%</span>
                              )}
                            </div>
                          )}
                          {/* Diamond milestone markers at start/end */}
                          <div className="absolute top-4 w-2.5 h-2.5 rotate-45 z-10" style={{ left: `calc(${leftPct}% - 5px)`, background: colors.bar }} />
                          <div className="absolute top-4 w-2.5 h-2.5 rotate-45 z-10" style={{ left: `calc(${leftPct + widthPct}% - 5px)`, background: colors.bar }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "Total Phases", value: ganttTasks.length, color: "#6366F1", icon: Layers },
                { label: "On Track", value: ganttTasks.filter(t => t.health === "on_track").length, color: "#10B981", icon: CheckCircle },
                { label: "At Risk", value: ganttTasks.filter(t => t.health === "at_risk").length, color: "#F59E0B", icon: AlertTriangle },
                { label: "Critical Path", value: criticalCount, color: "#EF4444", icon: Zap },
                { label: "Avg Progress", value: `${Math.round(ganttTasks.reduce((s, t) => s + t.progress, 0) / ganttTasks.length)}%`, color: "#8B5CF6", icon: Target },
              ].map((s, i) => (
                <SectionCard key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon size={13} style={{ color: s.color }} />
                    <div className="text-[10px]" style={{ color: "#64748B" }}>{s.label}</div>
                  </div>
                  <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                </SectionCard>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Stakeholders
// ═══════════════════════════════════════════════════════════
// ── Multi-Client Stakeholder Analysis Data ──────────────
function getMultiClientStakeholderData() {
  const allClientStakeholders = clients.map(c => {
    const stks = getClientStakeholders(c);
    return { client: c, stakeholders: stks };
  });

  // Cross-client influence matrix
  const influenceMatrix = clients.map(c => {
    const stks = getClientStakeholders(c);
    return {
      client: c.name,
      clientId: c.id,
      health: c.health,
      champions: stks.filter(s => s.type === "Champion").length,
      decisionMakers: stks.filter(s => s.type === "Decision Maker").length,
      influencers: stks.filter(s => s.type === "Influencer").length,
      users: stks.filter(s => s.type === "User").length,
      avgSentiment: Math.round(stks.reduce((a, s) => a + s.sentiment, 0) / (stks.length || 1)),
      total: stks.length,
      highInfluence: stks.filter(s => s.influence === "Very High" || s.influence === "High").length,
      riskContacts: stks.filter(s => s.sentiment < 50).length,
    };
  });

  // Shared roles across clients (people in similar positions)
  const roleOverlap = [
    { role: "CTO / VP Engineering", clients: ["Acme Corporation", "GlobalTech Inc", "Meridian Health"], sentiment: [85, 54, 78], trend: "stable" },
    { role: "CFO / Finance Lead", clients: ["Acme Corporation", "Atlas Financial", "NovaStar Energy"], sentiment: [45, 28, 65], trend: "declining" },
    { role: "Program Director", clients: ["Acme Corporation", "Meridian Health", "Pinnacle Retail"], sentiment: [90, 76, 48], trend: "improving" },
    { role: "IT Director", clients: ["Acme Corporation", "GlobalTech Inc", "NovaStar Energy"], sentiment: [78, 62, 71], trend: "stable" },
    { role: "HR / People Lead", clients: ["Acme Corporation", "Meridian Health", "Pinnacle Retail"], sentiment: [82, 80, 55], trend: "improving" },
  ];

  return { allClientStakeholders, influenceMatrix, roleOverlap };
}

function StakeholdersTab({ client }: { client: Client }) {
  const stakeholders = getClientStakeholders(client);
  const [search, setSearch] = useState("");
  const [stakeholderView, setStakeholderView] = useState<"register" | "mapping" | "multi-criteria" | "multi-client">("register");
  const multiClientData = useMemo(() => getMultiClientStakeholderData(), []);

  const filtered = stakeholders.filter(s =>
    !search || `${s.first} ${s.last}`.toLowerCase().includes(search.toLowerCase()) || s.position.toLowerCase().includes(search.toLowerCase())
  );

  // Power-Interest grid placement helper
  const getQuadrant = (power: number, interest: number) => {
    if (power >= 60 && interest >= 60) return "Manage Closely";
    if (power >= 60 && interest < 60) return "Keep Satisfied";
    if (power < 60 && interest >= 60) return "Keep Informed";
    return "Monitor";
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          {([
            { id: "register" as const, label: "Register", icon: Users },
            { id: "mapping" as const, label: "Stakeholder Mapping", icon: Network },
            { id: "multi-criteria" as const, label: "Multi-Criteria Analysis", icon: Grid3X3 },
            { id: "multi-client" as const, label: "Multi-Client Analysis", icon: Globe },
          ]).map(v => (
            <button key={v.id} onClick={() => setStakeholderView(v.id)} className="px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors" style={{ background: stakeholderView === v.id ? "#111128" : "transparent", color: stakeholderView === v.id ? "#818CF8" : "#64748B" }}>
              <v.icon size={12} /> {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stakeholders…" className="pl-8 pr-3 py-2 rounded-lg text-xs outline-none w-56" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
          </div>
          <button className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "#6366F1", color: "#fff" }}>
            <Plus size={12} /> Add Stakeholder
          </button>
        </div>
      </div>

      {/* ════════ REGISTER VIEW ════════ */}
      {stakeholderView === "register" && (
        <>
          {/* Stakeholder summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total", value: stakeholders.length, color: "#6366F1" },
              { label: "Champions", value: stakeholders.filter(s => s.type === "Champion").length, color: "#10B981" },
              { label: "Decision Makers", value: stakeholders.filter(s => s.type === "Decision Maker").length, color: "#818CF8" },
              { label: "Influencers", value: stakeholders.filter(s => s.type === "Influencer").length, color: "#F59E0B" },
              { label: "At-Risk (Sentiment < 50)", value: stakeholders.filter(s => s.sentiment < 50).length, color: "#EF4444" },
            ].map((s, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px]" style={{ color: "#64748B" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <SectionCard>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                    {["Name", "Position", "Type", "Influence", "Sentiment", "Last Interaction", "Contact", ""].map(h => (
                      <th key={h} className="py-2.5 px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={i} className="hover:bg-[#111128] transition-colors" style={{ borderBottom: "1px solid #0F0F28" }}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
                            {s.first[0]}{s.last[0]}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white">{s.first} {s.last}</div>
                            <div className="text-[10px]" style={{ color: "#64748B" }}>{client.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs" style={{ color: "#94A3B8" }}>{s.position}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                          background: s.type === "Champion" ? "rgba(16,185,129,0.12)" : s.type === "Decision Maker" ? "rgba(99,102,241,0.12)" : s.type === "Influencer" ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.12)",
                          color: s.type === "Champion" ? "#10B981" : s.type === "Decision Maker" ? "#818CF8" : s.type === "Influencer" ? "#F59E0B" : "#94A3B8",
                        }}>{s.type}</span>
                      </td>
                      <td className="py-3 px-3 text-xs" style={{ color: s.influence === "Very High" ? "#EF4444" : s.influence === "High" ? "#F59E0B" : "#64748B" }}>{s.influence}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                            <div className="h-full rounded-full" style={{ width: `${s.sentiment}%`, background: s.sentiment >= 70 ? "#10B981" : s.sentiment >= 50 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                          <span className="text-[10px]" style={{ color: s.sentiment >= 70 ? "#10B981" : s.sentiment >= 50 ? "#F59E0B" : "#EF4444" }}>{s.sentiment}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{s.lastInteraction}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#111128" }} title={s.email}>
                            <Mail size={11} style={{ color: "#818CF8" }} />
                          </button>
                          <button className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#111128" }} title={s.phone}>
                            <Phone size={11} style={{ color: "#818CF8" }} />
                          </button>
                          <button className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#111128" }}>
                            <Video size={11} style={{ color: "#818CF8" }} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <button className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#111128" }}>
                          <ChevronRight size={12} style={{ color: "#64748B" }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}

      {/* ════════ STAKEHOLDER MAPPING VIEW ════════ */}
      {stakeholderView === "mapping" && (
        <div className="space-y-4">
          {/* Power-Interest Matrix (Gainsight-style 2x2) */}
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Crosshair size={14} style={{ color: "#818CF8" }} /> Power-Interest Matrix
              </div>
              <span className="text-[10px]" style={{ color: "#64748B" }}>Stakeholder positions based on Power & Interest scores</span>
            </div>
            <div className="relative" style={{ height: 420 }}>
              {/* Axis labels */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold" style={{ color: "#64748B", transformOrigin: "center center" }}>Power →</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-semibold" style={{ color: "#64748B" }}>Interest →</div>

              {/* 2x2 Grid */}
              <div className="absolute inset-0 ml-6 mb-5 grid grid-cols-2 grid-rows-2 gap-px rounded-lg overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
                {/* Top-Left: Keep Satisfied (High Power, Low Interest) */}
                <div className="p-3 relative" style={{ background: "rgba(245,158,11,0.06)", borderRight: "1px solid #1A1A38", borderBottom: "1px solid #1A1A38" }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#F59E0B" }}>Keep Satisfied</div>
                  <div className="text-[8px]" style={{ color: "#475569" }}>High Power · Low Interest</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {stakeholders.filter(s => s.power >= 60 && s.interest < 60).map((s, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "#fff" }}>
                          {s.first[0]}{s.last[0]}
                        </div>
                        <div>
                          <div className="text-[9px] font-medium text-white">{s.first} {s.last[0]}.</div>
                          <div className="text-[7px]" style={{ color: "#64748B" }}>{s.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top-Right: Manage Closely (High Power, High Interest) */}
                <div className="p-3 relative" style={{ background: "rgba(239,68,68,0.06)", borderBottom: "1px solid #1A1A38" }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#EF4444" }}>Manage Closely</div>
                  <div className="text-[8px]" style={{ color: "#475569" }}>High Power · High Interest</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {stakeholders.filter(s => s.power >= 60 && s.interest >= 60).map((s, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#0C0C22", border: "1px solid #EF444433" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff" }}>
                          {s.first[0]}{s.last[0]}
                        </div>
                        <div>
                          <div className="text-[9px] font-medium text-white">{s.first} {s.last[0]}.</div>
                          <div className="text-[7px]" style={{ color: "#64748B" }}>{s.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom-Left: Monitor (Low Power, Low Interest) */}
                <div className="p-3 relative" style={{ background: "rgba(100,116,139,0.06)", borderRight: "1px solid #1A1A38" }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>Monitor</div>
                  <div className="text-[8px]" style={{ color: "#475569" }}>Low Power · Low Interest</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {stakeholders.filter(s => s.power < 60 && s.interest < 60).map((s, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "linear-gradient(135deg, #64748B, #475569)", color: "#fff" }}>
                          {s.first[0]}{s.last[0]}
                        </div>
                        <div>
                          <div className="text-[9px] font-medium text-white">{s.first} {s.last[0]}.</div>
                          <div className="text-[7px]" style={{ color: "#64748B" }}>{s.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom-Right: Keep Informed (Low Power, High Interest) */}
                <div className="p-3 relative" style={{ background: "rgba(16,185,129,0.06)" }}>
                  <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: "#10B981" }}>Keep Informed</div>
                  <div className="text-[8px]" style={{ color: "#475569" }}>Low Power · High Interest</div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {stakeholders.filter(s => s.power < 60 && s.interest >= 60).map((s, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "#fff" }}>
                          {s.first[0]}{s.last[0]}
                        </div>
                        <div>
                          <div className="text-[9px] font-medium text-white">{s.first} {s.last[0]}.</div>
                          <div className="text-[7px]" style={{ color: "#64748B" }}>{s.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Relationship Health Map */}
          <SectionCard>
            <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Network size={14} style={{ color: "#8B5CF6" }} /> Relationship Network Map
            </div>
            <div className="relative mx-auto" style={{ width: "100%", height: 340-16 }}>
              {/* Central node: Client */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold z-20" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
                {client.logo}
              </div>
              {/* Stakeholder nodes arranged in a circle */}
              {stakeholders.map((s, i) => {
                const total = stakeholders.length;
                const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
                const radius = 130;
                const cx = 50 + Math.cos(angle) * (radius / 4);
                const cy = 50 + Math.sin(angle) * (radius / 3.2);
                const sentColor = s.sentiment >= 70 ? "#10B981" : s.sentiment >= 50 ? "#F59E0B" : "#EF4444";
                const typeColor = s.type === "Champion" ? "#10B981" : s.type === "Decision Maker" ? "#818CF8" : s.type === "Influencer" ? "#F59E0B" : "#64748B";
                // Connection line strength
                const lineOpacity = s.sentiment / 100;
                return (
                  <React.Fragment key={i}>
                    {/* Connection line to center */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                      <line x1="50%" y1="50%" x2={`${cx}%`} y2={`${cy}%`} stroke={sentColor} strokeWidth={s.influence === "Very High" ? 2.5 : s.influence === "High" ? 2 : 1} strokeOpacity={lineOpacity} strokeDasharray={s.sentiment < 50 ? "4 3" : "none"} />
                    </svg>
                    {/* Stakeholder node */}
                    <div className="absolute z-10 flex flex-col items-center group" style={{ left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%, -50%)" }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-[9px] font-bold relative" style={{ background: `linear-gradient(135deg, ${typeColor}, ${typeColor}CC)`, color: "#fff", boxShadow: `0 0 8px ${typeColor}40`, border: `2px solid ${sentColor}` }}>
                        {s.first[0]}{s.last[0]}
                        {/* Sentiment ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke={sentColor} strokeWidth="2" strokeDasharray={`${s.sentiment} ${100 - s.sentiment}`} strokeLinecap="round" opacity={0.4} />
                        </svg>
                      </div>
                      <div className="text-[8px] mt-1 text-center whitespace-nowrap font-medium text-white">{s.first} {s.last[0]}.</div>
                      <div className="text-[7px] whitespace-nowrap" style={{ color: "#64748B" }}>{s.position}</div>
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:flex absolute -top-16 left-1/2 -translate-x-1/2 flex-col items-center px-3 py-2 rounded-lg z-30 whitespace-nowrap" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                        <div className="text-[9px] font-medium text-white">{s.first} {s.last}</div>
                        <div className="text-[8px]" style={{ color: "#64748B" }}>{s.type} · {s.influence} Influence</div>
                        <div className="text-[8px] font-bold" style={{ color: sentColor }}>Sentiment: {s.sentiment}%</div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
            {/* Network legend */}
            <div className="flex items-center justify-center gap-5 mt-3 pt-3" style={{ borderTop: "1px solid #1A1A38" }}>
              {[
                { label: "Champion", color: "#10B981" },
                { label: "Decision Maker", color: "#818CF8" },
                { label: "Influencer", color: "#F59E0B" },
                { label: "User", color: "#64748B" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <span className="text-[9px]" style={{ color: "#94A3B8" }}>{t.label}</span>
                </div>
              ))}
              <div className="ml-3 flex items-center gap-1.5">
                <div className="w-4 h-0 border-t-2" style={{ borderColor: "#10B981" }} />
                <span className="text-[9px]" style={{ color: "#94A3B8" }}>Strong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: "#EF4444" }} />
                <span className="text-[9px]" style={{ color: "#94A3B8" }}>At Risk</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ════════ MULTI-CRITERIA ANALYSIS VIEW ════════ */}
      {stakeholderView === "multi-criteria" && (
        <div className="space-y-4">
          {/* Radar Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard>
              <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Crosshair size={14} style={{ color: "#818CF8" }} /> Multi-Criteria Radar — All Stakeholders
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={[
                  { dimension: "Influence", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.influence === "Very High" ? 95 : s.influence === "High" ? 75 : s.influence === "Medium" ? 50 : 25])) },
                  { dimension: "Impact", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.impact])) },
                  { dimension: "Interest", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.interest])) },
                  { dimension: "Criticality", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.criticality])) },
                  { dimension: "Effort", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.effort])) },
                  { dimension: "Power", ...Object.fromEntries(stakeholders.slice(0, 5).map(s => [`${s.first}`, s.power])) },
                ]}>
                  <PolarGrid stroke="#1A1A38" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#475569", fontSize: 8 }} axisLine={false} />
                  {stakeholders.slice(0, 5).map((s, i) => {
                    const colors = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
                    return <RechartsRadar key={i} name={`${s.first} ${s.last[0]}.`} dataKey={s.first} stroke={colors[i]} fill={colors[i]} fillOpacity={0.1} strokeWidth={2} />;
                  })}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
                </RadarChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Influence vs Sentiment Scatter */}
            <SectionCard>
              <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <CircleDot size={14} style={{ color: "#8B5CF6" }} /> Influence vs Sentiment Bubble Map
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                  <XAxis type="number" dataKey="power" name="Power" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Power", position: "insideBottom", offset: -10, fill: "#64748B", fontSize: 10 }} />
                  <YAxis type="number" dataKey="sentiment" name="Sentiment" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} label={{ value: "Sentiment", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 10 }} />
                  <ZAxis type="number" dataKey="impact" range={[80, 400]} name="Impact" />
                  <Tooltip
                    contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }}
                    formatter={(value: number, name: string) => [value, name]}
                    labelFormatter={() => ""}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const d = payload[0]?.payload;
                      if (!d) return null;
                      return (
                        <div className="px-3 py-2 rounded-lg" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                          <div className="text-xs font-medium text-white">{d.name}</div>
                          <div className="text-[10px]" style={{ color: "#64748B" }}>{d.position}</div>
                          <div className="text-[10px]" style={{ color: "#94A3B8" }}>Power: {d.power} · Sentiment: {d.sentiment} · Impact: {d.impact}</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter
                    name="Stakeholders"
                    data={stakeholders.map(s => ({
                      name: `${s.first} ${s.last}`,
                      position: s.position,
                      power: s.power,
                      sentiment: s.sentiment,
                      impact: s.impact,
                      fill: s.sentiment >= 70 ? "#10B981" : s.sentiment >= 50 ? "#F59E0B" : "#EF4444",
                    }))}
                    fill="#6366F1"
                  >
                    {stakeholders.map((s, i) => (
                      <Cell key={i} fill={s.sentiment >= 70 ? "#10B981" : s.sentiment >= 50 ? "#F59E0B" : "#EF4444"} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Multi-Criteria Scoring Table */}
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Grid3X3 size={14} style={{ color: "#6366F1" }} /> Multi-Criteria Scoring Matrix
              </div>
              <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>6 Dimensions · {stakeholders.length} Stakeholders</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                    {["Stakeholder", "Interest", "Impact", "Criticality", "Effort", "Power", "Sentiment", "Quadrant", "Composite"].map(h => (
                      <th key={h} className="py-2.5 px-2.5 text-[9px] font-semibold uppercase tracking-wider text-center" style={{ color: "#475569" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stakeholders.map((s, i) => {
                    const composite = Math.round((s.interest + s.impact + s.criticality + s.effort + s.power + s.sentiment) / 6);
                    const quadrant = getQuadrant(s.power, s.interest);
                    const qColors: Record<string, string> = { "Manage Closely": "#EF4444", "Keep Satisfied": "#F59E0B", "Keep Informed": "#10B981", Monitor: "#64748B" };
                    const ScoreCell = ({ val }: { val: number }) => (
                      <td className="py-2.5 px-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <div className="w-8 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                            <div className="h-full rounded-full" style={{ width: `${val}%`, background: val >= 70 ? "#10B981" : val >= 50 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                          <span className="text-[10px] font-medium w-6 text-right" style={{ color: val >= 70 ? "#10B981" : val >= 50 ? "#F59E0B" : "#EF4444" }}>{val}</span>
                        </div>
                      </td>
                    );
                    return (
                      <tr key={i} className="hover:bg-[#111128] transition-colors" style={{ borderBottom: "1px solid #0F0F28" }}>
                        <td className="py-2.5 px-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "#fff" }}>
                              {s.first[0]}{s.last[0]}
                            </div>
                            <div>
                              <div className="text-[10px] font-medium text-white">{s.first} {s.last}</div>
                              <div className="text-[8px]" style={{ color: "#64748B" }}>{s.position}</div>
                            </div>
                          </div>
                        </td>
                        <ScoreCell val={s.interest} />
                        <ScoreCell val={s.impact} />
                        <ScoreCell val={s.criticality} />
                        <ScoreCell val={s.effort} />
                        <ScoreCell val={s.power} />
                        <ScoreCell val={s.sentiment} />
                        <td className="py-2.5 px-2.5 text-center">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${qColors[quadrant]}15`, color: qColors[quadrant] }}>{quadrant}</span>
                        </td>
                        <td className="py-2.5 px-2.5 text-center">
                          <span className="text-sm font-bold" style={{ color: composite >= 70 ? "#10B981" : composite >= 50 ? "#F59E0B" : "#EF4444" }}>{composite}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Quadrant Distribution Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Manage Closely", desc: "High Power · High Interest", count: stakeholders.filter(s => s.power >= 60 && s.interest >= 60).length, color: "#EF4444", icon: AlertTriangle },
              { label: "Keep Satisfied", desc: "High Power · Low Interest", count: stakeholders.filter(s => s.power >= 60 && s.interest < 60).length, color: "#F59E0B", icon: Eye },
              { label: "Keep Informed", desc: "Low Power · High Interest", count: stakeholders.filter(s => s.power < 60 && s.interest >= 60).length, color: "#10B981", icon: Mail },
              { label: "Monitor", desc: "Low Power · Low Interest", count: stakeholders.filter(s => s.power < 60 && s.interest < 60).length, color: "#64748B", icon: Clock },
            ].map((q, i) => (
              <SectionCard key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <q.icon size={13} style={{ color: q.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: q.color }}>{q.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{q.count}</div>
                <div className="text-[8px] mt-0.5" style={{ color: "#475569" }}>{q.desc}</div>
              </SectionCard>
            ))}
          </div>
        </div>
      )}

      {/* ════════ MULTI-CLIENT ANALYSIS VIEW ════════ */}
      {stakeholderView === "multi-client" && (
        <div className="space-y-4">
          {/* Cross-Client Influence Matrix */}
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe size={14} style={{ color: "#818CF8" }} /> Cross-Client Stakeholder Influence Matrix
              </div>
              <span className="text-[10px] px-2 py-1 rounded" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>All Clients Comparison</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                    {["Client", "Health", "Champions", "Decision Makers", "Influencers", "Users", "High Influence", "At-Risk Contacts", "Avg Sentiment"].map(h => (
                      <th key={h} className="py-2.5 px-3 text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {multiClientData.influenceMatrix.map((row, i) => (
                    <tr key={i} className={`hover:bg-[#111128] transition-colors ${row.clientId === client.id ? "bg-[#111128]" : ""}`} style={{ borderBottom: "1px solid #0F0F28" }}>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-white">{row.client}</span>
                          {row.clientId === client.id && <span className="text-[8px] px-1 py-px rounded" style={{ background: "rgba(99,102,241,0.2)", color: "#818CF8" }}>Current</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3"><HealthBadge health={row.health} /></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-bold" style={{ color: "#10B981" }}>{row.champions}</span></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-bold" style={{ color: "#818CF8" }}>{row.decisionMakers}</span></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-bold" style={{ color: "#F59E0B" }}>{row.influencers}</span></td>
                      <td className="py-2.5 px-3"><span className="text-xs" style={{ color: "#94A3B8" }}>{row.users}</span></td>
                      <td className="py-2.5 px-3"><span className="text-xs font-bold" style={{ color: "#A78BFA" }}>{row.highInfluence}</span></td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-bold" style={{ color: row.riskContacts > 0 ? "#EF4444" : "#10B981" }}>{row.riskContacts}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                            <div className="h-full rounded-full" style={{ width: `${row.avgSentiment}%`, background: row.avgSentiment >= 70 ? "#10B981" : row.avgSentiment >= 50 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                          <span className="text-[10px] font-medium" style={{ color: row.avgSentiment >= 70 ? "#10B981" : row.avgSentiment >= 50 ? "#F59E0B" : "#EF4444" }}>{row.avgSentiment}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Role-Based Cross-Client Comparison */}
          <SectionCard>
            <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={14} style={{ color: "#8B5CF6" }} /> Role-Based Sentiment Across Clients
            </div>
            <div className="space-y-3">
              {multiClientData.roleOverlap.map((role, ri) => (
                <div key={ri} className="rounded-lg p-3" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase size={12} style={{ color: "#818CF8" }} />
                      <span className="text-xs font-medium text-white">{role.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {role.trend === "improving" ? <TrendingUp size={11} style={{ color: "#10B981" }} /> : role.trend === "declining" ? <TrendingDown size={11} style={{ color: "#EF4444" }} /> : <Activity size={11} style={{ color: "#64748B" }} />}
                      <span className="text-[9px] capitalize" style={{ color: role.trend === "improving" ? "#10B981" : role.trend === "declining" ? "#EF4444" : "#64748B" }}>{role.trend}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {role.clients.map((cl, ci) => (
                      <div key={ci} className="flex items-center gap-2 px-2 py-1 rounded" style={{ background: "#0C0C22" }}>
                        <span className="text-[10px]" style={{ color: "#94A3B8" }}>{cl}</span>
                        <div className="w-10 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                          <div className="h-full rounded-full" style={{ width: `${role.sentiment[ci]}%`, background: role.sentiment[ci] >= 70 ? "#10B981" : role.sentiment[ci] >= 50 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: role.sentiment[ci] >= 70 ? "#10B981" : role.sentiment[ci] >= 50 ? "#F59E0B" : "#EF4444" }}>{role.sentiment[ci]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Stakeholder Distribution Bar Chart */}
          <SectionCard>
            <div className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={14} style={{ color: "#6366F1" }} /> Stakeholder Type Distribution by Client
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={multiClientData.influenceMatrix} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="client" type="category" tick={{ fill: "#E2E8F0", fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#94A3B8" }} />
                <Bar dataKey="champions" name="Champions" fill="#10B981" radius={[0, 3, 3, 0]} stackId="a" />
                <Bar dataKey="decisionMakers" name="Decision Makers" fill="#6366F1" radius={[0, 3, 3, 0]} stackId="a" />
                <Bar dataKey="influencers" name="Influencers" fill="#F59E0B" radius={[0, 3, 3, 0]} stackId="a" />
                <Bar dataKey="users" name="Users" fill="#64748B" radius={[0, 3, 3, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Learning
// ═══════════════════════════════════════════════════════════
function LearningTab({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Learning Resources</div>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: "#64748B" }}>
          {learningResources.filter(r => r.status === "Completed").length} / {learningResources.length} completed
        </div>
      </div>

      {/* Progress Overview */}
      <SectionCard>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Completed", count: learningResources.filter(r => r.status === "Completed").length, color: "#10B981" },
            { label: "In Progress", count: learningResources.filter(r => r.status === "In Progress").length, color: "#F59E0B" },
            { label: "Not Started", count: learningResources.filter(r => r.status === "Not Started").length, color: "#64748B" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[10px]" style={{ color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningResources.map(r => (
          <SectionCard key={r.id}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.status === "Completed" ? "rgba(16,185,129,0.12)" : r.status === "In Progress" ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.12)" }}>
                {r.type === "Course" ? <BookOpen size={15} style={{ color: r.status === "Completed" ? "#10B981" : "#F59E0B" }} /> :
                  r.type === "Workshop" ? <Users size={15} style={{ color: r.status === "Completed" ? "#10B981" : "#F59E0B" }} /> :
                    r.type === "Video Series" ? <Video size={15} style={{ color: "#F59E0B" }} /> :
                      <FileText size={15} style={{ color: r.status === "Completed" ? "#10B981" : "#F59E0B" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white">{r.title}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{r.type} · {r.duration} · {r.modules} modules</div>
              </div>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span style={{ color: "#64748B" }}>Progress</span>
                <span style={{ color: r.progress === 100 ? "#10B981" : "#F59E0B" }}>{r.progress}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${r.progress}%`, background: r.progress === 100 ? "#10B981" : "#6366F1" }} />
              </div>
            </div>
            <StatusBadge status={r.status} />
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN: ClientDetailPage
// ═══════════════════════════════════════════════════════════
export function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("summary");

  const client = clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Building2 size={48} style={{ color: "#1A1A38" }} />
        <div className="text-lg font-semibold text-white mt-4">Client not found</div>
        <div className="text-sm mt-1" style={{ color: "#64748B" }}>The client you're looking for doesn't exist.</div>
        <button onClick={() => navigate("/app/clients")} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#6366F1", color: "#fff" }}>
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/app/clients")} className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#111128] transition-colors" style={{ border: "1px solid #1A1A38" }}>
          <ArrowLeft size={16} style={{ color: "#94A3B8" }} />
        </button>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>
          {client.logo}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{client.name}</h1>
            <HealthBadge health={client.health} />
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{client.industry} · {client.arr} ARR · Renewal {client.renewalDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg text-xs flex items-center gap-1.5" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>
            <ExternalLink size={12} /> Export
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 mb-6 overflow-x-auto pb-px" style={{ borderBottom: "1px solid #1A1A38" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors relative"
            style={{ color: activeTab === tab.id ? "#818CF8" : "#64748B" }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "#6366F1" }} />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "summary" && <AccountSummaryTab client={client} />}
      {activeTab === "attributes" && <AccountAttributesTab client={client} />}
      {activeTab === "timeline" && <TimelineTab client={client} />}
      {activeTab === "activity" && <ActivityViewTab client={client} />}
      {activeTab === "stakeholders" && <StakeholdersTab client={client} />}
      {activeTab === "learning" && <LearningTab client={client} />}
    </div>
  );
}
