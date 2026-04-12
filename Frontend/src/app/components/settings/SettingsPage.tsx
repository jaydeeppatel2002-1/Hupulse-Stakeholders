import { useState, useEffect } from "react";
import React from "react";
import {
  User, Shield, Bell, Palette, Globe, Key, Users,
  Zap, Save, Check, ChevronRight, AlertTriangle, Brain,
  Lock, Mail, Smartphone, ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import { usersApi, organizationsApi } from "../../api";

type SettingsTab = "profile" | "notifications" | "security" | "ai" | "team" | "appearance";

const settingsTabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "ai", label: "AI Configuration", icon: Brain },
  { id: "team", label: "Team & Access", icon: Users },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0"
    style={{ background: enabled ? "#6366F1" : "#1A1A38" }}
  >
    <span
      className="inline-block h-4 w-4 transform rounded-full transition-transform bg-white"
      style={{ transform: enabled ? "translateX(22px)" : "translateX(2px)" }}
    />
  </button>
);

const SettingRow = ({
  label,
  desc,
  children,
  dangerous,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
  dangerous?: boolean;
}) => (
  <div className="flex items-center justify-between py-4" style={{ borderBottom: "1px solid #1A1A38" }}>
    <div className="flex-1 mr-6">
      <div className="text-sm font-medium" style={{ color: dangerous ? "#EF4444" : "#E2E8F0" }}>
        {label}
      </div>
      {desc && <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{desc}</div>}
    </div>
    {children}
  </div>
);

