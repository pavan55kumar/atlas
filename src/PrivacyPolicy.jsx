import { motion } from 'framer-motion'
import {
  ArrowLeft, Info, Database, Brain, Lock, Globe, ShieldCheck,
  UserCheck, AlertCircle, RefreshCw, Mail, ExternalLink
} from 'lucide-react'

// TODO: Bump this whenever the policy content actually changes — shown to users below.
const LAST_UPDATED = 'July 2026'
const CONTACT_EMAIL = 'pavanshettigar.dev@gmail.com'

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;

    --canvas-bg: #090810;
    --glass-base: rgba(18, 16, 32, 0.46);
    --glass-sheen-1: rgba(255, 255, 255, 0.04);
    --glass-sheen-2: rgba(255, 255, 255, 0.01);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-highlight: rgba(255, 255, 255, 0.09);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.4);
    --input-border: rgba(255, 255, 255, 0.06);

    --card-shadow: 0 24px 48px -24px rgba(20, 10, 45, 0.5), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
    --aurora-primary: rgba(139, 92, 246, 0.1);
    --aurora-secondary: rgba(96, 165, 250, 0.06);

    --accent-purple: #8b5cf6;
    --accent-purple-light: #a78bfa;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
    --accent-blue: #60a5fa;
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f6f8fa;
    --glass-base: rgba(255, 255, 255, 0.68);
    --glass-sheen-1: rgba(255, 255, 255, 0.45);
    --glass-sheen-2: rgba(255, 255, 255, 0.16);
    --glass-border: rgba(15, 23, 42, 0.07);
    --glass-highlight: rgba(255, 255, 255, 0.8);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.8);
    --input-border: rgba(15, 23, 42, 0.06);
    --card-shadow: 0 16px 36px rgba(30, 20, 80, 0.05), 0 1px 0 rgba(255, 255, 255, 0.65) inset;
    --accent-purple: #6d5ef2;
    --accent-purple-light: #8172f2;
    --accent-amber: #d97706;
  }

  .privacy-page-container {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 760px;
    margin: 0 auto;
    position: relative;
    padding: 20px 16px 40px 16px;
    box-sizing: border-box;
  }

  .aurora-blur-sphere { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
  .sphere-primary { top: -5%; left: -12%; width: 380px; height: 380px; background: var(--aurora-primary); }
  .sphere-secondary { bottom: 0%; right: -12%; width: 340px; height: 340px; background: var(--aurora-secondary); }

  .premium-card-glass {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
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

  .privacy-back-row {
    display: flex; align-items: center; gap: 8px;
    color: var(--text-secondary);
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    padding: 10px 4px;
    margin-bottom: 12px;
    z-index: 10;
    position: relative;
    width: max-content;
    transition: color 0.2s ease;
  }
  .privacy-back-row:hover { color: var(--text-primary); }

  .privacy-hero {
    padding: 28px 24px;
    margin-bottom: 20px;
    z-index: 10;
  }
  .privacy-hero-icon {
    width: 46px; height: 46px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(96, 165, 250, 0.12));
    color: var(--accent-purple-light);
    margin-bottom: 14px;
  }
  .privacy-title { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 6px 0; }
  .privacy-updated { font-size: 12px; color: var(--text-tertiary); font-weight: 500; }
  .privacy-lede { font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); margin: 14px 0 0 0; }

  .privacy-sections { display: flex; flex-direction: column; gap: 16px; z-index: 10; position: relative; }
  .privacy-section-card { padding: 22px 24px; }

  .privacy-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .privacy-section-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .privacy-section-title { font-size: 15px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }

  .privacy-text { font-size: 13.5px; line-height: 1.65; color: var(--text-secondary); margin: 0 0 12px 0; }
  .privacy-text:last-child { margin-bottom: 0; }
  .privacy-text strong { color: var(--text-primary); font-weight: 600; }

  .privacy-list { margin: 0 0 12px 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
  .privacy-list:last-child { margin-bottom: 0; }
  .privacy-list li { font-size: 13.5px; line-height: 1.6; color: var(--text-secondary); }
  .privacy-list li strong { color: var(--text-primary); font-weight: 600; }

  .privacy-inline-link {
    color: var(--accent-purple-light);
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    cursor: pointer;
  }
  .privacy-inline-link:hover { text-decoration: underline; }

  .privacy-todo-note {
    font-size: 11.5px;
    color: var(--accent-amber);
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 10px;
    padding: 8px 12px;
    margin-top: 10px;
    line-height: 1.5;
  }

  .privacy-contact-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #9b87ff 0%, #6d5ef2 55%, #5a4de0 100%);
    color: #ffffff;
    border: none;
    border-radius: 13px;
    padding: 11px 20px;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(124, 108, 246, 0.3);
    margin-top: 8px;
  }

  @media (max-width: 480px) {
    .privacy-hero { padding: 24px 20px; }
    .privacy-section-card { padding: 18px 20px; }
    .privacy-title { font-size: 22px; }
  }
