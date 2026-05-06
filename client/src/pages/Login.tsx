import { useState, useEffect, useRef } from "react";
import {useNavigate} from "react-router-dom";

/* ── Types ──────────────────────────────────────────────────────── */
interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  accent: string;
}

interface Stat {
  value: string;
  label: string;
}

/* ── Data ───────────────────────────────────────────────────────── */
const FEATURES: FeatureCard[] = [
  { icon: "👥", title: "Employee Directory",    description: "Centralized employee database with contact information, roles, and departments at your fingertips.", accent: "#3b82f6" },
  { icon: "🗓️", title: "Leave Management",      description: "Request, approve, and track leaves with automated balance calculations and smart workflows.",          accent: "#8b5cf6" },
  { icon: "💳", title: "Payroll Management",    description: "Automated payroll processing, tax calculations, and seamless salary disbursements.",                  accent: "#06b6d4" },
  { icon: "🎯", title: "Performance Tracking",  description: "Set goals, conduct reviews, and track employee performance metrics against real outcomes.",           accent: "#10b981" },
  { icon: "📊", title: "Analytics & Reports",   description: "Detailed insights into workforce metrics, trends, and organizational data to power decisions.",       accent: "#f59e0b" },
  { icon: "🔒", title: "Secure & Compliant",    description: "Enterprise-grade security with data encryption and full compliance standards built in.",              accent: "#ef4444" },
];

const STATS: Stat[] = [
  { value: "500+",  label: "Companies Trust Us" },
  { value: "50K+",  label: "Active Users" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "8+",    label: "Years Experience" },
];

const WHY_POINTS = [
  "Intuitive interface designed for HR professionals and employees alike",
  "Real-time notifications and updates across the entire organization",
  "Customizable workflows and multi-level approval chains",
  "24/7 customer support and continuously shipped improvements",
];

// const NAV_LINKS = ["Features", "About", "Contact"];

/* ── Hooks ──────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Sub-components ─────────────────────────────────────────────── */

