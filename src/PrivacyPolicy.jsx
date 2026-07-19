import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowUp, Info, Database, Brain, Lock, Globe, 
  ShieldCheck, UserCheck, AlertCircle, RefreshCw, Mail, ExternalLink
} from 'lucide-react';

const LAST_UPDATED = 'July 2026';
const CONTACT_EMAIL = 'pavanshettigar.dev@gmail.com';

const TOC_ITEMS = [
  { id: 'introduction', number: '01', title: 'Introduction' },
  { id: 'information-we-collect', number: '02', title: 'Information We Collect' },
  { id: 'ai-features', number: '03', title: 'How Our AI Features Work' },
  { id: 'data-storage-security', number: '04', title: 'Data Storage & Security' },
  { id: 'third-party-services', number: '05', title: 'Third-Party Services We Use' },
  { id: 'no-ads', number: '06', title: 'No Ads, No Selling of Data' },
  { id: 'rights-retention', number: '07', title: 'Your Rights & Data Retention' },
  { id: 'childrens-privacy', number: '08', title: "Children's Privacy" },
  { id: 'changes', number: '09', title: 'Changes to This Policy' },
  { id: 'contact', number: '10', title: 'Contact Us' },
];

const styles = `
  .atlas-privacy-container {
    max-width: 820px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }
  .atlas-privacy-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .atlas-privacy-back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s;
  }
  .atlas-privacy-back-btn:hover, .atlas-privacy-back-btn:focus-visible {
    background: var(--surface);
    border-color: var(--accent);
    outline: none;
  }
  .atlas-privacy-title-block {
    flex: 1;
    min-width: 0;
  }
  .atlas-privacy-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .atlas-privacy-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 4px 0 0 0;
  }
  .atlas-privacy-updated {
    font-size: 13px;
    color: var(--text-muted);
    margin-top: 4px;
    opacity: 0.8;
  }
  
  .atlas-privacy-intro {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }
  .atlas-privacy-intro-icon {
    color: var(--accent);
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .atlas-privacy-toc {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }
  .atlas-privacy-toc-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin: 0 0 16px 0;
  }
  .atlas-privacy-toc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2px;
  }
  .atlas-privacy-toc-link {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text-muted);
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
    cursor: pointer;
  }
  .atlas-privacy-toc-link:hover {
    color: var(--text);
    background-color: var(--surface);
  }
  .atlas-privacy-toc-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .atlas-privacy-toc-number {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    min-width: 20px;
  }
  
  .atlas-privacy-section {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    scroll-margin-top: 80px;
    transition: border-color 0.2s ease;
  }
  .atlas-privacy-section:hover {
    border-color: var(--accent);
  }
  .atlas-privacy-section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .atlas-privacy-section-number {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    font-variant-numeric: tabular-nums;
  }
  .atlas-privacy-section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--surface);
    color: var(--accent);
  }
  .atlas-privacy-section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.01em;
  }
  
  .atlas-privacy-text {
    font-size: 14px;
    line-height: 1.75;
    color: var(--text-muted);
    margin: 0 0 12px 0;
  }
  .atlas-privacy-text:last-child {
    margin-bottom: 0;
  }
  .atlas-privacy-text strong {
    color: var(--text);
    font-weight: 600;
  }
  
  .atlas-privacy-list {
    margin: 0 0 12px 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    list-style-type: disc;
  }
  .atlas-privacy-list:last-child {
    margin-bottom: 0;
  }
  .atlas-privacy-list li {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted);
    padding-left: 4px;
  }
  .atlas-privacy-list li::marker {
    color: var(--accent);
  }
  .atlas-privacy-list li strong {
    color: var(--text);
    font-weight: 600;
  }
  
  .atlas-privacy-note {
    font-size: 12px;
    color: #f59e0b; 
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 8px;
    padding: 10px 12px;
    margin-top: 12px;
    line-height: 1.5;
  }
  
  .atlas-privacy-contact-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    margin-top: 8px;
    transition: opacity 0.2s ease;
  }
  .atlas-privacy-contact-btn:hover {
    opacity: 0.9;
  }
  .atlas-privacy-contact-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  
  .atlas-privacy-back-to-top {
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    right: calc(20px + env(safe-area-inset-right, 0px));
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease, background-color 0.15s ease;
    z-index: 40;
  }
  .atlas-privacy-back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .atlas-privacy-back-to-top:hover {
    background-color: var(--surface);
    border-color: var(--accent);
  }
  .atlas-privacy-back-to-top:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  
  @media (max-width: 640px) {
    .atlas-privacy-section {
      padding: 20px;
    }
    .atlas-privacy-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    * {
      scroll-behavior: auto !important;
      transition: none !important;
    }
  }
`;

