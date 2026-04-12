import { useState, useMemo } from "react";
import React from "react";
import {
  Building2, Search, Filter, ChevronRight, ChevronDown,
  TrendingUp, TrendingDown, Activity, Users, Layers,
  Target, Calendar, AlertTriangle, Phone, Mail,
  ExternalLink, BarChart3, ArrowUpRight, ArrowDownRight,
  Clock, Star,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router";
import {
  useAppContext, clients, programs,
  type Client,
} from "../../contexts/AppContext";

const HealthBadge = ({ health }: { health: string }) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    healthy: { bg: "rgba(16,185,129,0.12)", text: "#10B981", label: "Healthy" },
    at_risk: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", label: "At Risk" },
    critical: { bg: "rgba(239,68,68,0.12)", text: "#EF4444", label: "Critical" },
  };
  const c = map[health] || map.healthy;
  return <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>{c.label}</span>;
};

// ── Client Detail Panel ─────────────────────────────────────
function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  const clientPrograms = programs.filter((p) => p.clientId === client.id);
  const navigate = useNavigate();

  const engagementTrend = [
    { month: "Oct", score: Math.max(20, client.sentiment - 25) },
    { month: "Nov", score: Math.max(20, client.sentiment - 20) },
    { month: "Dec", score: Math.max(20, client.sentiment - 12) },
    { month: "Jan", score: Math.max(20, client.sentiment - 8) },
    { month: "Feb", score: Math.max(20, client.sentiment - 5) },
    { month: "Mar", score: client.sentiment },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div className="ml-auto relative w-full max-w-2xl h-full overflow-y-auto" style={{ background: "#0C0C22", borderLeft: "1px solid #1A1A38" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{client.logo}</div>
            <div>
              <h2 className="text-base font-bold text-white">{client.name}</h2>
              <p className="text-xs" style={{ color: "#64748B" }}>{client.industry}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "NPS", value: client.nps, color: client.nps >= 60 ? "#10B981" : client.nps >= 40 ? "#F59E0B" : "#EF4444" },
              { label: "Sentiment", value: `${client.sentiment}%`, color: client.sentiment >= 70 ? "#10B981" : client.sentiment >= 50 ? "#F59E0B" : "#EF4444" },
              { label: "Stakeholders", value: client.stakeholderCount, color: "#6366F1" },
              { label: "Programs", value: client.programCount, color: "#8B5CF6" },
            ].map((m, i) => (
              <div key={i} className="rounded-lg p-3 text-center" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                <div className="text-lg font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[10px]" style={{ color: "#64748B" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
              <div className="text-[10px] font-medium" style={{ color: "#64748B" }}>ARR</div>
              <div className="text-sm font-bold text-white mt-0.5">{client.arr}</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
              <div className="text-[10px] font-medium" style={{ color: "#64748B" }}>Renewal</div>
              <div className="text-sm font-bold text-white mt-0.5">{client.renewalDate}</div>
            </div>
          </div>

          {/* Engagement Trend */}
          <div className="rounded-lg p-4" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
            <div className="text-xs font-semibold text-white mb-3">Engagement Trend</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={engagementTrend}>
                <defs><linearGradient id="gEng" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A38" />
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11, color: "#E2E8F0" }} />
                <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#gEng)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Programs */}
          <div>
            <div className="text-xs font-semibold text-white mb-3">Programs ({clientPrograms.length})</div>
            <div className="space-y-2">
              {clientPrograms.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#161630] cursor-pointer" style={{ border: "1px solid #1A1A38" }} onClick={() => navigate("/app/programs")}>
                  <Layers size={14} style={{ color: "#8B5CF6" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white">{p.name}</div>
                    <div className="text-[10px]" style={{ color: "#64748B" }}>{p.status} · {p.stakeholderCount} stakeholders</div>
                  </div>
                  <div className="w-16">
                    <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.health === "on_track" ? "#10B981" : p.health === "at_risk" ? "#F59E0B" : "#EF4444" }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-white w-8 text-right">{p.progress}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* CSM */}
          <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
              {client.csm.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="text-xs font-medium text-white">{client.csm}</div>
              <div className="text-[10px]" style={{ color: "#64748B" }}>Customer Success Manager</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export function ClientsPage() {
  const { hierarchy, setHierarchy } = useAppContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("grid");

  const industries = [...new Set(clients.map((c) => c.industry))];

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (healthFilter !== "all" && c.health !== healthFilter) return false;
      if (industryFilter !== "all" && c.industry !== industryFilter) return false;
      return true;
    });
  }, [search, healthFilter, industryFilter]);

  const totalARR = "$6.4M";
  const avgNPS = Math.round(clients.reduce((s, c) => s + c.nps, 0) / clients.length);
  const atRiskCount = clients.filter((c) => c.health !== "healthy").length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Clients</h1>
          <p className="text-xs mt-1" style={{ color: "#64748B" }}>{clients.length} clients · {totalARR} total ARR</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
            <button onClick={() => setView("grid")} className="px-3 py-1.5 text-xs" style={{ background: view === "grid" ? "#111128" : "transparent", color: view === "grid" ? "#818CF8" : "#64748B" }}>Grid</button>
            <button onClick={() => setView("table")} className="px-3 py-1.5 text-xs" style={{ background: view === "table" ? "#111128" : "transparent", color: view === "table" ? "#818CF8" : "#64748B" }}>Table</button>
          </div>
        </div>
      </div>

      {/* Aggregated KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><Building2 size={15} style={{ color: "#6366F1" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Total Clients</span></div>
          <div className="text-2xl font-bold text-white">{clients.length}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><Target size={15} style={{ color: "#10B981" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Avg NPS</span></div>
          <div className="text-2xl font-bold" style={{ color: avgNPS >= 60 ? "#10B981" : avgNPS >= 40 ? "#F59E0B" : "#EF4444" }}>{avgNPS}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={15} style={{ color: "#F59E0B" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>At Risk / Critical</span></div>
          <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{atRiskCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="flex items-center gap-2 mb-2"><BarChart3 size={15} style={{ color: "#8B5CF6" }} /><span className="text-[10px]" style={{ color: "#64748B" }}>Total ARR</span></div>
          <div className="text-2xl font-bold text-white">{totalARR}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search clients…" className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }} />
        </div>
        <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)} className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
          <option value="all">All Health</option>
          <option value="healthy">Healthy</option>
          <option value="at_risk">At Risk</option>
          <option value="critical">Critical</option>
        </select>
        <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)} className="px-3 py-2 rounded-lg text-xs outline-none" style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
          <option value="all">All Industries</option>
          {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} onClick={() => navigate(`/app/clients/${c.id}`)} className="rounded-xl p-5 cursor-pointer hover:border-[#2D2D52] transition-colors" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{c.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                  <div className="text-[10px]" style={{ color: "#64748B" }}>{c.industry}</div>
                </div>
                <HealthBadge health={c.health} />
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{c.nps}</div>
                  <div className="text-[9px]" style={{ color: "#475569" }}>NPS</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{c.stakeholderCount}</div>
                  <div className="text-[9px]" style={{ color: "#475569" }}>Stakeholders</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-white">{c.programCount}</div>
                  <div className="text-[9px]" style={{ color: "#475569" }}>Programs</div>
                </div>
              </div>

              {/* Sentiment bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span style={{ color: "#64748B" }}>Sentiment</span>
                  <span style={{ color: c.sentiment >= 70 ? "#10B981" : c.sentiment >= 50 ? "#F59E0B" : "#EF4444" }}>{c.sentiment}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.sentiment}%`, background: c.sentiment >= 70 ? "#10B981" : c.sentiment >= 50 ? "#F59E0B" : "#EF4444" }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>{c.csm.split(" ").map((n) => n[0]).join("")}</div>
                  <span className="text-[10px]" style={{ color: "#64748B" }}>{c.csm}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: "#475569" }}>
                  <Clock size={10} />
                  {c.lastActivity}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl overflow-hidden" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: "1px solid #1A1A38" }}>
                {["Client", "Industry", "Health", "NPS", "Sentiment", "Programs", "Stakeholders", "ARR", "CSM", "Renewal", "Last Activity"].map((h) => (
                  <th key={h} className="py-3 px-4 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#111128] transition-colors cursor-pointer" style={{ borderBottom: "1px solid #0F0F28" }} onClick={() => navigate(`/app/clients/${c.id}`)}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{c.logo}</div>
                      <span className="text-xs font-medium text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{c.industry}</td>
                  <td className="py-3 px-4"><HealthBadge health={c.health} /></td>
                  <td className="py-3 px-4 text-xs font-medium" style={{ color: c.nps >= 60 ? "#10B981" : c.nps >= 40 ? "#F59E0B" : "#EF4444" }}>{c.nps}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 w-20">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
                        <div className="h-full rounded-full" style={{ width: `${c.sentiment}%`, background: c.sentiment >= 70 ? "#10B981" : c.sentiment >= 50 ? "#F59E0B" : "#EF4444" }} />
                      </div>
                      <span className="text-[10px] text-white">{c.sentiment}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-white">{c.programCount}</td>
                  <td className="py-3 px-4 text-xs text-white">{c.stakeholderCount}</td>
                  <td className="py-3 px-4 text-xs text-white">{c.arr}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{c.csm}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: "#94A3B8" }}>{c.renewalDate}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: "#475569" }}>{c.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
