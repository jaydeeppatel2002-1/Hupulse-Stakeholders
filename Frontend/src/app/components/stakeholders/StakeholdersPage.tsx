import { useState, useRef, useEffect, useCallback } from "react";
import React from "react";
import {
  Users, Search, Filter, Plus, ChevronDown, ChevronRight,
  Network, Grid3X3, MoreHorizontal, Brain, TrendingUp,
  ArrowUpRight, ArrowDownRight, Star, AlertTriangle, Edit3,
  X, Check, Mail, Phone, Calendar, Building, Trash2,
  GitBranch, History,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { stakeholdersApi } from "../../api";
import { useAppContext, clients, programs } from "../../contexts/AppContext";

const AVATAR_WOMAN = "https://images.unsplash.com/photo-1758518729459-235dcaadc611?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3NDI3MDgzNHww&ixlib=rb-4.1.0&q=80&w=1080";
const AVATAR_MAN = "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdCUyMGJ1c2luZXNzJTIwc3VpdHxlbnwxfHx8fDE3NzQzMzA1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080";

const defaultStakeholders = [
  { id: 1, name: "Sarah Chen", role: "CMO", dept: "Marketing", sentiment: "supportive", influence: 92, power: 85, interest: 90, email: "s.chen@company.com", phone: "+1 555 0101", avatar: AVATAR_WOMAN, trend: "up", history: [70, 75, 80, 82, 88, 92], clientId: "acme", programId: "acme-cx" },
  { id: 2, name: "Marcus Johnson", role: "VP Engineering", dept: "Technology", sentiment: "supportive", influence: 88, power: 80, interest: 95, email: "m.johnson@company.com", phone: "+1 555 0102", avatar: AVATAR_MAN, trend: "up", history: [65, 70, 72, 80, 84, 88], clientId: "globaltech", programId: "gt-digital" },
  { id: 3, name: "Elena Rodriguez", role: "COO", dept: "Operations", sentiment: "neutral", influence: 76, power: 90, interest: 60, email: "e.rodriguez@company.com", phone: "+1 555 0103", avatar: AVATAR_WOMAN, trend: "stable", history: [78, 74, 76, 73, 75, 76], clientId: "meridian", programId: "mh-wellness" },
  { id: 4, name: "Richard Harmon", role: "CFO", dept: "Finance", sentiment: "resistant", influence: 22, power: 95, interest: 30, email: "r.harmon@company.com", phone: "+1 555 0104", avatar: AVATAR_MAN, trend: "down", history: [50, 42, 38, 30, 25, 22], clientId: "atlas", programId: "af-risk" },
  { id: 5, name: "Patricia Wong", role: "VP Operations", dept: "Operations", sentiment: "neutral", influence: 41, power: 72, interest: 55, email: "p.wong@company.com", phone: "+1 555 0105", avatar: AVATAR_WOMAN, trend: "down", history: [60, 58, 52, 48, 44, 41], clientId: "novastar", programId: "ns-sustainability" },
  { id: 6, name: "David Klein", role: "Head of IT", dept: "Technology", sentiment: "resistant", influence: 18, power: 65, interest: 25, email: "d.klein@company.com", phone: "+1 555 0106", avatar: AVATAR_MAN, trend: "down", history: [40, 35, 28, 24, 20, 18], clientId: "pinnacle", programId: "pr-loyalty" },
  { id: 7, name: "Amanda Foster", role: "HR Director", dept: "HR", sentiment: "supportive", influence: 84, power: 60, interest: 88, email: "a.foster@company.com", phone: "+1 555 0107", avatar: AVATAR_WOMAN, trend: "up", history: [68, 72, 76, 79, 82, 84], clientId: "acme", programId: "acme-onboard" },
  { id: 8, name: "James Park", role: "Head of Strategy", dept: "Strategy", sentiment: "supportive", influence: 79, power: 75, interest: 82, email: "j.park@company.com", phone: "+1 555 0108", avatar: AVATAR_MAN, trend: "up", history: [60, 64, 68, 72, 76, 79], clientId: "globaltech", programId: "gt-ai" },
];

const sentimentConfig: Record<string, { bg: string; text: string; label: string }> = {
  supportive: { bg: "rgba(16,185,129,0.15)", text: "#10B981", label: "Supportive" },
  neutral: { bg: "rgba(245,158,11,0.15)", text: "#F59E0B", label: "Neutral" },
  resistant: { bg: "rgba(239,68,68,0.15)", text: "#EF4444", label: "Resistant" },
};

const SentimentBadge = ({ s }: { s: string }) => {
  const c = sentimentConfig[s];
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: c.bg, color: c.text }}>
      {c.label}
    </span>
  );
};

