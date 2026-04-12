import { useState, useEffect } from "react";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell,
} from "recharts";
import {
  Plus, MessageSquare, BarChart3, Thermometer, AlertTriangle,
  Check, ChevronRight, Brain, TrendingUp, Users, Zap,
  Star, ThumbsUp, ThumbsDown, Minus,
} from "lucide-react";
import { surveysApi } from "../../api";

const surveys = [
  {
    id: 1,
    title: "Q1 Change Readiness Pulse",
    description: "Assess overall readiness for the digital transformation",
    status: "active",
    responses: 89,
    total: 100,
    avgScore: 6.8,
    created: "Mar 15, 2026",
    closes: "Mar 31, 2026",
    sentiment: "neutral",
  },
  {
    id: 2,
    title: "Finance Team Sentiment Check",
    description: "Targeted check-in for Finance department stakeholders",
    status: "closed",
    responses: 24,
    total: 24,
    avgScore: 4.2,
    created: "Mar 10, 2026",
    closes: "Mar 20, 2026",
    sentiment: "resistant",
  },
  {
    id: 3,
    title: "Post-Demo Feedback Survey",
    description: "Feedback collection after the Q2 product demo session",
    status: "draft",
    responses: 0,
    total: 60,
    avgScore: 0,
    created: "Mar 24, 2026",
    closes: "Apr 5, 2026",
    sentiment: "neutral",
  },
];

const surveyResults = [
  { question: "Leadership Communication", score: 7.8 },
  { question: "Change Clarity", score: 6.2 },
  { question: "Team Support", score: 7.1 },
  { question: "Resource Availability", score: 5.9 },
  { question: "Training Readiness", score: 6.5 },
  { question: "Timeline Feasibility", score: 5.4 },
];

const radarData = [
  { subject: "Communication", A: 78 },
  { subject: "Support", A: 71 },
  { subject: "Resources", A: 59 },
  { subject: "Training", A: 65 },
  { subject: "Timeline", A: 54 },
  { subject: "Clarity", A: 62 },
];

const heatmapData = [
  { dept: "Marketing", week1: "supportive", week2: "supportive", week3: "supportive", week4: "supportive" },
  { dept: "Engineering", week1: "supportive", week2: "supportive", week3: "neutral", week4: "supportive" },
  { dept: "Finance", week1: "neutral", week2: "neutral", week3: "resistant", week4: "resistant" },
  { dept: "Operations", week1: "neutral", week2: "neutral", week3: "neutral", week4: "neutral" },
  { dept: "HR", week1: "supportive", week2: "supportive", week3: "supportive", week4: "supportive" },
  { dept: "IT", week1: "neutral", week2: "resistant", week3: "resistant", week4: "resistant" },
  { dept: "Strategy", week1: "supportive", week2: "supportive", week3: "neutral", week4: "supportive" },
];

const sentimentHeatmap: Record<string, { bg: string; label: string }> = {
  supportive: { bg: "#10B981", label: "S" },
  neutral: { bg: "#F59E0B", label: "N" },
  resistant: { bg: "#EF4444", label: "R" },
};

const alerts = [
  { severity: "critical", dept: "Finance", message: "Finance department sentiment critically low (avg 4.2/10). Immediate executive escalation recommended.", time: "2h ago" },
  { severity: "high", dept: "IT", message: "IT team resistance increasing for 3 consecutive weeks. Root cause: legacy system concerns.", time: "6h ago" },
  { severity: "info", dept: "Marketing", message: "Marketing sentiment remains high. Consider peer-mentoring program to support other departments.", time: "1d ago" },
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "rgba(16,185,129,0.15)", text: "#10B981", label: "Active" },
  closed: { bg: "rgba(100,116,139,0.15)", text: "#64748B", label: "Closed" },
  draft: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "Draft" },
};

const sentimentConfig: Record<string, { bg: string; text: string }> = {
  supportive: { bg: "rgba(16,185,129,0.15)", text: "#10B981" },
  neutral: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B" },
  resistant: { bg: "rgba(239,68,68,0.15)", text: "#EF4444" },
};

type FeedbackTab = "overview" | "surveys" | "heatmap" | "alerts";

