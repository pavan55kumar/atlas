import { motion } from 'framer-motion'
import {
  Sparkles, CheckSquare, Calendar, TrendingUp, Heart, FileText,
  Activity, Layers, Compass, Globe, Mail,
  Star, Share2, ShieldAlert, ChevronRight, Code, ShieldCheck,
  Terminal, HelpCircle, Target, Coffee, Info, ArrowUpRight,
  Lock, Rocket,
} from 'lucide-react'

const styleSheet = `
  /* All selectors are scoped under .about-page-container to increase CSS specificity. 
     This prevents late-loading global stylesheets from overriding the About page's 
     layout and causing a post-load UI shift. */
  .about-page-container {
    max-width: 100%;
    margin: 0 auto;
    position: relative;
    padding: 8px 4px 32px;
    box-sizing: border-box;
    overflow-x: hidden; /* Safety net */
  }

  /* Scoped .card override to ensure the About page's glassmorphism and padding 
     are not overridden by external global .card rules loading after mount. */
  .about-page-container .card {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-highlight) 0%, transparent 100%);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    transition: box-shadow 0.3s ease, border-color 0.3s ease;
    position: relative;
    overflow: hidden;
    max-width: 100%;
    box-sizing: border-box;
  }

  .about-page-container .hero-card-premium {
    padding: 40px 32px;
    margin-bottom: 24px;
    text-align: center;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .about-page-container .hero-card-premium::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(208, 126, 255, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  .about-page-container .logo-pulse-wrapper {
    display: inline-flex;
    padding: 20px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    margin-bottom: 24px;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  .about-page-container .logo-pulse-wrapper::before {
    content: '';
    position: absolute;
    inset: -20px;
    border-radius: 40px;
    background: conic-gradient(from 0deg, #ff9a8b, #ff6a88, #d07eff, #8b5cf6, #ff9a8b);
    filter: blur(24px);
    opacity: 0.4;
    animation: logoGlowRotate 8s linear infinite;
    z-index: -1;
  }
  @keyframes logoGlowRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .about-page-container .hero-app-title {
    font-size: clamp(32px, 8vw, 48px);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0;
    background: linear-gradient(135deg, #ff9a8b 0%, #ff6a88 40%, #d07eff 70%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .about-page-container .hero-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 8px 0 20px 0;
    line-height: 1.5;
  }

  .about-page-container .about-layout { display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; z-index: 10; position: relative; }
  .about-page-container .about-main-pane, .about-page-container .about-side-pane { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

  .about-page-container .section-headline {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-tertiary);
    margin: 0 0 16px 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .about-page-container .about-intro-card { padding: 24px; }
  .about-page-container .about-paragraph {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    font-weight: 500;
  }
  .about-page-container .about-chips-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .about-page-container .value-pill {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    padding: 6px 12px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .about-page-container .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
  .about-page-container .feature-card {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--glass-base);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    min-height: 60px;
    box-sizing: border-box;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .about-page-container .feature-card:hover {
    border-color: rgba(208, 126, 255, 0.3);
    background: var(--glass-elevated);
  }
  .about-page-container .feature-icon-wrapper {
    color: var(--accent-purple);
    background: rgba(139, 92, 246, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .about-page-container .feature-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0; }
  .about-page-container .feature-desc { font-size: 11px; color: var(--text-tertiary); line-height: 1.3; margin: 2px 0 0 0; }

  .about-page-container .credits-section { padding: 24px; }
  .about-page-container .credits-badges-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .about-page-container .tech-badge {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .about-page-container .dev-card { padding: 24px; }
  .about-page-container .dev-profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .about-page-container .dev-avatar {
    width: 52px; height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ff9a8b 0%, #ff6a88 40%, #d07eff 70%, #8b5cf6 100%);
    display: flex; align-items: center; justify-content: center;
    color: #ffffff;
    font-weight: 800;
    font-size: 18px;
    box-shadow: 0 8px 24px rgba(208, 126, 255, 0.3);
    flex-shrink: 0;
  }
  .about-page-container .dev-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
  .about-page-container .dev-title { font-size: 12px; font-weight: 500; color: var(--text-secondary); margin-top: 2px; }
  .about-page-container .dev-description { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 20px 0; }

  .about-page-container .dev-social-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .about-page-container .dev-social-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 12px 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-sizing: border-box;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .about-page-container .dev-social-btn:hover { background: var(--glass-elevated); border-color: rgba(208, 126, 255, 0.3); }
  .about-page-container .dev-btn-left { display: flex; align-items: center; gap: 8px; }

  .about-page-container .info-table-card { padding: 24px; }
  .about-page-container .info-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--glass-border);
  }
  .about-page-container .info-row:last-child { border-bottom: none; padding-bottom: 0; }
  .about-page-container .info-row:first-child { padding-top: 0; }
  .about-page-container .info-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
  .about-page-container .info-val { font-size: 13px; color: var(--text-primary); font-weight: 600; }

  .about-page-container .support-card, .about-page-container .legal-card { padding: 24px; }
  .about-page-container .nav-list-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--glass-border);
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.2s ease;
  }
  .about-page-container .nav-list-row:last-child { border-bottom: none; }
  .about-page-container .nav-row-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .about-page-container .nav-row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .about-page-container .nav-row-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .about-page-container .nav-row-helper { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }
  .about-page-container .nav-row-chevron { color: var(--text-tertiary); flex-shrink: 0; }

  .about-page-container .footer-section {
    text-align: center;
    padding: 32px 16px 0 16px;
    z-index: 10;
    position: relative;
    border-top: 1px solid var(--glass-border);
    margin-top: 32px;
  }
  .about-page-container .footer-love { font-size: 12px; color: var(--text-tertiary); margin: 0; font-weight: 500; }

  @media (max-width: 840px) {
    .about-page-container .about-layout { grid-template-columns: 1fr; gap: 20px; }
  }
  @media (max-width: 480px) {
    .about-page-container .hero-card-premium { padding: 32px 20px; }
    .about-page-container .dev-social-grid { grid-template-columns: 1fr; }
  }
    .atlas-hero-logo {
  width: 72px;
  height: 72px;
  object-fit: contain;
  display: block;
  border-radius: 18px;
}
`;

