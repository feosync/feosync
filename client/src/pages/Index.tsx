import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────
   FEOSYNC — Landing Page
   Charte : Midnight Navy · Teal Jade · Or Malgache
   Police : DM Serif Display + DM Sans
───────────────────────────────────────────────── */

const COLORS = {
  navy:      "#0B1D3A",
  navyMid:   "#1A3A6B",
  navyLight: "#1E3A5F",
  teal:      "#00B4A2",
  tealDark:  "#007A6D",
  tealLight: "#E0F5F3",
  gold:      "#E8A020",
  goldLight: "#FEF3DC",
  ruby:      "#E53E3E",
  slate:     "#94A3B8",
  snow:      "#FFFFFF",
  cloud:     "#F1F5F9",
  pearl:     "#EFF6FF",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: ${COLORS.navy}; color: ${COLORS.snow}; overflow-x: hidden; }
  
  ::selection { background: ${COLORS.teal}40; color: ${COLORS.snow}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.navy}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.teal}; border-radius: 3px; }

  .serif { font-family: 'DM Serif Display', serif; }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes wave {
    0% { d: path("M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"); }
    50% { d: path("M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"); }
    100% { d: path("M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
  }
  @keyframes orbit2 {
    from { transform: rotate(120deg) translateX(70px) rotate(-120deg); }
    to   { transform: rotate(480deg) translateX(70px) rotate(-480deg); }
  }
  @keyframes orbit3 {
    from { transform: rotate(240deg) translateX(110px) rotate(-240deg); }
    to   { transform: rotate(600deg) translateX(110px) rotate(-600deg); }
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px ${COLORS.teal}40, 0 0 60px ${COLORS.teal}20; }
    50% { box-shadow: 0 0 40px ${COLORS.teal}60, 0 0 100px ${COLORS.teal}30; }
  }
  @keyframes count-up {
    from { opacity: 0; transform: scale(0.5); }
    to   { opacity: 1; transform: scale(1); }
  }

  .anim-fade-up { animation: fadeUp 0.7s ease both; }
  .anim-fade-up-d1 { animation: fadeUp 0.7s 0.1s ease both; }
  .anim-fade-up-d2 { animation: fadeUp 0.7s 0.2s ease both; }
  .anim-fade-up-d3 { animation: fadeUp 0.7s 0.35s ease both; }
  .anim-fade-up-d4 { animation: fadeUp 0.7s 0.5s ease both; }
  .anim-fade-in   { animation: fadeIn 1s ease both; }
  
  .float-1 { animation: float 4s ease-in-out infinite; }
  .float-2 { animation: float 5s 0.8s ease-in-out infinite; }
  .float-3 { animation: float 6s 1.6s ease-in-out infinite; }

  .nav-link {
    color: ${COLORS.slate};
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
    cursor: pointer;
  }
  .nav-link:hover { color: ${COLORS.snow}; }

  .btn-primary {
    background: ${COLORS.teal};
    color: ${COLORS.navy};
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .btn-primary:hover {
    background: #00CDB8;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px ${COLORS.teal}50;
  }
  .btn-outline {
    background: transparent;
    color: ${COLORS.snow};
    border: 1.5px solid rgba(255,255,255,0.25);
    padding: 13px 26px;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-outline:hover {
    border-color: ${COLORS.teal};
    color: ${COLORS.teal};
  }

  .feature-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 32px;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }
  .feature-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, ${COLORS.teal}08, transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .feature-card:hover {
    border-color: ${COLORS.teal}50;
    transform: translateY(-4px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .feature-card:hover::before { opacity: 1; }

  .plan-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    padding: 36px 32px;
    transition: all 0.3s;
    position: relative;
  }
  .plan-card.featured {
    background: linear-gradient(145deg, ${COLORS.navyLight}, rgba(0,180,162,0.12));
    border: 1.5px solid ${COLORS.teal}70;
    animation: glow-pulse 3s ease-in-out infinite;
  }
  .plan-card:not(.featured):hover {
    border-color: rgba(255,255,255,0.2);
    transform: translateY(-4px);
  }

  .step-connector {
    position: absolute;
    top: 32px;
    left: calc(50% + 48px);
    width: calc(100% - 96px);
    height: 1px;
    background: linear-gradient(to right, ${COLORS.teal}60, ${COLORS.teal}20);
  }

  .testimonial-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 28px;
    transition: all 0.3s;
  }
  .testimonial-card:hover {
    border-color: ${COLORS.gold}40;
    background: rgba(232,160,32,0.04);
  }

  .faq-item {
    border-bottom: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
  }
  .faq-item:hover .faq-q { color: ${COLORS.teal}; }

  .ticker-track {
    display: flex;
    animation: ticker 30s linear infinite;
    gap: 0;
  }
  .ticker-track:hover { animation-play-state: paused; }

  .grid-bg {
    background-image: 
      linear-gradient(rgba(0,180,162,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,180,162,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .noise-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  input, textarea {
    font-family: 'DM Sans', sans-serif;
  }

  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .hero-grid { grid-template-columns: 1fr !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .plans-grid { grid-template-columns: 1fr !important; }
    .steps-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .footer-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── Icons (inline SVG) ───────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    zap:       <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    brain:     <><path d="M12 2a6 6 0 0 1 6 6c0 1.5-.5 2.9-1.4 4L18 21H6l1.4-9A6 6 0 0 1 12 2z"/><path d="M12 8v4"/><path d="M12 16h.01"/></>,
    chart:     <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    message:   <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    shield:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    star:      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    arrow:     <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    menu:      <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
    fb:        <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></>,
    whatsapp:  <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    users:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    trending:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    play:      <><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></>,
    globe:     <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    plus:      <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:     <><line x1="5" y1="12" x2="19" y2="12"/></>,
    chev_down: <><polyline points="6 9 12 15 18 9"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ── Animated Sync Orb (Hero visual) ─────────────────────
const SyncOrb = () => (
  <div style={{ position: "relative", width: 380, height: 380, margin: "0 auto" }}>
    <div style={{
      position: "absolute", inset: "10%", borderRadius: "50%",
      background: `radial-gradient(circle, ${COLORS.teal}15 0%, transparent 70%)`,
      animation: "pulse-ring 3s ease-out infinite",
    }} />
    <div style={{
      position: "absolute", inset: "8%", borderRadius: "50%",
      border: `1px solid ${COLORS.teal}20`,
    }} />
    <div style={{
      position: "absolute", inset: "18%", borderRadius: "50%",
      border: `1px solid ${COLORS.teal}35`,
    }} />
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: 90, height: 90, borderRadius: "50%",
      background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
      boxShadow: `0 0 40px ${COLORS.teal}60`,
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "float 4s ease-in-out infinite",
    }}>
      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 700, color: COLORS.snow }}>FS</span>
    </div>
    {[
      { icon: "fb",       color: "#1877F2", size: 44, anim: "orbit 8s linear infinite" },
      { icon: "whatsapp", color: "#25D366", size: 40, anim: "orbit2 6s linear infinite" },
      { icon: "brain",    color: COLORS.gold, size: 40, anim: "orbit3 10s linear infinite" },
    ].map((o, i) => (
      <div key={i} style={{
        position: "absolute", top: "50%", left: "50%",
        width: o.size, height: o.size,
        marginLeft: -o.size/2, marginTop: -o.size/2,
        animation: o.anim,
      }}>
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: `${o.color}18`,
          border: `1.5px solid ${o.color}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}>
          <Icon name={o.icon} size={18} color={o.color} />
        </div>
      </div>
    ))}
    <div className="float-1" style={{
      position: "absolute", top: "5%", right: "0%",
      background: `linear-gradient(135deg, ${COLORS.navyMid}, #1a3a6b)`,
      border: `1px solid ${COLORS.teal}30`,
      borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontSize: 10, color: COLORS.slate, marginBottom: 2 }}>Posts publiés</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.teal }}>+12 400</div>
    </div>
    <div className="float-2" style={{
      position: "absolute", bottom: "12%", left: "-5%",
      background: `linear-gradient(135deg, ${COLORS.navyMid}, #1a3a6b)`,
      border: `1px solid ${COLORS.gold}30`,
      borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontSize: 10, color: COLORS.slate, marginBottom: 2 }}>Engagement moyen</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.gold }}>+340%</div>
    </div>
    <div className="float-3" style={{
      position: "absolute", bottom: "35%", right: "-8%",
      background: `linear-gradient(135deg, ${COLORS.navyMid}, #1a3a6b)`,
      border: `1px solid rgba(255,255,255,0.12)`,
      borderRadius: 12, padding: "10px 16px", backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontSize: 10, color: COLORS.slate, marginBottom: 2 }}>Temps économisé</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.snow }}>2h / jour</div>
    </div>
  </div>
);

