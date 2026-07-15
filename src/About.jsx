import { motion } from 'framer-motion'
import {
  Sparkles, CheckSquare, Calendar, TrendingUp, Heart, FileText,
  Activity, Layers, Compass, Globe, Mail,
  Star, Share2, ShieldAlert, ChevronRight, Code, ShieldCheck,
  Terminal, HelpCircle, Target, Coffee, Info, ArrowUpRight,
  Lock, Rocket,
} from 'lucide-react'

// Premium Adaptive Minimalist Glassmorphic CSS
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;

    --canvas-bg: #090810;
    --glass-base: rgba(18, 16, 32, 0.42);
    --glass-sheen-1: rgba(255, 255, 255, 0.04);
    --glass-sheen-2: rgba(255, 255, 255, 0.01);
    --glass-border: rgba(255, 255, 255, 0.055);
    --glass-highlight: rgba(255, 255, 255, 0.09);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(96, 165, 250, 0.18) 100%);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.4);
    --input-border: rgba(255, 255, 255, 0.06);

    --btn-primary-bg: linear-gradient(135deg, #9b87ff 0%, #6d5ef2 55%, #5a4de0 100%);
    --btn-primary-glow: rgba(124, 108, 246, 0.28);
    --card-shadow: 0 24px 48px -24px rgba(20, 10, 45, 0.5), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
    --card-shadow-hover: 0 30px 56px -22px rgba(28, 14, 60, 0.55), 0 1px 0 rgba(255, 255, 255, 0.05) inset;

    --aurora-primary: rgba(139, 92, 246, 0.11);
    --aurora-secondary: rgba(96, 165, 250, 0.06);

    --accent-purple: #8b5cf6;
    --accent-purple-light: #a78bfa;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
    --accent-blue: #60a5fa;
    --accent-neutral: #94a3b8;
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f6f8fa;
    --glass-base: rgba(255, 255, 255, 0.66);
    --glass-sheen-1: rgba(255, 255, 255, 0.45);
    --glass-sheen-2: rgba(255, 255, 255, 0.16);
    --glass-border: rgba(15, 23, 42, 0.07);
    --glass-highlight: rgba(255, 255, 255, 0.8);
    --glass-border-glow: linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(96, 165, 250, 0.15) 100%);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.8);
    --input-border: rgba(15, 23, 42, 0.06);

    --btn-primary-bg: linear-gradient(135deg, #8172f2 0%, #6152e8 100%);
    --btn-primary-glow: rgba(97, 82, 232, 0.18);
    --card-shadow: 0 16px 36px rgba(30, 20, 80, 0.05), 0 1px 0 rgba(255, 255, 255, 0.65) inset;
    --card-shadow-hover: 0 22px 44px rgba(30, 20, 80, 0.08), 0 1px 0 rgba(255, 255, 255, 0.7) inset;

    --aurora-primary: rgba(99, 102, 241, 0.06);
    --aurora-secondary: rgba(96, 165, 250, 0.05);
    --accent-purple: #6d5ef2;
    --accent-purple-light: #8172f2;
    --accent-amber: #d97706;
  }

  .about-page-container {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1080px;
    margin: 0 auto;
    position: relative;
    padding: 20px 16px;
    box-sizing: border-box;
    touch-action: pan-y;
    overflow-x: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ---------- Ambient backdrop ---------- */
  .aurora-blur-sphere { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
  .sphere-primary { top: -5%; left: -10%; width: 400px; height: 400px; background: var(--aurora-primary); animation: floatSphere1 22s infinite ease-in-out; }
  .sphere-secondary { bottom: 5%; right: -10%; width: 350px; height: 350px; background: var(--aurora-secondary); animation: floatSphere2 28s infinite ease-in-out; }
  @keyframes floatSphere1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -15px) scale(1.08); } }
  @keyframes floatSphere2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-15px, 20px) scale(1.05); } }

  .about-noise-overlay {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    opacity: 0.022; mix-blend-mode: overlay; border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  @media (prefers-reduced-motion: reduce) {
    .sphere-primary, .sphere-secondary, .ai-sparkle-animated, .logo-pulse-wrapper::before { animation: none !important; }
  }

  /* ---------- Shared premium glass surface ---------- */
  .premium-card-glass {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease-out, box-shadow 0.25s ease-out;
    position: relative;
    overflow: hidden;
  }
  .premium-card-glass::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-highlight), transparent);
    pointer-events: none;
  }

  /* ---------- Hero ---------- */
  .hero-card-premium {
    padding: 32px 24px;
    margin-bottom: 24px;
    text-align: center;
    z-index: 10;
  }
  .hero-card-premium::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.07) 0%, transparent 65%);
    pointer-events: none;
  }

  .logo-pulse-wrapper {
    display: inline-flex;
    padding: 18px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    margin-bottom: 16px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
  .logo-pulse-wrapper::before {
    content: '';
    position: absolute;
    inset: -16px;
    border-radius: 30px;
    background: conic-gradient(from 0deg, rgba(139, 92, 246, 0.32), rgba(96, 165, 250, 0.14), rgba(139, 92, 246, 0.32));
    filter: blur(20px);
    opacity: 0.75;
    animation: logoGlowRotate 9s linear infinite;
    z-index: -2;
  }
  .logo-pulse-wrapper::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 23px;
    background: var(--glass-border-glow);
    z-index: -1;
  }
  @keyframes logoGlowRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  @keyframes shimmerSparkle {
    0%, 100% { opacity: 0.7; transform: scale(0.94) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.06) rotate(8deg); }
  }
  .ai-sparkle-animated { animation: shimmerSparkle 4s infinite ease-in-out; }

  .hero-app-title {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-primary);
    margin: 0;
  }
  .hero-subtitle {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 6px 0 16px 0;
    letter-spacing: 0.01em;
    line-height: 1.5;
  }
  .version-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    font-weight: 700;
    color: #ffffff;
    background: var(--btn-primary-bg);
    padding: 6px 14px;
    border-radius: 999px;
    box-shadow: 0 4px 12px var(--btn-primary-glow);
    letter-spacing: 0.04em;
  }

  /* ---------- Layout grid ---------- */
  .about-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 20px; z-index: 10; position: relative; }
  .about-main-pane, .about-side-pane { display: flex; flex-direction: column; gap: 20px; }

  /* ---------- Section headline (de-emphasized caps) ---------- */
  .section-headline {
    font-size: 12.5px;
    font-weight: 700;
    color: var(--text-secondary);
    margin: 0 0 12px 0;
    letter-spacing: 0.01em;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* ---------- Core Premise ---------- */
  .about-intro-card { padding: 20px; }
  .about-paragraph {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0 0 16px 0;
    font-weight: 400;
  }
  .about-chips-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .value-pill {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid var(--glass-border);
    padding: 5px 12px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .value-pill:hover { border-color: rgba(139, 92, 246, 0.25); background: rgba(139, 92, 246, 0.04); }

  /* ---------- Feature grid ---------- */
  .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .feature-card {
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.014);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    min-height: 56px;
    box-sizing: border-box;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .feature-card:hover {
    transform: translateY(-2px);
    border-color: rgba(139, 92, 246, 0.2);
    background: rgba(255, 255, 255, 0.024);
    box-shadow: var(--card-shadow-hover);
  }
  .feature-icon-wrapper {
    color: var(--text-secondary);
    background: var(--input-bg);
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border);
    flex-shrink: 0;
    transition: color 0.2s ease, border-color 0.2s ease;
  }
  .feature-card:hover .feature-icon-wrapper { color: var(--accent-purple-light); border-color: rgba(139, 92, 246, 0.25); }
  .feature-title { font-size: 12px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .feature-desc { font-size: 10.5px; color: var(--text-tertiary); line-height: 1.3; margin: 2px 0 0 0; }

  /* ---------- System Stack (de-emphasized) ---------- */
  .credits-section { padding: 20px; }
  .credits-badges-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .tech-badge {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-tertiary);
    font-size: 10.5px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .tech-badge:hover { border-color: rgba(255, 255, 255, 0.14); color: var(--text-primary); background: rgba(255, 255, 255, 0.025); }

  /* ---------- Developer card ---------- */
  .dev-card { padding: 20px; }
  .dev-profile-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
  .dev-avatar {
    width: 48px; height: 48px;
    border-radius: 14px;
    background: var(--btn-primary-bg);
    display: flex; align-items: center; justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 16px;
    box-shadow: 0 4px 14px var(--btn-primary-glow), inset 0 1px 0 rgba(255,255,255,0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }
  .dev-name { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.01em; }
  .dev-title { font-size: 10.5px; font-weight: 600; color: var(--text-secondary); margin-top: 2px; }
  .dev-description { font-size: 12.5px; color: var(--text-secondary); line-height: 1.55; margin: 0 0 16px 0; }

  .dev-social-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .dev-social-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 11px 12px;
    border-radius: 14px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    min-height: 44px;
    box-sizing: border-box;
    transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  }
  .dev-social-btn:hover { background: var(--glass-border); border-color: rgba(139, 92, 246, 0.22); }
  .dev-btn-left { display: flex; align-items: center; gap: 8px; }
  .btn-icon-indicator { opacity: 0.5; transition: transform 0.2s ease, opacity 0.2s ease; }
  .dev-social-btn:hover .btn-icon-indicator { opacity: 1; transform: translate(1px, -1px); }

  /* ---------- App details (settings style) ---------- */
  .info-table-card { padding: 20px; }
  .info-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--glass-border);
  }
  .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .info-row:first-child { padding-top: 0; }
  .info-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
  .info-val { font-size: 12px; color: var(--text-primary); font-weight: 600; }

  /* ---------- Support & Legal: clean list-style navigation ---------- */
  .support-card, .legal-card { padding: 20px; }
  .support-actions-grid, .legal-list { display: flex; flex-direction: column; }

  .nav-list-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 4px;
    border-bottom: 1px solid var(--glass-border);
    cursor: pointer;
    min-height: 44px;
    box-sizing: border-box;
    border-radius: 12px;
    transition: background 0.2s ease;
  }
  .nav-list-row:last-child { border-bottom: none; }
  .nav-list-row:hover { background: rgba(255, 255, 255, 0.03); }
  .nav-row-icon {
    width: 32px; height: 32px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .nav-row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .nav-row-title { font-size: 12.5px; font-weight: 600; color: var(--text-primary); }
  .nav-row-helper { font-size: 10.5px; color: var(--text-tertiary); margin-top: 1px; }
  .nav-row-chevron { color: var(--text-tertiary); flex-shrink: 0; transition: transform 0.2s ease, color 0.2s ease; }
  .nav-list-row:hover .nav-row-chevron { transform: translateX(2px); color: var(--accent-purple-light); }

  /* ---------- Footer ---------- */
  .footer-section {
    text-align: center;
    padding: 28px 16px 12px 16px;
    z-index: 10;
    position: relative;
    border-top: 1px solid var(--glass-border);
    margin-top: 28px;
  }
  .footer-love { font-size: 11px; color: var(--text-tertiary); margin: 0; font-weight: 500; letter-spacing: 0.02em; }

  /* ---------- Responsive ---------- */
  @media (max-width: 840px) {
    .about-layout { grid-template-columns: 1fr; gap: 20px; }
  }
  @media (max-width: 480px) {
    .features-grid { grid-template-columns: repeat(2, 1fr); }
    .hero-card-premium { padding: 28px 20px; }
  }
`;

export default function AboutAtlas({ onNavigate }) {

  // TODO: Replace with real app version from package.json / build config
  const APP_VERSION = 'v1.0.0'
  // TODO: Replace with real CI build identifier
  const APP_BUILD = '2026.01.15'

  const handlePortfolioClick = () => {
    window.open("https://projectportfolio-blond.vercel.app/", "_blank");
  };

  const handleGithubClick = () => {
    window.open("https://github.com/pavan55kumar", "_blank");
  };

  const handleLinkedinClick = () => {
    window.open("https://www.linkedin.com/in/pavan-kumar-6864b2320/", "_blank");
  };

  const handleEmailClick = () => {
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com",
      "_blank"
    );
  };

  const handleRateAtlas = () => {
    // TODO: Wire up to real Play Store / App Store listing once published
    alert("Atlas will be available for rating after its Play Store release.");
  };

  const handleShareAtlas = async () => {
    const shareData = {
      title: "Atlas",
      text: "Boost your productivity with Atlas — your all-in-one AI-powered productivity workspace.",
      url: "https://atlas-rose-psi.vercel.app/", // TODO: Replace with your website or Play Store link
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent("Atlas Bug Report");
    const body = encodeURIComponent(`Describe the issue:

Steps to reproduce:

Expected behavior:

Actual behavior:

Device:
Android Version:
Atlas Version:
`);

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handleRequestFeature = () => {
    const subject = encodeURIComponent("Atlas Feature Request");
    const body = encodeURIComponent(`Feature Name:

Description:

Why should Atlas include this?

Additional Notes:
`);

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  const handlePrivacyRedirect = () => {
    onNavigate("privacy");
  };

  const handleTermsRedirect = () => {
    onNavigate("terms");
  };

  const handleLicensesRedirect = () => {
    onNavigate("licenses");
  };

  const handleChangelogRedirect = () => {
    onNavigate("changelog");
  };

  // Precomputed Features Array (Mapped to compact titles and brief descriptions)
  const featuresList = [
    { icon: <CheckSquare size={15} strokeWidth={1.75} />, title: 'Tasks', desc: 'Active priority lists' },
    { icon: <Activity size={15} strokeWidth={1.75} />, title: 'Habits', desc: 'Streaks & routine tracking' },
    { icon: <Target size={15} strokeWidth={1.75} />, title: 'Goals', desc: 'Strategic milestones' },
    { icon: <Calendar size={15} strokeWidth={1.75} />, title: 'Calendar', desc: 'Time blocking slots' },
    { icon: <Coffee size={15} strokeWidth={1.75} />, title: 'Focus', desc: 'Deep-work intervals' },
    { icon: <FileText size={15} strokeWidth={1.75} />, title: 'Notes', desc: 'Quick thought captures' },
    { icon: <TrendingUp size={15} strokeWidth={1.75} />, title: 'Expenses', desc: 'Sleek cashflow ledgers' },
    { icon: <Layers size={15} strokeWidth={1.75} />, title: 'Analytics', desc: 'Productivity mapping' },
    { icon: <Sparkles size={15} strokeWidth={1.75} />, title: 'AI Assistant', desc: 'Cognitive workflow companion' },
    { icon: <Compass size={15} strokeWidth={1.75} />, title: 'AI Schedule', desc: 'Autonomous schedule builder' }
  ];

  return (
    <div className="about-page-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="about-noise-overlay" aria-hidden="true" />

      {/* --- SECTION 1: HERO --- */}
      <motion.div
        className="hero-card-premium premium-card-glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logo-pulse-wrapper">
          <Sparkles size={32} color="var(--accent-purple)" className="ai-sparkle-animated" />
        </div>
        <h1 className="hero-app-title">Atlas</h1>
        <p className="hero-subtitle">Your Personal Life Operating System</p>
        <span className="version-badge">
          <Terminal size={10} />
          {APP_VERSION}
        </span>
      </motion.div>

      {/* --- Main double pane grid --- */}
      <div className="about-layout">

        <div className="about-main-pane">

          {/* --- SECTION 2: CORE PREMISE --- */}
          <motion.div
            className="about-intro-card premium-card-glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Info size={13} />
              <span>Core Premise</span>
            </h2>
            {/* TODO: Content owner may further tighten this copy over time */}
            <p className="about-paragraph">
              Atlas brings your tasks, habits, and finances into one calm, AI-guided
              workspace — built to help you plan less and progress more.
            </p>
            <div className="about-chips-row">
              <div className="value-pill">
                <Sparkles size={11} color="var(--accent-purple)" />
                <span>AI Powered</span>
              </div>
              <div className="value-pill">
                <Target size={11} color="var(--accent-amber)" />
                <span>Productivity Workspace</span>
              </div>
              <div className="value-pill">
                <Compass size={11} color="var(--accent-blue)" />
                <span>Cross Platform</span>
              </div>
              <div className="value-pill">
                <ShieldCheck size={11} color="var(--accent-emerald)" />
                <span>Privacy First</span>
              </div>
            </div>
          </motion.div>

          {/* --- SECTION 3: FEATURES GRID --- */}
          <motion.div
            className="features-container"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.1 } }
            }}
          >
            <h2 className="section-headline" style={{ paddingLeft: '4px', marginBottom: '10px' }}>
              <Layers size={13} />
              <span>Personal Operating Engines</span>
            </h2>
            <div className="features-grid">
              {featuresList.map((item, idx) => (
                <motion.div
                  className="feature-card"
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 22 } }
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="feature-icon-wrapper">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="feature-title">{item.title}</h4>
                    <p className="feature-desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- SECTION 8: SYSTEM STACK (lighter visual weight) --- */}
          <motion.div
            className="credits-section premium-card-glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Code size={13} />
              <span>System Stack</span>
            </h2>
            <div className="credits-badges-wrap">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">Capacitor</span>
              <span className="tech-badge">Supabase</span>
              <span className="tech-badge">Groq AI</span>
              <span className="tech-badge">Lucide React</span>
              <span className="tech-badge">Framer Motion</span>
            </div>
          </motion.div>

        </div>

        {/* Side Panel */}
        <div className="about-side-pane">

          {/* --- SECTION 4: DEVELOPER PROFILE --- */}
          <motion.div
            className="dev-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dev-profile-header">
              {/* TODO: Swap initials avatar for a real profile image when available */}
              <div className="dev-avatar">PK</div>
              <div>
                <h3 className="dev-name">Pavan Kumar</h3>
                <span className="dev-title">Software Developer</span>
              </div>
            </div>
            <p className="dev-description">
              Crafting cohesive, highly responsive digital interfaces balancing structural
              logic and typographic performance.
            </p>
            <div className="dev-social-grid">
              <motion.button onClick={handlePortfolioClick} className="dev-social-btn" whileTap={{ scale: 0.97 }}>
                <span className="dev-btn-left">
                  <Globe size={13} color="var(--accent-purple)" />
                  <span>Portfolio</span>
                </span>
                <ArrowUpRight size={13} className="btn-icon-indicator" />
              </motion.button>
              <motion.button onClick={handleGithubClick} className="dev-social-btn" whileTap={{ scale: 0.97 }}>
                <span className="dev-btn-left">
                  <Code size={13} color="var(--accent-amber)" />
                  <span>GitHub</span>
                </span>
                <ArrowUpRight size={13} className="btn-icon-indicator" />
              </motion.button>
              <motion.button onClick={handleLinkedinClick} className="dev-social-btn" whileTap={{ scale: 0.97 }}>
                <span className="dev-btn-left">
                  <Globe size={13} color="var(--accent-blue)" />
                  <span>LinkedIn</span>
                </span>
                <ArrowUpRight size={13} className="btn-icon-indicator" />
              </motion.button>
              <motion.button onClick={handleEmailClick} className="dev-social-btn" whileTap={{ scale: 0.97 }}>
                <span className="dev-btn-left">
                  <Mail size={13} color="var(--accent-emerald)" />
                  <span>Contact</span>
                </span>
                <ArrowUpRight size={13} className="btn-icon-indicator" />
              </motion.button>
            </div>
          </motion.div>

          {/* --- SECTION 5: APP DETAILS --- */}
          <motion.div
            className="info-table-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Terminal size={13} />
              <span>App Details</span>
            </h2>
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-val">{APP_VERSION}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Build</span>
              <span className="info-val">{APP_BUILD}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Platform</span>
              <span className="info-val">Cross-Platform Web</span>
            </div>
            <div className="info-row">
              <span className="info-label">Release</span>
              <span className="info-val">July 2026</span>
            </div>
            <div className="info-row">
              <span className="info-label">Developer</span>
              <span className="info-val">Pavan Kumar</span>
            </div>
          </motion.div>

          {/* --- SECTION 6: SUPPORT CHANNELS (clean list navigation) --- */}
          <motion.div
            className="support-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <HelpCircle size={13} />
              <span>Channels &amp; Support</span>
            </h2>
            <div className="support-actions-grid">
              <NavListRow
                icon={<Star size={15} style={{ fill: 'var(--accent-amber)' }} />}
                accent="#f59e0b"
                title="Rate App"
                helper="Enjoying Atlas? Leave us a rating"
                onClick={handleRateAtlas}
              />
              <NavListRow
                icon={<Share2 size={15} />}
                accent="#8b5cf6"
                title="Share App"
                helper="Tell a friend about Atlas"
                onClick={handleShareAtlas}
              />
              <NavListRow
                icon={<ShieldAlert size={15} />}
                accent="#ef4444"
                title="Report a Bug"
                helper="Help us squash issues fast"
                onClick={handleReportBug}
              />
              <NavListRow
                icon={<Sparkles size={15} />}
                accent="#60a5fa"
                title="Suggest a Feature"
                helper="Share ideas for what's next"
                onClick={handleRequestFeature}
              />
            </div>
          </motion.div>

          {/* --- SECTION 7: UPDATES & LEGAL --- */}
          <motion.div
            className="legal-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <ShieldCheck size={13} />
              <span>Updates &amp; Legal</span>
            </h2>
            <div className="legal-list">
              <NavListRow
                icon={<Rocket size={15} />}
                accent="#8b5cf6"
                title="What's New"
                helper="See the latest changes and improvements"
                onClick={handleChangelogRedirect}
              />
              <NavListRow
                icon={<Lock size={15} />}
                accent="#10b981"
                title="Privacy Policy"
                onClick={handlePrivacyRedirect}
              />
              <NavListRow
                icon={<FileText size={15} />}
                accent="#94a3b8"
                title="Terms & Conditions"
                onClick={handleTermsRedirect}
              />
              <NavListRow
                icon={<Code size={15} />}
                accent="#94a3b8"
                title="Open Source Licenses"
                onClick={handleLicensesRedirect}
              />
            </div>
          </motion.div>

        </div>

      </div>

      {/* --- SECTION 9: FOOTER --- */}
      <motion.div
        className="footer-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <p className="footer-love">
          Made with <Heart size={10} style={{ fill: 'var(--accent-red)', color: 'var(--accent-red)', display: 'inline-block' }} /> by Pavan Kumar • © Atlas
        </p>
      </motion.div>

    </div>
  )
}

// TODO: Extract to its own file if more list-style navigation sections are added elsewhere in the app
function NavListRow({ icon, accent, title, helper, onClick }) {
  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick && onClick()
    }
  }

  return (
    <motion.div
      className="nav-list-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
    >
      <span className="nav-row-icon" style={{ background: accent + '1f', color: accent }}>{icon}</span>
      <span className="nav-row-text">
        <span className="nav-row-title">{title}</span>
        {helper && <span className="nav-row-helper">{helper}</span>}
      </span>
      <ChevronRight size={14} className="nav-row-chevron" />
    </motion.div>
  )
}