const InfluenceBar = ({ score, color }: { score: number; color: string }) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1.5 rounded-full" style={{ background: "#1A1A38" }}>
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
    </div>
    <span className="text-xs font-medium text-white w-8 text-right">{score}</span>
  </div>
);

// Power-Interest Matrix
function PowerInterestMatrix({ stakeholders }: { stakeholders: typeof stakeholders }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<typeof stakeholders[0] | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const W = 580, H = 380;
  const PADDING = 40;

  const getPos = (s: typeof stakeholders[0]) => ({
    x: PADDING + (s.interest / 100) * (W - PADDING * 2),
    y: H - PADDING - (s.power / 100) * (H - PADDING * 2),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);

    // Background quadrants
    const midX = W / 2, midY = H / 2;
    const quadrants = [
      { x: 0, y: 0, w: midX, h: midY, label: "Keep Satisfied", color: "rgba(99,102,241,0.06)" },
      { x: midX, y: 0, w: midX, h: midY, label: "Manage Closely", color: "rgba(139,92,246,0.08)" },
      { x: 0, y: midY, w: midX, h: midY, label: "Monitor", color: "rgba(30,30,64,0.3)" },
      { x: midX, y: midY, w: midX, h: midY, label: "Keep Informed", color: "rgba(6,182,212,0.06)" },
    ];

    quadrants.forEach((q) => {
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = "rgba(100,116,139,0.5)";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(q.label, q.x + q.w / 2, q.y + 20);
    });

    // Grid lines
    ctx.strokeStyle = "#1A1A38";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes labels
    ctx.fillStyle = "rgba(100,116,139,0.8)";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Low Interest →", PADDING + 60, H - 10);
    ctx.fillText("High Interest →", W - PADDING - 60, H - 10);

    // Stakeholder dots
    stakeholders.forEach((s) => {
      const pos = getPos(s);
      const sentiment = s.sentiment;
      const colors: Record<string, string> = {
        supportive: "#10B981",
        neutral: "#F59E0B",
        resistant: "#EF4444",
      };
      const color = colors[sentiment] || "#6366F1";

      // Glow
      const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 20);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Name
      ctx.fillStyle = "#94A3B8";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.name.split(" ")[0], pos.x, pos.y - 14);
    });
  }, [stakeholders]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    const found = stakeholders.find((s) => {
      const pos = getPos(s);
      return Math.hypot(pos.x - mx, pos.y - my) < 16;
    });
    setHovered(found || null);
  };

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Power–Interest Matrix</h3>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Interactive stakeholder positioning</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {["Supportive", "Neutral", "Resistant"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: ["#10B981", "#F59E0B", "#EF4444"][i] }} />
              <span style={{ color: "#64748B" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative" style={{ paddingLeft: "24px" }}>
        {/* Y axis label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ writingMode: "vertical-rl", transform: "rotate(180deg) translateY(50%)", color: "#475569", fontSize: "11px" }}>
          Power ↑
        </div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full rounded-xl cursor-crosshair"
          style={{ border: "1px solid #1A1A38", background: "#08081A" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}
        />
        {hovered && (
          <div
            className="absolute z-10 px-3 py-2 rounded-lg text-xs pointer-events-none"
            style={{
              left: mousePos.x + 12,
              top: mousePos.y - 10,
              background: "#0C0C22",
              border: "1px solid #1A1A38",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div className="font-semibold text-white">{hovered.name}</div>
            <div style={{ color: "#64748B" }}>{hovered.role}</div>
            <div className="mt-1 flex gap-3">
              <span style={{ color: "#94A3B8" }}>Power: <span className="text-white">{hovered.power}</span></span>
              <span style={{ color: "#94A3B8" }}>Interest: <span className="text-white">{hovered.interest}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Influence Network
function InfluenceNetwork({ stakeholders }: { stakeholders: typeof stakeholders }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const nodes = stakeholders.map((s, i) => {
    const angle = (i / stakeholders.length) * Math.PI * 2;
    const r = 140;
    return {
      ...s,
      x: 300 + r * Math.cos(angle),
      y: 200 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  const edges = [
    [0, 1], [0, 2], [0, 6], [0, 7],
    [1, 2], [1, 7],
    [2, 3], [2, 4],
    [3, 5], [4, 5],
    [6, 7], [5, 2],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600, H = 400;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);

      // Draw edges with pulse animation
      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
        const alpha = 0.2 + 0.1 * Math.sin(t * 0.003 + a * 0.5);
        grad.addColorStop(0, `rgba(99,102,241,${alpha})`);
        grad.addColorStop(1, `rgba(139,92,246,${alpha})`);
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated particle on edge
        const progress = (t * 0.001 + a * 0.3) % 1;
        const px = na.x + (nb.x - na.x) * progress;
        const py = na.y + (nb.y - na.y) * progress;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,0.8)`;
        ctx.fill();
      });

      // Draw nodes
      nodes.forEach((n) => {
        const sentColors: Record<string, string> = {
          supportive: "#10B981",
          neutral: "#F59E0B",
          resistant: "#EF4444",
        };
        const color = sentColors[n.sentiment];
        const pulseR = 18 + 3 * Math.sin(t * 0.002 + n.id * 0.5);

        // Outer glow
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulseR + 10);
        glow.addColorStop(0, `${color}30`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR + 10, 0, Math.PI * 2);
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
        const nodeGrad = ctx.createRadialGradient(n.x - 4, n.y - 4, 0, n.x, n.y, 18);
        nodeGrad.addColorStop(0, `${color}cc`);
        nodeGrad.addColorStop(1, `${color}88`);
        ctx.fillStyle = nodeGrad;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Initials
        ctx.fillStyle = "white";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.name.split(" ").map(x => x[0]).join(""), n.x, n.y + 4);

        // Name label
        ctx.fillStyle = "rgba(148,163,184,0.9)";
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.name.split(" ")[0], n.x, n.y + 30);
      });

      animRef.current = requestAnimationFrame((ts) => draw(ts));
    };

    animRef.current = requestAnimationFrame((ts) => draw(ts));
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Influence Network</h3>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Real-time relationship mapping</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#8B5CF6" }} />
          Live
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full rounded-xl"
        style={{ border: "1px solid #1A1A38", background: "#08081A" }}
      />
    </div>
  );
}

// Org Map Node
function OrgNode({ name, role, dept, sentiment, small }: { name: string; role: string; dept: string; sentiment: string; small?: boolean }) {
  const colors: Record<string, string> = { supportive: "#10B981", neutral: "#F59E0B", resistant: "#EF4444" };
  return (
    <div className={`rounded-lg text-center ${small ? "px-3 py-2" : "px-4 py-3"}`} style={{ background: "#08081A", border: `1px solid ${colors[sentiment] || "#1A1A38"}`, minWidth: small ? 120 : 150 }}>
      <div className={`font-medium text-white ${small ? "text-[10px]" : "text-xs"}`}>{name}</div>
      <div className={`${small ? "text-[9px]" : "text-[10px]"}`} style={{ color: "#94A3B8" }}>{role}</div>
      <div className={`${small ? "text-[9px]" : "text-[10px]"}`} style={{ color: "#475569" }}>{dept}</div>
    </div>
  );
}

// RACI Matrix
function RACIMatrix({ stakeholders }: { stakeholders: typeof stakeholders }) {
  const activities = [
    "Change Strategy Approval",
    "Stakeholder Communication",
    "Training Delivery",
    "Risk Assessment",
    "Budget Approval",
    "Progress Reporting",
  ];

  const raciData: Record<string, string[]> = {
    "Change Strategy Approval": ["A", "C", "I", "R", "C", "I", "I", "C"],
    "Stakeholder Communication": ["R", "C", "A", "I", "I", "C", "R", "C"],
    "Training Delivery": ["I", "C", "C", "I", "I", "R", "A", "C"],
    "Risk Assessment": ["C", "R", "C", "C", "A", "I", "I", "C"],
    "Budget Approval": ["I", "I", "I", "C", "A", "I", "I", "R"],
    "Progress Reporting": ["C", "R", "C", "I", "I", "A", "C", "R"],
  };

  const raciColors: Record<string, { bg: string; text: string }> = {
    R: { bg: "rgba(99,102,241,0.2)", text: "#818CF8" },
    A: { bg: "rgba(139,92,246,0.2)", text: "#A78BFA" },
    C: { bg: "rgba(6,182,212,0.2)", text: "#22D3EE" },
    I: { bg: "rgba(100,116,139,0.15)", text: "#64748B" },
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">RACI Matrix</h3>
          <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Responsibility assignment</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {[["R", "Responsible"], ["A", "Accountable"], ["C", "Consulted"], ["I", "Informed"]].map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: raciColors[k].bg, color: raciColors[k].text }}>{k}</span>
              <span style={{ color: "#64748B" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #1A1A38" }}>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "#111128", borderBottom: "1px solid #1A1A38" }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: "#64748B", minWidth: "180px" }}>Activity</th>
              {stakeholders.map((s) => (
                <th key={s.id} className="px-3 py-3 font-medium text-center" style={{ color: "#64748B", minWidth: "80px" }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}>
                      {s.name.split(" ").map(x => x[0]).join("")}
                    </div>
                    <span style={{ fontSize: "10px" }}>{s.name.split(" ")[0]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, i) => (
              <tr
                key={activity}
                className="transition-colors hover:bg-[#111128]"
                style={{ borderBottom: i < activities.length - 1 ? "1px solid #1A1A38" : "none" }}
              >
                <td className="px-4 py-3 font-medium text-white">{activity}</td>
                {raciData[activity].map((role, j) => (
                  <td key={j} className="px-3 py-3 text-center">
                    <span
                      className="w-7 h-7 rounded flex items-center justify-center mx-auto font-bold"
                      style={{ background: raciColors[role].bg, color: raciColors[role].text, display: "inline-flex" }}
                    >
                      {role}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stakeholder Profile Drawer
function StakeholderProfile({ stakeholder, onClose, onDelete }: { stakeholder: typeof stakeholders[0]; onClose: () => void; onDelete: (id: number | string) => void }) {
  const sentimentHistory = stakeholder.history.map((v, i) => ({ week: `W${i + 1}`, score: v }));
  const c = sentimentConfig[stakeholder.sentiment];

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto"
      style={{ background: "#0C0C22", borderLeft: "1px solid #1A1A38", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)" }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">Stakeholder Profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>
            <X size={16} />
          </button>
        </div>

        {/* Profile card */}
        <div className="rounded-xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #0D0D22, #111130)", border: "1px solid #1A1A38" }}>
          <div className="flex items-start gap-4">
            <img
              src={stakeholder.avatar}
              alt={stakeholder.name}
              className="w-16 h-16 rounded-xl object-cover"
              style={{ border: "2px solid rgba(99,102,241,0.3)" }}
            />
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">{stakeholder.name}</h3>
              <p className="text-sm" style={{ color: "#64748B" }}>{stakeholder.role}</p>
              <div className="flex items-center gap-2 mt-2">
                <SentimentBadge s={stakeholder.sentiment} />
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#1A1A38", color: "#64748B" }}>
                  {stakeholder.dept}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="text-center p-3 rounded-lg" style={{ background: "#07071A" }}>
              <div className="text-xl font-bold" style={{ color: "#6366F1" }}>{stakeholder.influence}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>Influence</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: "#07071A" }}>
              <div className="text-xl font-bold" style={{ color: "#8B5CF6" }}>{stakeholder.power}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>Power</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: "#07071A" }}>
              <div className="text-xl font-bold" style={{ color: "#06B6D4" }}>{stakeholder.interest}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>Interest</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-xl p-4 mb-4" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
          <h4 className="text-xs font-semibold text-white mb-3">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} style={{ color: "#6366F1" }} />
              <span style={{ color: "#94A3B8" }}>{stakeholder.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} style={{ color: "#8B5CF6" }} />
              <span style={{ color: "#94A3B8" }}>{stakeholder.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building size={14} style={{ color: "#06B6D4" }} />
              <span style={{ color: "#94A3B8" }}>{stakeholder.dept} Department</span>
            </div>
          </div>
        </div>

        {/* Sentiment graph */}
        <div className="rounded-xl p-4 mb-4" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
          <h4 className="text-xs font-semibold text-white mb-3">Sentiment History</h4>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={sentimentHistory}>
              <XAxis dataKey="week" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#0C0C22", border: "1px solid #1A1A38", borderRadius: 8, fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={c.text}
                strokeWidth={2}
                dot={{ r: 3, fill: c.text }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendation */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} style={{ color: "#A78BFA" }} />
            <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>AI Recommendation</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
            {stakeholder.sentiment === "resistant"
              ? `Schedule a 1:1 with ${stakeholder.name} to address concerns. Focus on ROI metrics and team impact. Consider involving their direct reports in the next demo.`
              : stakeholder.sentiment === "neutral"
              ? `${stakeholder.name} shows neutral engagement. Share success stories from their peer departments. A tailored benefits summary could shift sentiment positively.`
              : `${stakeholder.name} is a strong advocate. Leverage their support by involving them in stakeholder presentations to neutral and resistant contacts.`
            }
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            onClick={() => { window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting+with+${encodeURIComponent(stakeholder.name)}&details=Stakeholder+engagement+meeting`, '_blank'); }}
          >
            Schedule Meeting
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
            onClick={() => { if (stakeholder.email) window.location.href = `mailto:${stakeholder.email}?subject=Follow-up: Stakeholder Engagement`; }}
          >
            Send Email
          </button>
        </div>
        <button
          className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}
          onClick={() => { if (confirm(`Remove ${stakeholder.name}?`)) { onDelete(stakeholder.id); onClose(); } }}
        >
          <Trash2 size={14} /> Remove Stakeholder
        </button>
      </div>
    </div>
  );
}

type Tab = "list" | "matrix" | "network" | "raci" | "orgmap" | "engagement";

export function StakeholdersPage() {
  const { hierarchy } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>("list");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>(hierarchy.clientId || "all");
  const [programFilter, setProgramFilter] = useState<string>(hierarchy.programId || "all");
  const [selectedProfile, setSelectedProfile] = useState<typeof defaultStakeholders[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stakeholders, setStakeholders] = useState(defaultStakeholders);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "", phone: "", jobTitle: "", company: "", department: "", type: "INTERNAL", sentiment: "neutral", powerScore: 50, interestScore: 50, notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadStakeholders = useCallback(async () => {
    try {
      const res = await stakeholdersApi.list({ limit: 100 });
      if (res.data?.length) {
        setStakeholders(res.data.map((s: any) => ({
          id: s.id,
          name: `${s.firstName} ${s.lastName}`,
          role: s.jobTitle || "—",
          dept: s.department || "—",
          sentiment: (s.sentiment || "neutral").toLowerCase(),
          influence: s.engagementScores?.[0]?.score ?? 50,
          power: s.powerScore ?? 50,
          interest: s.interestScore ?? 50,
          email: s.email || "",
          phone: s.phone || "",
          avatar: AVATAR_WOMAN,
          trend: "stable",
          history: [50, 50, 50, 50, 50, 50],
        })));
      }
    } catch {
      // API unavailable — keep default data
    }
  }, []);

  useEffect(() => { loadStakeholders(); }, [loadStakeholders]);

  const handleAddSubmit = async () => {
    if (!addForm.firstName || !addForm.lastName) return;
    setSubmitting(true);
    try {
      await stakeholdersApi.create({
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        email: addForm.email || undefined,
        phone: addForm.phone || undefined,
        jobTitle: addForm.jobTitle || undefined,
        department: addForm.department || undefined,
        type: addForm.type,
        sentiment: addForm.sentiment.toUpperCase(),
        powerScore: addForm.powerScore,
        interestScore: addForm.interestScore,
        notes: addForm.notes || undefined,
      });
      await loadStakeholders();
    } catch {
      // API unavailable — add locally
      setStakeholders((prev) => [...prev, {
        id: Date.now(),
        name: `${addForm.firstName} ${addForm.lastName}`,
        role: addForm.jobTitle || "—",
        dept: addForm.department || "—",
        sentiment: addForm.sentiment,
        influence: 50,
        power: addForm.powerScore,
        interest: addForm.interestScore,
        email: addForm.email,
        phone: addForm.phone,
        avatar: AVATAR_WOMAN,
        trend: "stable",
        history: [50, 50, 50, 50, 50, 50],
      }]);
    }
    setSubmitting(false);
    setShowAddModal(false);
    setAddForm({ firstName: "", lastName: "", email: "", phone: "", jobTitle: "", company: "", department: "", type: "INTERNAL", sentiment: "neutral", powerScore: 50, interestScore: 50, notes: "" });
  };

  // Sync filters when hierarchy context changes
  useEffect(() => {
    if (hierarchy.clientId) setClientFilter(hierarchy.clientId);
    else setClientFilter("all");
    if (hierarchy.programId) setProgramFilter(hierarchy.programId);
    else setProgramFilter("all");
  }, [hierarchy.clientId, hierarchy.programId]);

  const filtered = stakeholders.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.dept.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.sentiment === filter;
    const matchClient = clientFilter === "all" || (s as any).clientId === clientFilter;
    const matchProgram = programFilter === "all" || (s as any).programId === programFilter;
    return matchSearch && matchFilter && matchClient && matchProgram;
  });

  const contextClient = clients.find(c => c.id === clientFilter);
  const contextPrograms = programFilter === "all" ? programs.filter(p => clientFilter === "all" || p.clientId === clientFilter) : programs;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "list", label: "Stakeholder List", icon: Users },
    { id: "matrix", label: "Power–Interest Matrix", icon: Grid3X3 },
    { id: "network", label: "Influence Network", icon: Network },
    { id: "raci", label: "RACI Matrix", icon: Grid3X3 },
    { id: "orgmap", label: "Org Map", icon: GitBranch },
    { id: "engagement", label: "Engagement History", icon: History },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">Stakeholder Management</h1>
            {contextClient && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                {contextClient.name}
              </span>
            )}
          </div>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>
            {filtered.length} of {stakeholders.length} stakeholders · AI-enhanced analysis
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
        >
          <Plus size={16} /> Add Stakeholder
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

      {/* List view */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stakeholders..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}
              />
            </div>
            {["all", "supportive", "neutral", "resistant"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                style={{
                  background: filter === f ? sentimentConfig[f]?.bg || "rgba(99,102,241,0.15)" : "#0C0C22",
                  color: filter === f ? sentimentConfig[f]?.text || "#818CF8" : "#64748B",
                  border: "1px solid #1A1A38",
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
            {!hierarchy.clientId && (
              <select
                value={clientFilter}
                onChange={(e) => { setClientFilter(e.target.value); setProgramFilter("all"); }}
                className="px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#94A3B8" }}
              >
                <option value="all">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {!hierarchy.programId && (
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="px-3 py-2 rounded-lg text-xs outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#94A3B8" }}
              >
                <option value="all">All Programs</option>
                {contextPrograms.filter(p => clientFilter === "all" || p.clientId === clientFilter).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1A1A38" }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#111128", borderBottom: "1px solid #1A1A38" }}>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Stakeholder</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Department</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Sentiment</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Influence Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: "#64748B" }}>Trend</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-[#111128] cursor-pointer"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1A1A38" : "none" }}
                    onClick={() => setSelectedProfile(s)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          style={{ border: "1px solid #1A1A38" }}
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{s.name}</div>
                          <div className="text-xs" style={{ color: "#64748B" }}>{s.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: "#1A1A38", color: "#94A3B8" }}>
                        {s.dept}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <SentimentBadge s={s.sentiment} />
                    </td>
                    <td className="px-5 py-3 w-40">
                      <InfluenceBar
                        score={s.influence}
                        color={sentimentConfig[s.sentiment].text}
                      />
                    </td>
                    <td className="px-5 py-3">
                      {s.trend === "up" ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#10B981" }}>
                          <ArrowUpRight size={14} /> Rising
                        </span>
                      ) : s.trend === "down" ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}>
                          <ArrowDownRight size={14} /> Declining
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "#64748B" }}>Stable</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ color: "#64748B" }}
                        onClick={(e) => { e.stopPropagation(); setSelectedProfile(s); }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matrix view */}
      {activeTab === "matrix" && (
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <PowerInterestMatrix stakeholders={stakeholders} />
        </div>
      )}

      {/* Network view */}
      {activeTab === "network" && (
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <InfluenceNetwork stakeholders={stakeholders} />
        </div>
      )}

      {/* RACI view */}
      {activeTab === "raci" && (
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <RACIMatrix stakeholders={stakeholders} />
        </div>
      )}

      {/* Org Map view */}
      {activeTab === "orgmap" && (
        <div className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Organization Map</h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>Hierarchical reporting structure of the client organization</p>
          </div>
          <div className="flex flex-col items-center">
            {/* CEO level */}
            <OrgNode name="Elena Rodriguez" role="COO" dept="Operations" sentiment="neutral" />
            <div className="w-px h-6" style={{ background: "#1A1A38" }} />
            {/* Direct reports */}
            <div className="flex items-start gap-8 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px" style={{ background: "#1A1A38", width: "80%" }} />
              <div className="flex flex-col items-center">
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <OrgNode name="Sarah Chen" role="CMO" dept="Marketing" sentiment="supportive" />
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <div className="flex gap-4">
                  <OrgNode name="Amanda Foster" role="HR Director" dept="HR" sentiment="supportive" small />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <OrgNode name="Richard Harmon" role="CFO" dept="Finance" sentiment="resistant" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <OrgNode name="Marcus Johnson" role="VP Engineering" dept="Technology" sentiment="supportive" />
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <div className="flex gap-4">
                  <OrgNode name="David Klein" role="Head of IT" dept="Technology" sentiment="resistant" small />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <OrgNode name="Patricia Wong" role="VP Operations" dept="Operations" sentiment="neutral" />
              </div>
              <div className="flex flex-col items-center">
                <div className="w-px h-6" style={{ background: "#1A1A38" }} />
                <OrgNode name="James Park" role="Head of Strategy" dept="Strategy" sentiment="supportive" />
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-8 text-xs">
            {["Supportive", "Neutral", "Resistant"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: ["#10B981", "#F59E0B", "#EF4444"][i] }} />
                <span style={{ color: "#64748B" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement History view */}
      {activeTab === "engagement" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search stakeholders for history..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38", color: "#E2E8F0" }}
              />
            </div>
          </div>
          {filtered.slice(0, 4).map((s) => {
            const touchpoints = [
              { type: "Email", date: "Mar 24, 2026", desc: `Sent Q2 roadmap update to ${s.name}`, color: "#6366F1" },
              { type: "Meeting", date: "Mar 20, 2026", desc: `1:1 alignment call — discussed change readiness`, color: "#8B5CF6" },
              { type: "Phone", date: "Mar 15, 2026", desc: `Quick check-in on project concerns`, color: "#06B6D4" },
              { type: "Email", date: "Mar 10, 2026", desc: `Shared stakeholder engagement report`, color: "#6366F1" },
              { type: "Meeting", date: "Mar 5, 2026", desc: `Team town hall — presented transformation plan`, color: "#8B5CF6" },
            ];
            return (
              <div key={s.id} className="rounded-xl p-5" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" style={{ border: "1px solid #1A1A38" }} />
                  <div>
                    <span className="text-sm font-medium text-white">{s.name}</span>
                    <span className="text-xs ml-2" style={{ color: "#64748B" }}>{s.role} · {s.dept}</span>
                  </div>
                  <SentimentBadge s={s.sentiment} />
                </div>
                <div className="relative ml-4 pl-6 space-y-4" style={{ borderLeft: "2px solid #1A1A38" }}>
                  {touchpoints.map((tp, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#0C0C22", border: `2px solid ${tp.color}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: tp.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: `${tp.color}15`, color: tp.color }}>{tp.type}</span>
                          <span className="text-xs" style={{ color: "#475569" }}>{tp.date}</span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{tp.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile drawer */}
      {selectedProfile && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setSelectedProfile(null)}
          />
          <StakeholderProfile stakeholder={selectedProfile} onClose={() => setSelectedProfile(null)} onDelete={async (id) => {
            try { await stakeholdersApi.delete(String(id)); await loadStakeholders(); } catch { setStakeholders(prev => prev.filter(s => s.id !== id)); }
          }} />
        </>
      )}

      {/* Add Stakeholder Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-lg rounded-2xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: "#0C0C22", border: "1px solid #1A1A38", boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Add Stakeholder</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#111128", color: "#64748B" }}>×</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>First Name *</label>
                    <input value={addForm.firstName} onChange={(e) => setAddForm(f => ({ ...f, firstName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="First name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Last Name *</label>
                    <input value={addForm.lastName} onChange={(e) => setAddForm(f => ({ ...f, lastName: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="Last name" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Email</label>
                    <input value={addForm.email} onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))} type="email" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="email@company.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Phone</label>
                    <input value={addForm.phone} onChange={(e) => setAddForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="+1 555 0100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Job Title</label>
                    <input value={addForm.jobTitle} onChange={(e) => setAddForm(f => ({ ...f, jobTitle: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="VP Engineering" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Department</label>
                    <input value={addForm.department} onChange={(e) => setAddForm(f => ({ ...f, department: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="Technology" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Sentiment</label>
                    <select value={addForm.sentiment} onChange={(e) => setAddForm(f => ({ ...f, sentiment: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
                      <option value="supportive">Supportive</option>
                      <option value="neutral">Neutral</option>
                      <option value="resistant">Resistant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Type</label>
                    <select value={addForm.type} onChange={(e) => setAddForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}>
                      <option value="INTERNAL">Internal</option>
                      <option value="EXTERNAL">External</option>
                      <option value="PARTNER">Partner</option>
                      <option value="REGULATOR">Regulator</option>
                      <option value="COMMUNITY">Community</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Power Score: {addForm.powerScore}</label>
                    <input type="range" min={0} max={100} value={addForm.powerScore} onChange={(e) => setAddForm(f => ({ ...f, powerScore: Number(e.target.value) }))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Interest Score: {addForm.interestScore}</label>
                    <input type="range" min={0} max={100} value={addForm.interestScore} onChange={(e) => setAddForm(f => ({ ...f, interestScore: Number(e.target.value) }))} className="w-full" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Notes</label>
                  <textarea rows={2} value={addForm.notes} onChange={(e) => setAddForm(f => ({ ...f, notes: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }} placeholder="Additional notes..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button disabled={submitting || !addForm.firstName || !addForm.lastName} onClick={handleAddSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                    {submitting ? "Adding..." : "Add Stakeholder"}
                  </button>
                  <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}>
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