export default function AboutAtlas({ onNavigate }) {
  const APP_VERSION = 'v1.0.0';
  const APP_BUILD = '2026.01.15';

  const handlePortfolioClick = () => window.open("https://projectportfolio-blond.vercel.app/", "_blank");
  const handleGithubClick = () => window.open("https://github.com/pavan55kumar", "_blank");
  const handleLinkedinClick = () => window.open("https://www.linkedin.com/in/pavan-kumar-6864b2320/", "_blank");
  const handleEmailClick = () => window.open("https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com", "_blank");
  const handleRateAtlas = () => alert("Atlas will be available for rating after its Play Store release.");
  
  const handleShareAtlas = async () => {
    const shareData = { title: "Atlas", text: "Boost your productivity with Atlas.", url: "https://atlas-rose-psi.vercel.app/" };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); alert("Link copied to clipboard!"); }
    } catch (err) { console.error("Share failed:", err); }
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent("Atlas Bug Report");
    const body = encodeURIComponent(`Describe the issue:\nSteps to reproduce:\nExpected behavior:\nActual behavior:\nDevice:\nAndroid Version:\nAtlas Version:\n`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com&su=${subject}&body=${body}`, "_blank");
  };

  const handleRequestFeature = () => {
    const subject = encodeURIComponent("Atlas Feature Request");
    const body = encodeURIComponent(`Feature Name:\nDescription:\nWhy should Atlas include this?\nAdditional Notes:\n`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=pavanshettigar.dev@gmail.com&su=${subject}&body=${body}`, "_blank");
  };

  const handlePrivacyRedirect = () => onNavigate("privacy");
  const handleTermsRedirect = () => onNavigate("terms");
  const handleLicensesRedirect = () => onNavigate("licenses");
  const handleChangelogRedirect = () => onNavigate("changelog");

  const featuresList = [
    { icon: <CheckSquare size={16} strokeWidth={2} />, title: 'Tasks', desc: 'Active priority lists' },
    { icon: <Activity size={16} strokeWidth={2} />, title: 'Habits', desc: 'Streaks & routine tracking' },
    { icon: <Target size={16} strokeWidth={2} />, title: 'Goals', desc: 'Strategic milestones' },
    { icon: <Calendar size={16} strokeWidth={2} />, title: 'Calendar', desc: 'Time blocking slots' },
    { icon: <Coffee size={16} strokeWidth={2} />, title: 'Focus', desc: 'Deep-work intervals' },
    { icon: <FileText size={16} strokeWidth={2} />, title: 'Notes', desc: 'Quick thought captures' },
    { icon: <TrendingUp size={16} strokeWidth={2} />, title: 'Expenses', desc: 'Sleek cashflow ledgers' },
    { icon: <Layers size={16} strokeWidth={2} />, title: 'Analytics', desc: 'Productivity mapping' },
    { icon: <Sparkles size={16} strokeWidth={2} />, title: 'AI Assistant', desc: 'Cognitive workflow companion' },
    { icon: <Compass size={16} strokeWidth={2} />, title: 'AI Schedule', desc: 'Autonomous schedule builder' }
  ];

  return (
    <div className="about-page-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      <motion.div
        className="hero-card-premium card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="logo-pulse-wrapper">
  <img
    src="/pwa-512x512.png"
    alt="Atlas Logo"
    className="atlas-hero-logo"
  />
</div>
        <h1 className="hero-app-title">Atlas</h1>
        <p className="hero-subtitle">Your Personal Life Operating System</p>
      </motion.div>

      <div className="about-layout">
        <div className="about-main-pane">
          <motion.div
            className="about-intro-card card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <h2 className="section-headline"><Info size={14} /><span>Core Premise</span></h2>
            <p className="about-paragraph">One system. All of life. Atlas brings your tasks, habits, and finances into one calm, AI-guided workspace — built to help you plan less and progress more.</p>
            <div className="about-chips-row">
              <div className="value-pill"><Sparkles size={12} color="#d07eff" /><span>AI Powered</span></div>
              <div className="value-pill"><Target size={12} color="#f59e0b" /><span>Productivity Workspace</span></div>
              <div className="value-pill"><Compass size={12} color="#60a5fa" /><span>Cross Platform</span></div>
              <div className="value-pill"><ShieldCheck size={12} color="#10b981" /><span>Privacy First</span></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="section-headline" style={{ paddingLeft: '4px', marginBottom: '12px' }}>
              <Layers size={14} /><span>Personal Operating Engines</span>
            </h2>
            <div className="features-grid">
              {featuresList.map((item, idx) => (
                <motion.div
                  className="feature-card"
                  key={idx}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="feature-icon-wrapper">{item.icon}</div>
                  <div>
                    <h4 className="feature-title">{item.title}</h4>
                    <p className="feature-desc">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="credits-section card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="section-headline"><Code size={14} /><span>System Stack</span></h2>
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

        <div className="about-side-pane">
          <motion.div
            className="dev-card card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="dev-profile-header">
              <div className="dev-avatar">PK</div>
              <div>
                <h3 className="dev-name">Pavan Kumar</h3>
                <span className="dev-title">Software Developer</span>
              </div>
            </div>
            <p className="dev-description">Crafting cohesive, highly responsive digital interfaces balancing structural logic and typographic performance.</p>
            <div className="dev-social-grid">
              <motion.button onClick={handlePortfolioClick} className="dev-social-btn" whileTap={{ opacity: 0.8 }}>
                <span className="dev-btn-left"><Globe size={14} color="#8b5cf6" /><span>Portfolio</span></span>
                <ArrowUpRight size={14} opacity={0.5} />
              </motion.button>
              <motion.button onClick={handleGithubClick} className="dev-social-btn" whileTap={{ opacity: 0.8 }}>
                <span className="dev-btn-left"><Code size={14} color="#f59e0b" /><span>GitHub</span></span>
                <ArrowUpRight size={14} opacity={0.5} />
              </motion.button>
              <motion.button onClick={handleLinkedinClick} className="dev-social-btn" whileTap={{ opacity: 0.8 }}>
                <span className="dev-btn-left"><Globe size={14} color="#60a5fa" /><span>LinkedIn</span></span>
                <ArrowUpRight size={14} opacity={0.5} />
              </motion.button>
              <motion.button onClick={handleEmailClick} className="dev-social-btn" whileTap={{ opacity: 0.8 }}>
                <span className="dev-btn-left"><Mail size={14} color="#10b981" /><span>Contact</span></span>
                <ArrowUpRight size={14} opacity={0.5} />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            className="info-table-card card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <h2 className="section-headline"><Terminal size={14} /><span>App Details</span></h2>
            <div className="info-row"><span className="info-label">Version</span><span className="info-val">{APP_VERSION}</span></div>
            <div className="info-row"><span className="info-label">Build</span><span className="info-val">{APP_BUILD}</span></div>
            <div className="info-row"><span className="info-label">Platform</span><span className="info-val">Cross-Platform Web</span></div>
            <div className="info-row"><span className="info-label">Release</span><span className="info-val">July 2026</span></div>
            <div className="info-row"><span className="info-label">Developer</span><span className="info-val">Pavan Kumar</span></div>
          </motion.div>

          <motion.div
            className="support-card card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
          >
            <h2 className="section-headline"><HelpCircle size={14} /><span>Channels &amp; Support</span></h2>
            <NavListRow icon={<Star size={16} style={{ fill: '#f59e0b' }} />} accent="rgba(245, 158, 11, 0.1)" color="#f59e0b" title="Rate App" helper="Leave us a rating" onClick={handleRateAtlas} />
            <NavListRow icon={<Share2 size={16} />} accent="rgba(139, 92, 246, 0.1)" color="#8b5cf6" title="Share App" helper="Tell a friend about Atlas" onClick={handleShareAtlas} />
            <NavListRow icon={<ShieldAlert size={16} />} accent="rgba(239, 68, 68, 0.1)" color="#ef4444" title="Report a Bug" helper="Help us squash issues fast" onClick={handleReportBug} />
            <NavListRow icon={<Sparkles size={16} />} accent="rgba(96, 165, 250, 0.1)" color="#60a5fa" title="Suggest a Feature" helper="Share ideas for what's next" onClick={handleRequestFeature} />
          </motion.div>

          <motion.div
            className="legal-card card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="section-headline"><ShieldCheck size={14} /><span>Updates &amp; Legal</span></h2>
            <NavListRow icon={<Rocket size={16} />} accent="rgba(139, 92, 246, 0.1)" color="#8b5cf6" title="What's New" onClick={handleChangelogRedirect} />
            <NavListRow icon={<Lock size={16} />} accent="rgba(16, 185, 129, 0.1)" color="#10b981" title="Privacy Policy" onClick={handlePrivacyRedirect} />
            <NavListRow icon={<FileText size={16} />} accent="rgba(148, 163, 184, 0.1)" color="#94a3b8" title="Terms & Conditions" onClick={handleTermsRedirect} />
            <NavListRow icon={<Code size={16} />} accent="rgba(148, 163, 184, 0.1)" color="#94a3b8" title="Open Source Licenses" onClick={handleLicensesRedirect} />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="footer-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <p className="footer-love">Made with <Heart size={10} style={{ fill: '#ef4444', color: '#ef4444', display: 'inline-block' }} /> by Pavan Kumar • © Atlas</p>
      </motion.div>
    </div>
  )
}

function NavListRow({ icon, accent, color, title, helper, onClick }) {
  return (
    <motion.div
      className="nav-list-row"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}
      whileTap={{ opacity: 0.7 }}
    >
      <span className="nav-row-icon" style={{ background: accent, color: color }}>{icon}</span>
      <span className="nav-row-text">
        <span className="nav-row-title">{title}</span>
        {helper && <span className="nav-row-helper">{helper}</span>}
      </span>
      <ChevronRight size={16} className="nav-row-chevron" />
    </motion.div>
  )
}