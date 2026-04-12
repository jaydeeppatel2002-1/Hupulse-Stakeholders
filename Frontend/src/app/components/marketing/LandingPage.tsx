import { useNavigate } from "react-router";
import {
  Zap,
  ArrowRight,
  Users,
  Brain,
  BarChart3,
  Network,
  Shield,
  Star,
  Check,
  ChevronRight,
  Globe,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Play,
  Twitter,
  Linkedin,
  Github,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const HERO_IMG = "https://images.unsplash.com/photo-1664854953181-b12e6dda8b7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG5ldHdvcmslMjBub2RlcyUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwZGFya3xlbnwxfHx8fDE3NzQzMzA1MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const DASHBOARD_IMG = "https://images.unsplash.com/photo-1679485205984-4ce35c32b2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMGFuYWx5dGljcyUyMGRhc2hib2FyZCUyMGZ1dHVyaXN0aWMlMjBibHVlfGVufDF8fHx8MTc3NDMzMDUxNXww&ixlib=rb-4.1.0&q=80&w=1080";
const TEAM_IMG = "https://images.unsplash.com/photo-1758519288948-e3c87d2d78d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnByaXNlJTIwdGVhbSUyMGNvbGxhYm9yYXRpb24lMjBtZWV0aW5nJTIwbW9kZXJufGVufDF8fHx8MTc3NDMzMDUxM3ww&ixlib=rb-4.1.0&q=80&w=1080";

const features = [
  {
    icon: Brain,
    title: "AI-Driven Stakeholder Intelligence",
    desc: "Our AI engine continuously analyzes stakeholder behavior, communication patterns, and sentiment to surface actionable insights before issues escalate.",
    color: "#6366F1",
    tag: "AI-Native",
  },
  {
    icon: Network,
    title: "Influence Mapping & Network Analysis",
    desc: "Visualize complex stakeholder relationships with our dynamic influence network. Identify key connectors, power brokers, and hidden influencers instantly.",
    color: "#8B5CF6",
    tag: "Visual Analytics",
  },
  {
    icon: BarChart3,
    title: "Real-Time Sentiment Tracking",
    desc: "Monitor stakeholder sentiment across every touchpoint — emails, meetings, surveys — with automated scoring that keeps your finger on the pulse.",
    color: "#06B6D4",
    tag: "Sentiment AI",
  },
  {
    icon: MessageSquare,
    title: "Unified Communication Hub",
    desc: "Consolidate all stakeholder interactions in one timeline. Log meetings, emails, and calls with automatic AI tagging and follow-up suggestions.",
    color: "#10B981",
    tag: "CRM + Comms",
  },
  {
    icon: Shield,
    title: "Risk Scoring & Early Warning",
    desc: "Never be blindsided. HuPulse identifies at-risk stakeholders 30 days before traditional methods — powered by predictive ML models.",
    color: "#F59E0B",
    tag: "Predictive",
  },
  {
    icon: Globe,
    title: "Engagement Planning Engine",
    desc: "Build structured engagement plans with templated workflows, automated reminders, and stakeholder-specific communication strategies.",
    color: "#EC4899",
    tag: "Planning",
  },
];

const stats = [
  { value: "2.4×", label: "Faster stakeholder alignment" },
  { value: "89%", label: "Reduction in engagement risks" },
  { value: "340+", label: "Enterprise clients" },
  { value: "$2.1B", label: "Projects managed" },
];

const testimonials = [
  {
    quote: "HuPulse transformed how we manage change. We now predict stakeholder resistance 6 weeks in advance.",
    name: "Sarah Mitchell",
    title: "VP of Change Management, Accenture",
    avatar: "SM",
    rating: 5,
  },
  {
    quote: "The influence network visualization alone saved us 3 months of stakeholder mapping work. Incredible product.",
    name: "James Park",
    title: "Director of Strategy, McKinsey",
    avatar: "JP",
    rating: 5,
  },
  {
    quote: "Finally, a platform that speaks the language of stakeholder management. The AI insights are eerily accurate.",
    name: "Elena Rodriguez",
    title: "Chief Transformation Officer, Deloitte",
    avatar: "ER",
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
    period: "per user / month",
    desc: "Perfect for small teams beginning their stakeholder journey.",
    features: [
      "Up to 50 stakeholders",
      "Basic sentiment tracking",
      "Communication timeline",
      "Standard reports",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
    color: "#6366F1",
  },
  {
    name: "Professional",
    price: 149,
    period: "per user / month",
    desc: "For growing organizations with complex stakeholder ecosystems.",
    features: [
      "Unlimited stakeholders",
      "AI sentiment analysis",
      "Influence network mapping",
      "Power-Interest matrix",
      "Survey & feedback module",
      "LMS & learning paths",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
    color: "#8B5CF6",
  },
  {
    name: "Enterprise",
    price: null,
    period: "custom pricing",
    desc: "For large enterprises with mission-critical stakeholder programs.",
    features: [
      "Everything in Professional",
      "Dedicated AI model tuning",
      "Custom integrations (Salesforce, SAP)",
      "RACI automation",
      "SSO & advanced security",
      "Dedicated CSM",
      "SLA guarantee",
    ],
    cta: "Book a Demo",
    popular: false,
    color: "#06B6D4",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ background: "#07071A", color: "#E2E8F0", fontFamily: "Inter, sans-serif" }}>
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ background: "rgba(7, 7, 26, 0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">HuPulse</span>
          <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>Stakeholder</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm transition-colors" style={{ color: "#94A3B8" }}>Features</a>
          <a href="#pricing" className="text-sm transition-colors" style={{ color: "#94A3B8" }}>Pricing</a>
          <a href="#testimonials" className="text-sm transition-colors" style={{ color: "#94A3B8" }}>Customers</a>
          <a href="#about" className="text-sm transition-colors" style={{ color: "#94A3B8" }}>About</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/app/dashboard")}
            className="text-sm px-4 py-2 rounded-lg transition-colors"
            style={{ color: "#94A3B8" }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/app/dashboard")}
            className="text-sm px-4 py-2 rounded-lg font-medium text-white transition-all"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Get Started Free
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: "#94A3B8" }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 p-6 space-y-4"
          style={{ background: "#0C0C22", borderBottom: "1px solid #1A1A38" }}
        >
          <a href="#features" className="block text-sm" style={{ color: "#94A3B8" }}>Features</a>
          <a href="#pricing" className="block text-sm" style={{ color: "#94A3B8" }}>Pricing</a>
          <a href="#testimonials" className="block text-sm" style={{ color: "#94A3B8" }}>Customers</a>
          <button
            onClick={() => navigate("/app/dashboard")}
            className="w-full text-sm px-4 py-2.5 rounded-lg font-medium text-white"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            Get Started Free
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse, #8B5CF6 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <Sparkles size={14} style={{ color: "#818CF8" }} />
              <span className="text-sm" style={{ color: "#A78BFA" }}>AI-powered stakeholder management platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight" style={{ letterSpacing: "-0.03em" }}>
              Stop Reading{" "}
              <span style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dashboards.
              </span>
              <br />
              Start Getting{" "}
              <span style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Answers.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "#94A3B8", lineHeight: 1.7 }}>
              HuPulse Stakeholder replaces legacy spreadsheets and disconnected tools with an AI-native platform that gives you real-time stakeholder intelligence, influence mapping, and predictive engagement insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/app/dashboard")}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}
              >
                Start Free Trial <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0" }}
              >
                <Play size={16} /> Watch Demo
              </button>
            </div>

            <p className="mt-4 text-sm" style={{ color: "#475569" }}>
              No credit card required · 14-day free trial · Setup in 5 minutes
            </p>
          </div>

          {/* Hero visual */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(99,102,241,0.2)",
              boxShadow: "0 0 80px rgba(99,102,241,0.15), 0 40px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 z-10" style={{ background: "linear-gradient(to top, #07071A, transparent)" }} />
            <img
              src={HERO_IMG}
              alt="HuPulse Stakeholder Platform"
              className="w-full object-cover"
              style={{ height: "480px", objectPosition: "center" }}
            />
            {/* Overlay with mock UI elements */}
            <div className="absolute inset-0 z-5" style={{ background: "rgba(7,7,26,0.4)" }} />
            {/* Floating stats cards */}
            <div
              className="absolute top-6 left-6 z-20 px-4 py-3 rounded-xl"
              style={{ background: "rgba(12,12,34,0.9)", border: "1px solid rgba(99,102,241,0.3)", backdropFilter: "blur(12px)" }}
            >
              <div className="text-xs mb-1" style={{ color: "#64748B" }}>Engagement Score</div>
              <div className="text-2xl font-bold" style={{ color: "#818CF8" }}>87.4</div>
              <div className="text-xs" style={{ color: "#10B981" }}>↑ 12% this week</div>
            </div>
            <div
              className="absolute top-6 right-6 z-20 px-4 py-3 rounded-xl"
              style={{ background: "rgba(12,12,34,0.9)", border: "1px solid rgba(139,92,246,0.3)", backdropFilter: "blur(12px)" }}
            >
              <div className="text-xs mb-1" style={{ color: "#64748B" }}>AI Insights Active</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#8B5CF6" }} />
                <span className="text-sm font-semibold text-white">24 new alerts</span>
              </div>
            </div>
            <div
              className="absolute bottom-8 left-6 z-20 px-4 py-3 rounded-xl"
              style={{ background: "rgba(12,12,34,0.9)", border: "1px solid rgba(6,182,212,0.3)", backdropFilter: "blur(12px)" }}
            >
              <div className="text-xs mb-1" style={{ color: "#64748B" }}>High Risk Stakeholders</div>
              <div className="text-2xl font-bold" style={{ color: "#EF4444" }}>3</div>
              <div className="text-xs" style={{ color: "#94A3B8" }}>Requires attention</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 md:px-12" style={{ borderTop: "1px solid #1A1A38", borderBottom: "1px solid #1A1A38" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "#64748B" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <span className="text-xs" style={{ color: "#818CF8" }}>Platform Capabilities</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need for</h2>
            <h2 className="text-4xl font-bold mb-4" style={{ background: "linear-gradient(135deg, #6366F1, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              stakeholder mastery
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#64748B" }}>
              HuPulse Stakeholder is the only platform that combines stakeholder analysis, AI intelligence, and engagement planning in one unified system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{
                  background: "#0C0C22",
                  border: "1px solid #1A1A38",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}
                  >
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full mt-1" style={{ background: `${f.color}15`, color: f.color }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-white font-semibold mb-2 text-base">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: f.color }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-24 px-6 md:px-12" style={{ background: "#0A0A1E" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <span className="text-xs" style={{ color: "#06B6D4" }}>Stakeholder Management Software</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-6" style={{ lineHeight: 1.2 }}>
                Your complete stakeholder analysis platform
              </h2>
              <p className="mb-8" style={{ color: "#64748B", lineHeight: 1.7 }}>
                From power-interest matrices to real-time influence networks, HuPulse Stakeholder gives your team a 360° view of every stakeholder relationship — powered by AI that learns your organization's unique dynamics.
              </p>
              <div className="space-y-4">
                {[
                  "Power-Interest Matrix with live stakeholder positioning",
                  "AI-generated engagement strategies per stakeholder",
                  "Change management tools built for enterprise scale",
                  "RACI matrix with automated responsibility tracking",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(16,185,129,0.2)" }}>
                      <Check size={12} style={{ color: "#10B981" }} />
                    </div>
                    <span className="text-sm" style={{ color: "#94A3B8" }}>{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/app/dashboard")}
                className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                Explore the Platform <ArrowRight size={16} />
              </button>
            </div>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(99,102,241,0.2)", boxShadow: "0 0 60px rgba(99,102,241,0.1)" }}
            >
              <img src={DASHBOARD_IMG} alt="HuPulse Dashboard" className="w-full object-cover" style={{ height: "400px" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by the world's</h2>
            <h2 className="text-4xl font-bold mb-4" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              top change leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl"
                style={{ background: "#0C0C22", border: "1px solid #1A1A38" }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                  ))}
                </div>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#94A3B8" }}>
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "white" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: "#64748B" }}>{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 md:px-12" style={{ background: "#0A0A1E" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <span className="text-xs" style={{ color: "#818CF8" }}>Simple, transparent pricing</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Invest in stakeholder excellence</h2>
            <p className="text-lg" style={{ color: "#64748B" }}>Start free. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: plan.popular ? "linear-gradient(135deg, #0D0D28, #111130)" : "#0C0C22",
                  border: plan.popular ? `1px solid ${plan.color}50` : "1px solid #1A1A38",
                  boxShadow: plan.popular ? `0 0 40px ${plan.color}20` : "none",
                }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${plan.color}, #6366F1)` }}
                  >
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="text-sm font-semibold mb-1" style={{ color: plan.color }}>{plan.name}</div>
                  <div className="flex items-end gap-2 mb-2">
                    {plan.price ? (
                      <>
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-sm mb-1" style={{ color: "#64748B" }}>{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-white">Custom</span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "#64748B" }}>{plan.desc}</p>
                </div>

                <button
                  onClick={() => navigate("/app/dashboard")}
                  className="w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all"
                  style={
                    plan.popular
                      ? { background: `linear-gradient(135deg, ${plan.color}, #6366F1)`, color: "white" }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0" }
                  }
                >
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${plan.color}20` }}
                      >
                        <Check size={10} style={{ color: plan.color }} />
                      </div>
                      <span className="text-sm" style={{ color: "#94A3B8" }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="p-12 rounded-3xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0D0D28, #111130)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at center, #6366F1 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to transform your stakeholder management?
              </h2>
              <p className="text-lg mb-8" style={{ color: "#94A3B8" }}>
                Join 340+ enterprise teams using HuPulse Stakeholder to drive alignment and manage change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/app/dashboard")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
                >
                  Start Free Trial <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/app/dashboard")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0" }}
                >
                  Book a Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12" style={{ borderTop: "1px solid #1A1A38" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
                  <Zap size={16} className="text-white" />
                </div>
                <span className="font-bold text-white">HuPulse</span>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748B" }}>
                The AI-native stakeholder management platform for enterprise change leaders.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#111128", color: "#64748B" }}><Twitter size={14} /></a>
                <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#111128", color: "#64748B" }}><Linkedin size={14} /></a>
                <a href="#" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "#111128", color: "#64748B" }}><Github size={14} /></a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-4">Product</div>
              <div className="space-y-3">
                {["Features", "Pricing", "Changelog", "Roadmap", "API Docs"].map(link => (
                  <a key={link} href="#" className="block text-sm" style={{ color: "#64748B" }}>{link}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-4">Company</div>
              <div className="space-y-3">
                {["About", "Blog", "Careers", "Press", "Contact"].map(link => (
                  <a key={link} href="#" className="block text-sm" style={{ color: "#64748B" }}>{link}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-4">Legal</div>
              <div className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Security", "GDPR", "SOC 2"].map(link => (
                  <a key={link} href="#" className="block text-sm" style={{ color: "#64748B" }}>{link}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8" style={{ borderTop: "1px solid #1A1A38" }}>
            <p className="text-sm" style={{ color: "#475569" }}>© 2026 HuPulse Technologies. All rights reserved.</p>
            <p className="text-sm mt-2 md:mt-0" style={{ color: "#475569" }}>Stakeholder Management Software · Change Management Tools · Stakeholder Analysis Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
