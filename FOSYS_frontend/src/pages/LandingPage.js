import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  GitPullRequest,
  Shield,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * LandingPage (Glow 2 - Medium Glow + Animated Border)
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const parallaxRef = useRef(null);

  // Mouse parallax for background orb
  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="min-h-screen bg-landing-dark text-slate-100 antialiased">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/30 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.jpg"
              alt="FOSYS"
              className="h-10 w-10 rounded-lg ring-1 ring-slate-700/40"
            />
            <span className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "Work Sans" }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400">
                FOSYS
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-6 text-slate-300">
              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white">Features</button>
              <button onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white">How It Works</button>
              <button onClick={() => document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-white">Impact</button>
            </nav>

            <Button onClick={() => navigate("/login")} className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">
              Sign In
            </Button>

            <button onClick={() => navigate("/signup")} className="md:hidden bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6">
          {/* LEFT: Text */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight" style={{ fontFamily: "Work Sans" }}>
              <span className="block text-white">AI-Powered Workspace</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Management Platform for engineers & teams
              </span>
            </h1>

            <p className="text-slate-300 text-lg max-w-xl">
              Streamline your workflow with intelligent meeting transcription, auto-created tasks, and real-time PR validation — powered by the latest AI models.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={() => navigate("/signup")} className="cta-primary">
                Get Started <ArrowRight className="ml-2 w-5 h-5 inline-block" />
              </Button>

              <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-slate-300 hover:text-white flex items-center gap-2">
                Learn more <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-3">
              <span className="badge">Realtime PR validation</span>
              <span className="badge">Auto task extraction</span>
              <span className="badge">Role-based dashboards</span>
            </div>
          </div>

          {/* RIGHT: Feature Cards + Effects */}
          <div className="relative">
            {/* Parallax neon orb */}
            <div ref={parallaxRef} className="orb absolute -right-8 -top-10 w-72 h-72 rounded-full opacity-50 pointer-events-none"></div>

            {/* cards stack */}
            <div className="space-y-6">
              <NeonCard
                icon={<Bot className="w-6 h-6 text-white" />}
                title="Smart Scrum Transcription"
                desc="Transcribe meetings and auto-generate tasks with assignees & deadlines."
              />
              <NeonCard
                icon={<GitPullRequest className="w-6 h-6 text-white" />}
                title="Real-Time PR Validation"
                desc="Automated checks and live feedback for each pull request."
              />
              <NeonCard
                icon={<Shield className="w-6 h-6 text-white" />}
                title="Role-Based Dashboards"
                desc="Personalized views for interns, engineers, managers, and admins."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center" style={{ fontFamily: "Work Sans" }}>
            Core Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bot className="w-8 h-8 text-cyan-300" />}
              title="Smart Scrum Transcription"
              desc="Automatically transcribe meetings and extract action items for instant task creation."
            />
            <FeatureCard
              icon={<GitPullRequest className="w-8 h-8 text-emerald-300" />}
              title="Real-Time PR Validation"
              desc="Live peer review tracking via WebSockets for faster, transparent development."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-violet-300" />}
              title="Role-Based Dashboards"
              desc="Personalized dashboards with secure role-based access."
            />
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="py-16 px-6 bg-gradient-to-br from-slate-900/20 to-slate-900/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <Step number={1} title="Capture Meetings" desc="AI transcribes & identifies action items" color="bg-blue-600" />
            <Step number={2} title="Auto-Assign Tasks" desc="Tasks mapped to responsible employees" color="bg-emerald-500" />
            <Step number={3} title="Validate PRs" desc="GitHub events update dashboard in real time" color="bg-violet-500" />
            <Step number={4} title="Track & Optimize" desc="Monitor team-wide progress and optimize" color="bg-amber-500" />
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Impact & Outcomes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ImpactCard color="from-blue-600 to-blue-500" icon={<TrendingUp className="w-10 h-10 text-blue-200" />} value="40%" label="Faster Delivery" />
            <ImpactCard color="from-emerald-500 to-emerald-400" icon={<Zap className="w-10 h-10 text-emerald-200" />} value="60%" label="Reduction in Manual Effort" />
            <ImpactCard color="from-violet-500 to-violet-400" icon={<Target className="w-10 h-10 text-violet-200" />} value="100%" label="Transparency Across Teams" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-800/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 mb-2">AI Workspace © {new Date().getFullYear()}</p>
          <p className="text-slate-500 text-sm">Inspired by the intelligence of AI and the precision of engineering.</p>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  );
};

/* ---------------- Subcomponents ---------------- */

const NeonCard = ({ icon, title, desc }) => {
  return (
    <div className="neon-card group">
      <div className="icon-wrap">
        <div className="icon-gradient">{icon}</div>
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <p className="text-slate-300 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="feature-card">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-tr from-cyan-600 to-blue-500/70">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-slate-300 text-sm mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

const Step = ({ number, title, desc, color }) => (
  <div className="text-center">
    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${color} text-white font-bold mb-4 shadow-lg`}>
      {number}
    </div>
    <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
    <p className="text-slate-300 text-sm">{desc}</p>
  </div>
);

const ImpactCard = ({ color, icon, value, label }) => (
  <div className={`p-6 rounded-2xl bg-gradient-to-br ${color}/10 border border-slate-700/30 text-center`}>
    <div className="mx-auto w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-3xl font-bold text-white">{value}</h3>
    <p className="text-slate-300 mt-2">{label}</p>
  </div>
);

const FloatingCTA = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
      <button onClick={() => navigate("/signup")} className="floating-cta">
        <span className="font-semibold">Start Free</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <button onClick={() => navigate("/help")} className="help-btn" aria-label="Help">?</button>
    </div>
  );
};

export default LandingPage;
