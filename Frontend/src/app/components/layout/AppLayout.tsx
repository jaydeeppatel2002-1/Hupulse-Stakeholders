import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, MessageSquare, BarChart3, BookOpen,
  TrendingUp, Settings, Bell, Search, ChevronLeft, ChevronRight,
  Zap, LogOut, User, HelpCircle, Sparkles, CheckCheck,
  FolderKanban, Building2, Layers, X, ChevronDown, Shield,
  ArrowRight, Command,
} from "lucide-react";
import { notificationsApi } from "../../api";
import {
  useAppContext, personaMeta, companies, clients, programs,
  type Persona, type HierarchySelection,
} from "../../contexts/AppContext";

// ── Nav configuration by persona ────────────────────────────
const allNavItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, perm: null },
  { path: "/app/clients", label: "Clients", icon: Building2, perm: "view_clients" },
  { path: "/app/programs", label: "Programs", icon: Layers, perm: "view_programs" },
  { path: "/app/stakeholders", label: "Stakeholders", icon: Users, perm: "view_stakeholders" },
  { path: "/app/communication", label: "Communication", icon: MessageSquare, perm: "view_communication" },
  { path: "/app/feedback", label: "Feedback", icon: BarChart3, perm: "view_feedback" },
  { path: "/app/learning", label: "Learning", icon: BookOpen, perm: "view_learning" },
  { path: "/app/analytics", label: "Analytics", icon: TrendingUp, perm: "view_analytics" },
];

const bottomNavItems = [
  { path: "/app/settings", label: "Settings", icon: Settings },
];