`;

function Section({ icon, accent, title, children }) {
  return (
    <motion.div
      className="privacy-section-card premium-card-glass"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="privacy-section-header">
        <span className="privacy-section-icon" style={{ background: accent + '1f', color: accent }}>
          {icon}
        </span>
        <h2 className="privacy-section-title">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

export default function PrivacyPolicy({ onNavigate }) {
  function handleBack() {
    // TODO: Confirm "about" is always the right back-target; wire to router history if Atlas adopts one later.
    onNavigate ? onNavigate('about') : window.history.back()
  }

  function handleContact() {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent('Atlas Privacy Question')}`,
      '_blank'
    )
  }

  return (
    <div className="privacy-page-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />

      <div className="privacy-back-row" onClick={handleBack} role="button" tabIndex={0}>
        <ArrowLeft size={15} />
        <span>Back to About</span>
      </div>

      <motion.div
        className="privacy-hero premium-card-glass"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="privacy-hero-icon"><ShieldCheck size={22} /></div>
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-updated">Last updated: {LAST_UPDATED}</p>
        <p className="privacy-lede">
          Atlas is built around a simple principle: your personal data belongs to you. This
          policy explains what we collect, why we collect it, how it's used — including by the
          AI features — and the choices you have. It applies to the Atlas web app, the installable
          Progressive Web App, and the Atlas Android app.
        </p>
      </motion.div>

      <div className="privacy-sections">

        <Section icon={<Info size={16} />} accent="#8b5cf6" title="1. Introduction">
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
        </Section>

        <Section icon={<Database size={16} />} accent="#60a5fa" title="2. Information We Collect">
          <p className="privacy-text"><strong>Account information.</strong> When you sign up, we collect your email address and manage your credentials through Supabase Authentication. Atlas does not store your raw password — authentication is handled by Supabase's secure auth system.</p>
          <p className="privacy-text"><strong>Content you create.</strong> Atlas stores the information you enter so it can function as your productivity workspace, including:</p>
          <ul className="privacy-list">
            <li><strong>Core productivity data:</strong> tasks, habits, goals, and calendar events</li>
            <li><strong>Notes and expenses</strong> you record</li>
            <li><strong>Academic data:</strong> subjects, attendance records, assignments, CGPA planner entries, and study planner information</li>
            <li><strong>AI conversations</strong> — prompts and responses from the AI Assistant, AI Daily Brief, AI Scheduling, and AI Suggestions features, where applicable</li>
          </ul>
          <p className="privacy-text"><strong>Technical information.</strong> Basic device and app information (such as browser type or app version) may be processed to keep Atlas working correctly across web, PWA, and Android. At this time, Atlas does not integrate third-party advertising or analytics SDKs beyond what's described in this policy.</p>
        </Section>

        <Section icon={<Brain size={16} />} accent="#a78bfa" title="3. How Our AI Features Work">
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
        </Section>

        <Section icon={<Lock size={16} />} accent="#10b981" title="4. Data Storage & Security">
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
        </Section>

        <Section icon={<Globe size={16} />} accent="#60a5fa" title="5. Third-Party Services We Use">
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
        </Section>

        <Section icon={<ShieldCheck size={16} />} accent="#f59e0b" title="6. No Ads, No Selling of Data">
          <p className="privacy-text">
            Atlas does not display third-party advertisements. We do <strong>not</strong> sell,
            rent, or trade your personal information or content to third parties for marketing or
            advertising purposes. Data is used solely to provide and improve the Atlas experience
            for you.
          </p>
        </Section>

        <Section icon={<UserCheck size={16} />} accent="#8b5cf6" title="7. Your Rights & Data Retention">
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
        </Section>

        <Section icon={<AlertCircle size={16} />} accent="#ef4444" title="8. Children's Privacy">
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
        </Section>

        <Section icon={<RefreshCw size={16} />} accent="#60a5fa" title="9. Changes to This Policy">
          <p className="privacy-text">
            We may update this Privacy Policy as Atlas evolves — for example, if we add new
            features or change service providers. Material changes will be reflected by updating
            the "Last updated" date above, and where appropriate, we'll provide a more prominent
            notice in the app.
          </p>
        </Section>

        <Section icon={<Mail size={16} />} accent="#10b981" title="10. Contact Us">
          <p className="privacy-text">
            If you have questions about this Privacy Policy or how your data is handled, reach
            out any time:
          </p>
          <button className="privacy-contact-btn" onClick={handleContact}>
            <Mail size={15} />
            <span>{CONTACT_EMAIL}</span>
            <ExternalLink size={13} />
          </button>
        </Section>

      </div>
    </div>
  )
}