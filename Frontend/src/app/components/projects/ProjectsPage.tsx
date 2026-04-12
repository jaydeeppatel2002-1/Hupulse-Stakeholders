import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import {
  FolderKanban, Search, Filter, Plus, ChevronDown, ChevronRight,
  MoreHorizontal, Clock, Target, CheckCircle2, AlertTriangle,
  Users, Calendar, GripVertical, ArrowUpRight, ArrowDownRight,
  X, Layers, BarChart3, User,
} from "lucide-react";

/* ────────────────────────── sample data ────────────────────────── */

interface Task {
  id: number;
  title: string;
  status: "todo" | "doing" | "done";
  assignee: string;
  avatar: string;
  priority: "low" | "medium" | "high";
  dueDate: string;
}

interface Milestone {
  id: number;
  label: string;
  start: number; // day offset
  duration: number; // days
  color: string;
  progress: number; // 0-100
  owner: string;
  description: string;
}

interface TeamMember {
  name: string;
  avatar: string;
  role: string;
  utilization: number;
  tasks: number;
}

interface Project {
  id: number;
  name: string;
  status: "on-track" | "at-risk" | "completed" | "delayed";
  owner: string;
  ownerAvatar: string;
  progress: number;
  dueDate: string;
  tasks: Task[];
  milestones: Milestone[];
  team: TeamMember[];
  description: string;
}