function NavBar({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(10,18,35,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(59,130,246,0.12)" : "none",
      transition: "all 0.35s ease",
      padding: "0 32px",
    }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>💼</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif", letterSpacing: "-0.02em" }}>
            Talent<span style={{ color: "#60a5fa" }}>Hub</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          
          <button onClick={onSignIn}
            style={{ padding: "8px 22px", borderRadius: 10, border: "1.5px solid rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.22s", letterSpacing: "0.01em" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.3)"; e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.color = "#a5b4fc"; }}>
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection({ onSignIn }: { onSignIn: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "80px 24px 60px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Orb background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "12%",  left: "10%",  width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "30%",  right: "8%",  width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "30%",  width: 480, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)", filter: "blur(60px)" }} />
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.05 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#6366f1" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div style={{
        position: "relative", maxWidth: 820,
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        {/* Pill badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.08)", marginBottom: 28 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa", boxShadow: "0 0 6px #60a5fa" }} />
          <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.04em" }}>Enterprise HR Platform</span>
        </div>

        <h1 style={{
          margin: "0 0 20px", fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: "clamp(38px,6vw,68px)", lineHeight: 1.08, letterSpacing: "-0.03em",
          color: "#fff",
        }}>
          Streamline Your<br />
          <span style={{ backgroundImage: "linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            HR Operations
          </span>
        </h1>

        <p style={{ margin: "0 auto 40px", maxWidth: 580, fontSize: 18, color: "rgba(148,163,184,0.9)", lineHeight: 1.7, fontWeight: 400 }}>
          Manage employees, leave requests, payroll, and performance — all in one intuitive platform built for modern teams.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onSignIn}
            style={{ padding: "14px 34px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(99,102,241,0.4)", transition: "all 0.25s", letterSpacing: "-0.01em" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.4)"; }}>
            Get Started Free →
          </button>
        </div>
        {/* Trust bar */}
        <p style={{ marginTop: 52, fontSize: 12.5, color: "rgba(148,163,184,0.55)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
          Trusted by 500+ companies worldwide
        </p>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { ref, inView } = useInView();
  return (
    <section id="features" ref={ref} style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)" }} />
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64,
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase" }}>Platform Features</p>
          <h2 style={{ margin: "0 0 14px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,44px)", color: "#fff", letterSpacing: "-0.025em" }}>
            Everything you need, nothing you don't
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: "rgba(148,163,184,0.75)", maxWidth: 480, marginInline: "auto", lineHeight: 1.6 }}>
            A complete HR suite that scales with your organization
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <FeatureCardItem key={f.title} feature={f} delay={i * 80} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCardItem({ feature, delay, inView }: { feature: FeatureCard; delay: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "28px 26px", borderRadius: 16,
        background: hovered ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${feature.accent}40` : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.28s ease",
        transform: inView ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(24px)",
        opacity: inView ? 1 : 0,
        transitionDelay: `${delay}ms`,
        boxShadow: hovered ? `0 20px 48px rgba(0,0,0,0.3), 0 0 0 1px ${feature.accent}20` : "none",
        cursor: "default",
      }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${feature.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18, border: `1px solid ${feature.accent}30`, transition: "all 0.25s", transform: hovered ? "scale(1.08)" : "scale(1)" }}>
        {feature.icon}
      </div>
      <h3 style={{ margin: "0 0 10px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: "-0.01em" }}>{feature.title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.75)", lineHeight: 1.65 }}>{feature.description}</p>
    </div>
  );
}

function AboutSection() {
  const { ref, inView } = useInView();
  return (
    <section id="about" ref={ref} style={{ padding: "100px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.25),transparent)" }} />
      <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 60, alignItems: "center" }}>

        {/* Left */}
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-24px)", transition: "all 0.65s ease" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase" }}>Why TalentHub</p>
          <h2 style={{ margin: "0 0 30px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(26px,3.5vw,40px)", color: "#fff", lineHeight: 1.15, letterSpacing: "-0.025em" }}>
            Built for teams that move fast
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {WHY_POINTS.map((pt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12,
                opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-12px)",
                transition: `all 0.5s ease ${200 + i * 90}ms` }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0, marginTop: 1, boxShadow: "0 3px 10px rgba(99,102,241,0.35)" }}>✓</div>
                <p style={{ margin: 0, fontSize: 15, color: "rgba(203,213,225,0.85)", lineHeight: 1.6 }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — stats grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(24px)",
          transition: "all 0.65s ease 0.12s"
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "30px 24px", borderRadius: 16, textAlign: "center",
              background: i % 2 === 0 ? "rgba(59,130,246,0.08)" : "rgba(99,102,241,0.08)",
              border: `1px solid ${i % 2 === 0 ? "rgba(59,130,246,0.2)" : "rgba(99,102,241,0.2)"}`,
              transition: "transform 0.25s, box-shadow 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              <p style={{ margin: "0 0 6px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 38, backgroundImage: i%2===0?"linear-gradient(135deg,#60a5fa,#93c5fd)":"linear-gradient(135deg,#a78bfa,#c4b5fd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.8)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ onSignIn }: { onSignIn: () => void }) {
  const { ref, inView } = useInView();
  return (
    <section id="contact" ref={ref} style={{ padding: "100px 24px", textAlign: "center", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.25),transparent)" }} />
      {/* Glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div ref={ref} style={{ position: "relative", maxWidth: 640, margin: "0 auto",
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.65s ease" }}>
        <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase" }}>Get Started</p>
        <h2 style={{ margin: "0 0 16px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,46px)", color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          Ready to transform<br />your HR?
        </h2>
        <p style={{ margin: "0 0 40px", fontSize: 17, color: "rgba(148,163,184,0.75)", lineHeight: 1.65 }}>
          Join hundreds of companies streamlining their HR operations with TalentHub.
        </p>
        <button onClick={onSignIn}
          style={{ padding: "16px 40px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1,#8b5cf6)", color: "#fff", fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 10px 32px rgba(99,102,241,0.4)", transition: "all 0.25s", letterSpacing: "-0.01em" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 18px 44px rgba(99,102,241,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(99,102,241,0.4)"; }}>
          Start Your Free Trial →
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "60px 24px 36px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💼</div>
              <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif" }}>Talent<span style={{ color: "#60a5fa" }}>Hub</span></span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: "rgba(148,163,184,0.65)", lineHeight: 1.65 }}>Your complete HR management solution for modern teams.</p>
          </div>

          {/* Links */}
          {[
            { title: "Product",  links: ["Features", "Pricing", "Security"] },
            { title: "Company",  links: ["About", "Blog", "Careers"] },
            { title: "Legal",    links: ["Privacy", "Terms", "Contact"] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>{col.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 14, color: "rgba(148,163,184,0.65)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(148,163,184,0.65)")}>
                    {l}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(148,163,184,0.45)" }}>© 2025 TalentHub HR. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "rgba(148,163,184,0.45)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Sign-In Modal ───────────────────────────────────────────────── */
type ModalStep = "idle" | "loading" | "success";

function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail]   = useState("");
  const [password, setPassword]   = useState("");
  const [step, setStep]     = useState<ModalStep>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate=useNavigate();

  useEffect(() => {
    if (open) { setStep("idle"); setEmail(""); setTimeout(() => inputRef.current?.focus(), 120); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(`${email}+${password}`);
    if(!email.trim()||!password.trim()) return;
    setStep("loading");
    const response = await fetch("http://localhost:8080/employees/login",{
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({email,password}),
    })
    console.log(response);
    if(response.status===200){
        const empData=await response.json();
        setStep("success");
        if(empData.employee.role=="ADMIN"){
            navigate('/dashboard');
        }else{
            navigate(`/employee/${empData.employee.employeeID}`);
        }

    }
    await new Promise(r => setTimeout(r, 1200));
    setTimeout(() => onClose(), 2800);
  };

  if (!open) return null;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(5,10,25,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 22, background: "rgba(15,23,42,0.98)", border: "1px solid rgba(99,102,241,0.22)", padding: "36px 32px", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)", animation: "modalIn 0.25s ease" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>💼</div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc", fontFamily: "'Sora',sans-serif" }}>TalentHub</span>
            </div>
            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "-0.02em" }}>Welcome back</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "rgba(148,163,184,0.65)" }}>Sign in to your HR portal</p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "rgba(255,255,255,0.06)", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", color: "rgba(255,255,255,0.5)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
            ✕
          </button>
        </div>

        {step === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 18px", boxShadow: "0 0 30px rgba(16,185,129,0.15)" }}>✅</div>
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>Check your inbox!</h3>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(148,163,184,0.7)" }}>We've sent a sign-in link to<br /><strong style={{ color: "#a5b4fc" }}>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(148,163,184,0.8)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
              <input
                ref={inputRef}
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your.email@company.com"
                required disabled={step === "loading"}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 11, border: "1.5px solid rgba(99,102,241,0.22)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14.5, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")}
                onBlur={e => (e.target.style.borderColor = "rgba(99,102,241,0.22)")}
              />
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(148,163,184,0.8)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Password</label>
              <input
                ref={inputRef}
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="your password"
                required disabled={step === "loading"}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 11, border: "1.5px solid rgba(99,102,241,0.22)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14.5, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => (e.target.style.borderColor = "#6366f1")}
                onBlur={e => (e.target.style.borderColor = "rgba(99,102,241,0.22)")}
              />
            </div>

            <button type="submit" disabled={step === "loading" || !email.trim()}
              style={{ padding: "13px 0", borderRadius: 11, border: "none", background: step === "loading" ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: step === "loading" ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.22s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {step === "loading" ? (
                <>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Sending link…
                </>
              ) : "Sign In with Email"}
            </button>

            <div style={{ position: "relative", margin: "4px 0" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}><div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} /></div>
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}><span style={{ padding: "0 12px", background: "rgba(15,23,42,0.98)", fontSize: 12.5, color: "rgba(148,163,184,0.45)" }}>or</span></div>
            </div>

            <button type="button"
              style={{ padding: "12px 0", borderRadius: 11, border: "1.5px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}>
              🧪 Continue with Demo Account
            </button>

            <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: "rgba(148,163,184,0.5)" }}>
              Don't have an account?{" "}
              <a href="#" style={{ color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>Request access</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Root ───────────────────────────────────────────────────────── */
export default function HRPortal() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#050d1a 0%,#0a1628 40%,#0d1f3c 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        ::selection { background: rgba(99,102,241,0.35); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      <NavBar onSignIn={() => setModalOpen(true)} />
      <HeroSection onSignIn={() => setModalOpen(true)} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection onSignIn={() => setModalOpen(true)} />
      <Footer />

      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}