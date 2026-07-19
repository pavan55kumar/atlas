import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Info, Database, Brain, Lock, Globe, ShieldCheck,
  UserCheck, AlertCircle, RefreshCw, Mail, ExternalLink, ChevronUp
} from 'lucide-react'

// TODO: Bump this whenever the policy content actually changes — shown to users below.
const LAST_UPDATED = 'July 2026'
const CONTACT_EMAIL = 'pavanshettigar.dev@gmail.com'

// ============================================================================
// STYLES — Premium CSS matching the ATLAS design system variables
// ============================================================================
const stylesCSS = `
  .privacy-container {
    max-width: 820px;
    margin: 0 auto;
    color: var(--text, #f5f5f7);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif;
    box-sizing: border-box;
    position: relative;
  }

  @media (prefers-reduced-motion: reduce) {
    .privacy-container {
      scroll-behavior: auto !important;
    }
    .privacy-back-btn, .privacy-section-card, .privacy-toc-link, .privacy-contact-btn, .privacy-btt-btn {
      transition: none !important;
    }
  }

  .privacy-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
    padding-top: 8px;
  }

  .privacy-back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    background-color: var(--surface, #131316);
    color: var(--text, #f5f5f7);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    flex-shrink: 0;
  }

  .privacy-back-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
    border-color: var(--text-muted, #71717a);
  }

  .privacy-back-btn:active {
    transform: scale(0.97);
  }

  .privacy-back-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }

  .privacy-header-content {
    flex: 1;
    min-width: 0;
  }

  .privacy-title {
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 6px 0;
    color: var(--text, #f5f5f7);
    line-height: 1.2;
  }

  .privacy-subtitle {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    margin: 0 0 8px 0;
    line-height: 1.4;
  }

  .privacy-updated-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent, #8b5cf6);
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    padding: 3px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .privacy-intro-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .privacy-intro-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    color: var(--accent, #8b5cf6);
    flex-shrink: 0;
  }

  .privacy-intro-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted, #a1a1aa);
    margin: 0;
  }

  .privacy-toc-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 32px;
  }

  .privacy-toc-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted, #71717a);
    margin: 0 0 16px 0;
  }

  .privacy-toc-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 4px;
  }

  @media (min-width: 640px) {
    .privacy-toc-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .privacy-toc-link {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 8px;
    font-size: 13.5px;
    color: var(--text-muted, #a1a1aa);
    text-decoration: none;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .privacy-toc-link:hover {
    color: var(--text, #f5f5f7);
    background-color: var(--surface, #131316);
  }

  .privacy-toc-link:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
  }

  .privacy-toc-number {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent, #8b5cf6);
    min-width: 20px;
  }

  .privacy-sections {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
  }

  .privacy-section-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 24px;
    scroll-margin-top: calc(76px + env(safe-area-inset-top, 0px));
    box-sizing: border-box;
    transition: border-color 0.15s ease;
  }

  .privacy-section-card:hover {
    border-color: var(--accent, #8b5cf6);
  }

  .privacy-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .privacy-section-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .privacy-section-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: var(--text, #f5f5f7);
    letter-spacing: -0.01em;
  }

  .privacy-section-number {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent, #8b5cf6);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
    display: block;
  }

  .privacy-text {
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-muted, #a1a1aa);
    margin: 0 0 14px 0;
  }

  .privacy-text:last-child {
    margin-bottom: 0;
  }

  .privacy-text strong {
    color: var(--text, #f5f5f7);
    font-weight: 600;
  }

  .privacy-list {
    margin: 0 0 14px 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .privacy-list:last-child {
    margin-bottom: 0;
  }

  .privacy-list li {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted, #a1a1aa);
  }

  .privacy-list li strong {
    color: var(--text, #f5f5f7);
    font-weight: 600;
  }

  .privacy-todo-note {
    font-size: 12px;
    color: var(--accent-amber, #f59e0b);
    background-color: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 10px;
    padding: 12px;
    margin-top: 14px;
    line-height: 1.5;
  }

  .privacy-contact-card {
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.06));
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    margin-top: 16px;
  }

  .privacy-contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.12));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    color: var(--accent, #8b5cf6);
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    margin-top: 12px;
  }

  .privacy-contact-btn:hover {
    background-color: rgba(139, 92, 246, 0.20);
    border-color: rgba(139, 92, 246, 0.35);
  }

  .privacy-btt-btn {
    position: fixed;
    bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    right: calc(24px + env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    color: var(--text, #f5f5f7);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 100;
    opacity: 0;
    transform: translateY(16px);
    pointer-events: none;
    transition: opacity 0.25s ease, transform 0.25s ease, background-color 0.15s ease;
  }

  .privacy-btt-btn.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .privacy-btt-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
  }

  .privacy-btt-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }

  .privacy-footer {
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 24px;
    padding-bottom: 12px;
    text-align: center;
  }

  .privacy-footer-text {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-muted, #71717a);
    margin: 0 0 6px 0;
  }

  .privacy-footer-text:last-child {
    margin-bottom: 0;
  }
`;

