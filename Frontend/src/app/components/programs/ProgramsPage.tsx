import { useState, useMemo } from "react";
import React from "react";
import {
  Layers, Search, Filter, ChevronRight, Users, Building2,
  Target, Calendar, AlertTriangle, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, BarChart3,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";
import {
  useAppContext, clients, programs,
  type Program,
} from "../../contexts/AppContext";

const HealthBadge = ({ health }: { health: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    on_track: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "On Track" },
    at_risk: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", label: "At Risk" },
    delayed: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Delayed" },
  };
  const c = map[health] || map.on_track;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string }> = {
    active: { bg: "rgba(99,102,241,0.12)", text: "#818CF8" },
    planning: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
    completed: { bg: "rgba(16,185,129,0.12)", text: "#10B981" },
    paused: { bg: "rgba(100,116,139,0.12)", text: "#94A3B8" },
  };
  const c = map[status] || map.active;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: c.bg, color: c.text }}>{status}</span>;
};

// ── Program Detail Panel ────────────────────────────────────
function ProgramDetail({ program, onClose }: { program: Program; onClose: () => void }) {
  const client = clients.find((c) => c.id === program.clientId);
  const navigate = useNavigate();

  const progressTimeline = [
    { week: "W1", progress: Math.max(0, program.progress - 50) },
    { week: "W4", progress: Math.max(0, program.progress - 38) },
    { week: "W8", progress: Math.max(0, program.progress - 25) },
    { week: "W12", progress: Math.max(0, program.progress - 15) },
    { week: "W16", progress: Math.max(0, program.progress - 5) },
    { week: "Now", progress: program.progress },
  ];

  const stakeholderBreakdown = [
    { role: "Executive Sponsors", count: Math.ceil(program.stakeholderCount * 0.15) },
    { role: "Decision Makers", count: Math.ceil(program.stakeholderCount * 0.25) },
    { role: "Influencers", count: Math.ceil(program.stakeholderCount * 0.3) },
    { role: "End Users", count: Math.ceil(program.stakeholderCount * 0.3) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="ml-auto relative w-full max-w-2xl h-full overflow-y-auto" style={{ background: "#0C0C22", borderLeft: "1px solid #1A1A38" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
          <div>
            <h2 className="text-base font-bold text-white">{program.name}</h2>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{client?.name} · {program.status}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status row */}
          <div className="flex items-center gap-3">
            <HealthBadge health={program.health} />
            <StatusBadge status={program.status} />
            <span className="text-xs" style={{ color: "#64748B" }}>{program.startDate} → {program.endDate}</span>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Progress", value: `${program.progress}%`, color: program.progress >= 60 ? "#10B981" : program.progress >= 30 ? "#F59E0B" : "#EF4444" },
              { label: "Stakeholders", value: program.stakeholderCount, color: "#6366F1" },
              { label: "Budget", value: program.budget, color: "#8B5CF6" },
              { label: "Owner", value: program.owner.split(" ")[0], color: "#06B6D4" },
            ].map((m, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                <div className="text-lg font-bold" style={{ color: typeof m.color === "string" ? m.color : "#E2E8F0" }}>{m.value}</div>
                <div className="text-[10px]" style={{ color: "#64748B" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Progress Timeline */}
          <div className="rounded-lg p-4" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
            <div className="text-xs font-semibold text-white mb-3">Progress Timeline</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={progressTimeline}>
                <defs><linearGradient id="gProg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
                <Area type="monotone" dataKey="progress" stroke="#8B5CF6" fillOpacity={1} fill="url(#gProg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stakeholder Mapping */}
          <div className="rounded-lg p-4" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
            <div className="text-xs font-semibold text-white mb-3">Stakeholder Mapping</div>
            <div className="space-y-2">
              {stakeholderBreakdown.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] w-28" style={{ color: "#94A3B8" }}>{s.role}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#1A1A38" }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.count / program.stakeholderCount) * 100}%`, background: ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981"][i] }} />
                  </div>
                  <span className="text-xs font-medium text-white w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/app/stakeholders")} className="mt-3 text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
              View All Stakeholders <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export function ProgramsPage() {
  const { hierarchy } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [view, setView] = useState<"grid" | "table">("table");

  const filtered = useMemo(() => {
    let progs = programs;
    if (hierarchy.clientId) progs = progs.filter((p) => p.clientId === hierarchy.clientId);
    return progs.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (healthFilter !== "all" && p.health !== healthFilter) return false;
      if (clientFilter !== "all" && p.clientId !== clientFilter) return false;
      return true;
    });
  }, [search, statusFilter, healthFilter, clientFilter, hierarchy.clientId]);

  const activeCount = filtered.filter((p) => p.status === "active").length;
  const atRiskCount = filtered.filter((p) => p.health !== "on_track").length;
  const avgProgress = Math.round(filtered.reduce((s, p) => s + p.progress, 0) / (filtered.length || 1));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Programs</h1>
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>
            {hierarchy.clientName ? `${hierarchy.clientName} ·` : ""} {filtered.length} programs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
            <button onClick={() => setView("grid")} className="px-3 py-1.5 text-xs" style={{ background: view === "grid" ? "#111128" : "transparent", color: view === "grid" ? "#818CF8" : "#64748B" }}>Grid</button>
            <button onClick={() => setView("table")} className="px-3 py-1.5 text-xs" style={{ background: view === "table" ? "#111128" : "transparent", color: view === "table" ? "#818CF8" : "#64748B" }}>Table</button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><Layers size={15} style={{ color: "#8B5CF6" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Total Programs</span></div>
          <div className="text-2xl font-bold text-white">{filtered.length}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><Activity size={15} style={{ color: "#6366F1" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Active</span></div>
          <div className="text-2xl font-bold text-white">{activeCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} style={{ color: "#F59E0B" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>At Risk / Delayed</span></div>
          <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{atRiskCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><Target size={15} style={{ color: "#10B981" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Avg Progress</span></div>
          <div className="text-2xl font-bold text-white">{avgProgress}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programs…" className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
        </div>
        {!hierarchy.clientId && (
          <select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
            <option value="all">All Clients</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="planning">Planning</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
        <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)} className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
          <option value="all">All Health</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const cl = clients.find((c) => c.id === p.clientId);
            return (
              <div key={p.id} onClick={() => setSelectedProgram(p)} className="rounded-xl p-5 cursor-pointer hover:border-[#2D2D52] transition-colors" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">{p.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: "#64748B" }}>{cl?.name}</div>
                  </div>
                  <HealthBadge health={p.health} />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: "#64748B" }}>Progress</span>
                    <span className="font-medium text-white">{p.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: "#1A1A38" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.health === "on_track" ? "#10B981" : p.health === "at_risk" ? "#F59E0B" : "#EF4444" }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-3">
                    <span style={{ color: "#94A3B8" }}><Users size={10} className="inline mr-1" />{p.stakeholderCount}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <span style={{ color: "#475569" }}>{p.endDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                {["Program", "Client", "Status", "Health", "Progress", "Stakeholders", "Owner", "Budget", "Timeline"].map((h) => (
                  <th key={h} className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cl = clients.find((c) => c.id === p.clientId);
                return (
                  <tr key={p.id} className="hover:bg-[#111128] transition-colors cursor-pointer" style={{ borderBottom: "1px solid #0F0F28" }} onClick={() => setSelectedProgram(p)}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Layers size={13} style={{ color: "#8B5CF6" }} />
                        <span className="text-xs font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{cl?.name}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4"><HealthBadge health={p.health} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                          <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.health === "on_track" ? "#10B981" : p.health === "at_risk" ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-[10px] text-white w-7 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-white">{p.stakeholderCount}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{p.owner}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{p.budget}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "#475569" }}>{p.startDate} → {p.endDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedProgram && <ProgramDetail program={selectedProgram} onClose={() => setSelectedProgram(null)} />}
    </div>
  );
}