const defaultProjects: Project[] = [
  {
    id: 1,
    name: "Digital Transformation Initiative",
    status: "on-track",
    owner: "Sarah Chen",
    ownerAvatar: "SC",
    progress: 68,
    dueDate: "Jun 30, 2026",
    description: "Enterprise-wide digital transformation covering all core business processes.",
    tasks: [
      { id: 101, title: "Stakeholder mapping complete", status: "done", assignee: "Sarah Chen", avatar: "SC", priority: "high", dueDate: "Mar 15" },
      { id: 102, title: "Integration architecture review", status: "done", assignee: "Marcus Johnson", avatar: "MJ", priority: "high", dueDate: "Mar 20" },
      { id: 103, title: "Security compliance audit", status: "doing", assignee: "David Klein", avatar: "DK", priority: "high", dueDate: "Apr 5" },
      { id: 104, title: "Training curriculum design", status: "doing", assignee: "Amanda Foster", avatar: "AF", priority: "medium", dueDate: "Apr 10" },
      { id: 105, title: "Q2 milestone deck preparation", status: "todo", assignee: "James Park", avatar: "JP", priority: "medium", dueDate: "Apr 15" },
      { id: 106, title: "Budget reallocation proposal", status: "todo", assignee: "Richard Harmon", avatar: "RH", priority: "high", dueDate: "Apr 20" },
      { id: 107, title: "Phased rollout plan for Operations", status: "todo", assignee: "Patricia Wong", avatar: "PW", priority: "medium", dueDate: "Apr 25" },
    ],
    milestones: [
      { id: 1, label: "Discovery & Planning", start: 0, duration: 30, color: "#6366F1", progress: 100, owner: "Sarah Chen", description: "Initial assessment & stakeholder mapping" },
      { id: 2, label: "Architecture Design", start: 25, duration: 35, color: "#8B5CF6", progress: 100, owner: "Marcus Johnson", description: "Technical architecture & integration design" },
      { id: 3, label: "Security & Compliance", start: 55, duration: 25, color: "#EF4444", progress: 40, owner: "David Klein", description: "Security audit & GDPR compliance review" },
      { id: 4, label: "Training Program", start: 60, duration: 40, color: "#10B981", progress: 25, owner: "Amanda Foster", description: "Training curriculum & delivery schedule" },
      { id: 5, label: "Phase 1 Rollout", start: 90, duration: 30, color: "#06B6D4", progress: 0, owner: "Patricia Wong", description: "Operations department rollout" },
      { id: 6, label: "Phase 2 Rollout", start: 115, duration: 35, color: "#F59E0B", progress: 0, owner: "James Park", description: "Company-wide deployment" },
    ],
    team: [
      { name: "Sarah Chen", avatar: "SC", role: "Project Sponsor", utilization: 85, tasks: 4 },
      { name: "Marcus Johnson", avatar: "MJ", role: "Tech Lead", utilization: 92, tasks: 6 },
      { name: "David Klein", avatar: "DK", role: "Security Lead", utilization: 78, tasks: 3 },
      { name: "Amanda Foster", avatar: "AF", role: "Training Lead", utilization: 65, tasks: 5 },
      { name: "James Park", avatar: "JP", role: "Strategy Lead", utilization: 55, tasks: 3 },
      { name: "Patricia Wong", avatar: "PW", role: "Ops Lead", utilization: 40, tasks: 2 },
    ],
  },
  {
    id: 2,
    name: "CRM Platform Migration",
    status: "at-risk",
    owner: "Marcus Johnson",
    ownerAvatar: "MJ",
    progress: 42,
    dueDate: "Aug 15, 2026",
    description: "Migration from legacy CRM to modern cloud-based platform.",
    tasks: [
      { id: 201, title: "Data migration strategy", status: "done", assignee: "Marcus Johnson", avatar: "MJ", priority: "high", dueDate: "Mar 10" },
      { id: 202, title: "Vendor evaluation complete", status: "done", assignee: "James Park", avatar: "JP", priority: "high", dueDate: "Mar 20" },
      { id: 203, title: "API integration mapping", status: "doing", assignee: "David Klein", avatar: "DK", priority: "high", dueDate: "Apr 1" },
      { id: 204, title: "User acceptance testing plan", status: "todo", assignee: "Amanda Foster", avatar: "AF", priority: "medium", dueDate: "Apr 20" },
      { id: 205, title: "Go-live checklist", status: "todo", assignee: "Sarah Chen", avatar: "SC", priority: "low", dueDate: "May 1" },
    ],
    milestones: [
      { id: 1, label: "Assessment", start: 0, duration: 20, color: "#6366F1", progress: 100, owner: "Marcus Johnson", description: "Current system assessment" },
      { id: 2, label: "Vendor Selection", start: 15, duration: 25, color: "#8B5CF6", progress: 100, owner: "James Park", description: "RFP & vendor evaluation" },
      { id: 3, label: "Data Migration", start: 35, duration: 40, color: "#F59E0B", progress: 30, owner: "David Klein", description: "Data cleansing & migration" },
      { id: 4, label: "UAT & Training", start: 70, duration: 30, color: "#10B981", progress: 0, owner: "Amanda Foster", description: "User testing & training" },
      { id: 5, label: "Go-Live", start: 95, duration: 15, color: "#EF4444", progress: 0, owner: "Sarah Chen", description: "Production deployment" },
    ],
    team: [
      { name: "Marcus Johnson", avatar: "MJ", role: "Project Lead", utilization: 95, tasks: 5 },
      { name: "David Klein", avatar: "DK", role: "Data Architect", utilization: 88, tasks: 4 },
      { name: "James Park", avatar: "JP", role: "Business Analyst", utilization: 60, tasks: 3 },
      { name: "Amanda Foster", avatar: "AF", role: "Change Manager", utilization: 45, tasks: 2 },
    ],
  },
  {
    id: 3,
    name: "Employee Engagement Program",
    status: "completed",
    owner: "Amanda Foster",
    ownerAvatar: "AF",
    progress: 100,
    dueDate: "Mar 1, 2026",
    description: "Company-wide employee engagement and retention improvement program.",
    tasks: [
      { id: 301, title: "Engagement survey deployed", status: "done", assignee: "Amanda Foster", avatar: "AF", priority: "high", dueDate: "Jan 15" },
      { id: 302, title: "Results analysis complete", status: "done", assignee: "James Park", avatar: "JP", priority: "high", dueDate: "Feb 1" },
      { id: 303, title: "Action plan approved", status: "done", assignee: "Sarah Chen", avatar: "SC", priority: "medium", dueDate: "Feb 15" },
      { id: 304, title: "Initiatives launched", status: "done", assignee: "Amanda Foster", avatar: "AF", priority: "medium", dueDate: "Mar 1" },
    ],
    milestones: [
      { id: 1, label: "Survey Phase", start: 0, duration: 15, color: "#6366F1", progress: 100, owner: "Amanda Foster", description: "Deploy & collect survey" },
      { id: 2, label: "Analysis", start: 12, duration: 18, color: "#8B5CF6", progress: 100, owner: "James Park", description: "Data analysis & insights" },
      { id: 3, label: "Planning", start: 28, duration: 15, color: "#10B981", progress: 100, owner: "Sarah Chen", description: "Action plan development" },
      { id: 4, label: "Launch", start: 40, duration: 20, color: "#06B6D4", progress: 100, owner: "Amanda Foster", description: "Initiative rollout" },
    ],
    team: [
      { name: "Amanda Foster", avatar: "AF", role: "Program Lead", utilization: 30, tasks: 2 },
      { name: "James Park", avatar: "JP", role: "Analyst", utilization: 20, tasks: 1 },
      { name: "Sarah Chen", avatar: "SC", role: "Sponsor", utilization: 15, tasks: 1 },
    ],
  },
  {
    id: 4,
    name: "Finance Process Automation",
    status: "delayed",
    owner: "Richard Harmon",
    ownerAvatar: "RH",
    progress: 25,
    dueDate: "Sep 30, 2026",
    description: "Automating finance workflows including invoicing, AP/AR, and reporting.",
    tasks: [
      { id: 401, title: "Process mapping workshop", status: "done", assignee: "Richard Harmon", avatar: "RH", priority: "high", dueDate: "Feb 20" },
      { id: 402, title: "RPA tool evaluation", status: "doing", assignee: "David Klein", avatar: "DK", priority: "high", dueDate: "Apr 10" },
      { id: 403, title: "Pilot automation flows", status: "todo", assignee: "Marcus Johnson", avatar: "MJ", priority: "medium", dueDate: "May 15" },
      { id: 404, title: "Change management plan", status: "todo", assignee: "Amanda Foster", avatar: "AF", priority: "medium", dueDate: "May 30" },
      { id: 405, title: "Full deployment", status: "todo", assignee: "Richard Harmon", avatar: "RH", priority: "high", dueDate: "Sep 15" },
    ],
    milestones: [
      { id: 1, label: "Discovery", start: 0, duration: 25, color: "#6366F1", progress: 100, owner: "Richard Harmon", description: "Process mapping & requirements" },
      { id: 2, label: "Tool Selection", start: 20, duration: 30, color: "#F59E0B", progress: 40, owner: "David Klein", description: "RPA tool evaluation & selection" },
      { id: 3, label: "Pilot Phase", start: 50, duration: 40, color: "#8B5CF6", progress: 0, owner: "Marcus Johnson", description: "Build & test pilot automations" },
      { id: 4, label: "Rollout", start: 85, duration: 35, color: "#10B981", progress: 0, owner: "Richard Harmon", description: "Enterprise rollout" },
    ],
    team: [
      { name: "Richard Harmon", avatar: "RH", role: "Project Owner", utilization: 50, tasks: 3 },
      { name: "David Klein", avatar: "DK", role: "Tech Lead", utilization: 70, tasks: 2 },
      { name: "Marcus Johnson", avatar: "MJ", role: "Automation Eng", utilization: 35, tasks: 2 },
    ],
  },
];

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  "on-track": { bg: "rgba(16,185,129,0.15)", text: "#10B981", label: "On Track", dot: "#10B981" },
  "at-risk": { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "At Risk", dot: "#F59E0B" },
  completed: { bg: "rgba(99,102,241,0.15)", text: "#818CF8", label: "Completed", dot: "#818CF8" },
  delayed: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", label: "Delayed", dot: "#EF4444" },
};