// ============================================================================
// HELPER COMPONENT — Reusable section card with explicit structural elements
// ============================================================================
function PrivacySection({ id, number, icon, accent, title, children }) {
  return (
    <section id={id} className="privacy-section-card" aria-labelledby={`${id}-heading`}>
      <div className="privacy-section-header">
        <span className="privacy-section-icon-wrap" style={{ backgroundColor: `${accent}12`, color: accent }}>
          {icon}
        </span>
        <div>
          <span className="privacy-section-number">{number}</span>
          <h2 id={`${id}-heading`} className="privacy-section-title">{title}</h2>
        </div>
      </div>
      <div className="privacy-section-content">
        {children}
      </div>
    </section>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export default function PrivacyPolicy({ onNavigate }) {
  const navigate = useNavigate();
  const [showBtt, setShowBtt] = useState(false);

  function handleBack() {
    onNavigate ? onNavigate('about') : navigate('/about');
  }

  function handleContact() {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent('Atlas Privacy Question')}`,
      '_blank'
    );
  }

  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  const handleScrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // Passive scroll observer for the Back-to-Top trigger
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShowBtt(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="privacy-container">
      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />

      {/* ============================================================ HEADER */}
      <header className="privacy-header">
        <button
          className="privacy-back-btn"
          onClick={handleBack}
          aria-label="Navigate back to About ATLAS"
          title="Back to About"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="privacy-header-content">
          <h1 className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">
            How ATLAS collects, uses, stores, and protects your information.
          </p>
          <span className="privacy-updated-badge">Last Updated: {LAST_UPDATED}</span>
        </div>
      </header>

      {/* ============================================================ INTRODUCTION */}
      <section className="privacy-intro-card" aria-labelledby="intro-heading">
        <span className="privacy-intro-icon-wrap" aria-hidden="true">
          <ShieldCheck size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 id="intro-heading" style={{ display: 'none' }}>Introduction Summary</h2>
          <p className="privacy-intro-text">
            Atlas is built around a simple principle: your personal data belongs to you. This
            policy explains what we collect, why we collect it, how it's used — including by the
            AI features — and the choices you have. It applies to the Atlas web app, the installable
            Progressive Web App, and the Atlas Android app.
          </p>
        </div>
      </section>

      {/* ============================================================ TABLE OF CONTENTS */}
      <nav className="privacy-toc-card" aria-label="Privacy policy sections">
        <h2 className="privacy-toc-title">Sections</h2>
        <div className="privacy-toc-grid">
          <a href="#introduction" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "introduction")}>
            <span className="privacy-toc-number">01</span>
            <span>Introduction</span>
          </a>
          <a href="#information-we-collect" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "information-we-collect")}>
            <span className="privacy-toc-number">02</span>
            <span>Information We Collect</span>
          </a>
          <a href="#ai-features" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "ai-features")}>
            <span className="privacy-toc-number">03</span>
            <span>How Our AI Features Work</span>
          </a>
          <a href="#data-storage-security" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "data-storage-security")}>
            <span className="privacy-toc-number">04</span>
            <span>Data Storage & Security</span>
          </a>
          <a href="#third-party-services" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "third-party-services")}>
            <span className="privacy-toc-number">05</span>
            <span>Third-Party Services</span>
          </a>
          <a href="#no-ads" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "no-ads")}>
            <span className="privacy-toc-number">06</span>
            <span>No Ads, No Selling of Data</span>
          </a>
          <a href="#rights-retention" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "rights-retention")}>
            <span className="privacy-toc-number">07</span>
            <span>Your Rights & Data Retention</span>
          </a>
          <a href="#children-privacy" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "children-privacy")}>
            <span className="privacy-toc-number">08</span>
            <span>Children's Privacy</span>
          </a>
          <a href="#changes-policy" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "changes-policy")}>
            <span className="privacy-toc-number">09</span>
            <span>Changes to This Policy</span>
          </a>
          <a href="#contact-us" className="privacy-toc-link" onClick={(e) => handleTocClick(e, "contact-us")}>
            <span className="privacy-toc-number">10</span>
            <span>Contact Us</span>
          </a>
        </div>
      </nav>

      {/* ============================================================ DOCUMENT SECTIONS */}
      <main className="privacy-sections">

        {/* SECTION 1: INTRODUCTION */}
        <PrivacySection
          id="introduction"
          number="Section 01"
          icon={<Info size={16} />}
          accent="#8b5cf6"
          title="Introduction"
        >
          <p className="privacy-text">
            This Privacy Policy describes how Atlas ("Atlas", "we", "us") handles information
            when you use the application across the Web, Progressive Web App (PWA), and Android
            (built with Capacitor) platforms. By creating an account or using Atlas, you agree to
            the practices described here.
          </p>
          <div className="privacy-todo-note">
            TODO: Insert the legal entity name and jurisdiction (e.g. "Atlas is operated by
            [Name/Company], based in [Country]") once that's finalized — reviewers and some
            regulations expect this.
          </div>
        </PrivacySection>

        {/* SECTION 2: INFORMATION WE COLLECT */}
        <PrivacySection
          id="information-we-collect"
          number="Section 02"
          icon={<Database size={16} />}
          accent="#60a5fa"
          title="Information We Collect"
        >
          <p className="privacy-text">
            <strong>Account information.</strong> When you sign up, we collect your email address and manage your credentials through Supabase Authentication. Atlas does not store your raw password — authentication is handled by Supabase's secure auth system.
          </p>
          <p className="privacy-text">
            <strong>Content you create.</strong> Atlas stores the information you enter so it can function as your productivity workspace, including:
          </p>
          <ul className="privacy-list">
            <li><strong>Core productivity data:</strong> tasks, habits, goals, and calendar events</li>
            <li><strong>Notes and expenses</strong> you record</li>
            <li><strong>Academic data:</strong> subjects, attendance records, assignments, CGPA planner entries, and study planner information</li>
            <li><strong>AI conversations</strong> — prompts and responses from the AI Assistant, AI Daily Brief, AI Scheduling, and AI Suggestions features, where applicable</li>
          </ul>
          <p className="privacy-text">
            <strong>Technical information.</strong> Basic device and app information (such as browser type or app version) may be processed to keep Atlas working correctly across web, PWA, and Android. At this time, Atlas does not integrate third-party advertising or analytics SDKs beyond what's described in this policy.
          </p>
        </PrivacySection>

        {/* SECTION 3: AI FEATURES */}
        <PrivacySection
          id="ai-features"
          number="Section 03"
          icon={<Brain size={16} />}
          accent="#a78bfa"
          title="How Our AI Features Work"
        >
          <p className="privacy-text">
            Atlas's AI Assistant, AI Daily Brief, AI Scheduling, and AI Suggestions are powered by
            the <strong>Groq API</strong>. When you use one of these features, the relevant
            content — such as your prompt, or the task/schedule context needed to generate a
            useful response — is sent to Groq's servers for processing. Groq processes this data
            to return a response to Atlas; it is not used by Atlas for advertising.
          </p>
          <p className="privacy-text">
            Groq's handling of data sent to its API is governed by Groq's own privacy policy,
            which we encourage you to review.
          </p>
          <div className="privacy-todo-note">
            TODO: Confirm Groq's current data-retention terms for API traffic (e.g. whether prompts
            are retained/used for training) and link the exact policy URL from groq.com here.
          </div>
        </PrivacySection>

        {/* SECTION 4: STORAGE SECURITY */}
        <PrivacySection
          id="data-storage-security"
          number="Section 04"
          icon={<Lock size={16} />}
          accent="#10b981"
          title="Data Storage & Security"
        >
          <p className="privacy-text">
            Your data is stored in a <strong>Supabase</strong>-managed PostgreSQL database and
            transmitted using encrypted connections (HTTPS/TLS). Atlas is designed so that each
            account can only access its own data.
          </p>
          <div className="privacy-todo-note">
            TODO (developer, not just copy): Confirm Supabase Row Level Security (RLS) policies
            are actually enabled on every table listed in Section 2 before this claim goes live —
            this line should reflect the real configuration, not just the intended one.
          </div>
          <p className="privacy-text">
            No online service can guarantee absolute security. We take reasonable technical
            measures to protect your data, but you should also use a strong, unique password for
            your account.
          </p>
        </PrivacySection>

        {/* SECTION 5: THIRD-PARTY SERVICES */}
        <PrivacySection
          id="third-party-services"
          number="Section 05"
          icon={<Globe size={16} />}
          accent="#60a5fa"
          title="Third-Party Services We Use"
        >
          <p className="privacy-text">
            Atlas relies on a small number of trusted service providers ("sub-processors") to
            operate:
          </p>
          <ul className="privacy-list">
            <li><strong>Supabase</strong> — authentication and database hosting</li>
            <li><strong>Groq</strong> — AI inference for Atlas's AI features (see Section 3)</li>
            <li><strong>Vercel</strong> — web app hosting and delivery</li>
          </ul>
          <p className="privacy-text">
            These providers only receive the data necessary to perform their function for Atlas
            and are not permitted to use it for their own advertising purposes.
          </p>
          <div className="privacy-todo-note">
            TODO: Add/remove providers here if the hosting or infra stack changes (e.g. if push
            notifications, crash reporting, or an app-store analytics SDK is added later).
          </div>
        </PrivacySection>

        {/* SECTION 6: NO ADS / DATA MARKETING */}
        <PrivacySection
          id="no-ads"
          number="Section 06"
          icon={<ShieldCheck size={16} />}
          accent="#f59e0b"
          title="No Ads, No Selling of Data"
        >
          <p className="privacy-text">
            Atlas does not display third-party advertisements. We do <strong>not</strong> sell,
            rent, or trade your personal information or content to third parties for marketing or
            advertising purposes. Data is used solely to provide and improve the Atlas experience
            for you.
          </p>
        </PrivacySection>

        {/* SECTION 7: RIGHTS & RETENTION */}
        <PrivacySection
          id="rights-retention"
          number="Section 07"
          icon={<UserCheck size={16} />}
          accent="#8b5cf6"
          title="Your Rights & Data Retention"
        >
          <p className="privacy-text">
            You can access, edit, or delete most of your content directly within Atlas. Your data
            is retained for as long as your account remains active.
          </p>
          <ul className="privacy-list">
            <li><strong>Access &amp; export:</strong> you may request a copy of your stored data</li>
            <li><strong>Correction:</strong> you can edit incorrect information directly in the app</li>
            <li><strong>Deletion:</strong> you may request full account and data deletion at any time</li>
          </ul>
          <p className="privacy-text">
            To exercise any of these rights, contact us using the details in Section 10.
          </p>
          <div className="privacy-todo-note">
            TODO: If Atlas will have users in the EU/UK or California, add explicit GDPR (Art.
            15–17) or CCPA-style clauses here and consider naming a data controller/contact for
            those regimes.
          </div>
        </PrivacySection>

        {/* SECTION 8: CHILDREN'S PRIVACY */}
        <PrivacySection
          id="children-privacy"
          number="Section 08"
          icon={<AlertCircle size={16} />}
          accent="#ef4444"
          title="Children's Privacy"
        >
          <p className="privacy-text">
            Atlas is not directed at children, and we do not knowingly collect personal
            information from children under 13. If you believe a child has provided us with
            personal information, please contact us so we can remove it.
          </p>
          <div className="privacy-todo-note">
            TODO: Confirm the intended minimum age for Atlas (13 is the common baseline, but some
            regions/app stores expect 16) and adjust this section and your Play Store data-safety
            form to match.
          </div>
        </PrivacySection>

        {/* SECTION 9: CHANGES */}
        <PrivacySection
          id="changes-policy"
          number="Section 09"
          icon={<RefreshCw size={16} />}
          accent="#60a5fa"
          title="Changes to This Policy"
        >
          <p className="privacy-text">
            We may update this Privacy Policy as Atlas evolves — for example, if we add new
            features or change service providers. Material changes will be reflected by updating
            the "Last updated" date above, and where appropriate, we'll provide a more prominent
            notice in the app.
          </p>
        </PrivacySection>

        {/* SECTION 10: CONTACT US */}
        <PrivacySection
          id="contact-us"
          number="Section 10"
          icon={<Mail size={16} />}
          accent="#10b981"
          title="Contact Us"
        >
          <p className="privacy-text">
            If you have questions about this Privacy Policy or how your data is handled, reach
            out any time:
          </p>
          <div className="privacy-contact-card">
            <p className="privacy-text" style={{ fontSize: '13px', margin: '0 0 12px 0' }}>
              We welcome privacy inquiries and aim to address all data concerns in a professional and timely manner.
            </p>
            <button className="privacy-contact-btn" onClick={handleContact} aria-label={`Send email to ${CONTACT_EMAIL}`}>
              <Mail size={14} />
              <span>{CONTACT_EMAIL}</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </PrivacySection>

      </main>

      {/* ============================================================ FOOTER */}
      <footer className="privacy-footer">
        <p className="privacy-footer-text">
          Personal data processed on ATLAS remains subject to standard legal frameworks.
        </p>
        <p className="privacy-footer-text">
          Trademarks and intellectual assets belong exclusively to their respective owners.
        </p>
        <p className="privacy-footer-text">
          © {new Date().getFullYear()} ATLAS. All rights reserved.
        </p>
      </footer>

      {/* ============================================================ BACK TO TOP TRIGGER */}
      <button
        className={`privacy-btt-btn ${showBtt ? 'visible' : ''}`}
        onClick={handleScrollToTop}
        aria-label="Back to top"
        title="Scroll to top"
      >
        <ChevronUp size={18} />
      </button>
    </div>
  )
}