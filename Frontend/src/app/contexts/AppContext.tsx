import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

// ── Persona types ───────────────────────────────────────────
export type Persona = "customer_head" | "manager" | "consultant" | "stakeholder";

export const personaMeta: Record<Persona, { label: string; description: string; color: string }> = {
  customer_head: { label: "Customer Head", description: "Executive View", color: "#8B5CF6" },
  manager: { label: "Engagement Manager", description: "Manager View", color: "#6366F1" },
  consultant: { label: "Consultant", description: "Operational View", color: "#06B6D4" },
  stakeholder: { label: "End Stakeholder", description: "Client View", color: "#10B981" },
};

// ── Hierarchy types ─────────────────────────────────────────
export type HierarchyLevel = "company" | "client" | "program";

export interface HierarchySelection {
  level: HierarchyLevel;
  companyId: string;
  companyName: string;
  clientId?: string;
  clientName?: string;
  programId?: string;
  programName?: string;
}

// ── Sample data ─────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  health: "healthy" | "at_risk" | "critical";
  stakeholderCount: number;
  programCount: number;
  nps: number;
  arr: string;
  csm: string;
  renewalDate: string;
  sentiment: number;
  lastActivity: string;
}

export interface Program {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "planning" | "completed" | "paused";
  progress: number;
  stakeholderCount: number;
  startDate: string;
  endDate: string;
  owner: string;
  budget: string;
  health: "on_track" | "at_risk" | "delayed";
}

export const companies = [
  { id: "comp-1", name: "HuPulse Corp" },
];

export const clients: Client[] = [
  { id: "cl-1", name: "Acme Corporation", industry: "Technology", logo: "AC", health: "healthy", stakeholderCount: 24, programCount: 3, nps: 72, arr: "$1.2M", csm: "Sarah Parker", renewalDate: "Sep 2026", sentiment: 82, lastActivity: "2h ago" },
  { id: "cl-2", name: "GlobalTech Inc", industry: "Software", logo: "GT", health: "at_risk", stakeholderCount: 18, programCount: 2, nps: 45, arr: "$860K", csm: "Mike Chen", renewalDate: "Jun 2026", sentiment: 54, lastActivity: "1d ago" },
  { id: "cl-3", name: "Meridian Health", industry: "Healthcare", logo: "MH", health: "healthy", stakeholderCount: 31, programCount: 4, nps: 68, arr: "$2.1M", csm: "Lisa Wong", renewalDate: "Dec 2026", sentiment: 76, lastActivity: "4h ago" },
  { id: "cl-4", name: "Atlas Financial", industry: "Finance", logo: "AF", health: "critical", stakeholderCount: 12, programCount: 1, nps: 28, arr: "$540K", csm: "John Davis", renewalDate: "Apr 2026", sentiment: 31, lastActivity: "3d ago" },
  { id: "cl-5", name: "NovaStar Energy", industry: "Energy", logo: "NE", health: "healthy", stakeholderCount: 20, programCount: 2, nps: 65, arr: "$980K", csm: "Sarah Parker", renewalDate: "Nov 2026", sentiment: 71, lastActivity: "6h ago" },
  { id: "cl-6", name: "Pinnacle Retail", industry: "Retail", logo: "PR", health: "at_risk", stakeholderCount: 15, programCount: 2, nps: 42, arr: "$720K", csm: "Mike Chen", renewalDate: "Aug 2026", sentiment: 48, lastActivity: "2d ago" },
];