function PrivacySection({ id, number, title, icon, children }) {
  return (
    <motion.section 
      id={id} 
      className="atlas-privacy-section"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="atlas-privacy-section-header">
        <span className="atlas-privacy-section-number">{number}</span>
        {icon && <span className="atlas-privacy-section-icon">{icon}</span>}
        <h2 className="atlas-privacy-section-title">{title}</h2>
      </div>
      <div className="atlas-privacy-section-body">
        {children}
      </div>
    </motion.section>
  );
}

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const topSentinelRef = useRef(null);
  
  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/about');
    }
  };

  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });
      if (window.history.replaceState) {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  }, [prefersReducedMotion]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowBackToTop(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );

    if (topSentinelRef.current) {
      observer.observe(topSentinelRef.current);
    }

    return () => {
      if (topSentinelRef.current) {
        observer.unobserve(topSentinelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start"
          });
        });
      }
    }
  }, [prefersReducedMotion]);

  return (
    <main className="atlas-privacy-container">
      <style>{styles}</style>

      <header className="atlas-privacy-header">
        <button 
          className="atlas-privacy-back-btn" 
          onClick={handleBack}
          aria-label="Navigate back to About ATLAS"
          title="Back to About"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="atlas-privacy-title-block">
          <h1 className="atlas-privacy-title">Privacy Policy</h1>
          <p className="atlas-privacy-subtitle">How ATLAS collects, uses, stores, and protects your information.</p>
          <p className="atlas-privacy-updated">Last Updated: {LAST_UPDATED}</p>
        </div>
      </header>

      <div ref={topSentinelRef} />

      <div className="atlas-privacy-intro">
        <ShieldCheck size={20} className="atlas-privacy-intro-icon" />
        <div>
          Atlas is built around a simple principle: your personal data belongs to you. This
          policy explains what we collect, why we collect it, how it's used — including by the
          AI features — and the choices you have. It applies to the Atlas web app, the installable
          Progressive Web App, and the Atlas Android app.
        </div>
      </div>

      <nav aria-label="Privacy Policy sections" className="atlas-privacy-toc">
        <h2 className="atlas-privacy-toc-title">Table of Contents</h2>
        <div className="atlas-privacy-toc-grid">
          {TOC_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="atlas-privacy-toc-link"
              onClick={(e) => handleTocClick(e, item.id)}
            >
              <span className="atlas-privacy-toc-number">{item.number}</span>
              <span>{item.title}</span>
            </a>
          ))}
        </div>
      </nav>

      <PrivacySection id="introduction" number="01" title="Introduction" icon={<Info size={16} />}>
        <p className="atlas-privacy-text">
          This Privacy Policy describes how Atlas ("Atlas", "we", "us") handles information
          when you use the application across the Web, Progressive Web App (PWA), and Android
          (built with Capacitor) platforms. By creating an account or using Atlas, you agree to
          the practices described here.
        </p>
        <div className="atlas-privacy-note">
          TODO: Insert the legal entity name and jurisdiction (e.g. "Atlas is operated by
          [Name/Company], based in [Country]") once that's finalized — reviewers and some
          regulations expect this.
        </div>
      </PrivacySection>

      <PrivacySection id="information-we-collect" number="02" title="Information We Collect" icon={<Database size={16} />}>
        <p className="atlas-privacy-text"><strong>Account information.</strong> When you sign up, we collect your email address and manage your credentials through Supabase Authentication. Atlas does not store your raw password — authentication is handled by Supabase's secure auth system.</p>
        <p className="atlas-privacy-text"><strong>Content you create.</strong> Atlas stores the information you enter so it can function as your productivity workspace, including:</p>
        <ul className="atlas-privacy-list">
          <li><strong>Core productivity data:</strong> tasks, habits, goals, and calendar events</li>
          <li><strong>Notes and expenses</strong> you record</li>
          <li><strong>Academic data:</strong> subjects, attendance records, assignments, CGPA planner entries, and study planner information</li>
          <li><strong>AI conversations</strong> — prompts and responses from the AI Assistant, AI Daily Brief, AI Scheduling, and AI Suggestions features, where applicable</li>
        </ul>
        <p className="atlas-privacy-text"><strong>Technical information.</strong> Basic device and app information (such as browser type or app version) may be processed to keep Atlas working correctly across web, PWA, and Android. At this time, Atlas does not integrate third-party advertising or analytics SDKs beyond what's described in this policy.</p>
      </PrivacySection>

      <PrivacySection id="ai-features" number="03" title="How Our AI Features Work" icon={<Brain size={16} />}>
        <p className="atlas-privacy-text">
          Atlas's AI Assistant, AI Daily Brief, AI Scheduling, and AI Suggestions are powered by
          the <strong>Groq API</strong>. When you use one of these features, the relevant
          content — such as your prompt, or the task/schedule context needed to generate a
          useful response — is sent to Groq's servers for processing. Groq processes this data
          to return a response to Atlas; it is not used by Atlas for advertising.
        </p>
        <p className="atlas-privacy-text">
          Groq's handling of data sent to its API is governed by Groq's own privacy policy,
          which we encourage you to review.
        </p>
        <div className="atlas-privacy-note">
          TODO: Confirm Groq's current data-retention terms for API traffic (e.g. whether prompts
          are retained/used for training) and link the exact policy URL from groq.com here.
        </div>
      </PrivacySection>

      <PrivacySection id="data-storage-security" number="04" title="Data Storage & Security" icon={<Lock size={16} />}>
        <p className="atlas-privacy-text">
          Your data is stored in a <strong>Supabase</strong>-managed PostgreSQL database and
          transmitted using encrypted connections (HTTPS/TLS). Atlas is designed so that each
          account can only access its own data.
        </p>
        <div className="atlas-privacy-note">
          TODO (developer, not just copy): Confirm Supabase Row Level Security (RLS) policies
          are actually enabled on every table listed in Section 2 before this claim goes live —
          this line should reflect the real configuration, not just the intended one.
        </div>
        <p className="atlas-privacy-text">
          No online service can guarantee absolute security. We take reasonable technical
          measures to protect your data, but you should also use a strong, unique password for
          your account.
        </p>
      </PrivacySection>

      <PrivacySection id="third-party-services" number="05" title="Third-Party Services We Use" icon={<Globe size={16} />}>
        <p className="atlas-privacy-text">
          Atlas relies on a small number of trusted service providers ("sub-processors") to
          operate:
        </p>
        <ul className="atlas-privacy-list">
          <li><strong>Supabase</strong> — authentication and database hosting</li>
          <li><strong>Groq</strong> — AI inference for Atlas's AI features (see Section 3)</li>
          <li><strong>Vercel</strong> — web app hosting and delivery</li>
        </ul>
        <p className="atlas-privacy-text">
          These providers only receive the data necessary to perform their function for Atlas
          and are not permitted to use it for their own advertising purposes.
        </p>
        <div className="atlas-privacy-note">
          TODO: Add/remove providers here if the hosting or infra stack changes (e.g. if push
          notifications, crash reporting, or an app-store analytics SDK is added later).
        </div>
      </PrivacySection>

      <PrivacySection id="no-ads" number="06" title="No Ads, No Selling of Data" icon={<ShieldCheck size={16} />}>
        <p className="atlas-privacy-text">
          Atlas does not display third-party advertisements. We do <strong>not</strong> sell,
          rent, or trade your personal information or content to third parties for marketing or
          advertising purposes. Data is used solely to provide and improve the Atlas experience
          for you.
        </p>
      </PrivacySection>

      <PrivacySection id="rights-retention" number="07" title="Your Rights & Data Retention" icon={<UserCheck size={16} />}>
        <p className="atlas-privacy-text">
          You can access, edit, or delete most of your content directly within Atlas. Your data
          is retained for as long as your account remains active.
        </p>
        <ul className="atlas-privacy-list">
          <li><strong>Access &amp; export:</strong> you may request a copy of your stored data</li>
          <li><strong>Correction:</strong> you can edit incorrect information directly in the app</li>
          <li><strong>Deletion:</strong> you may request full account and data deletion at any time</li>
        </ul>
        <p className="atlas-privacy-text">
          To exercise any of these rights, contact us using the details in Section 10.
        </p>
        <div className="atlas-privacy-note">
          TODO: If Atlas will have users in the EU/UK or California, add explicit GDPR (Art.
          15–17) or CCPA-style clauses here and consider naming a data controller/contact for
          those regimes.
        </div>
      </PrivacySection>

      <PrivacySection id="childrens-privacy" number="08" title="Children's Privacy" icon={<AlertCircle size={16} />}>
        <p className="atlas-privacy-text">
          Atlas is not directed at children, and we do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with
          personal information, please contact us so we can remove it.
        </p>
        <div className="atlas-privacy-note">
          TODO: Confirm the intended minimum age for Atlas (13 is the common baseline, but some
          regions/app stores expect 16) and adjust this section and your Play Store data-safety
          form to match.
        </div>
      </PrivacySection>

      <PrivacySection id="changes" number="09" title="Changes to This Policy" icon={<RefreshCw size={16} />}>
        <p className="atlas-privacy-text">
          We may update this Privacy Policy as Atlas evolves — for example, if we add new
          features or change service providers. Material changes will be reflected by updating
          the "Last updated" date above, and where appropriate, we'll provide a more prominent
          notice in the app.
        </p>
      </PrivacySection>

      <PrivacySection id="contact" number="10" title="Contact Us" icon={<Mail size={16} />}>
        <p className="atlas-privacy-text">
          If you have questions about this Privacy Policy or how your data is handled, reach
          out any time:
        </p>
        <a 
          href={`mailto:${CONTACT_EMAIL}`} 
          className="atlas-privacy-contact-btn"
          aria-label={`Email ATLAS support at ${CONTACT_EMAIL}`}
        >
          <Mail size={16} />
          {CONTACT_EMAIL}
        </a>
      </PrivacySection>

      <button 
        className={`atlas-privacy-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
      >
        <ArrowUp size={20} />
      </button>
    </main>
  );
}