// ── Dashboard Preview Card ───────────────────────────────
const DashboardPreview = () => (
  <div style={{
    background: `linear-gradient(145deg, ${COLORS.navyLight}, ${COLORS.navy})`,
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: 20, overflow: "hidden",
    boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,180,162,0.1)`,
    maxWidth: 680, margin: "0 auto",
  }}>
    <div style={{
      background: "rgba(0,0,0,0.3)", padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 8,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}>
      {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
      ))}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 6,
          padding: "4px 20px", fontSize: 12, color: COLORS.slate,
        }}>
          app.feosync.mg
        </div>
      </div>
    </div>

    <div style={{ display: "flex", height: 320 }}>
      <div style={{
        width: 56, borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 20, gap: 20,
      }}>
        {["zap","calendar","chart","message","users"].map((ic, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: i === 0 ? `${COLORS.teal}20` : "transparent",
            cursor: "pointer",
          }}>
            <Icon name={ic} size={16} color={i === 0 ? COLORS.teal : COLORS.slate} />
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: "20px 16px", overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: COLORS.slate, marginBottom: 14, fontWeight: 600, letterSpacing: 1 }}>
          TABLEAU DE BORD
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Posts ce mois", val: "47", trend: "+12%" },
            { label: "Portée totale", val: "23.4k", trend: "+34%" },
            { label: "Engagement", val: "8.2%", trend: "+5%" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 10,
              padding: "10px 12px",
              border: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{ fontSize: 9, color: COLORS.slate, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.snow }}>{s.val}</div>
              <div style={{ fontSize: 9, color: COLORS.teal, marginTop: 2 }}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: COLORS.slate, marginBottom: 8, fontWeight: 600 }}>
          PROCHAINES PUBLICATIONS
        </div>
        {[
          { time: "Demain 9h00", page: "Le Grill d'Ivandry", status: "IA prête", color: COLORS.teal },
          { time: "Demain 12h30", page: "Boutique Zara Tana", status: "En attente", color: COLORS.gold },
          { time: "Jeu 18h00", page: "Hotel Sakamanga", status: "Brouillon", color: COLORS.slate },
        ].map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 10px", borderRadius: 8,
            background: i === 0 ? "rgba(0,180,162,0.08)" : "rgba(255,255,255,0.02)",
            marginBottom: 4, border: `1px solid ${i === 0 ? COLORS.teal + "25" : "rgba(255,255,255,0.04)"}`,
          }}>
            <div>
              <div style={{ fontSize: 10, color: COLORS.snow, fontWeight: 500 }}>{p.page}</div>
              <div style={{ fontSize: 9, color: COLORS.slate }}>{p.time}</div>
            </div>
            <div style={{
              fontSize: 9, color: p.color, background: `${p.color}18`,
              padding: "3px 8px", borderRadius: 20, fontWeight: 600,
            }}>
              {p.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Counter hook ─────────────────────────────────────────
const useCounter = (end: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | undefined;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, end, duration]);
  return count;
};

// ── Navbar ───────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      padding: "0 32px",
      background: scrolled ? `${COLORS.navy}F0` : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid rgba(255,255,255,0.07)` : "none",
      transition: "all 0.4s",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 68,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 16px ${COLORS.teal}40`,
          }}>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, fontWeight: 700, color: COLORS.snow }}>F</span>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: COLORS.snow, fontWeight: 400 }}>
            Feo<span style={{ color: COLORS.teal }}>Sync</span>
          </span>
        </div>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Fonctionnalités", "Tarifs", "À propos", "Blog"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
          ))}
        </div>

        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-outline" style={{ padding: "9px 20px", fontSize: 14 }} onClick={() => navigate("/login")}>
            Se connecter
          </button>
          <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={() => navigate("/register")}>
            Essai gratuit 14j
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: COLORS.snow, cursor: "pointer", display: "none" }}
          className="show-mobile">
          <Icon name={menuOpen ? "x" : "menu"} />
        </button>
      </div>
    </nav>
  );
};

// ── Ticker Bar ───────────────────────────────────────────
const TickerBar = () => {
  const items = [
    "✦ Publication automatique 7j/7",
    "✦ Génération IA Gemini 2.0",
    "✦ Facebook + WhatsApp Business",
    "✦ Analytics temps réel",
    "✦ Calendrier éditorial",
    "✦ Templates sectoriels",
    "✦ Rapports hebdomadaires",
    "✦ Made in Madagascar",
  ];
  const doubled = [...items, ...items];

  return (
    <div style={{
      background: COLORS.teal,
      color: COLORS.navy,
      overflow: "hidden",
      padding: "10px 0",
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: 0.3,
    }}>
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span key={i} style={{ whiteSpace: "nowrap", padding: "0 32px" }}>{item}</span>
        ))}
      </div>
    </div>
  );
};

// ── FAQ Item ─────────────────────────────────────────────
const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0",
      }}>
        <span className="faq-q" style={{
          fontSize: 16, fontWeight: 500, color: COLORS.snow,
          transition: "color 0.2s", paddingRight: 20,
        }}>{q}</span>
        <div style={{
          minWidth: 28, height: 28, borderRadius: "50%",
          border: `1px solid rgba(255,255,255,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
          transform: open ? "rotate(45deg)" : "none",
          color: open ? COLORS.teal : COLORS.slate,
        }}>
          <Icon name="plus" size={14} color="currentColor" />
        </div>
      </div>
      <div style={{
        overflow: "hidden",
        maxHeight: open ? 200 : 0,
        transition: "max-height 0.4s ease",
      }}>
        <p style={{ fontSize: 15, color: COLORS.slate, lineHeight: 1.7, paddingBottom: 20 }}>{a}</p>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────
export default function Index() {
  const statsRef = useRef<HTMLElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const navigate = useNavigate();

  const clients = useCounter(500, 2500, statsVisible);
  const posts   = useCounter(50000, 2500, statsVisible);
  const time    = useCounter(2, 1500, statsVisible);
  const rate    = useCounter(98, 2000, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: "zap",      title: "Publication Automatique",      desc: "Schedulez vos posts avec des règles cron. FeoSync publie à votre place, 7j/7, sans intervention manuelle." },
    { icon: "brain",    title: "Génération IA (Gemini 2.0)",   desc: "Légendes percutantes, visuels 1080×1080 et hashtags générés automatiquement, adaptés à votre secteur." },
    { icon: "fb",       title: "Facebook + WhatsApp",           desc: "Gérez plusieurs Pages Facebook et diffusez simultanément sur vos listes WhatsApp Business." },
    { icon: "chart",    title: "Analytics Temps Réel",          desc: "Dashboard avec portée, engagement, meilleures heures de publication et rapports email hebdomadaires." },
    { icon: "star",     title: "Avis Clients Automatisés",      desc: "Importez et publiez automatiquement vos avis 5★ Google et Facebook pour booster votre réputation." },
    { icon: "shield",   title: "Sécurité Renforcée",            desc: "Tokens chiffrés AES-256-GCM, HTTPS obligatoire, conformité complète avec les politiques Meta." },
  ];

  const steps = [
    { num: "01", title: "Connectez votre Page", desc: "Liez votre Page Facebook en un clic via OAuth Meta sécurisé." },
    { num: "02", title: "Configurez vos règles", desc: "Définissez vos horaires, sources de contenu et templates graphiques." },
    { num: "03", title: "L'IA crée le contenu", desc: "Gemini 2.0 génère visuels et légendes adaptés à votre marque." },
    { num: "04", title: "Publiez & analysez", desc: "FeoSync publie automatiquement et mesure l'impact en temps réel." },
  ];

  const plans = [
    {
      name: "Starter",
      price: "29 149",
      eur: "~6,5 EUR",
      badge: "Idéal pour démarrer",
      color: "#4ADE80",
      features: ["2 Pages Facebook", "30 posts/mois", "10 générations IA", "Templates sectoriels", "Dashboard analytics", "Support email"],
      cta: "Commencer gratuitement",
      featured: false,
    },
    {
      name: "Business",
      price: "59 149",
      eur: "~13 EUR",
      badge: "⭐ Le plus populaire",
      color: COLORS.teal,
      features: ["5 Pages Facebook", "100 posts/mois", "50 générations IA", "WhatsApp Business", "Analytics avancés", "Rapports email auto", "Mode B — prompt libre", "Support prioritaire"],
      cta: "Essayer 14 jours",
      featured: true,
    },
    {
      name: "Agency",
      price: "89 149",
      eur: "~20 EUR",
      badge: "Multi-clients",
      color: COLORS.gold,
      features: ["Pages illimitées", "Posts illimités", "200 générations IA", "WhatsApp Business", "Gestion multi-clients", "Templates custom", "Rapports white-label", "Account manager dédié"],
      cta: "Contacter l'équipe",
      featured: false,
    },
  ];

  const testimonials = [
    { name: "Hanta R.", role: "Propriétaire, Le Grill d'Ivandry", text: "FeoSync a transformé notre présence digitale. Nos posts sont maintenant réguliers, professionnels, et notre engagement a triplé en 2 mois.", stars: 5, avatar: "HR" },
    { name: "Tojo M.", role: "Gérant, Boutique Zara Tana", text: "J'économise 2 heures par jour. Les visuels générés par l'IA sont bluffants — mes clients pensent que j'ai une agence !", stars: 5, avatar: "TM" },
    { name: "Miora F.", role: "Directrice, AgenceMG360", text: "En tant qu'agence, le plan Agency est parfait. Je gère 12 clients depuis un seul tableau de bord. Gain de temps inestimable.", stars: 5, avatar: "MF" },
  ];

  const faqs = [
    { q: "Comment fonctionne l'essai gratuit de 14 jours ?", a: "Vous avez accès complet au plan Business pendant 14 jours sans carte bancaire. À la fin, choisissez le plan qui vous convient ou continuez gratuitement avec des fonctionnalités limitées." },
    { q: "Est-ce que FeoSync est conforme aux politiques Meta ?", a: "Oui. FeoSync utilise l'API officielle Meta Business Suite. Tous les tokens sont chiffrés AES-256-GCM. Nous sommes passés par la Meta App Review et respectons strictement les conditions d'utilisation." },
    { q: "Peut-on utiliser FeoSync sans connaissances techniques ?", a: "Absolument. L'interface est conçue pour les non-techniciens. L'IA génère automatiquement le contenu, et l'onboarding guidé vous permet d'être opérationnel en moins de 10 minutes." },
    { q: "Comment fonctionne la génération d'images par IA ?", a: "Gemini 2.0 Flash analyse votre secteur, votre ton de marque et le contenu source pour créer des visuels 1080×1080 px avec vos couleurs et votre logo. Un seul appel IA génère simultanément l'image et la légende." },
    { q: "Peut-on annuler son abonnement à tout moment ?", a: "Oui, sans engagement ni frais de résiliation. Votre abonnement reste actif jusqu'à la fin de la période payée, puis s'arrête automatiquement." },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className="noise-overlay" />

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="grid-bg" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative",
        background: `radial-gradient(ellipse 100% 80% at 50% -10%, ${COLORS.navyMid}80, transparent), radial-gradient(ellipse 60% 60% at 80% 50%, ${COLORS.teal}08, transparent), ${COLORS.navy}`,
        paddingTop: 80,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 32px 60px", width: "100%" }}>
          <div className="hero-grid" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 60, alignItems: "center",
          }}>
            <div>
              <div className="anim-fade-up" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: `${COLORS.teal}15`,
                border: `1px solid ${COLORS.teal}30`,
                borderRadius: 99, padding: "6px 16px", marginBottom: 28,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal, boxShadow: `0 0 8px ${COLORS.teal}` }} />
                <span style={{ fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>
                  Plateforme SaaS · Made in Madagascar
                </span>
              </div>

              <h1 className="serif anim-fade-up-d1" style={{
                fontSize: "clamp(40px, 5vw, 62px)", lineHeight: 1.1,
                fontWeight: 400, marginBottom: 24,
              }}>
                Synchronisez<br />
                <em style={{ color: COLORS.teal, fontStyle: "italic" }}>votre voix</em><br />
                digitale.
              </h1>

              <p className="anim-fade-up-d2" style={{
                fontSize: 17, color: COLORS.slate, lineHeight: 1.7, marginBottom: 40, maxWidth: 480,
              }}>
                FeoSync automatise vos publications Facebook et WhatsApp Business grâce à l'IA générative. Publiez, analysez et développez votre audience — sans effort.
              </p>

              <div className="anim-fade-up-d3" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
                <button className="btn-primary" style={{ fontSize: 16, padding: "15px 32px" }} onClick={() => navigate("/register")}>
                  Démarrer gratuitement <Icon name="arrow" size={16} color={COLORS.navy} />
                </button>
                <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name="play" size={16} color={COLORS.teal} />
                  Voir la démo
                </button>
              </div>

              <div className="anim-fade-up-d4" style={{
                display: "flex", alignItems: "center", gap: 16,
                borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24,
              }}>
                <div style={{ display: "flex" }}>
                  {["HR","TM","MF","AB","LN"].map((a, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `hsl(${160 + i*30}, 60%, 35%)`,
                      border: `2px solid ${COLORS.navy}`,
                      marginLeft: i > 0 ? -10 : 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: COLORS.snow,
                      zIndex: 5 - i,
                    }}>{a}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: COLORS.snow, fontWeight: 600 }}>
                    {"★★★★★"} <span style={{ color: COLORS.gold }}>4.9/5</span>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.slate }}>+200 PME nous font confiance</div>
                </div>
              </div>
            </div>

            <div className="anim-fade-in hide-mobile" style={{ display: "flex", justifyContent: "center" }}>
              <SyncOrb />
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" style={{ display: "block", width: "100%" }} preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill={COLORS.navy} fillOpacity="0.5" />
          </svg>
        </div>
      </section>

      <TickerBar />

      {/* ── STATS ────────────────────────────────────────── */}
      <section ref={statsRef} style={{
        background: COLORS.navy, padding: "80px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="stats-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          }}>
            {[
              { val: `${clients}+`, label: "PME clientes", sub: "à Madagascar", color: COLORS.teal },
              { val: `${posts.toLocaleString()}+`, label: "Posts publiés", sub: "via FeoSync", color: COLORS.snow },
              { val: `-${time}h/j`, label: "Temps économisé", sub: "par client", color: COLORS.gold },
              { val: `${rate}%`, label: "Taux de satisfaction", sub: "NPS > 50", color: COLORS.teal },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center", padding: 32,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
              }}>
                <div className="serif" style={{
                  fontSize: 52, color: s.color, fontWeight: 400, lineHeight: 1,
                  marginBottom: 8,
                }}>{s.val}</div>
                <div style={{ fontSize: 16, color: COLORS.snow, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: COLORS.slate }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, ${COLORS.navy}, #0D2244)`,
        padding: "100px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block", background: `${COLORS.ruby}20`,
            border: `1px solid ${COLORS.ruby}40`, borderRadius: 99,
            padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, color: "#FC8181", fontWeight: 600 }}>
              ⚠️ Le problème quotidien
            </span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 20 }}>
            Vous perdez <span style={{ color: COLORS.gold }}>2 heures</span><br />
            chaque jour sur les réseaux.
          </h2>
          <p style={{ fontSize: 17, color: COLORS.slate, maxWidth: 600, margin: "0 auto 60px", lineHeight: 1.7 }}>
            Publication manuelle, visuels non professionnels, irrégularité des posts, avis clients inexploités… FeoSync résout tout.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { problem: "Publication manuelle quotidienne", impact: "1–2h perdues par jour", fix: "Scheduler automatique 7j/7" },
              { problem: "Visuels non professionnels", impact: "Image de marque dégradée", fix: "IA génère vos images 1080px" },
              { problem: "Publications irrégulières", impact: "Chute de l'engagement", fix: "Calendrier éditorial automatisé" },
              { problem: "WhatsApp Business non optimisé", impact: "Clients potentiels perdus", fix: "Diffusion automatique WA" },
            ].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: 28, textAlign: "left",
              }}>
                <div style={{ fontSize: 14, color: "#FC8181", marginBottom: 6, fontWeight: 500 }}>
                  ✗ {item.problem}
                </div>
                <div style={{ fontSize: 13, color: COLORS.slate, marginBottom: 16 }}>{item.impact}</div>
                <div style={{
                  fontSize: 14, color: COLORS.teal, fontWeight: 600,
                  borderTop: `1px solid rgba(255,255,255,0.07)`, paddingTop: 14,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Icon name="check" size={14} color={COLORS.teal} />
                  {item.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ─────────────────────────────── */}
      <section style={{
        background: "#0D2244",
        padding: "100px 32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.teal}06 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block", background: `${COLORS.teal}15`,
            border: `1px solid ${COLORS.teal}30`, borderRadius: 99,
            padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>Interface FeoSync</span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
            Un tableau de bord<br />
            <span style={{ color: COLORS.teal }}>pensé pour vous</span>
          </h2>
          <p style={{ fontSize: 16, color: COLORS.slate, maxWidth: 520, margin: "0 auto 60px", lineHeight: 1.7 }}>
            Visualisez vos performances, planifiez vos contenus et gérez toutes vos pages depuis un seul endroit.
          </p>
          <DashboardPreview />
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="fonctionnalités" style={{
        background: COLORS.navy, padding: "100px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
              Tout ce dont votre PME<br />
              a <span style={{ color: COLORS.teal }}>besoin</span>
            </h2>
            <p style={{ fontSize: 17, color: COLORS.slate, maxWidth: 500, margin: "0 auto" }}>
              Six fonctionnalités clés pour automatiser, créer et mesurer votre présence digitale.
            </p>
          </div>
          <div className="features-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
          }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${COLORS.teal}15`,
                  border: `1px solid ${COLORS.teal}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <Icon name={f.icon} size={20} color={COLORS.teal} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: COLORS.snow, marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: COLORS.slate, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, ${COLORS.navy}, #0D2244)`,
        padding: "100px 32px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
            Opérationnel en <span style={{ color: COLORS.gold }}>10 minutes</span>
          </h2>
          <p style={{ fontSize: 17, color: COLORS.slate, maxWidth: 500, margin: "0 auto 64px", lineHeight: 1.7 }}>
            Quatre étapes simples pour automatiser votre marketing digital.
          </p>
          <div className="steps-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
          }}>
            {steps.map((s, i) => (
              <div key={i} style={{ position: "relative", textAlign: "center" }}>
                {i < steps.length - 1 && (
                  <div className="hide-mobile step-connector" />
                )}
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.teal}25, ${COLORS.teal}08)`,
                  border: `2px solid ${COLORS.teal}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  position: "relative", zIndex: 1,
                }}>
                  <span className="serif" style={{ fontSize: 22, color: COLORS.teal }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.snow, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: COLORS.slate, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="tarifs" style={{ background: "#0D2244", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            display: "inline-block", background: `${COLORS.gold}15`,
            border: `1px solid ${COLORS.gold}30`, borderRadius: 99,
            padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 13, color: COLORS.gold, fontWeight: 600 }}>Tarifs en Ariary</span>
          </div>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
            Simple, transparent,<br />
            <span style={{ color: COLORS.gold }}>accessible</span>
          </h2>
          <p style={{ fontSize: 17, color: COLORS.slate, maxWidth: 500, margin: "0 auto 64px", lineHeight: 1.7 }}>
            Trois plans pour chaque étape de votre croissance. Essai gratuit 14 jours, sans carte bancaire.
          </p>

          <div className="plans-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "start",
          }}>
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card${plan.featured ? " featured" : ""}`}>
                {plan.featured && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                    color: COLORS.navy, fontSize: 12, fontWeight: 700, borderRadius: 99,
                    padding: "5px 18px", whiteSpace: "nowrap",
                  }}>
                    ⭐ Le plus populaire
                  </div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: plan.color,
                    background: `${plan.color}18`, padding: "4px 12px",
                    borderRadius: 99, letterSpacing: 1,
                  }}>
                    {plan.name.toUpperCase()}
                  </span>
                </div>
                {!plan.featured && (
                  <div style={{ fontSize: 12, color: COLORS.slate, marginBottom: 20, marginTop: 8 }}>{plan.badge}</div>
                )}
                <div style={{ margin: "20px 0 24px" }}>
                  <span className="serif" style={{ fontSize: 52, color: COLORS.snow }}>{plan.price}</span>
                  <span style={{ fontSize: 16, color: COLORS.slate }}> Ar/mois</span>
                  <div style={{ fontSize: 13, color: COLORS.slate, marginTop: 4 }}>{plan.eur}</div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 0",
                      borderBottom: j < plan.features.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: `${plan.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Icon name="check" size={10} color={plan.color} />
                      </div>
                      <span style={{ fontSize: 14, color: COLORS.slate }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={plan.featured ? "btn-primary" : "btn-outline"}
                  style={{
                    width: "100%", justifyContent: "center",
                    ...(plan.featured ? {} : { borderColor: `${plan.color}40`, color: plan.color }),
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 40, fontSize: 14, color: COLORS.slate }}>
            ✦ Sans engagement · Annulation à tout moment · Paiement par Mobile Money (MVola, Orange Money)
          </p>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section style={{ background: COLORS.navy, padding: "100px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
              Ils nous font confiance
            </h2>
            <p style={{ fontSize: 17, color: COLORS.slate }}>
              Des PME malgaches qui ont transformé leur présence digitale avec FeoSync.
            </p>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24,
          }}>
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Icon key={j} name="star" size={14} color={COLORS.gold} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: COLORS.slate, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: COLORS.snow, flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.snow }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.slate }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section style={{ background: "#0D2244", padding: "100px 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", marginBottom: 16 }}>
              Questions fréquentes
            </h2>
          </div>
          {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.tealDark}, ${COLORS.navy})`,
        padding: "120px 32px",
        position: "relative", overflow: "hidden", textAlign: "center",
      }}>
        <div style={{
          position: "absolute", top: -80, left: -80, width: 300, height: 300,
          borderRadius: "50%", background: `${COLORS.teal}15`,
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, right: -60, width: 250, height: 250,
          borderRadius: "50%", background: `${COLORS.gold}10`,
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 className="serif" style={{ fontSize: "clamp(36px, 5vw, 64px)", marginBottom: 24 }}>
            Prêt à synchroniser<br />
            votre voix digitale ?
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", maxWidth: 520, margin: "0 auto 48px", lineHeight: 1.7 }}>
            Rejoignez +200 PME malgaches qui publient automatiquement grâce à FeoSync. 14 jours offerts, sans carte bancaire.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 17, padding: "17px 40px" }}>
              Commencer maintenant <Icon name="arrow" size={18} color={COLORS.navy} />
            </button>
            <button className="btn-outline" style={{
              borderColor: "rgba(255,255,255,0.3)", color: COLORS.snow,
              fontSize: 17, padding: "17px 40px",
            }}>
              Parler à un expert
            </button>
          </div>
          <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["✓ 14 jours gratuits", "✓ Sans engagement", "✓ Support malgache"].map((t, i) => (
              <span key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ background: "#050F1E", padding: "64px 32px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid" style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 64,
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navyMid})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: COLORS.snow }}>F</span>
                </div>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: COLORS.snow }}>
                  Feo<span style={{ color: COLORS.teal }}>Sync</span>
                </span>
              </div>
              <p style={{ fontSize: 14, color: COLORS.slate, lineHeight: 1.7, maxWidth: 280 }}>
                "Synchronisez votre voix digitale" — La plateforme SaaS de référence pour les PME malgaches.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                {["fb", "whatsapp", "globe"].map((ic, i) => (
                  <div key={i} style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <Icon name={ic} size={16} color={COLORS.slate} />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Produit", links: ["Fonctionnalités", "Tarifs", "Intégrations", "API Docs", "Changelog"] },
              { title: "Ressources", links: ["Blog", "Guides", "Tutoriels", "Support", "Statut"] },
              { title: "Entreprise", links: ["À propos", "Carrières", "Contact", "Presse", "Partenaires"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.snow, letterSpacing: 1, marginBottom: 20 }}>
                  {col.title.toUpperCase()}
                </div>
                {col.links.map(l => (
                  <div key={l} style={{ marginBottom: 12 }}>
                    <a href="#" style={{
                      fontSize: 14, color: COLORS.slate, textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                      onMouseOver={e => (e.target as HTMLElement).style.color = COLORS.snow}
                      onMouseOut={e => (e.target as HTMLElement).style.color = COLORS.slate}
                    >{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <span style={{ fontSize: 13, color: COLORS.slate }}>
              © 2025 FeoSync. Tous droits réservés. Made with ♥ in Madagascar.
            </span>
            <div style={{ display: "flex", gap: 24 }}>
              {["Confidentialité", "CGU", "Cookies"].map(l => (
                <a key={l} href="#" style={{ fontSize: 13, color: COLORS.slate, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