// ── Context Switcher ────────────────────────────────────────
function ContextSwitcher({ collapsed }: { collapsed: boolean }) {
  const { hierarchy, setHierarchy } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const contextLabel = hierarchy.programName || hierarchy.clientName || hierarchy.companyName;
  const levelBadge = hierarchy.level === "program" ? "PRG" : hierarchy.level === "client" ? "CLT" : "CO";
  const levelColor = hierarchy.level === "program" ? "#8B5CF6" : hierarchy.level === "client" ? "#06B6D4" : "#6366F1";

  const handleSelect = (h: HierarchySelection) => { setHierarchy(h); setOpen(false); };

  if (collapsed) {
    return (
      <button onClick={() => setOpen(!open)} className="mx-auto mt-3 w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${levelColor}20`, color: levelColor, border: `1px solid ${levelColor}40` }}>
        {levelBadge}
      </button>
    );
  }

  return (
    <div ref={ref} className="mx-3 mt-3 relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: `${levelColor}20`, color: levelColor }}>
          {levelBadge}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">{contextLabel}</div>
          <div className="text-[10px] capitalize" style={{ color: "#64748B" }}>{hierarchy.level} context</div>
        </div>
        <ChevronDown size={14} style={{ color: "#64748B" }} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-xl py-2 z-50 max-h-80 overflow-y-auto" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          {/* Company level */}
          <div className="px-3 py-1"><span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Company</span></div>
          {companies.map((c) => (
            <button key={c.id} onClick={() => handleSelect({ level: "company", companyId: c.id, companyName: c.name })} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#111128] transition-colors">
              <Building2 size={13} style={{ color: "#6366F1" }} />
              <span className="text-xs text-white">{c.name}</span>
              {hierarchy.level === "company" && hierarchy.companyId === c.id && <Check size={12} style={{ color: "#6366F1" }} className="ml-auto" />}
            </button>
          ))}

          <div className="mx-3 my-1.5" style={{ borderTop: "1px solid #1A1A38" }} />

          {/* Client level */}
          <div className="px-3 py-1"><span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Clients</span></div>
          {clients.map((cl) => (
            <button key={cl.id} onClick={() => handleSelect({ level: "client", companyId: "comp-1", companyName: "HuPulse Corp", clientId: cl.id, clientName: cl.name })} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#111128] transition-colors">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold" style={{ background: cl.health === "healthy" ? "rgba(16,185,129,0.15)" : cl.health === "at_risk" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: cl.health === "healthy" ? "#10B981" : cl.health === "at_risk" ? "#F59E0B" : "#EF4444" }}>
                {cl.logo}
              </div>
              <span className="text-xs text-white truncate">{cl.name}</span>
              {hierarchy.level === "client" && hierarchy.clientId === cl.id && <Check size={12} style={{ color: "#06B6D4" }} className="ml-auto flex-shrink-0" />}
            </button>
          ))}

          <div className="mx-3 my-1.5" style={{ borderTop: "1px solid #1A1A38" }} />

          {/* Program level */}
          <div className="px-3 py-1"><span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Programs</span></div>
          {programs.slice(0, 8).map((pr) => {
            const cl = clients.find((c) => c.id === pr.clientId);
            return (
              <button key={pr.id} onClick={() => handleSelect({ level: "program", companyId: "comp-1", companyName: "HuPulse Corp", clientId: pr.clientId, clientName: cl?.name || "", programId: pr.id, programName: pr.name })} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#111128] transition-colors">
                <Layers size={13} style={{ color: "#8B5CF6" }} />
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-white truncate block">{pr.name}</span>
                  <span className="text-[10px]" style={{ color: "#475569" }}>{cl?.name}</span>
                </div>
                {hierarchy.level === "program" && hierarchy.programId === pr.id && <Check size={12} style={{ color: "#8B5CF6" }} className="ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Check icon (used in context switcher) ───────────────────
function Check({ size, style, className }: { size: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ── Persona Switcher ────────────────────────────────────────
function PersonaSwitcher({ collapsed }: { collapsed: boolean }) {
  const { persona, setPersona } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = personaMeta[persona];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (collapsed) return null;

  return (
    <div ref={ref} className="mx-3 mt-2 relative">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left" style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
        <Shield size={13} style={{ color: meta.color }} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium" style={{ color: meta.color }}>{meta.label}</div>
          <div className="text-[9px]" style={{ color: "#475569" }}>{meta.description}</div>
        </div>
        <ChevronDown size={12} style={{ color: "#475569" }} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-xl py-1.5 z-50" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          {(Object.entries(personaMeta) as [Persona, typeof personaMeta[Persona]][]).map(([key, m]) => (
            <button key={key} onClick={() => { setPersona(key); setOpen(false); }} className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#111128] transition-colors">
              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              <div>
                <div className="text-xs text-white">{m.label}</div>
                <div className="text-[10px]" style={{ color: "#475569" }}>{m.description}</div>
              </div>
              {persona === key && <Check size={12} style={{ color: m.color }} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Breadcrumbs ─────────────────────────────────────────────
function Breadcrumbs() {
  const location = useLocation();
  const { hierarchy } = useAppContext();
  const segments = location.pathname.replace(/^\/app\/?/, "").split("/").filter(Boolean);
  if (!segments.length) return null;

  return (
    <div className="flex items-center gap-1.5 px-6 py-2.5 text-xs" style={{ borderBottom: "1px solid #1A1A38" }}>
      <NavLink to="/app/dashboard" className="hover:underline" style={{ color: "#818CF8" }}>Home</NavLink>
      {hierarchy.level !== "company" && (
        <>
          <ChevronRight size={10} style={{ color: "#475569" }} />
          <span style={{ color: "#64748B" }}>{hierarchy.companyName}</span>
        </>
      )}
      {hierarchy.clientName && (
        <>
          <ChevronRight size={10} style={{ color: "#475569" }} />
          <span style={{ color: "#64748B" }}>{hierarchy.clientName}</span>
        </>
      )}
      {hierarchy.programName && (
        <>
          <ChevronRight size={10} style={{ color: "#475569" }} />
          <span style={{ color: "#64748B" }}>{hierarchy.programName}</span>
        </>
      )}
      {segments.map((seg, i) => {
        const path = "/app/" + segments.slice(0, i + 1).join("/");
        const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight size={10} style={{ color: "#475569" }} />
            {isLast ? (
              <span className="font-medium" style={{ color: "#E2E8F0" }}>{label}</span>
            ) : (
              <NavLink to={path} className="hover:underline" style={{ color: "#818CF8" }}>{label}</NavLink>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ── Search Overlay ──────────────────────────────────────────
const searchableItems = [
  { label: "Executive Dashboard", path: "/app/dashboard", hub: "Dashboard", icon: LayoutDashboard },
  { label: "Clients", path: "/app/clients", hub: "Clients", icon: Building2 },
  { label: "Programs", path: "/app/programs", hub: "Programs", icon: Layers },
  { label: "Stakeholders", path: "/app/stakeholders", hub: "Stakeholders", icon: Users },
  { label: "Communication Hub", path: "/app/communication", hub: "Communication", icon: MessageSquare },
  { label: "Feedback & Surveys", path: "/app/feedback", hub: "Feedback", icon: BarChart3 },
  { label: "Learning Center", path: "/app/learning", hub: "Learning", icon: BookOpen },
  { label: "Analytics", path: "/app/analytics", hub: "Analytics", icon: TrendingUp },
  { label: "Settings", path: "/app/settings", hub: "Settings", icon: Settings },
  ...clients.map((c) => ({ label: c.name, path: "/app/clients", hub: "Client", icon: Building2 })),
  ...programs.slice(0, 6).map((p) => ({ label: p.name, path: "/app/programs", hub: "Program", icon: Layers })),
];

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  if (!open) return null;

  const filtered = searchableItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} />
      <div className="relative w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 25px 80px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-4 gap-3" style={{ borderBottom: "1px solid #1A1A38" }}>
          <Search size={16} style={{ color: "#475569" }} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search across all hubs, clients, programs…" className="flex-1 py-4 text-sm outline-none bg-transparent" style={{ color: "#E2E8F0" }} />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1A1A38", color: "#475569" }}>ESC</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: "#475569" }}>No results found</div>
          ) : (
            filtered.map((item, i) => (
              <button key={i} onClick={() => { navigate(item.path); onClose(); }} className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#111128] transition-colors">
                <item.icon size={14} style={{ color: "#64748B" }} />
                <span className="text-sm text-white flex-1">{item.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.12)", color: "#818CF8" }}>{item.hub}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Layout ─────────────────────────────────────────────
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { persona, hasPermission, hierarchy } = useAppContext();

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen((o) => !o); }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fallbackNotifications = [
    { id: 1, text: "Atlas Financial health score dropped to Critical", time: "2m ago", type: "alert" },
    { id: 2, text: "New stakeholder mapped: Marcus Johnson → Cloud Infrastructure", time: "15m ago", type: "info" },
    { id: 3, text: "AI insight: Engagement risk in GlobalTech Security program", time: "1h ago", type: "warning" },
    { id: 4, text: "Meridian Health NPS improved to 68 (+5)", time: "2h ago", type: "success" },
    { id: 5, text: "3 surveys completed across Acme programs", time: "3h ago", type: "info" },
  ];

  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [unreadCount, setUnreadCount] = useState(5);

  useEffect(() => {
    notificationsApi.list().then((data: any) => {
      if (Array.isArray(data) && data.length) {
        setNotifications(data.map((n: any) => ({ id: n.id, text: n.message || n.title || "Notification", time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "", type: n.type || "info" })));
      }
    }).catch(() => {});
    notificationsApi.unreadCount().then((data: any) => {
      if (typeof data?.count === "number") setUnreadCount(data.count);
    }).catch(() => {});
  }, []);

  const handleMarkAllRead = () => {
    notificationsApi.markAllRead().then(() => { setUnreadCount(0); }).catch(() => {});
  };

  // Filter nav items based on persona permissions
  const visibleNav = allNavItems.filter((item) => !item.perm || hasPermission(item.perm));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#07071A", color: "#E2E8F0" }}>
      {/* ─── Sidebar ─── */}
      <aside className="flex flex-col transition-all duration-300 ease-in-out relative z-20 flex-shrink-0" style={{ width: collapsed ? "64px" : "250px", background: "#0C0C22", borderRight: "1px solid #1A1A38" }}>
        {/* Logo */}
        <div className="flex items-center h-14 px-4 gap-3 flex-shrink-0" style={{ borderBottom: "1px solid #1A1A38" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            <Zap size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-sm leading-none">HuPulse</div>
              <div className="text-[10px] leading-none mt-0.5" style={{ color: "#6366F1" }}>Stakeholder Intelligence</div>
            </div>
          )}
        </div>

        {/* Context Switcher */}
        <ContextSwitcher collapsed={collapsed} />

        {/* Persona Switcher */}
        <PersonaSwitcher collapsed={collapsed} />

        {/* AI Insight chip */}
        {!collapsed && (
          <div className="mx-3 mt-2 mb-1 rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
            <Sparkles size={12} style={{ color: "#8B5CF6" }} className="flex-shrink-0" />
            <span className="text-[10px]" style={{ color: "#A78BFA" }}>3 AI insights available</span>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {!collapsed && <div className="px-3 pt-1 pb-2"><span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Navigation</span></div>}
          {visibleNav.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group ${collapsed ? "justify-center" : ""}`}
              style={({ isActive }) => ({ background: isActive ? "rgba(99, 102, 241, 0.12)" : "transparent", color: isActive ? "#818CF8" : "#94A3B8" })}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={17} className="flex-shrink-0" style={{ color: isActive ? "#818CF8" : "#64748B" }} />
                  {!collapsed && <span className="text-[13px] font-medium truncate">{item.label}</span>}
                  {isActive && !collapsed && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "#6366F1" }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-3 space-y-1" style={{ borderTop: "1px solid #1A1A38" }}>
          <div className="pt-2">
            {bottomNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 ${collapsed ? "justify-center" : ""}`} style={({ isActive }) => ({ background: isActive ? "rgba(99, 102, 241, 0.12)" : "transparent", color: isActive ? "#818CF8" : "#64748B" })}>
                {({ isActive }) => (
                  <>
                    <item.icon size={17} className="flex-shrink-0" />
                    {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* User card */}
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mt-1" style={{ background: "#111128" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>JD</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">John Doe</div>
                <div className="text-[10px] truncate capitalize" style={{ color: "#64748B" }}>{personaMeta[persona].label}</div>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center transition-colors z-30" style={{ background: "#1A1A38", border: "1px solid #2D2D52", color: "#94A3B8" }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ─── Main content ─── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0 z-10" style={{ background: "#07071A", borderBottom: "1px solid #1A1A38" }}>
          {/* Search trigger */}
          <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#475569", width: "320px" }}>
            <Search size={14} />
            <span className="text-xs">Search clients, stakeholders, programs…</span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#1A1A38", color: "#475569" }}>⌘K</kbd>
            </div>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Hierarchy breadcrumb pills */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>{hierarchy.companyName}</span>
              {hierarchy.clientName && (
                <>
                  <ArrowRight size={10} style={{ color: "#475569" }} />
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4" }}>{hierarchy.clientName}</span>
                </>
              )}
              {hierarchy.programName && (
                <>
                  <ArrowRight size={10} style={{ color: "#475569" }} />
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>{hierarchy.programName}</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }} className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: notifOpen ? "#111128" : "transparent" }}>
                <Bell size={17} style={{ color: "#94A3B8" }} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: "#EF4444" }}>{unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-11 w-80 rounded-xl py-2 z-50" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                  <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid #1A1A38" }}>
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.2)", color: "#818CF8" }}>{unreadCount} new</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full hover:bg-[#111128]" style={{ color: "#818CF8" }}>
                          <CheckCheck size={11} /> Read all
                        </button>
                      )}
                    </div>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-2.5 hover:bg-[#111128] transition-colors cursor-pointer">
                      <p className="text-xs text-white">{n.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{n.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "#64748B" }}>
              <HelpCircle size={17} />
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>JD</div>
                <span className="text-xs text-white hidden md:block">John Doe</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-11 w-48 rounded-xl py-2 z-50" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                  <div className="px-4 py-2" style={{ borderBottom: "1px solid #1A1A38" }}>
                    <p className="text-sm font-medium text-white">John Doe</p>
                    <p className="text-[10px]" style={{ color: "#64748B" }}>john@company.com</p>
                  </div>
                  <button onClick={() => { navigate("/app/settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-[#111128] flex items-center gap-2" style={{ color: "#94A3B8" }}><User size={13} /> Profile</button>
                  <button onClick={() => { navigate("/app/settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-[#111128] flex items-center gap-2" style={{ color: "#94A3B8" }}><Settings size={13} /> Settings</button>
                  <button onClick={() => navigate("/")} className="w-full text-left px-4 py-2 text-xs hover:bg-[#111128] flex items-center gap-2" style={{ color: "#EF4444", borderTop: "1px solid #1A1A38" }}><LogOut size={13} /> Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#07071A" }}>
          <Outlet />
        </main>
      </div>

      {/* Search Overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
