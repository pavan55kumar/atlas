import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, CheckSquare, Calendar, TrendingUp, Heart, FileText, 
  Activity, Layers, Compass, Globe, Mail, 
  Star, Share2, ShieldAlert, ChevronRight, Code, ShieldCheck, 
  Terminal, HelpCircle, Target, Coffee, Info
} from 'lucide-react'

// Premium Theme Adaptive Glassmorphic Stylesheet
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Handcrafted Dark Theme Colors (Linear/Arc style) */
    --canvas-bg: #090810;
    --glass-bg: rgba(18, 16, 32, 0.60);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.45);
    --input-border: rgba(255, 255, 255, 0.06);
    --input-focus-border: #8b5cf6;
    
    /* Premium accents & gradients */
    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.25);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.05) inset,
      0 10px 30px -10px rgba(0, 0, 0, 0.5);
    
    /* Ambient backdrop spheres */
    --aurora-primary: rgba(139, 92, 246, 0.15);
    --aurora-secondary: rgba(236, 72, 153, 0.08);
    --aurora-tertiary: rgba(59, 130, 246, 0.08);
  }

  /* Handcrafted Light Theme Colors (Apple Settings / Notion style) */
  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f6f8fa;
    --glass-bg: rgba(255, 255, 255, 0.75);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-glow: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(224, 83, 93, 0.15) 100%);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.85);
    --input-border: rgba(15, 23, 42, 0.08);
    --input-focus-border: #6366f1;
    
    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-glow: rgba(99, 102, 241, 0.15);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 10px 30px -10px rgba(15, 23, 42, 0.04);
    
    /* Light Theme soft pastel gradients */
    --aurora-primary: rgba(99, 102, 241, 0.08);
    --aurora-secondary: rgba(236, 72, 153, 0.06);
    --aurora-tertiary: rgba(59, 130, 246, 0.06);
  }

  .about-page-container {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: 24px 16px;
    box-sizing: border-box;
    
    /* Touch optimization */
    touch-action: pan-y;
    overflow-x: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  /* --- Backdrop Floating Ambient Spheres --- */
  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
  }

  @keyframes floatSphere1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(30px, -20px) scale(1.1); }
  }

  @keyframes floatSphere2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-20px, 30px) scale(1.08); }
  }

  .sphere-primary {
    top: -5%;
    left: -15%;
    width: 500px;
    height: 500px;
    background: var(--aurora-primary);
    animation: floatSphere1 20s infinite ease-in-out;
  }

  .sphere-secondary {
    bottom: 5%;
    right: -15%;
    width: 450px;
    height: 450px;
    background: var(--aurora-secondary);
    animation: floatSphere2 25s infinite ease-in-out;
  }

  /* --- Premium Matte Glass Cards --- */
  .premium-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
  }

  /* --- Section 1: Hero Banner --- */
  .hero-card-premium {
    padding: 40px 32px;
    margin-bottom: 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
    z-index: 10;
  }

  .hero-card-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .logo-pulse-wrapper {
    display: inline-flex;
    padding: 16px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    position: relative;
  }

  .logo-pulse-wrapper::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 25px;
    background: var(--glass-border-glow);
    z-index: -1;
  }

  .hero-app-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--text-primary);
    margin: 0 0 8px 0;
  }

  .hero-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0 0 20px 0;
    letter-spacing: 0.02em;
  }

  /* Premium Version Pill */
  .version-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    background: var(--btn-primary-bg);
    padding: 6px 14px;
    border-radius: 99px;
    box-shadow: 0 4px 12px var(--btn-primary-glow);
    letter-spacing: 0.05em;
  }

  /* --- Elegant Double Pane Workspace --- */
  .about-layout {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;
    z-index: 10;
    position: relative;
  }

  .about-main-pane, .about-side-pane {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* --- Section 2: Clean About Text --- */
  .about-intro-card {
    padding: 24px;
  }

  .section-headline {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 12px 0;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .about-paragraph {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
  }

  /* --- Section 3: Feature Matrix --- */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .feature-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .feature-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  .feature-icon-wrapper {
    color: var(--text-secondary);
    background: var(--input-bg);
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border);
  }

  .feature-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .feature-desc {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.4;
    margin: 0;
  }

  /* --- Section 4: Premium Developer Profile Card --- */
  .dev-card {
    padding: 24px;
  }

  .dev-profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .dev-avatar {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: var(--btn-primary-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 20px;
    box-shadow: 0 4px 12px var(--btn-primary-glow);
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .dev-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }

  .dev-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 2px;
  }

  .dev-description {
    font-size: 12.5px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0 0 20px 0;
  }

  .dev-social-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .dev-social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dev-social-btn:hover {
    background: var(--glass-border);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  /* --- Section 5: App Information Card --- */
  .info-table-card {
    padding: 24px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
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
    font-size: 12px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .info-val {
    font-size: 12px;
    color: var(--text-primary);
    font-weight: 600;
  }

  /* --- Section 6: Support Action Grid --- */
  .support-card {
    padding: 24px;
  }

  .support-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* --- Section 7: Legal List Card --- */
  .legal-card {
    padding: 24px;
  }

  .legal-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .legal-row:last-child {
    margin-bottom: 0;
  }

  .legal-row:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateX(2px);
  }

  .legal-text {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-primary);
  }

  /* --- Section 8: Technology Credits Row --- */
  .credits-section {
    padding: 24px;
  }

  .credits-badges-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tech-badge {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    font-size: 11px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .tech-badge:hover {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.02);
  }

  /* --- Section 9: Elegant Footer --- */
  .footer-section {
    text-align: center;
    padding: 40px 16px 20px 16px;
    z-index: 10;
    position: relative;
    border-top: 1px solid var(--glass-border);
    margin-top: 32px;
  }

  .footer-love {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0 0 6px 0;
    font-weight: 500;
  }

  .footer-copyright {
    font-size: 11px;
    color: var(--text-tertiary);
    margin: 0;
    font-weight: 500;
  }

  /* --- Responsive Adaptive Media Queries --- */
  @media (max-width: 768px) {
    .about-layout {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .hero-card-premium {
      padding: 32px 20px;
    }

    .hero-app-title {
      font-size: 26px;
    }
  }
`;

export default function AboutAtlas() {
  
  // SECTION 4: Developer Handlers
  const handlePortfolioClick = () => {
    // TODO: Add portfolio URL
    // Example: window.open("https://pavankumar.dev", "_blank");
    console.log("Navigating to portfolio...");
  };

  const handleGithubClick = () => {
    // TODO: Add GitHub URL
    // Example: window.open("https://github.com/pavan-kumar", "_blank");
    console.log("Navigating to GitHub...");
  };

  const handleLinkedinClick = () => {
    // TODO: Add LinkedIn URL
    // Example: window.open("https://linkedin.com/in/pavan-kumar", "_blank");
    console.log("Navigating to LinkedIn...");
  };

  const handleEmailClick = () => {
    // TODO: Add Email Address
    // Example: window.location.href = "mailto:hello@example.com";
    console.log("Initiating developer email action...");
  };

  // SECTION 6: Support Interactions
  const handleRateAtlas = () => {
    // TODO: Implement Rate App
    console.log("Opening App Store rating...");
  };

  const handleShareAtlas = () => {
    // TODO: Implement Share
    console.log("Triggering native/web system share...");
  };

  const handleReportBug = () => {
    // TODO: Connect Bug Report page
    console.log("Redirecting to Bug Tracker...");
  };

  const handleRequestFeature = () => {
    // TODO: Connect Feature Request page
    console.log("Opening Feature Backlog portal...");
  };

  // SECTION 7: Legal Redirects
  const handlePrivacyRedirect = () => {
    // TODO: Connect Privacy Policy page
    console.log("Navigating to Privacy Policy...");
  };

  const handleTermsRedirect = () => {
    // TODO: Connect Terms page
    console.log("Navigating to Terms and Conditions...");
  };

  const handleLicensesRedirect = () => {
    // TODO: Connect Licenses page
    console.log("Navigating to Open Source Licenses...");
  };

  // Array map of features for systematic scaling
  const featuresList = [
    { icon: <CheckSquare size={16} strokeWidth={1.75} />, title: 'Tasks', desc: 'Streamlined lists & productivity pipelines.' },
    { icon: <Activity size={16} strokeWidth={1.75} />, title: 'Habits', desc: 'Recurrent routines & streak tracking.' },
    { icon: <Target size={16} strokeWidth={1.75} />, title: 'Goals', desc: 'High-level milestones & path building.' },
    { icon: <Calendar size={16} strokeWidth={1.75} />, title: 'Calendar', desc: 'Fluid weekly timeline & schedule slots.' },
    { icon: <Coffee size={16} strokeWidth={1.75} />, title: 'Focus Mode', desc: 'Pure deep-work interval controllers.' },
    { icon: <FileText size={16} strokeWidth={1.75} />, title: 'Notes', desc: 'Capture raw thoughts & markdown drafts.' },
    { icon: <TrendingUp size={16} strokeWidth={1.75} />, title: 'Expenses', desc: 'Transparent cashflow ledgers & balances.' },
    { icon: <Layers size={16} strokeWidth={1.75} />, title: 'Analytics', desc: 'Behavioral maps & productivity charts.' },
    { icon: <Sparkles size={16} strokeWidth={1.75} />, title: 'AI Assistant', desc: 'Context-aware intelligence companion.' },
    { icon: <Compass size={16} strokeWidth={1.75} />, title: 'AI Schedule', desc: 'Autonomous time block restructuring.' }
  ];

  return (
    <div className="about-page-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />

      {/* --- SECTION 1: HERO --- */}
      <motion.div 
        className="hero-card-premium premium-card-glass"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logo-pulse-wrapper">
          <Sparkles size={36} color="#8b5cf6" className="ai-sparkle-animated" />
        </div>
        <h1 className="hero-app-title">Atlas</h1>
        <p className="hero-subtitle">Your Personal Life Operating System</p>
        <span className="version-badge">
          <Terminal size={12} />
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Info size={16} color="var(--text-secondary)" />
              <span>About Atlas</span>
            </h2>
            <p className="about-paragraph">
              Atlas coordinates your entire personal ecosystem within a highly unified, 
              visually serene command center. Seamlessly fusing tasks, deep habits, strategic 
              goals, and finances with next-generation AI scheduling modules, Atlas offers a holistic 
              overview designed to alleviate executive dysfunction, maximize clarity, and accelerate progress.
            </p>
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
                transition: { staggerChildren: 0.05, delayChildren: 0.2 }
              }
            }}
          >
            <h2 className="section-headline" style={{ paddingLeft: '4px', marginBottom: '16px' }}>
              <Layers size={16} color="var(--text-secondary)" />
              <span>Personal Operating Engines</span>
            </h2>
            <div className="features-grid">
              {featuresList.map((item, idx) => (
                <motion.div 
                  className="feature-card"
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } }
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

          {/* --- SECTION 8: CREDITS --- */}
          <motion.div 
            className="credits-section premium-card-glass"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Code size={16} color="var(--text-secondary)" />
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
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="dev-profile-header">
              <div className="dev-avatar">PK</div>
              <div>
                <h3 className="dev-name">Pavan Kumar</h3>
                <span className="dev-title">Software Developer</span>
              </div>
            </div>
            <p className="dev-description">
              Crafting fluid digital interfaces that find absolute balance 
              between high-performance utility and architectural precision.
            </p>
            <div className="dev-social-grid">
              <button onClick={handlePortfolioClick} className="dev-social-btn">
                <Globe size={14} />
                <span>Portfolio</span>
              </button>
              <button onClick={handleGithubClick} className="dev-social-btn">
                <Code size={14} />
                <span>GitHub</span>
              </button>
              <button onClick={handleLinkedinClick} className="dev-social-btn">
                <Globe size={14} />
                <span>LinkedIn</span>
              </button>
              <button onClick={handleEmailClick} className="dev-social-btn">
                <Mail size={14} />
                <span>Contact</span>
              </button>
            </div>
          </motion.div>

          {/* --- SECTION 5: APP INFORMATION --- */}
          <motion.div 
            className="info-table-card premium-card-glass"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <Terminal size={16} color="var(--text-secondary)" />
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
              <span className="info-label">Release Date</span>
              <span className="info-val">July 2026</span>
            </div>
            <div className="info-row">
              <span className="info-label">Architect</span>
              <span className="info-val">Pavan Kumar</span>
            </div>
          </motion.div>

          {/* --- SECTION 6: SUPPORT CHANNELS --- */}
          <motion.div 
            className="support-card premium-card-glass"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <HelpCircle size={16} color="var(--text-secondary)" />
              <span>Channels & Support</span>
            </h2>
            <div className="support-actions-grid">
              <button onClick={handleRateAtlas} className="dev-social-btn" style={{ gap: '6px' }}>
                <Star size={13} style={{ fill: '#ffd166', color: '#ffd166' }} />
                <span>Rate Atlas</span>
              </button>
              <button onClick={handleShareAtlas} className="dev-social-btn" style={{ gap: '6px' }}>
                <Share2 size={13} color="#8b5cf6" />
                <span>Share App</span>
              </button>
              <button onClick={handleReportBug} className="dev-social-btn" style={{ gap: '6px' }}>
                <ShieldAlert size={13} color="#ff737b" />
                <span>Report Bug</span>
              </button>
              <button onClick={handleRequestFeature} className="dev-social-btn" style={{ gap: '6px' }}>
                <Sparkles size={13} color="#ffd166" />
                <span>Suggestions</span>
              </button>
            </div>
          </motion.div>

          {/* --- SECTION 7: LEGAL NODES --- */}
          <motion.div 
            className="legal-card premium-card-glass"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-headline">
              <ShieldCheck size={16} color="var(--text-secondary)" />
              <span>Legal Disclosures</span>
            </h2>
            
            <div onClick={handlePrivacyRedirect} className="legal-row">
              <span className="legal-text">Privacy Policy</span>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </div>

            <div onClick={handleTermsRedirect} className="legal-row">
              <span className="legal-text">Terms & Conditions</span>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </div>

            <div onClick={handleLicensesRedirect} className="legal-row">
              <span className="legal-text">Open Source Licenses</span>
              <ChevronRight size={14} color="var(--text-tertiary)" />
            </div>
          </motion.div>

        </div>

      </div>

      {/* --- SECTION 9: FOOTER --- */}
      <motion.div 
        className="footer-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <p className="footer-love">Made with <Heart size={10} style={{ fill: '#ff737b', color: '#ff737b', display: 'inline-block' }} /> by Pavan Kumar</p>
        <p className="footer-copyright">© 2026 Atlas. All rights reserved.</p>
      </motion.div>

    </div>
  )
}