export const programs: Program[] = [
  { id: "prg-1", clientId: "cl-1", name: "Digital Transformation", status: "active", progress: 68, stakeholderCount: 12, startDate: "Jan 2026", endDate: "Dec 2026", owner: "Marcus Johnson", budget: "$450K", health: "on_track" },
  { id: "prg-2", clientId: "cl-1", name: "CRM Migration", status: "active", progress: 42, stakeholderCount: 8, startDate: "Mar 2026", endDate: "Sep 2026", owner: "David Klein", budget: "$280K", health: "at_risk" },
  { id: "prg-3", clientId: "cl-1", name: "Employee Engagement", status: "planning", progress: 15, stakeholderCount: 4, startDate: "May 2026", endDate: "Dec 2026", owner: "Amanda Foster", budget: "$120K", health: "on_track" },
  { id: "prg-4", clientId: "cl-2", name: "Cloud Infrastructure", status: "active", progress: 55, stakeholderCount: 10, startDate: "Feb 2026", endDate: "Oct 2026", owner: "Elena Rodriguez", budget: "$380K", health: "at_risk" },
  { id: "prg-5", clientId: "cl-2", name: "Security Compliance", status: "active", progress: 30, stakeholderCount: 8, startDate: "Apr 2026", endDate: "Nov 2026", owner: "James Park", budget: "$200K", health: "delayed" },
  { id: "prg-6", clientId: "cl-3", name: "Patient Portal 2.0", status: "active", progress: 78, stakeholderCount: 14, startDate: "Nov 2025", endDate: "Jul 2026", owner: "Patricia Wong", budget: "$520K", health: "on_track" },
  { id: "prg-7", clientId: "cl-3", name: "Data Analytics Suite", status: "active", progress: 45, stakeholderCount: 9, startDate: "Feb 2026", endDate: "Dec 2026", owner: "Sarah Chen", budget: "$340K", health: "on_track" },
  { id: "prg-8", clientId: "cl-3", name: "Compliance Upgrade", status: "completed", progress: 100, stakeholderCount: 5, startDate: "Sep 2025", endDate: "Feb 2026", owner: "Richard Harmon", budget: "$180K", health: "on_track" },
  { id: "prg-9", clientId: "cl-3", name: "Staff Training", status: "planning", progress: 10, stakeholderCount: 3, startDate: "Jun 2026", endDate: "Dec 2026", owner: "Amanda Foster", budget: "$90K", health: "on_track" },
  { id: "prg-10", clientId: "cl-4", name: "Risk Platform Overhaul", status: "active", progress: 25, stakeholderCount: 12, startDate: "Jan 2026", endDate: "Dec 2026", owner: "Richard Harmon", budget: "$600K", health: "delayed" },
  { id: "prg-11", clientId: "cl-5", name: "Smart Grid Analytics", status: "active", progress: 60, stakeholderCount: 11, startDate: "Dec 2025", endDate: "Sep 2026", owner: "Marcus Johnson", budget: "$410K", health: "on_track" },
  { id: "prg-12", clientId: "cl-5", name: "Sustainability Reporting", status: "active", progress: 35, stakeholderCount: 9, startDate: "Mar 2026", endDate: "Dec 2026", owner: "Elena Rodriguez", budget: "$150K", health: "on_track" },
  { id: "prg-13", clientId: "cl-6", name: "Omnichannel Platform", status: "active", progress: 50, stakeholderCount: 8, startDate: "Jan 2026", endDate: "Oct 2026", owner: "James Park", budget: "$320K", health: "at_risk" },
  { id: "prg-14", clientId: "cl-6", name: "Loyalty Program", status: "planning", progress: 8, stakeholderCount: 7, startDate: "May 2026", endDate: "Feb 2027", owner: "Patricia Wong", budget: "$250K", health: "on_track" },
];

// ── Permission matrix ───────────────────────────────────────
const permissions: Record<Persona, Set<string>> = {
  customer_head: new Set(["view_all", "view_analytics", "view_clients", "view_programs", "view_stakeholders", "view_communication", "view_feedback", "view_learning", "view_settings", "view_ai_insights", "manage_team", "export_data", "view_risk_heatmap"]),
  manager: new Set(["view_analytics", "view_clients", "view_programs", "view_stakeholders", "view_communication", "view_feedback", "view_learning", "view_settings", "edit_stakeholders", "edit_communication", "view_ai_insights", "export_data"]),
  consultant: new Set(["view_stakeholders", "view_communication", "view_feedback", "view_learning", "edit_stakeholders", "edit_communication", "create_communication", "log_activity"]),
  stakeholder: new Set(["view_profile", "view_feedback", "submit_feedback", "view_learning"]),
};

// ── Context ─────────────────────────────────────────────────
interface AppContextValue {
  persona: Persona;
  setPersona: (p: Persona) => void;
  hierarchy: HierarchySelection;
  setHierarchy: (h: HierarchySelection) => void;
  hasPermission: (action: string) => boolean;
  getClientsForContext: () => Client[];
  getProgramsForContext: () => Program[];
}

const defaultHierarchy: HierarchySelection = {
  level: "company",
  companyId: "comp-1",
  companyName: "HuPulse Corp",
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<Persona>("customer_head");
  const [hierarchy, setHierarchy] = useState<HierarchySelection>(defaultHierarchy);

  const hasPermission = useCallback(
    (action: string) => permissions[persona].has(action) || permissions[persona].has("view_all"),
    [persona]
  );

  const getClientsForContext = useCallback(() => {
    if (persona === "consultant") return clients.slice(0, 2);
    if (persona === "stakeholder") return [];
    return clients;
  }, [persona]);

  const getProgramsForContext = useCallback(() => {
    let progs = programs;
    if (hierarchy.clientId) progs = progs.filter((p) => p.clientId === hierarchy.clientId);
    if (persona === "consultant") {
      const clientIds = clients.slice(0, 2).map((c) => c.id);
      progs = progs.filter((p) => clientIds.includes(p.clientId));
    }
    return progs;
  }, [hierarchy.clientId, persona]);

  const value = useMemo(
    () => ({ persona, setPersona, hierarchy, setHierarchy, hasPermission, getClientsForContext, getProgramsForContext }),
    [persona, hierarchy, hasPermission, getClientsForContext, getProgramsForContext]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

// ── RBAC wrapper component ──────────────────────────────────
export function RBACGuard({ permission, children, fallback }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { hasPermission } = useAppContext();
  if (!hasPermission(permission)) return <>{fallback || null}</>;
  return <>{children}</>;
}
