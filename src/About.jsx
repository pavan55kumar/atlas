import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, CheckSquare, Calendar, TrendingUp, Heart, FileText, 
  Activity, Layers, Compass, Globe, Mail, 
  Star, Share2, ShieldAlert, ChevronRight, Code, ShieldCheck, 
  Terminal, HelpCircle, Target, Coffee, Info ,ArrowUpRight,
} from 'lucide-react'

// Premium Adaptive Minimalist Glassmorphic CSS
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Handcrafted Dark Theme Colors (Linear/Arc Style) */
    --canvas-bg: #090810;
    --glass-bg: rgba(18, 16, 32, 0.45);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(236, 72, 153, 0.25) 100%);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.4);
    --input-border: rgba(255, 255, 255, 0.05);
    
    /* Premium gradients & shadows */
    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.2);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.03) inset,
      0 10px 30px -10px rgba(0, 0, 0, 0.6);
    
    /* Soft ambient backing glows */
    --aurora-primary: rgba(139, 92, 246, 0.12);
    --aurora-secondary: rgba(236, 72, 153, 0.06);
  }

  /* Light Theme Overrides (Notion / macOS Settings style) */
  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f6f8fa;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-glow: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(224, 83, 93, 0.15) 100%);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.8);
    --input-border: rgba(15, 23, 42, 0.06);
    
    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-glow: rgba(99, 102, 241, 0.15);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 10px 30px -10px rgba(15, 23, 42, 0.03);
    
    --aurora-primary: rgba(99, 102, 241, 0.06);
    --aurora-secondary: rgba(236, 72, 153, 0.04);
  }

  /* Structural wrapper settings */
  .about-page-container {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1080px;
    margin: 0 auto;
    position: relative;
    padding: 16px 12px;
    box-sizing: border-box;
    touch-action: pan-y;
    overflow-x: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  /* --- Backdrop Floating Ambient Spheres --- */
  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
  }

  .sphere-primary {
    top: -5%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: var(--aurora-primary);
    animation: floatSphere1 22s infinite ease-in-out;
  }

  .sphere-secondary {
    bottom: 5%;
    right: -10%;
    width: 350px;
    height: 350px;
    background: var(--aurora-secondary);
    animation: floatSphere2 28s infinite ease-in-out;
  }

  @keyframes floatSphere1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -15px) scale(1.08); }
  }

  @keyframes floatSphere2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-15px, 20px) scale(1.05); }
  }

  /* --- Premium Matte Glass Cards --- */
  .premium-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px) saturate(130%);
    -webkit-backdrop-filter: blur(20px) saturate(130%);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease-out, box-shadow 0.25s ease-out;
  }

  /* --- Compact Hero Identity --- */
  .hero-card-premium {
    padding: 24px;
    margin-bottom: 16px;
    text-align: center;
    position: relative;
    overflow: hidden;
    z-index: 10;
  }

  .hero-card-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 65%);
    pointer-events: none;
  }

  .logo-pulse-wrapper {
    display: inline-flex;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid var(--glass-border);
    margin-bottom: 12px;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .logo-pulse-wrapper::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 19px;
    background: var(--glass-border-glow);
    z-index: -1;
  }

  @keyframes shimmerSparkle {
    0%, 100% { opacity: 0.6; transform: scale(0.9) rotate(0deg); }
    50% { opacity: 1; transform: scale(1.05) rotate(10deg); }
  }

  .ai-sparkle-animated {
    animation: shimmerSparkle 4s infinite ease-in-out;
  }

  .hero-app-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-primary);
    margin: 0;
  }

  .hero-subtitle {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 4px 0 12px 0;
    letter-spacing: 0.01em;
  }

  .version-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    color: #ffffff;
    background: var(--btn-primary-bg);
    padding: 4px 10px;
    border-radius: 99px;
    box-shadow: 0 4px 10px var(--btn-primary-glow);
    letter-spacing: 0.04em;
  }

  /* --- Grid Structure / Double Pane Setup --- */
  .about-layout {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 16px;
    z-index: 10;
    position: relative;
  }

  .about-main-pane, .about-side-pane {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* --- Compact About Description --- */
  .about-intro-card {
    padding: 18px;
  }

  .section-headline {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 10px 0;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
  }

  .about-paragraph {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
    margin: 0 0 14px 0;
    font-weight: 400;
  }

  /* Core Value Tags/Chips Row */
  .about-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .value-pill {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    padding: 4px 10px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: border-color 0.2s ease;
  }

  .value-pill:hover {
    border-color: rgba(139, 92, 246, 0.2);
  }

  /* --- Compact 2-Column Feature Grid --- */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .feature-card {
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    min-height: 52px;
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-card:hover {
    transform: translateY(-1px);
    border-color: rgba(236, 72, 153, 0.15);
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  .feature-icon-wrapper {
    color: var(--text-secondary);
    background: var(--input-bg);
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border);
    flex-shrink: 0;
  }

  .feature-card:hover .feature-icon-wrapper {
    color: #d946ef;
    border-color: rgba(217, 70, 239, 0.2);
  }

  .feature-title {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .feature-desc {
    font-size: 10px;
    color: var(--text-tertiary);
    line-height: 1.2;
    margin: 1px 0 0 0;
  }

  /* --- System Stack Section --- */
  .credits-section {
    padding: 18px;
  }

  .credits-badges-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tech-badge {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-secondary);
    font-size: 10.5px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;
  }

  .tech-badge:hover {
    border-color: rgba(255, 255, 255, 0.12);
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.02);
  }

  /* --- Developer card --- */
  .dev-card {
    padding: 18px;
  }

  .dev-profile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .dev-avatar {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--btn-primary-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 16px;
    box-shadow: 0 4px 10px var(--btn-primary-glow);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dev-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .dev-title {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 1px;
  }

  .dev-description {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0 0 14px 0;
  }

  /* Dev Action Buttons (2x2 Matrix) */
  .dev-social-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .dev-social-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dev-social-btn:hover {
    background: var(--glass-border);
    border-color: rgba(139, 92, 246, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }

  .dev-btn-left {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-icon-indicator {
    opacity: 0.5;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .dev-social-btn:hover .btn-icon-indicator {
    opacity: 1;
    transform: translate(1px, -1px);
  }

  /* --- Compact Metadata Rows --- */
  .info-table-card {
    padding: 18px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--glass-border);
  }

  .info-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .info-row:first-child {
    padding-top: 0;
  }

  .info-label {
    font-size: 11.5px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .info-val {
    font-size: 11.5px;
    color: var(--text-primary);
    font-weight: 600;
  }

  /* --- Compact Action Cards --- */
  .support-card, .legal-card {
    padding: 18px;
  }

  .support-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  /* --- Clean List Rows --- */
  .legal-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    margin-bottom: 6px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .legal-row:last-child {
    margin-bottom: 0;
  }

  .legal-row:hover {
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateX(2px);
  }

  .legal-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
  }

  /* --- Section 9: Dense Footer --- */
  .footer-section {
    text-align: center;
    padding: 24px 16px 12px 16px;
    z-index: 10;
    position: relative;
    border-top: 1px solid var(--glass-border);
    margin-top: 24px;
  }

  .footer-love {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* --- Tablet & Mobile Media Queries --- */
  @media (max-width: 840px) {
    .about-layout {
      grid-template-columns: 1fr;
      gap: 16px;
    }
  }

  @media (max-width: 480px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .support-actions-grid {
      grid-template-columns: 1fr;
    }
    
    .hero-card-premium {
      padding: 20px 16px;
    }
  }
`;

export default function AboutAtlas({ onNavigate })  {
  
  // SECTION 4: Developer Handlers
  const handlePortfolioClick = () => {
    // TODO: Add portfolio URL
  window.open("https://projectportfolio-blond.vercel.app/", "_blank");
    console.log("Navigating to portfolio...");
  };

  const handleGithubClick = () => {
    // TODO: Add GitHub URL
    window.open("https://github.com/pavan55kumar", "_blank");
    console.log("Navigating to GitHub...");
  };

  const handleLinkedinClick = () => {
    // TODO: Add LinkedIn URL
    window.open("https://www.linkedin.com/in/pavan-kumar-6864b2320/", "_blank");
    console.log("Navigating to LinkedIn...");
  };

const handleEmailClick = () => {
  window.open(
    "https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com",
    "_blank"
  );
};

  // SECTION 6: Support Interactions
  const handleRateAtlas = () => {
    // TODO: Implement Rate App
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

  // SECTION 7: Legal Redirects
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
<div
  onClick={handleChangelogRedirect}
  className="legal-row"
>
  <span className="legal-text">
    What's New
  </span>

  <ChevronRight
    size={12}
    color="var(--text-tertiary)"
  />
</div>
  // Precomputed Features Array (Mapped to compact titles and brief descriptions)
  const featuresList = [
    { icon: <CheckSquare size={14} strokeWidth={1.75} />, title: 'Tasks', desc: 'Active priority lists' },
    { icon: <Activity size={14} strokeWidth={1.75} />, title: 'Habits', desc: 'Streaks & routine tracking' },
    { icon: <Target size={14} strokeWidth={1.75} />, title: 'Goals', desc: 'Strategic milestones' },
    { icon: <Calendar size={14} strokeWidth={1.75} />, title: 'Calendar', desc: 'Time blocking slots' },
    { icon: <Coffee size={14} strokeWidth={1.75} />, title: 'Focus', desc: 'Deep-work intervals' },
    { icon: <FileText size={14} strokeWidth={1.75} />, title: 'Notes', desc: 'Quick thought captures' },
    { icon: <TrendingUp size={14} strokeWidth={1.75} />, title: 'Expenses', desc: 'Sleek cashflow ledgers' },
    { icon: <Layers size={14} strokeWidth={1.75} />, title: 'Analytics', desc: 'Productivity mapping' },
    { icon: <Sparkles size={14} strokeWidth={1.75} />, title: 'AI Assistant', desc: 'Cognitive workflow companion' },
    { icon: <Compass size={14} strokeWidth={1.75} />, title: 'AI Schedule', desc: 'Autonomous schedule builder' }
  ];

  return (
    <div className="about-page-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />

      {/* --- SECTION 1: HERO (Compact Identity Card) --- */}
      <motion.div 
        className="hero-card-premium premium-card-glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logo-pulse-wrapper">
          <Sparkles size={28} color="#8b5cf6" className="ai-sparkle-animated" />
        </div>
        <h1 className="hero-app-title">Atlas</h1>
        <p className="hero-subtitle">Your Personal Life Operating System</p>
        <span className="version-badge">
          <Terminal size={10} />
          {/* TODO: Update version */}
          v1.0.0
        </span>
      </motion.div>

      {/* --- Main double pane grid --- */}
      <div className="about-layout">
        
        {/* Main Side Panel */}
        <div className="about-main-pane">
          
          {/* --- SECTION 2: ABOUT DESCRIPTION --- */}
          <motion.div 
            className="about-intro-card premium-card-glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Info size={12} />
              <span>Core Premise</span>
            </h2>
            <p className="about-paragraph">
              Atlas coordinates your personal ecosystem within a unified, visually serene command center. 
              Fusing tasks, habits, and finances with next-generation AI scheduling modules, it 
              delivers a holistic dashboard tailored to maximize daily progression and focus.
            </p>
            <div className="about-chips-row">
              <div className="value-pill">
                <Sparkles size={11} color="#8b5cf6" />
                <span>AI Powered</span>
              </div>
              <div className="value-pill">
                <Target size={11} color="#d946ef" />
                <span>Productivity Workspace</span>
              </div>
              <div className="value-pill">
                <Compass size={11} color="#3b82f6" />
                <span>Cross Platform</span>
              </div>
              <div className="value-pill">
                <ShieldCheck size={11} color="#10b981" />
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
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.03, delayChildren: 0.1 }
              }
            }}
          >
            <h2 className="section-headline" style={{ paddingLeft: '4px', marginBottom: '8px' }}>
              <Layers size={12} />
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

          {/* --- SECTION 8: CREDITS (System Stack) --- */}
          <motion.div 
            className="credits-section premium-card-glass"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Code size={12} />
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

        {/* Side Panel (Contextual Metadata) */}
        <div className="about-side-pane">
          
          {/* --- SECTION 4: DEVELOPER PROFILE --- */}
          <motion.div 
            className="dev-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dev-profile-header">
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
              <button onClick={handlePortfolioClick} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Globe size={12} color="#8b5cf6" />
                  <span>Portfolio</span>
                </span>
                <ArrowUpRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleGithubClick} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Code size={12} color="#d946ef" />
                  <span>GitHub</span>
                </span>
                <ArrowUpRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleLinkedinClick} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Globe size={12} color="#3b82f6" />
                  <span>LinkedIn</span>
                </span>
                <ArrowUpRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleEmailClick} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Mail size={12} color="#10b981" />
                  <span>Contact</span>
                </span>
                <ArrowUpRight size={12} className="btn-icon-indicator" />
              </button>
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
              <Terminal size={12} />
              <span>App Details</span>
            </h2>
            <div className="info-row">
              <span className="info-label">Version</span>
              {/* TODO: Update version */}
              <span className="info-val">v1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Build</span>
              {/* TODO: Update build number */}
              <span className="info-val">2026.01.15</span>
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

          {/* --- SECTION 6: SUPPORT CHANNELS --- */}
          <motion.div 
            className="support-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <HelpCircle size={12} />
              <span>Channels & Support</span>
            </h2>
            <div className="support-actions-grid">
              <button onClick={handleRateAtlas} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Star size={12} style={{ fill: '#ffd166', color: '#ffd166' }} />
                  <span>Rate App</span>
                </span>
                <ChevronRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleShareAtlas} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Share2 size={12} color="#8b5cf6" />
                  <span>Share App</span>
                </span>
                <ChevronRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleReportBug} className="dev-social-btn">
                <span className="dev-btn-left">
                  <ShieldAlert size={12} color="#ff737b" />
                  <span>Report Bug</span>
                </span>
                <ChevronRight size={12} className="btn-icon-indicator" />
              </button>
              <button onClick={handleRequestFeature} className="dev-social-btn">
                <span className="dev-btn-left">
                  <Sparkles size={12} color="#ffd166" />
                  <span>Suggestions</span>
                </span>
                <ChevronRight size={12} className="btn-icon-indicator" />
              </button>
            </div>
          </motion.div>

          {/* --- SECTION 7: LEGAL NODES --- */}
          <motion.div 
            className="legal-card premium-card-glass"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <ShieldCheck size={12} />
              <span>Legal Disclosures</span>
            </h2>
            
            <div onClick={handlePrivacyRedirect} className="legal-row">
              <span className="legal-text">Privacy Policy</span>
              <ChevronRight size={12} color="var(--text-tertiary)" />
            </div>

            <div onClick={handleTermsRedirect} className="legal-row">
              <span className="legal-text">Terms & Conditions</span>
              <ChevronRight size={12} color="var(--text-tertiary)" />
            </div>

            <div onClick={handleLicensesRedirect} className="legal-row">
              <span className="legal-text">Open Source Licenses</span>
              <ChevronRight size={12} color="var(--text-tertiary)" />
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
          Made with <Heart size={10} style={{ fill: '#ff737b', color: '#ff737b', display: 'inline-block' }} /> by Pavan Kumar • © Atlas
        </p>
      </motion.div>

    </div>
  )
}