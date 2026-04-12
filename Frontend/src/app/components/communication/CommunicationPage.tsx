import { useState, useEffect, useCallback } from "react";
import React from "react";
import {
  Mail, Phone, Video, Users, MessageSquare, Plus,
  Filter, Search, Clock, Tag, ChevronDown, Paperclip,
  Send, Brain, Star, MoreHorizontal, Calendar, CheckCircle,
  Pin, AtSign, FileText, FolderOpen, BookOpen, ClipboardList,
  Upload, Download, Eye, History,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";
import { communicationsApi } from "../../api";

const channels = ["All", "Email", "Meeting", "Phone", "SMS", "Video Call"];

type LogType = "email" | "meeting" | "phone" | "sms" | "video";

interface CommLog {
  id: number;
  type: LogType;
  stakeholder: string;
  role: string;
  avatar: string;
  subject: string;
  summary: string;
  date: string;
  time: string;
  sentiment: "positive" | "neutral" | "negative";
  tags: string[];
  followUp?: string;
  starred?: boolean;
}

const defaultLogs: CommLog[] = [
  {
    id: 1,
    type: "meeting",
    stakeholder: "Sarah Chen",
    role: "CMO",
    avatar: "SC",
    subject: "Q2 Change Roadmap Alignment",
    summary: "Discussed the upcoming transformation timeline. Sarah expressed strong support for the digital initiative and offered to champion the message to her team. Agreed to co-host a town hall in April.",
    date: "Mar 24, 2026",
    time: "10:00 AM",
    sentiment: "positive",
    tags: ["Roadmap", "Executive Sponsor"],
    followUp: "Send Q2 milestone deck by March 27",
    starred: true,
  },
  {
    id: 2,
    type: "email",
    stakeholder: "Richard Harmon",
    role: "CFO",
    avatar: "RH",
    subject: "Re: Budget Reallocation Proposal",
    summary: "Richard responded with concerns about the proposed $2.4M reallocation. Key objection: ROI timeline is unclear. Requested a detailed financial model showing 3-year projections before next board meeting.",
    date: "Mar 23, 2026",
    time: "3:45 PM",
    sentiment: "negative",
    tags: ["Finance", "Objection", "Budget"],
    followUp: "Prepare 3-year financial model — due March 26",
  },
  {
    id: 3,
    type: "phone",
    stakeholder: "Patricia Wong",
    role: "VP Operations",
    avatar: "PW",
    subject: "Change Readiness Check-in",
    summary: "Patricia seems uncertain about the timeline. Operations team is short-staffed and the Q2 deadline feels aggressive. Suggested a phased rollout approach for her department.",
    date: "Mar 22, 2026",
    time: "2:00 PM",
    sentiment: "neutral",
    tags: ["Operations", "Timeline"],
    followUp: "Explore phased rollout option with PMO",
  },
  {
    id: 4,
    type: "video",
    stakeholder: "Marcus Johnson",
    role: "VP Engineering",
    avatar: "MJ",
    subject: "Technical Architecture Review",
    summary: "Marcus reviewed the integration architecture. Tech team is on board. Identified 2 potential API conflicts with legacy systems — team will submit technical feasibility report by end of week.",
    date: "Mar 21, 2026",
    time: "11:30 AM",
    sentiment: "positive",
    tags: ["Technical", "Architecture"],
    followUp: "Review technical feasibility report",
    starred: true,
  },
  {
    id: 5,
    type: "email",
    stakeholder: "David Klein",
    role: "Head of IT",
    avatar: "DK",
    subject: "Security Review Concerns",
    summary: "David flagged concerns about data security compliance in the proposed platform migration. Citing GDPR requirements and internal IT governance policies as potential blockers.",
    date: "Mar 20, 2026",
    time: "9:15 AM",
    sentiment: "negative",
    tags: ["Security", "Compliance", "IT"],
    followUp: "Engage CISO team for security review",
  },
  {
    id: 6,
    type: "meeting",
    stakeholder: "Amanda Foster",
    role: "HR Director",
    avatar: "AF",
    subject: "Training Program Design Session",
    summary: "Productive session designing the stakeholder training curriculum. Amanda committed 40% of HR team bandwidth for Q2. Draft training calendar shared — finalizing by next week.",
    date: "Mar 19, 2026",
    time: "2:00 PM",
    sentiment: "positive",
    tags: ["Training", "HR"],
  },
];

const channelActivity = [
  { week: "W1", email: 12, meeting: 8, phone: 5, video: 3 },
  { week: "W2", email: 18, meeting: 10, phone: 7, video: 6 },
  { week: "W3", email: 14, meeting: 12, phone: 4, video: 8 },
  { week: "W4", email: 22, meeting: 9, phone: 6, video: 5 },
];

const iconMap: Record<LogType, { icon: React.ElementType; color: string; label: string }> = {
  email: { icon: Mail, color: "#6366F1", label: "Email" },
  meeting: { icon: Users, color: "#8B5CF6", label: "Meeting" },
  phone: { icon: Phone, color: "#06B6D4", label: "Phone" },
  sms: { icon: MessageSquare, color: "#F59E0B", label: "SMS" },
  video: { icon: Video, color: "#10B981", label: "Video Call" },
};

const sentimentColors: Record<string, { bg: string; text: string; dot: string }> = {
  positive: { bg: "rgba(16,185,129,0.15)", text: "#10B981", dot: "#10B981" },
  neutral: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", dot: "#F59E0B" },
  negative: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", dot: "#EF4444" },
};

export function CommunicationPage() {
  const [activeChannel, setActiveChannel] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [logs, setLogs] = useState(defaultLogs);
  const navigate = useNavigate();

  const [newLog, setNewLog] = useState({ stakeholder: defaultLogs[0]?.stakeholder ?? "", channel: "email" as LogType, subject: "", summary: "", sentiment: "neutral" as "positive" | "neutral" | "negative", date: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    communicationsApi.list({ limit: 50 }).then((res) => {
      if (res.data?.length) {
        setLogs(res.data.map((c: any, i: number) => ({
          id: i + 1000,
          type: (c.channel || "email").toLowerCase() as LogType,
          stakeholder: c.stakeholders?.[0]?.firstName ? `${c.stakeholders[0].firstName} ${c.stakeholders[0].lastName}` : "Unknown",
          role: c.stakeholders?.[0]?.jobTitle || "—",
          avatar: "??",
          subject: c.subject || "(no subject)",
          summary: c.body || "",
          date: c.occurredAt ? new Date(c.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
          time: c.occurredAt ? new Date(c.occurredAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "",
          sentiment: (c.sentiment || "neutral").toLowerCase().replace("supportive", "positive").replace("resistant", "negative") as "positive" | "neutral" | "negative",
          tags: [],
        })));
      }
    }).catch(() => {});
  }, []);

  const handleLogSubmit = async () => {
    if (!newLog.subject && !newLog.summary) return;
    setSubmitting(true);
    try {
      await communicationsApi.create({
        channel: newLog.channel.toUpperCase(),
        subject: newLog.subject,
        body: newLog.summary,
        sentiment: newLog.sentiment.toUpperCase(),
        occurredAt: newLog.date ? new Date(newLog.date).toISOString() : undefined,
        stakeholderIds: [],
      });
    } catch {
      // API unavailable — add locally
    }
    setLogs((prev) => [{
      id: Date.now(),
      type: newLog.channel,
      stakeholder: newLog.stakeholder,
      role: "—",
      avatar: newLog.stakeholder.split(" ").map(w => w[0]).join(""),
      subject: newLog.subject,
      summary: newLog.summary,
      date: newLog.date ? new Date(newLog.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      sentiment: newLog.sentiment,
      tags: [],
    }, ...prev]);
    setSubmitting(false);
    setShowAddModal(false);
    setNewLog({ stakeholder: defaultLogs[0]?.stakeholder ?? "", channel: "email", subject: "", summary: "", sentiment: "neutral", date: "" });
  };

  const filtered = logs.filter((l) => {
    const matchChannel = activeChannel === "All" || iconMap[l.type].label === activeChannel;
    const matchSearch =
      l.stakeholder.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase());
    return matchChannel && matchSearch;
  });

  const totalInteractions = logs.length;
  const positiveCount = logs.filter((l) => l.sentiment === "positive").length;
  const followUpCount = logs.filter((l) => l.followUp).length;

  type HubTab = "timeline" | "discussions" | "wiki" | "files" | "meetings";
  const [hubTab, setHubTab] = useState<HubTab>("timeline");

  // ──── Discussion Module state ────
  const [discussions, setDiscussions] = useState([
    { id: 1, author: "Sarah Chen", avatar: "SC", text: "The Q2 roadmap alignment meeting went well. @Marcus Johnson, can you share the technical feasibility report?", time: "2h ago", pinned: true, replies: [
      { author: "Marcus Johnson", avatar: "MJ", text: "Report shared in the file manager. Key finding: 2 API conflicts with legacy systems. @David Klein is reviewing.", time: "1h ago" },
      { author: "David Klein", avatar: "DK", text: "Reviewing now. Will have feedback by end of day.", time: "45m ago" },
    ]},
    { id: 2, author: "Amanda Foster", avatar: "AF", text: "Training curriculum draft is ready for review. Targeting 40% HR bandwidth for Q2.", time: "4h ago", pinned: false, replies: [
      { author: "James Park", avatar: "JP", text: "Looks good! Suggest adding a section on stakeholder communication best practices.", time: "3h ago" },
    ]},
    { id: 3, author: "Richard Harmon", avatar: "RH", text: "Budget reallocation needs a detailed 3-year ROI projection before I can approve. Timeline feels aggressive.", time: "1d ago", pinned: false, replies: [] },
  ]);
  const [newDiscussionText, setNewDiscussionText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  // ──── Wiki state ────
  const [wikiDocs] = useState([
    { id: 1, title: "Account Playbook: Enterprise Onboarding", content: "# Enterprise Onboarding Playbook\n\n## Overview\nThis playbook covers the standard process for onboarding enterprise accounts with 500+ stakeholders.\n\n## Steps\n1. **Initial Assessment** — Map all key stakeholders within first 2 weeks\n2. **Engagement Plan** — Create personalized engagement plans for top 20% influencers\n3. **Communication Cadence** — Weekly updates to sponsors, bi-weekly to broader team\n4. **Risk Monitoring** — Daily sentiment analysis via AI dashboard\n\n## Key Metrics\n- Stakeholder identification rate: >95% within 30 days\n- Engagement score target: >75/100\n- Response rate to communications: >80%", updated: "Mar 22, 2026", author: "Sarah Chen" },
    { id: 2, title: "Project Standards & Guidelines", content: "# Project Standards\n\n## Communication Standards\n- All meetings must have a documented MOM within 24 hours\n- Follow-up tasks auto-generated from meeting notes\n- Stakeholder sentiment reviewed weekly\n\n## Documentation\n- Use markdown for all project documentation\n- Version control all project assets\n- Keep decision logs updated", updated: "Mar 20, 2026", author: "James Park" },
    { id: 3, title: "Stakeholder Engagement Framework", content: "# Engagement Framework\n\n## Sentiment Categories\n- **Supportive** — Active champions; leverage for peer influence\n- **Neutral** — Need targeted engagement; share success stories\n- **Resistant** — Require 1:1 attention; address specific concerns\n\n## Engagement Tactics by Quadrant\n| Power / Interest | High Interest | Low Interest |\n|---|---|---|\n| **High Power** | Manage Closely | Keep Satisfied |\n| **Low Power** | Keep Informed | Monitor |", updated: "Mar 18, 2026", author: "Amanda Foster" },
  ]);
  const [selectedDoc, setSelectedDoc] = useState<typeof wikiDocs[0] | null>(null);

  // ──── File Manager state ────
  const [files] = useState([
    { id: 1, name: "Q2-Roadmap-v3.pdf", type: "pdf", size: "2.4 MB", uploaded: "Mar 24, 2026", author: "Sarah Chen", versions: 3 },
    { id: 2, name: "Technical-Architecture.pptx", type: "pptx", size: "8.1 MB", uploaded: "Mar 21, 2026", author: "Marcus Johnson", versions: 5 },
    { id: 3, name: "Budget-Reallocation.xlsx", type: "xlsx", size: "1.2 MB", uploaded: "Mar 23, 2026", author: "Richard Harmon", versions: 2 },
    { id: 4, name: "Training-Curriculum-Draft.docx", type: "docx", size: "3.7 MB", uploaded: "Mar 22, 2026", author: "Amanda Foster", versions: 4 },
    { id: 5, name: "Stakeholder-Map.png", type: "png", size: "680 KB", uploaded: "Mar 20, 2026", author: "James Park", versions: 1 },
    { id: 6, name: "Security-Audit-Report.pdf", type: "pdf", size: "4.5 MB", uploaded: "Mar 19, 2026", author: "David Klein", versions: 2 },
  ]);
  const fileTypeColors: Record<string, string> = { pdf: "#EF4444", pptx: "#F59E0B", xlsx: "#10B981", docx: "#6366F1", png: "#8B5CF6" };

  // ──── Meeting Logger state ────
  const [showMomModal, setShowMomModal] = useState(false);
  const [momForm, setMomForm] = useState({ title: "", date: "", attendees: "", agenda: "", decisions: "", actionItems: "" });

  const hubTabs: { id: HubTab; label: string; icon: React.ElementType }[] = [
    { id: "timeline", label: "Interaction Log", icon: Clock },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "wiki", label: "Wiki / Playbooks", icon: BookOpen },
    { id: "files", label: "File Manager", icon: FolderOpen },
    { id: "meetings", label: "Meeting Logger", icon: ClipboardList },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Communication Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            All stakeholder interactions in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMomModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#94A3B8" }}
          >
            <ClipboardList size={16} /> Log Meeting
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <Plus size={16} /> Log Interaction
          </button>
        </div>
      </div>

      {/* Hub Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
        {hubTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setHubTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: hubTab === tab.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: hubTab === tab.id ? "#818CF8" : "#64748B",
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TIMELINE TAB ─── */}
      {hubTab === "timeline" && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Interactions", value: totalInteractions, sub: "this month", color: "#6366F1" },
              { label: "Positive Outcomes", value: positiveCount, sub: `${Math.round((positiveCount/totalInteractions)*100)}% of total`, color: "#10B981" },
              { label: "Open Follow-ups", value: followUpCount, sub: "require action", color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="text-xs mb-2" style={{ color: "#64748B" }}>{s.label}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: "#475569" }}>{s.sub}</div>
              </div>
            ))}
          </div>

      {/* Channel activity chart + timeline */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Channel chart */}
        <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <h3 className="text-sm font-semibold text-white mb-1">Channel Activity</h3>
          <p className="text-xs mb-4" style={{ color: "#64748B" }}>Weekly breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={channelActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
              <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="email" name="Email" fill="#6366F1" radius={[2, 2, 0, 0]} stackId="a" />
              <Bar dataKey="meeting" name="Meeting" fill="#8B5CF6" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="phone" name="Phone" fill="#06B6D4" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="video" name="Video" fill="#10B981" radius={[2, 2, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {[["Email", "#6366F1"], ["Meeting", "#8B5CF6"], ["Phone", "#06B6D4"], ["Video", "#10B981"]].map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                <span className="text-xs" style={{ color: "#64748B" }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline - 2/3 */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
          {/* Filter bar */}
          <div className="p-4 flex items-center gap-3" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interactions..."
                className="w-full pl-8 pr-4 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
              />
            </div>
            <div className="flex gap-1">
              {channels.map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeChannel === ch ? "rgba(99,102,241,0.2)" : "transparent",
                    color: activeChannel === ch ? "#818CF8" : "#64748B",
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="overflow-y-auto" style={{ maxHeight: "360px", background: "#07071A" }}>
            {filtered.map((log, i) => {
              const ch = iconMap[log.type];
              const sent = sentimentColors[log.sentiment];
              const isExpanded = expandedId === log.id;

              return (
                <div
                  key={log.id}
                  className="relative"
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1A1A38" : "none" }}
                >
                  {/* Timeline line */}
                  {i < filtered.length - 1 && (
                    <div
                      className="absolute left-8 top-14 w-px"
                      style={{ height: "calc(100% - 48px)", background: "#1A1A38" }}
                    />
                  )}

                  <div
                    className="p-4 cursor-pointer transition-colors hover:bg-[#0C0C22]"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Channel icon */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 z-10"
                        style={{ background: `${ch.color}20`, border: `1px solid ${ch.color}30` }}
                      >
                        <ch.icon size={15} style={{ color: ch.color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{log.stakeholder}</span>
                              <span className="text-xs" style={{ color: "#475569" }}>{log.role}</span>
                              {log.starred && <Star size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} />}
                            </div>
                            <p className="text-sm mt-0.5" style={{ color: "#94A3B8" }}>{log.subject}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs" style={{ color: "#475569" }}>{log.date}</div>
                            <div className="text-xs" style={{ color: "#475569" }}>{log.time}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                            style={{ background: sent.bg, color: sent.text }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sent.dot }} />
                            {log.sentiment.charAt(0).toUpperCase() + log.sentiment.slice(1)}
                          </span>
                          {log.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1A1A38", color: "#64748B" }}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3">
                            <div className="p-3 rounded-lg text-sm" style={{ background: "#111128" }}>
                              <p style={{ color: "#94A3B8", lineHeight: 1.6 }}>{log.summary}</p>
                            </div>
                            {log.followUp && (
                              <div
                                className="flex items-start gap-2 p-3 rounded-lg"
                                style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
                              >
                                <CheckCircle size={13} style={{ color: "#F59E0B" }} className="mt-0.5" />
                                <div>
                                  <div className="text-xs font-semibold mb-0.5" style={{ color: "#F59E0B" }}>Follow-up Required</div>
                                  <p className="text-xs" style={{ color: "#94A3B8" }}>{log.followUp}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button onClick={(e) => { e.stopPropagation(); window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Follow-up+with+${encodeURIComponent(log.stakeholder)}&details=${encodeURIComponent(log.followUp || '')}`, '_blank'); }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                                Schedule Follow-up
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); navigate("/app/stakeholders"); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>
                                View Stakeholder Profile
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}

      {/* ─── DISCUSSIONS TAB ─── */}
      {hubTab === "discussions" && (
        <div className="space-y-4">
          {/* New discussion input */}
          <div className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>JD</div>
              <div className="flex-1">
                <textarea
                  value={newDiscussionText}
                  onChange={(e) => setNewDiscussionText(e.target.value)}
                  placeholder="Start a discussion… Use @name to mention team members"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: "#64748B" }}><AtSign size={12} /> Mention</button>
                    <button className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: "#64748B" }}><Paperclip size={12} /> Attach</button>
                  </div>
                  <button
                    onClick={() => {
                      if (!newDiscussionText.trim()) return;
                      setDiscussions(prev => [{ id: Date.now(), author: "John Doe", avatar: "JD", text: newDiscussionText, time: "Just now", pinned: false, replies: [] }, ...prev]);
                      setNewDiscussionText("");
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    <Send size={12} /> Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Discussion threads */}
          {discussions.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((d) => (
            <div key={d.id} className="rounded-xl overflow-hidden" style={{ background: "#0C0C22", border: d.pinned ? "1px solid rgba(99,102,241,0.4)" : "1px solid #1A1A38" }}>
              {d.pinned && (
                <div className="flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                  <Pin size={10} /> Pinned
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}>{d.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{d.author}</span>
                      <span className="text-xs" style={{ color: "#475569" }}>{d.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{d.text.split(/(@\w+ \w+)/g).map((part, i) => part.startsWith("@") ? <span key={i} style={{ color: "#818CF8", fontWeight: 500 }}>{part}</span> : part)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => { setReplyingTo(replyingTo === d.id ? null : d.id); setReplyText(""); }}
                        className="text-xs flex items-center gap-1"
                        style={{ color: "#64748B" }}
                      >
                        <MessageSquare size={11} /> Reply ({d.replies.length})
                      </button>
                      <button
                        onClick={() => setDiscussions(prev => prev.map(x => x.id === d.id ? { ...x, pinned: !x.pinned } : x))}
                        className="text-xs flex items-center gap-1"
                        style={{ color: d.pinned ? "#818CF8" : "#64748B" }}
                      >
                        <Pin size={11} /> {d.pinned ? "Unpin" : "Pin"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {d.replies.length > 0 && (
                  <div className="ml-11 mt-3 space-y-3 pl-3" style={{ borderLeft: "2px solid #1A1A38" }}>
                    {d.replies.map((r, ri) => (
                      <div key={ri} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}>{r.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{r.author}</span>
                            <span className="text-[10px]" style={{ color: "#475569" }}>{r.time}</span>
                          </div>
                          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#94A3B8" }}>{r.text.split(/(@\w+ \w+)/g).map((part, i) => part.startsWith("@") ? <span key={i} style={{ color: "#818CF8", fontWeight: 500 }}>{part}</span> : part)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === d.id && (
                  <div className="ml-11 mt-3 flex items-center gap-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply…"
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && replyText.trim()) {
                          setDiscussions(prev => prev.map(x => x.id === d.id ? { ...x, replies: [...x.replies, { author: "John Doe", avatar: "JD", text: replyText, time: "Just now" }] } : x));
                          setReplyText("");
                          setReplyingTo(null);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!replyText.trim()) return;
                        setDiscussions(prev => prev.map(x => x.id === d.id ? { ...x, replies: [...x.replies, { author: "John Doe", avatar: "JD", text: replyText, time: "Just now" }] } : x));
                        setReplyText("");
                        setReplyingTo(null);
                      }}
                      className="p-1.5 rounded-lg"
                      style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                    >
                      <Send size={12} className="text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── WIKI TAB ─── */}
      {hubTab === "wiki" && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Doc list */}
          <div className="space-y-3">
            {wikiDocs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="w-full text-left p-4 rounded-xl transition-all hover:border-[#2D2D52]"
                style={{
                  background: selectedDoc?.id === doc.id ? "rgba(99,102,241,0.1)" : "#0C0C22",
                  border: selectedDoc?.id === doc.id ? "1px solid rgba(99,102,241,0.4)" : "1px solid #1A1A38",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={13} style={{ color: "#818CF8" }} />
                  <span className="text-sm font-medium text-white">{doc.title}</span>
                </div>
                <div className="text-xs" style={{ color: "#64748B" }}>Updated {doc.updated} · by {doc.author}</div>
              </button>
            ))}
          </div>

          {/* Doc viewer */}
          <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            {selectedDoc ? (
              <div>
                <h2 className="text-base font-bold text-white mb-1">{selectedDoc.title}</h2>
                <p className="text-xs mb-4" style={{ color: "#64748B" }}>Last updated {selectedDoc.updated} by {selectedDoc.author}</p>
                <div className="prose prose-sm prose-invert max-w-none" style={{ color: "#94A3B8" }}>
                  {selectedDoc.content.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) return <h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
                    if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold text-white mt-3 mb-1.5">{line.slice(3)}</h2>;
                    if (line.startsWith("- **")) return <li key={i} className="text-xs leading-relaxed ml-4">{line.slice(2)}</li>;
                    if (line.startsWith("- ")) return <li key={i} className="text-xs leading-relaxed ml-4" style={{ color: "#94A3B8" }}>{line.slice(2)}</li>;
                    if (line.startsWith("|")) return <pre key={i} className="text-xs" style={{ color: "#64748B" }}>{line}</pre>;
                    if (line.match(/^\d+\./)) return <li key={i} className="text-xs leading-relaxed ml-4 list-decimal" style={{ color: "#94A3B8" }}>{line.replace(/^\d+\.\s*/, "")}</li>;
                    if (line.trim() === "") return <br key={i} />;
                    return <p key={i} className="text-xs leading-relaxed">{line}</p>;
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#475569" }}>
                Select a document to view
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FILE MANAGER TAB ─── */}
      {hubTab === "files" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium">{files.length} project assets</span>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>
              <Upload size={13} /> Upload File
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="p-4 rounded-xl transition-all hover:border-[#2D2D52]" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${fileTypeColors[file.type] || "#6366F1"}15` }}>
                    <FileText size={18} style={{ color: fileTypeColors[file.type] || "#6366F1" }} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#64748B" }} title="View"><Eye size={13} /></button>
                    <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "#64748B" }} title="Download"><Download size={13} /></button>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-white truncate mb-1">{file.name}</h4>
                <div className="flex items-center gap-2 text-xs" style={{ color: "#64748B" }}>
                  <span>{file.size}</span>
                  <span>·</span>
                  <span>{file.uploaded}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: "#475569" }}>by {file.author}</span>
                  <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                    <History size={9} /> v{file.versions}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MEETING LOGGER TAB ─── */}
      {hubTab === "meetings" && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl p-6" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <h2 className="text-base font-bold text-white mb-1">Minutes of Meeting (MOM)</h2>
            <p className="text-xs mb-5" style={{ color: "#64748B" }}>Capture meeting notes and auto-generate follow-up tasks in the Projects Hub.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Meeting Title *</label>
                <input value={momForm.title} onChange={(e) => setMomForm(f => ({ ...f, title: e.target.value }))} placeholder="Q2 Roadmap Alignment" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Date *</label>
                  <input type="date" value={momForm.date} onChange={(e) => setMomForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Attendees</label>
                  <input value={momForm.attendees} onChange={(e) => setMomForm(f => ({ ...f, attendees: e.target.value }))} placeholder="Sarah Chen, Marcus Johnson…" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Agenda / Topics Discussed</label>
                <textarea rows={3} value={momForm.agenda} onChange={(e) => setMomForm(f => ({ ...f, agenda: e.target.value }))} placeholder="What was covered in the meeting?" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Key Decisions</label>
                <textarea rows={2} value={momForm.decisions} onChange={(e) => setMomForm(f => ({ ...f, decisions: e.target.value }))} placeholder="What was decided?" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Action Items (auto-creates tasks in Projects Hub)</label>
                <textarea rows={3} value={momForm.actionItems} onChange={(e) => setMomForm(f => ({ ...f, actionItems: e.target.value }))} placeholder={"- @Sarah Chen: Send Q2 milestone deck by March 27\n- @Marcus Johnson: Review API conflicts"} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  disabled={!momForm.title}
                  onClick={() => {
                    setMomForm({ title: "", date: "", attendees: "", agenda: "", decisions: "", actionItems: "" });
                  }}
                >
                  Save MOM & Generate Tasks
                </button>
                <button
                  className="py-2.5 px-4 rounded-lg text-sm font-medium"
                  style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                  onClick={() => setMomForm({ title: "", date: "", attendees: "", agenda: "", decisions: "", actionItems: "" })}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Interaction Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowAddModal(false)}
          />
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-lg rounded-2xl p-6"
              style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Log New Interaction</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Stakeholder</label>
                  <select value={newLog.stakeholder} onChange={(e) => setNewLog(f => ({ ...f, stakeholder: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
                    {defaultLogs.map((l) => <option key={l.id}>{l.stakeholder}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Channel</label>
                  <div className="grid grid-cols-5 gap-2">
                    {(["email", "meeting", "phone", "sms", "video"] as LogType[]).map((type) => {
                      const ch = iconMap[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setNewLog(f => ({ ...f, channel: type }))}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-lg text-xs"
                          style={{ background: newLog.channel === type ? `${ch.color}20` : "#111128", border: newLog.channel === type ? `1px solid ${ch.color}50` : "1px solid #1A1A38", color: newLog.channel === type ? ch.color : "#64748B" }}
                        >
                          <ch.icon size={16} style={{ color: ch.color }} />
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Subject</label>
                  <input
                    type="text"
                    value={newLog.subject}
                    onChange={(e) => setNewLog(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Meeting subject or email title..."
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Summary</label>
                  <textarea
                    rows={3}
                    value={newLog.summary}
                    onChange={(e) => setNewLog(f => ({ ...f, summary: e.target.value }))}
                    placeholder="What was discussed? What were the outcomes?"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Sentiment</label>
                    <select value={newLog.sentiment} onChange={(e) => setNewLog(f => ({ ...f, sentiment: e.target.value as any }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Date</label>
                    <input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                      style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                    disabled={submitting || (!newLog.subject && !newLog.summary)}
                    onClick={handleLogSubmit}
                  >
                    {submitting ? "Logging..." : "Log Interaction"}
                  </button>
                  <button
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}