export function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<FeedbackTab>("overview");
  const [showNewSurvey, setShowNewSurvey] = useState(false);
  const [surveyList, setSurveyList] = useState(surveys);
  const [alertList, setAlertList] = useState(alerts);
  const [newSurvey, setNewSurvey] = useState({ title: "", description: "", type: "PULSE", closes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    surveysApi.list({ limit: 50 }).then((res) => {
      if (res.data?.length) {
        setSurveyList(res.data.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description || "",
          status: (s.status || "draft").toLowerCase(),
          responses: s._count?.responses || 0,
          total: 100,
          avgScore: 0,
          created: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          closes: s.endsAt ? new Date(s.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
          sentiment: "neutral",
        })));
      }
    }).catch(() => {});
    surveysApi.alerts().then((data: any) => {
      if (Array.isArray(data) && data.length) {
        setAlertList(data.map((a: any) => ({
          severity: a.severity || "info",
          dept: a.department || "General",
          message: a.message || a.title || "Alert",
          time: a.createdAt ? new Date(a.createdAt).toLocaleString() : "",
        })));
      }
    }).catch(() => {});
  }, []);

  const handleCreateSurvey = async () => {
    if (!newSurvey.title) return;
    setSubmitting(true);
    try {
      await surveysApi.create({
        title: newSurvey.title,
        description: newSurvey.description || undefined,
        type: newSurvey.type,
        questions: {},
        endsAt: newSurvey.closes ? new Date(newSurvey.closes).toISOString() : undefined,
      });
    } catch {
      // API unavailable
    }
    setSurveyList((prev) => [{
      id: Date.now(),
      title: newSurvey.title,
      description: newSurvey.description,
      status: "draft",
      responses: 0,
      total: 100,
      avgScore: 0,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      closes: newSurvey.closes ? new Date(newSurvey.closes).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      sentiment: "neutral",
    }, ...prev]);
    setSubmitting(false);
    setShowNewSurvey(false);
    setNewSurvey({ title: "", description: "", type: "PULSE", closes: "" });
  };

  const tabs: { id: FeedbackTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Results Overview", icon: BarChart3 },
    { id: "surveys", label: "Surveys", icon: MessageSquare },
    { id: "heatmap", label: "Sentiment Heatmap", icon: Thermometer },
    { id: "alerts", label: "Alerts", icon: AlertTriangle },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Feedback & Sentiment</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            Real-time pulse across all stakeholder groups
          </p>
        </div>
        <button
          onClick={() => setShowNewSurvey(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Plus size={16} /> New Survey
        </button>
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Avg. Engagement Score", value: "6.8", unit: "/10", color: "#6366F1", icon: TrendingUp },
              { label: "Survey Response Rate", value: "89%", unit: "", color: "#10B981", icon: Users },
              { label: "Open Alerts", value: "3", unit: "", color: "#EF4444", icon: AlertTriangle },
              { label: "Active Surveys", value: "1", unit: "", color: "#F59E0B", icon: MessageSquare },
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: "#64748B" }}>{k.label}</span>
                  <k.icon size={14} style={{ color: k.color }} />
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</span>
                  {k.unit && <span className="text-sm mb-1" style={{ color: "#64748B" }}>{k.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Bar chart results */}
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white mb-1">Q1 Change Readiness Survey</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Average score by question (89 responses)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={surveyResults} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="question" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {surveyResults.map((entry, index) => (
                      <Cell key={index} fill={entry.score >= 7 ? "#10B981" : entry.score >= 6 ? "#F59E0B" : "#EF4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar */}
            <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white mb-1">Change Readiness Radar</h3>
              <p className="text-xs mb-4" style={{ color: "#64748B" }}>Multi-dimensional stakeholder readiness</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1A1A38" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 10 }} />
                  <Radar name="Score" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Analysis */}
          <div
            className="p-5 rounded-xl"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} style={{ color: "#A78BFA" }} />
              <h3 className="text-sm font-semibold" style={{ color: "#A78BFA" }}>AI Sentiment Analysis</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Critical Gap: Timeline Feasibility",
                  desc: "Lowest-scoring category (5.4/10). Stakeholders feel the Q2 deadline is unrealistic. Recommend extending timeline or providing more resources.",
                  color: "#EF4444",
                },
                {
                  title: "Strong Signal: Leadership Communication",
                  desc: "Highest score (7.8/10) indicates executive communication is working. Amplify this through more frequent updates.",
                  color: "#10B981",
                },
                {
                  title: "Watch: Resource Availability",
                  desc: "Resource constraints flagged by 68% of respondents as a concern. Operations and Finance teams most affected.",
                  color: "#F59E0B",
                },
              ].map((insight, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border-l-2"
                  style={{ background: `${insight.color}08`, borderLeftColor: insight.color }}
                >
                  <h4 className="text-xs font-semibold mb-2" style={{ color: insight.color }}>{insight.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{insight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Surveys Tab */}
      {activeTab === "surveys" && (
        <div className="space-y-4">
          {surveyList.map((survey) => {
            const status = statusConfig[survey.status];
            const sent = sentimentConfig[survey.sentiment];
            const progress = (survey.responses / survey.total) * 100;

            return (
              <div
                key={survey.id}
                className="p-5 rounded-xl transition-all hover:border-indigo-900 cursor-pointer"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-white">{survey.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: status.bg, color: status.text }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "#64748B" }}>{survey.description}</p>
                  </div>
                  <button className="p-1.5 rounded-lg" style={{ color: "#64748B" }}>
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>Responses</div>
                    <div className="text-sm font-semibold text-white">{survey.responses}/{survey.total}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>Avg Score</div>
                    <div className="text-sm font-semibold" style={{ color: survey.avgScore >= 7 ? "#10B981" : survey.avgScore >= 5 ? "#F59E0B" : "#EF4444" }}>
                      {survey.avgScore > 0 ? `${survey.avgScore}/10` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>Created</div>
                    <div className="text-sm" style={{ color: "#94A3B8" }}>{survey.created}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>Closes</div>
                    <div className="text-sm" style={{ color: "#94A3B8" }}>{survey.closes}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "#64748B" }}>Response rate</span>
                    <span className="text-xs font-medium text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === "heatmap" && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
          <div className="p-5" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
            <h3 className="text-sm font-semibold text-white mb-1">Department Sentiment Heatmap</h3>
            <p className="text-xs" style={{ color: "#64748B" }}>Weekly sentiment evolution by department</p>
            <div className="flex items-center gap-4 mt-3">
              {[["Supportive", "#10B981"], ["Neutral", "#F59E0B"], ["Resistant", "#EF4444"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#07071A" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B", background: "#0C0C22" }}>Department</th>
                  {["Week 1", "Week 2", "Week 3", "Week 4"].map((w) => (
                    <th key={w} className="px-5 py-3 text-xs font-semibold text-center" style={{ color: "#64748B", background: "#0C0C22" }}>{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, i) => (
                  <tr key={row.dept} style={{ borderBottom: i < heatmapData.length - 1 ? "1px solid #1A1A38" : "none" }}>
                    <td className="px-5 py-4 text-sm font-medium text-white">{row.dept}</td>
                    {([row.week1, row.week2, row.week3, row.week4] as string[]).map((sent, j) => {
                      const config = sentimentHeatmap[sent];
                      return (
                        <td key={j} className="px-5 py-4 text-center">
                          <div
                            className="mx-auto w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ background: `${config.bg}25`, border: `1px solid ${config.bg}40`, color: config.bg }}
                          >
                            {config.label}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-3">
          {alertList.map((alert, i) => {
            const colors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
              critical: { bg: "rgba(239,68,68,0.08)", text: "#EF4444", icon: AlertTriangle },
              high: { bg: "rgba(245,158,11,0.08)", text: "#F59E0B", icon: AlertTriangle },
              info: { bg: "rgba(99,102,241,0.08)", text: "#818CF8", icon: Brain },
            };
            const c = colors[alert.severity];

            return (
              <div
                key={i}
                className="p-4 rounded-xl flex items-start gap-4 border-l-2"
                style={{ background: c.bg, borderLeftColor: c.text, border: `1px solid ${c.text}20`, borderLeft: `2px solid ${c.text}` }}
              >
                <c.icon size={18} style={{ color: c.text }} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: c.text }}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1A1A38", color: "#64748B" }}>
                      {alert.dept}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: "#475569" }}>{alert.time}</span>
                  </div>
                  <p className="text-sm" style={{ color: "#94A3B8" }}>{alert.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                      style={{ background: `linear-gradient(135deg, #6366F1, #8B5CF6)` }}
                      onClick={() => { setActiveTab("surveys"); setShowNewSurvey(true); }}
                    >
                      Take Action
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "#111128", border: "1px solid #1A1A38", color: "#64748B" }}
                      onClick={() => setAlertList((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {alertList.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: "#64748B" }}>No active alerts</div>
          )}
        </div>
      )}

      {/* New Survey Modal */}
      {showNewSurvey && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowNewSurvey(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Create New Survey</h2>
                <button onClick={() => setShowNewSurvey(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Title *</label>
                  <input value={newSurvey.title} onChange={(e) => setNewSurvey(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="Survey title" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Description</label>
                  <textarea rows={2} value={newSurvey.description} onChange={(e) => setNewSurvey(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="What is this survey about?" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Type</label>
                    <select value={newSurvey.type} onChange={(e) => setNewSurvey(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
                      <option value="PULSE">Pulse Check</option>
                      <option value="READINESS">Readiness Assessment</option>
                      <option value="FEEDBACK">Feedback</option>
                      <option value="NPS">NPS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Closes</label>
                    <input type="date" value={newSurvey.closes} onChange={(e) => setNewSurvey(f => ({ ...f, closes: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button disabled={submitting || !newSurvey.title} onClick={handleCreateSurvey} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                    {submitting ? "Creating..." : "Create Survey"}
                  </button>
                  <button onClick={() => setShowNewSurvey(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}