const priorityColors: Record<string, string> = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
};

/* ────────────────────────── Gantt Chart ────────────────────────── */

function GanttChart({ milestones }: { milestones: Milestone[] }) {
  const totalDays = Math.max(...milestones.map((m) => m.start + m.duration)) + 10;
  const [hoveredMilestone, setHoveredMilestone] = useState<Milestone | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const daysPerMonth = totalDays / months.length;

  return (
    <div className="relative">
      {/* Month headers */}
      <div className="flex mb-2" style={{ paddingLeft: "180px" }}>
        {months.map((m, i) => (
          <div
            key={m}
            className="text-xs font-medium text-center"
            style={{ width: `${100 / months.length}%`, color: "#475569" }}
          >
            {m}
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="space-y-2">
        {milestones.map((ms) => (
          <div
            key={ms.id}
            className="flex items-center gap-3"
            onMouseMove={(e) => {
              setHoveredMilestone(ms);
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoveredMilestone(null)}
          >
            <div className="w-44 flex-shrink-0 text-xs text-right pr-2 truncate" style={{ color: "#94A3B8" }}>
              {ms.label}
            </div>
            <div className="flex-1 relative h-7 rounded" style={{ background: "#111128" }}>
              {/* Grid lines */}
              {months.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${(i / months.length) * 100}%`, background: "#1A1A38" }}
                />
              ))}
              {/* Bar */}
              <div
                className="absolute top-1 bottom-1 rounded cursor-pointer transition-opacity hover:opacity-90"
                style={{
                  left: `${(ms.start / totalDays) * 100}%`,
                  width: `${(ms.duration / totalDays) * 100}%`,
                  background: `${ms.color}30`,
                  border: `1px solid ${ms.color}50`,
                }}
              >
                {/* Progress fill */}
                <div
                  className="h-full rounded-l"
                  style={{
                    width: `${ms.progress}%`,
                    background: `${ms.color}60`,
                  }}
                />
                {/* Label inside bar */}
                <div
                  className="absolute inset-0 flex items-center px-2 text-xs font-medium truncate"
                  style={{ color: ms.color }}
                >
                  {ms.progress}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hoveredMilestone && (
        <div
          className="fixed z-50 px-4 py-3 rounded-lg text-xs pointer-events-none"
          style={{
            left: mousePos.x + 16,
            top: mousePos.y - 10,
            background: "#0C0C22",
            border: "1px solid #1A1A38",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div className="font-semibold text-white mb-1">{hoveredMilestone.label}</div>
          <div style={{ color: "#64748B" }}>{hoveredMilestone.description}</div>
          <div className="mt-1.5 flex gap-3">
            <span style={{ color: "#94A3B8" }}>Owner: <span className="text-white">{hoveredMilestone.owner}</span></span>
            <span style={{ color: "#94A3B8" }}>Progress: <span style={{ color: hoveredMilestone.color }}>{hoveredMilestone.progress}%</span></span>
          </div>
          <div style={{ color: "#94A3B8" }}>Duration: <span className="text-white">{hoveredMilestone.duration} days</span></div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── Kanban Board ────────────────────────── */

function KanbanBoard({ tasks, onTaskMove }: { tasks: Task[]; onTaskMove: (id: number, newStatus: Task["status"]) => void }) {
  const columns: { id: Task["status"]; label: string; color: string; icon: React.ElementType }[] = [
    { id: "todo", label: "To-Do", color: "#64748B", icon: Target },
    { id: "doing", label: "In Progress", color: "#F59E0B", icon: Clock },
    { id: "done", label: "Done", color: "#10B981", icon: CheckCircle2 },
  ];

  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className="rounded-xl overflow-hidden"
            style={{ background: "#0A0A1E", border: "1px solid #1A1A38" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedTask !== null) {
                onTaskMove(draggedTask, col.id);
                setDraggedTask(null);
              }
            }}
          >
            {/* Column header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1A1A38" }}>
              <div className="flex items-center gap-2">
                <col.icon size={14} style={{ color: col.color }} />
                <span className="text-sm font-semibold text-white">{col.label}</span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${col.color}20`, color: col.color }}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-2 min-h-[200px]">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTask(task.id)}
                  className="p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:border-[#2D2D52]"
                  style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm text-white leading-snug">{task.title}</span>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: priorityColors[task.priority] }}
                      title={task.priority}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}
                      >
                        {task.avatar}
                      </div>
                      <span className="text-xs" style={{ color: "#64748B" }}>{task.assignee.split(" ")[0]}</span>
                    </div>
                    <span className="text-xs" style={{ color: "#475569" }}>{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────── Resource Tracker ────────────────────────── */

function ResourceTracker({ team }: { team: TeamMember[] }) {
  return (
    <div className="space-y-3">
      {team.map((member) => {
        const barColor =
          member.utilization > 85 ? "#EF4444" : member.utilization > 60 ? "#F59E0B" : "#10B981";
        return (
          <div
            key={member.name}
            className="p-4 rounded-xl flex items-center gap-4"
            style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}
            >
              {member.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-medium text-white">{member.name}</span>
                  <span className="text-xs ml-2" style={{ color: "#64748B" }}>{member.role}</span>
                </div>
                <span className="text-xs" style={{ color: "#64748B" }}>{member.tasks} tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${member.utilization}%`, background: barColor }}
                  />
                </div>
                <span className="text-xs font-semibold w-10 text-right" style={{ color: barColor }}>
                  {member.utilization}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────── Main Page ────────────────────────── */

type Tab = "list" | "timeline" | "kanban" | "resources";

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState(defaultProjects);

  // For Kanban: manage tasks of selected project
  const handleTaskMove = (taskId: number, newStatus: Task["status"]) => {
    if (!selectedProject) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)) }
          : p
      )
    );
    setSelectedProject((prev) =>
      prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)) } : prev
    );
  };

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "list", label: "Project List", icon: Layers },
    { id: "timeline", label: "Timeline", icon: Calendar },
    { id: "kanban", label: "Activity Board", icon: FolderKanban },
    { id: "resources", label: "Resources", icon: Users },
  ];

  const summaryStats = useMemo(() => ({
    total: projects.length,
    onTrack: projects.filter((p) => p.status === "on-track").length,
    atRisk: projects.filter((p) => p.status === "at-risk" || p.status === "delayed").length,
    completed: projects.filter((p) => p.status === "completed").length,
  }), [projects]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Projects Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            {projects.length} projects · Manage timelines, tasks & resources
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Plus size={16} /> Create New Project
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: summaryStats.total, color: "#6366F1", icon: FolderKanban },
          { label: "On Track", value: summaryStats.onTrack, color: "#10B981", icon: CheckCircle2 },
          { label: "At Risk / Delayed", value: summaryStats.atRisk, color: "#EF4444", icon: AlertTriangle },
          { label: "Completed", value: summaryStats.completed, color: "#818CF8", icon: Target },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "#64748B" }}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{s.value}</div>
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

      {/* ──── LIST VIEW ──── */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}
              />
            </div>
            {["all", "on-track", "at-risk", "delayed", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: statusFilter === f ? (statusConfig[f]?.bg || "rgba(99,102,241,0.15)") : "#0C0C22",
                  color: statusFilter === f ? (statusConfig[f]?.text || "#818CF8") : "#64748B",
                  border: "1px solid #1A1A38",
                }}
              >
                {f === "all" ? "All" : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#111128", borderBottom: "1px solid #1A1A38" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Project Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Owner</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Due Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const st = statusConfig[p.status];
                  return (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-[#111128] cursor-pointer"
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1A1A38" : "none" }}
                      onClick={() => setSelectedProject(p)}
                    >
                      <td className="px-5 py-3">
                        <div>
                          <div className="text-sm font-medium text-white">{p.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#475569" }}>{p.description.slice(0, 60)}…</div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit"
                          style={{ background: st.bg, color: st.text }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}
                          >
                            {p.ownerAvatar}
                          </div>
                          <span className="text-sm" style={{ color: "#94A3B8" }}>{p.owner}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${p.progress}%`,
                                background:
                                  p.progress === 100 ? "#818CF8" : p.progress > 50 ? "#10B981" : p.progress > 25 ? "#F59E0B" : "#EF4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-white w-8 text-right">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs" style={{ color: "#94A3B8" }}>{p.dueDate}</span>
                      </td>
                      <td className="px-5 py-3">
                        <ChevronRight size={16} style={{ color: "#64748B" }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──── TIMELINE VIEW ──── */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          {/* Project selector */}
          {!selectedProject && (
            <div className="grid grid-cols-2 gap-4">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="p-4 rounded-xl text-left transition-all hover:border-[#2D2D52]"
                  style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: statusConfig[p.status].bg, color: statusConfig[p.status].text }}
                    >
                      {statusConfig[p.status].label}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>{p.milestones.length} milestones · Due {p.dueDate}</div>
                </button>
              ))}
            </div>
          )}
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg"
                  style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                >
                  ← All Projects
                </button>
                <h2 className="text-base font-semibold text-white">{selectedProject.name}</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: statusConfig[selectedProject.status].bg, color: statusConfig[selectedProject.status].text }}
                >
                  {statusConfig[selectedProject.status].label}
                </span>
              </div>
              <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <h3 className="text-sm font-semibold text-white mb-4">Project Timeline (Gantt)</h3>
                <GanttChart milestones={selectedProject.milestones} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──── KANBAN VIEW ──── */}
      {activeTab === "kanban" && (
        <div className="space-y-4">
          {!selectedProject && (
            <div className="grid grid-cols-2 gap-4">
              {projects.filter(p => p.status !== "completed").map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="p-4 rounded-xl text-left transition-all hover:border-[#2D2D52]"
                  style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: statusConfig[p.status].bg, color: statusConfig[p.status].text }}
                    >
                      {statusConfig[p.status].label}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "#64748B" }}>
                    {p.tasks.filter(t => t.status === "todo").length} to-do · {p.tasks.filter(t => t.status === "doing").length} in progress · {p.tasks.filter(t => t.status === "done").length} done
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg"
                  style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                >
                  ← All Projects
                </button>
                <h2 className="text-base font-semibold text-white">{selectedProject.name}</h2>
              </div>
              <KanbanBoard tasks={selectedProject.tasks} onTaskMove={handleTaskMove} />
            </div>
          )}
        </div>
      )}

      {/* ──── RESOURCES VIEW ──── */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          {!selectedProject && (
            <div className="grid grid-cols-2 gap-4">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="p-4 rounded-xl text-left transition-all hover:border-[#2D2D52]"
                  style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span className="text-xs" style={{ color: "#64748B" }}>{p.team.length} members</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {p.team.slice(0, 5).map((m) => (
                      <div
                        key={m.name}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8", border: "2px solid #0C0C22" }}
                      >
                        {m.avatar}
                      </div>
                    ))}
                    {p.team.length > 5 && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]" style={{ background: "#1A1A38", color: "#64748B" }}>
                        +{p.team.length - 5}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedProject && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg"
                  style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                >
                  ← All Projects
                </button>
                <h2 className="text-base font-semibold text-white">{selectedProject.name}</h2>
                <span className="text-xs" style={{ color: "#64748B" }}>{selectedProject.team.length} team members</span>
              </div>
              <ResourceTracker team={selectedProject.team} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
