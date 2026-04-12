import { useState, useEffect } from "react";
import React from "react";
import {
  BookOpen, Play, CheckCircle, Clock, Award,
  Users, TrendingUp, BarChart3, Lock, Star,
  ChevronRight, Filter, Search, Plus, Brain,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { coursesApi } from "../../api";

const defaultCourses = [
  {
    id: 1,
    title: "Stakeholder Analysis Fundamentals",
    category: "Foundation",
    duration: "2.5h",
    modules: 8,
    progress: 100,
    status: "completed",
    rating: 4.8,
    enrolled: 124,
    color: "#10B981",
    skills: ["Stakeholder Mapping", "Influence Analysis", "Power-Interest Matrix"],
    desc: "Master the fundamentals of stakeholder analysis including power-interest mapping, influence networks, and segmentation strategies.",
  },
  {
    id: 2,
    title: "Change Management Communication",
    category: "Communication",
    duration: "3.0h",
    modules: 10,
    progress: 65,
    status: "in-progress",
    rating: 4.9,
    enrolled: 98,
    color: "#6366F1",
    skills: ["Messaging Frameworks", "Resistance Management", "Executive Communication"],
    desc: "Develop compelling change narratives and communication strategies tailored to different stakeholder audiences.",
  },
  {
    id: 3,
    title: "Sentiment Intelligence & AI",
    category: "AI & Analytics",
    duration: "1.5h",
    modules: 6,
    progress: 30,
    status: "in-progress",
    rating: 4.7,
    enrolled: 76,
    color: "#8B5CF6",
    skills: ["AI Sentiment Analysis", "Data Interpretation", "Predictive Modeling"],
    desc: "Learn how AI-powered sentiment analysis works and how to act on insights from HuPulse's intelligence engine.",
  },
  {
    id: 4,
    title: "Executive Stakeholder Engagement",
    category: "Advanced",
    duration: "4.0h",
    modules: 12,
    progress: 0,
    status: "not-started",
    rating: 4.9,
    enrolled: 54,
    color: "#06B6D4",
    skills: ["C-Suite Communication", "Board Engagement", "Strategic Influence"],
    desc: "Advanced strategies for engaging C-suite and board-level stakeholders during transformational change programs.",
  },
  {
    id: 5,
    title: "RACI & Governance Frameworks",
    category: "Governance",
    duration: "2.0h",
    modules: 7,
    progress: 0,
    status: "locked",
    rating: 4.6,
    enrolled: 42,
    color: "#F59E0B",
    skills: ["RACI Matrix", "Decision Governance", "Accountability Mapping"],
    desc: "Design and implement RACI frameworks that clarify accountability and accelerate decision-making across stakeholder groups.",
  },
  {
    id: 6,
    title: "Resistance Management Playbook",
    category: "Advanced",
    duration: "3.5h",
    modules: 9,
    progress: 0,
    status: "locked",
    rating: 4.8,
    enrolled: 38,
    color: "#EF4444",
    skills: ["Resistance Identification", "Influence Strategies", "Conflict Resolution"],
    desc: "Tactical approaches to identifying, understanding, and converting resistant stakeholders into active change supporters.",
  },
];

const skillMatrix = [
  { skill: "Stakeholder Analysis", level: 90, benchmark: 65 },
  { skill: "Communication", level: 72, benchmark: 70 },
  { skill: "Change Management", level: 58, benchmark: 60 },
  { skill: "AI & Analytics", level: 45, benchmark: 40 },
  { skill: "Governance", level: 30, benchmark: 50 },
  { skill: "Resistance Mgmt", level: 20, benchmark: 45 },
];

const teamProgress = [
  { name: "Dept Overall", completed: 42, in_progress: 28, not_started: 30 },
  { name: "Marketing", completed: 68, in_progress: 22, not_started: 10 },
  { name: "Engineering", completed: 55, in_progress: 30, not_started: 15 },
  { name: "Finance", completed: 25, in_progress: 20, not_started: 55 },
  { name: "Operations", completed: 40, in_progress: 35, not_started: 25 },
];

const radarSkills = [
  { subject: "Analysis", score: 90 },
  { subject: "Comms", score: 72 },
  { subject: "Change", score: 58 },
  { subject: "AI", score: 45 },
  { subject: "Governance", score: 30 },
  { subject: "Resistance", score: 20 },
];

const statusConfig: Record<string, { color: string; label: string; icon: React.ElementType }> = {
  completed: { color: "#10B981", label: "Completed", icon: CheckCircle },
  "in-progress": { color: "#6366F1", label: "In Progress", icon: Play },
  "not-started": { color: "#64748B", label: "Not Started", icon: BookOpen },
  locked: { color: "#475569", label: "Locked", icon: Lock },
};

type LearningTab = "courses" | "skills" | "analytics";

export function LearningPage() {
  const [activeTab, setActiveTab] = useState<LearningTab>("courses");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [courseList, setCourseList] = useState(defaultCourses);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    coursesApi.list({ limit: 50 }).then((res) => {
      if (res.data?.length) {
        setCourseList(res.data.map((c: any, i: number) => ({
          id: c.id || i + 1,
          title: c.title,
          category: c.status === "PUBLISHED" ? "Foundation" : "Advanced",
          duration: c.durationHours ? `${c.durationHours}h` : "2h",
          modules: 6,
          progress: 0,
          status: "not-started",
          rating: 4.7,
          enrolled: 50,
          color: ["#10B981", "#6366F1", "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444"][i % 6],
          skills: c.objectives?.slice(0, 3) || ["Stakeholder Management"],
          desc: c.description || c.title,
        })));
      }
    }).catch(() => {});
  }, []);

  const showAction = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const categories = ["All", "Foundation", "Communication", "AI & Analytics", "Advanced", "Governance"];

  const filtered = courseList.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeFilter === "All" || c.category === activeFilter;
    return matchSearch && matchCat;
  });

  const completedCount = courseList.filter((c) => c.status === "completed").length;
  const inProgressCount = courseList.filter((c) => c.status === "in-progress").length;
  const overallProgress = courseList.length ? Math.round((completedCount / courseList.length) * 100) : 0;

  const tabs: { id: LearningTab; label: string; icon: React.ElementType }[] = [
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "skills", label: "Skills Matrix", icon: BarChart3 },
    { id: "analytics", label: "Team Analytics", icon: TrendingUp },
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
          <h1 className="text-xl font-bold text-white">Learning Management System</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            Build your stakeholder management expertise
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <Award size={16} style={{ color: "#F59E0B" }} />
            <span className="text-sm font-semibold" style={{ color: "#F59E0B" }}>Level 3 Practitioner</span>
          </div>
        </div>
      </div>

      {/* Progress summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Overall Progress", value: `${overallProgress}%`, color: "#6366F1", sub: "of learning path" },
          { label: "Completed", value: completedCount, color: "#10B981", sub: "courses finished" },
          { label: "In Progress", value: inProgressCount, color: "#F59E0B", sub: "currently active" },
          { label: "Skills Earned", value: "8", color: "#8B5CF6", sub: "competencies" },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <div className="text-xs mb-2" style={{ color: "#64748B" }}>{s.label}</div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#475569" }}>{s.sub}</div>
            {i === 0 && (
              <div className="mt-2 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                <div className="h-full rounded-full" style={{ width: `${overallProgress}%`, background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }} />
              </div>
            )}
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

      {/* Courses tab */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-8 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0", width: "220px" }}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: activeFilter === cat ? "rgba(99,102,241,0.15)" : "#0C0C22",
                    color: activeFilter === cat ? "#818CF8" : "#64748B",
                    border: "1px solid #1A1A38",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => {
              const status = statusConfig[course.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={course.id}
                  className="p-5 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={{
                    background: "#0C0C22",
                    border: "1px solid #1A1A38",
                    opacity: course.status === "locked" ? 0.7 : 1,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${course.color}20` }}
                    >
                      <BookOpen size={18} style={{ color: course.color }} />
                    </div>
                    <StatusIcon size={16} style={{ color: status.color }} />
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-1">{course.title}</h3>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: "#64748B" }}>{course.desc}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {course.skills.slice(0, 2).map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${course.color}15`, color: course.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-3 text-xs" style={{ color: "#64748B" }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {course.modules} modules</span>
                    <span className="flex items-center gap-1"><Star size={11} fill="#F59E0B" style={{ color: "#F59E0B" }} /> {course.rating}</span>
                  </div>

                  {/* Progress */}
                  {course.status !== "not-started" && course.status !== "locked" && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "#64748B" }}>Progress</span>
                        <span style={{ color: status.color }}>{course.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${course.progress}%`, background: course.color }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
                    style={
                      course.status === "locked"
                        ? { background: "#111128", color: "#475569", cursor: "not-allowed" }
                        : { background: `${course.color}20`, color: course.color }
                    }
                    disabled={course.status === "locked"}
                    onClick={() => {
                      if (course.status === "completed") showAction(`Reviewing: ${course.title}`);
                      else if (course.status === "in-progress") {
                        showAction(`Continuing: ${course.title} (${course.progress}% done)`);
                        coursesApi.update(String(course.id), { progress: Math.min(course.progress + 10, 100) }).catch(() => {});
                      }
                      else if (course.status === "not-started") {
                        setCourseList((prev) => prev.map((c) => c.id === course.id ? { ...c, status: "in-progress", progress: 5 } : c));
                        showAction(`Started: ${course.title}`);
                        coursesApi.update(String(course.id), { status: "IN_PROGRESS", progress: 5 }).catch(() => {});
                      }
                    }}
                  >
                    {course.status === "completed" ? "Review Course" :
                      course.status === "in-progress" ? "Continue Learning" :
                        course.status === "locked" ? "🔒 Complete Prerequisites" :
                          "Start Course"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Matrix Tab */}
      {activeTab === "skills" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
            <div className="p-5" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
              <h3 className="text-sm font-semibold text-white">Skill Proficiency vs Benchmark</h3>
              <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Your progress vs industry standard</p>
            </div>
            <div style={{ background: "#07071A", padding: "16px" }}>
              {skillMatrix.map((skill) => (
                <div key={skill.skill} className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-white">{skill.skill}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span style={{ color: "#6366F1" }}>You: {skill.level}%</span>
                      <span style={{ color: "#475569" }}>Avg: {skill.benchmark}%</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full" style={{ background: "#1A1A38" }}>
                    <div
                      className="absolute h-full rounded-full"
                      style={{ width: `${skill.benchmark}%`, background: "rgba(100,116,139,0.3)" }}
                    />
                    <div
                      className="absolute h-full rounded-full"
                      style={{
                        width: `${skill.level}%`,
                        background: skill.level >= skill.benchmark
                          ? "linear-gradient(90deg, #6366F1, #10B981)"
                          : "linear-gradient(90deg, #EF4444, #F59E0B)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <h3 className="text-sm font-semibold text-white mb-1">Competency Radar</h3>
            <p className="text-xs mb-4" style={{ color: "#64748B" }}>Multi-dimensional skill overview</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarSkills}>
                <PolarGrid stroke="#1A1A38" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 11 }} />
                <Radar name="Your Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Team Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
            <h3 className="text-sm font-semibold text-white mb-1">Team Learning Progress by Department</h3>
            <p className="text-xs mb-4" style={{ color: "#64748B" }}>Completion rates across the organization</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={teamProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="in_progress" name="In Progress" fill="#6366F1" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="not_started" name="Not Started" fill="#1A1A38" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3">
              {[["Completed", "#10B981"], ["In Progress", "#6366F1"], ["Not Started", "#1A1A38"]].map(([label, color]) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                  <span className="text-xs" style={{ color: "#64748B" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Learning Recommendations */}
          <div
            className="p-5 rounded-xl"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} style={{ color: "#A78BFA" }} />
              <h3 className="text-sm font-semibold" style={{ color: "#A78BFA" }}>AI Learning Recommendations</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Priority: Governance Training",
                  desc: "Finance department has 55% 'not started' rate. Governance and RACI courses are most relevant to their resistance patterns.",
                  color: "#EF4444",
                  action: "Assign to Finance",
                },
                {
                  title: "Leverage: Marketing Champions",
                  desc: "Marketing team (68% completed) could serve as change champions. Enable peer coaching functionality.",
                  color: "#10B981",
                  action: "Enable Peer Coaching",
                },
                {
                  title: "Recommend: Resistance Management",
                  desc: "2 key stakeholders in IT show persistent resistance. The Resistance Management Playbook course is highly relevant.",
                  color: "#F59E0B",
                  action: "Assign Course",
                },
              ].map((rec, i) => (
                <div key={i} className="p-4 rounded-xl border-l-2" style={{ background: `${rec.color}08`, borderLeftColor: rec.color }}>
                  <h4 className="text-xs font-semibold mb-1.5" style={{ color: rec.color }}>{rec.title}</h4>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: "#64748B" }}>{rec.desc}</p>
                  <button
                    className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                    style={{ background: rec.color }}
                    onClick={() => showAction(`Action initiated: ${rec.action}`)}
                  >
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}