const teamMembers = [
  { name: "John Doe", email: "john@company.com", role: "Admin", avatar: "JD", active: true },
  { name: "Sarah Chen", email: "s.chen@company.com", role: "Editor", avatar: "SC", active: true },
  { name: "Marcus Johnson", email: "m.johnson@company.com", role: "Viewer", avatar: "MJ", active: true },
  { name: "Emma Wilson", email: "e.wilson@company.com", role: "Editor", avatar: "EW", active: false },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [profile, setProfile] = useState({
    firstName: "John", lastName: "Doe", email: "john@company.com",
    jobTitle: "Change Management Lead", department: "Strategy",
    organization: "Acme Corporation", bio: "Change management professional with 10+ years experience driving enterprise transformation programs.",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    sentimentAlerts: true,
    weeklyDigest: true,
    aiInsights: true,
    newStakeholders: false,
    communicationReminders: true,
    mobileNotifs: false,
    surveyResults: true,
  });

  const [aiSettings, setAiSettings] = useState({
    autoAnalysis: true,
    predictiveInsights: true,
    sentimentProcessing: true,
    emailSummarization: false,
    riskAlerts: true,
    recommendationEngine: true,
  });

  const [aiFrequency, setAiFrequency] = useState("Every 2 hours");
  const [theme, setTheme] = useState("dark");
  const [accentColor, setAccentColor] = useState("#6366F1");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activityIndicators, setActivityIndicators] = useState(true);
  const [teamList, setTeamList] = useState(teamMembers);

  // Load saved settings from localStorage + API
  useEffect(() => {
    const stored = localStorage.getItem("hupulse-settings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.profile) setProfile(s.profile);
        if (s.notifications) setNotifications(s.notifications);
        if (s.aiSettings) setAiSettings(s.aiSettings);
        if (s.aiFrequency) setAiFrequency(s.aiFrequency);
        if (s.theme) setTheme(s.theme);
        if (s.accentColor) setAccentColor(s.accentColor);
        if (s.sidebarCollapsed !== undefined) setSidebarCollapsed(s.sidebarCollapsed);
        if (s.activityIndicators !== undefined) setActivityIndicators(s.activityIndicators);
      } catch {}
    }
    // Try loading from API
    usersApi.me().then((u: any) => {
      if (u?.fullName) {
        const parts = u.fullName.split(" ");
        setProfile(prev => ({
          ...prev,
          firstName: parts[0] || prev.firstName,
          lastName: parts.slice(1).join(" ") || prev.lastName,
          email: u.email || prev.email,
        }));
      }
    }).catch(() => {});
    organizationsApi.current().then((org: any) => {
      if (org?.name) setProfile(prev => ({ ...prev, organization: org.name }));
    }).catch(() => {});
    usersApi.list().then((users: any[]) => {
      if (users?.length) {
        setTeamList(users.map((u: any) => ({
          name: u.fullName || "Unknown",
          email: u.email || "",
          role: u.role || "Viewer",
          avatar: (u.fullName || "??").split(" ").map((w: string) => w[0]).join("").slice(0, 2),
          active: u.isActive !== false,
        })));
      }
    }).catch(() => {});
  }, []);

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAI = (key: keyof typeof aiSettings) => {
    setAiSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    // Persist to localStorage
    const settings = { profile, notifications, aiSettings, aiFrequency, theme, accentColor, sidebarCollapsed, activityIndicators };
    localStorage.setItem("hupulse-settings", JSON.stringify(settings));

    // Try persisting to API
    try {
      await usersApi.me().then(async (u: any) => {
        if (u?.id) {
          await usersApi.update(u.id, { fullName: `${profile.firstName} ${profile.lastName}` });
        }
      });
    } catch {}
    try {
      await organizationsApi.update({ name: profile.organization });
    } catch {}

    setSaved(true);
    setSaveMsg("Settings saved successfully!");
    setTimeout(() => { setSaved(false); setSaveMsg(""); }, 2000);
  };

  const showToast = (msg: string) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  return (
    <div className="p-6 flex gap-6" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <div
        className="w-52 flex-shrink-0 rounded-xl p-3 h-fit"
        style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
      >
        <div className="text-xs font-semibold mb-2 px-3" style={{ color: "#475569" }}>SETTINGS</div>
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all mb-0.5 text-left"
            style={{
              background: activeTab === tab.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === tab.id ? "#818CF8" : "#64748B",
            }}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-xl overflow-hidden" style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}>
          <div className="px-6 py-5" style={{ borderBottom: "1px solid #1A1A38" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {settingsTabs.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
                  Manage your HuPulse Stakeholder preferences
                </p>
              </div>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                style={{ background: saved ? "#10B981" : "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                {saved ? <Check size={15} /> : <Save size={15} />}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
            {saveMsg && (
              <div className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: saved ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", color: saved ? "#10B981" : "#818CF8" }}>
                {saveMsg}
              </div>
            )}
          </div>

          <div className="px-6 py-4">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="space-y-1">
                {/* Avatar */}
                <div className="flex items-center gap-5 py-6" style={{ borderBottom: "1px solid #1A1A38" }}>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "white" }}
                  >
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{profile.firstName} {profile.lastName}</div>
                    <div className="text-xs mb-3" style={{ color: "#64748B" }}>{profile.email}</div>
                    <button
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 py-4" style={{ borderBottom: "1px solid #1A1A38" }}>
                  {([
                    { label: "First Name", key: "firstName" as const },
                    { label: "Last Name", key: "lastName" as const },
                    { label: "Email", key: "email" as const },
                    { label: "Job Title", key: "jobTitle" as const },
                    { label: "Department", key: "department" as const },
                    { label: "Organization", key: "organization" as const },
                  ] as const).map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>
                        {field.label}
                      </label>
                      <input
                        value={profile[field.key]}
                        onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                      />
                    </div>
                  ))}
                </div>

                <div className="py-4">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>Bio</label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                  />
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <div>
                <div className="text-xs font-semibold mb-4 mt-2" style={{ color: "#475569" }}>ALERT PREFERENCES</div>
                {[
                  { key: "emailAlerts" as const, label: "Email Alerts", desc: "Receive important alerts via email" },
                  { key: "sentimentAlerts" as const, label: "Sentiment Change Alerts", desc: "Notified when stakeholder sentiment changes significantly" },
                  { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Summary of stakeholder activity each Monday" },
                  { key: "aiInsights" as const, label: "AI Insight Notifications", desc: "Real-time alerts when AI detects patterns requiring action" },
                  { key: "newStakeholders" as const, label: "New Stakeholder Added", desc: "Alerts when team members add stakeholders" },
                  { key: "communicationReminders" as const, label: "Communication Reminders", desc: "Follow-up reminders for overdue stakeholder touchpoints" },
                  { key: "mobileNotifs" as const, label: "Mobile Push Notifications", desc: "Critical alerts sent to your mobile device" },
                  { key: "surveyResults" as const, label: "Survey Completion", desc: "Notified when survey results are ready" },
                ].map((item) => (
                  <SettingRow key={item.key} label={item.label} desc={item.desc}>
                    <Toggle enabled={notifications[item.key]} onToggle={() => toggleNotif(item.key)} />
                  </SettingRow>
                ))}
              </div>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <div>
                <SettingRow label="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <button
                    onClick={() => showToast("Two-factor authentication setup coming soon")}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Enable 2FA
                  </button>
                </SettingRow>
                <SettingRow label="Change Password" desc="Update your account password">
                  <button
                    onClick={() => showToast("Password update coming soon")}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                  >
                    Update Password
                  </button>
                </SettingRow>
                <SettingRow label="Active Sessions" desc="Manage devices logged into your account">
                  <button
                    onClick={() => showToast("Session management coming soon")}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                  >
                    View Sessions
                  </button>
                </SettingRow>
                <SettingRow label="API Keys" desc="Generate and manage API access tokens">
                  <button
                    onClick={() => showToast("API key management coming soon")}
                    className="px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                  >
                    Manage Keys
                  </button>
                </SettingRow>
                <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} style={{ color: "#EF4444" }} />
                    <span className="text-sm font-semibold" style={{ color: "#EF4444" }}>Danger Zone</span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "#64748B" }}>
                    Deleting your account will permanently remove all your data, stakeholders, and analytics. This action cannot be undone.
                  </p>
                  <button onClick={() => showToast("Account deletion requires confirmation via email")} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* AI Configuration */}
            {activeTab === "ai" && (
              <div>
                <div
                  className="p-4 rounded-xl mb-4 mt-2 flex items-center gap-3"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  <Brain size={18} style={{ color: "#A78BFA" }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#A78BFA" }}>HuPulse AI Engine</div>
                    <div className="text-xs" style={{ color: "#64748B" }}>
                      Configure how AI analyzes your stakeholder data and surfaces insights
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "#10B981" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                    Active
                  </div>
                </div>

                {[
                  { key: "autoAnalysis" as const, label: "Automatic Stakeholder Analysis", desc: "AI continuously analyzes stakeholder patterns and updates intelligence" },
                  { key: "predictiveInsights" as const, label: "Predictive Insights Engine", desc: "Generate future-state predictions based on current stakeholder trajectories" },
                  { key: "sentimentProcessing" as const, label: "Real-time Sentiment Processing", desc: "Automatically analyze sentiment from all communication logs" },
                  { key: "emailSummarization" as const, label: "Email Summarization", desc: "AI summarizes long stakeholder email threads (requires email integration)" },
                  { key: "riskAlerts" as const, label: "Automated Risk Alerts", desc: "AI triggers alerts when stakeholders show risk patterns" },
                  { key: "recommendationEngine" as const, label: "Engagement Recommendations", desc: "Receive AI-generated engagement strategy recommendations" },
                ].map((item) => (
                  <SettingRow key={item.key} label={item.label} desc={item.desc}>
                    <Toggle enabled={aiSettings[item.key]} onToggle={() => toggleAI(item.key)} />
                  </SettingRow>
                ))}

                <div className="py-4">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#94A3B8" }}>AI Analysis Frequency</label>
                  <select
                    value={aiFrequency}
                    onChange={(e) => setAiFrequency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{ background: "#111128", border: "1px solid #1A1A38", color: "#E2E8F0" }}
                  >
                    <option>Every 2 hours</option>
                    <option>Every 4 hours</option>
                    <option>Every 12 hours</option>
                    <option>Daily</option>
                  </select>
                </div>
              </div>
            )}

            {/* Team */}
            {activeTab === "team" && (
              <div>
                <div className="flex items-center justify-between mt-2 mb-4">
                  <div className="text-xs font-semibold" style={{ color: "#475569" }}>TEAM MEMBERS ({teamList.length})</div>
                  <button
                    onClick={() => showToast("Team invitation sent")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                  >
                    Invite Member
                  </button>
                </div>

                {teamList.map((member, i) => (
                  <div
                    key={member.email}
                    className="flex items-center gap-4 py-3"
                    style={{ borderBottom: i < teamList.length - 1 ? "1px solid #1A1A38" : "none" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1E1E3F, #2D2D52)", color: "#94A3B8" }}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{member.name}</div>
                      <div className="text-xs" style={{ color: "#64748B" }}>{member.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!member.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                          Pending
                        </span>
                      )}
                      <select
                        value={member.role}
                        onChange={(e) => setTeamList(prev => prev.map((m, idx) => idx === i ? { ...m, role: e.target.value } : m))}
                        className="text-xs px-3 py-1.5 rounded-lg outline-none"
                        style={{ background: "#111128", border: "1px solid #1A1A38", color: "#94A3B8" }}
                      >
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                      <button
                        onClick={() => { setTeamList(prev => prev.filter((_, idx) => idx !== i)); showToast(`Removed ${member.name}`); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: "#EF4444" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 rounded-xl" style={{ background: "#111128", border: "1px solid #1A1A38" }}>
                  <div className="text-xs font-semibold text-white mb-3">Role Permissions</div>
                  <div className="space-y-2 text-xs">
                    {[
                      ["Admin", "Full access including billing, team management, and settings"],
                      ["Editor", "Can add/edit stakeholders, log communications, create surveys"],
                      ["Viewer", "Read-only access to all stakeholder data and analytics"],
                    ].map(([role, desc]) => (
                      <div key={role} className="flex items-start gap-2">
                        <span className="font-semibold" style={{ color: "#818CF8", minWidth: "50px" }}>{role}</span>
                        <span style={{ color: "#64748B" }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <div className="space-y-6 mt-2">
                <div>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#475569" }}>THEME</div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "dark", label: "Dark", bg: "#07071A", border: "#6366F1" },
                      { id: "light", label: "Light", bg: "#F8F9FF", border: "#64748B" },
                      { id: "auto", label: "System", bg: "linear-gradient(135deg, #07071A 50%, #F8F9FF 50%)", border: "#64748B" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className="p-4 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: theme === t.id ? "#0C0C22" : "#111128",
                          border: theme === t.id ? `2px solid ${t.border}` : "1px solid #1A1A38",
                          color: theme === t.id ? "#818CF8" : "#64748B",
                        }}
                      >
                        <div
                          className="w-full h-12 rounded-lg mb-2"
                          style={{ background: t.bg, border: "1px solid #1A1A38" }}
                        />
                        {t.label}
                        {theme === t.id && (
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ background: "#6366F1" }} />
                            <span className="text-xs" style={{ color: "#6366F1" }}>Active</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#475569" }}>ACCENT COLOR</div>
                  <div className="flex gap-3">
                    {[
                      ["#6366F1", "Indigo"],
                      ["#8B5CF6", "Purple"],
                      ["#06B6D4", "Cyan"],
                      ["#10B981", "Emerald"],
                      ["#F59E0B", "Amber"],
                    ].map(([color, name]) => (
                      <button
                        key={color}
                        title={name}
                        onClick={() => setAccentColor(color)}
                        className="w-8 h-8 rounded-full transition-all hover:scale-110"
                        style={{
                          background: color,
                          boxShadow: accentColor === color ? `0 0 0 3px ${color}44` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#475569" }}>SIDEBAR</div>
                  <SettingRow label="Collapsed by default" desc="Start with sidebar in compact mode">
                    <Toggle enabled={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} />
                  </SettingRow>
                  <SettingRow label="Show activity indicators" desc="Display real-time AI activity in sidebar">
                    <Toggle enabled={activityIndicators} onToggle={() => setActivityIndicators(prev => !prev)} />
                  </SettingRow>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}