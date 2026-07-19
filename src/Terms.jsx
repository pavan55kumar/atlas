import { useEffect, useRef, useState, useCallback } from "react";

// ============================================================================
// CONFIGURATION
// ============================================================================
// Prioritize Vite environment variables. Replace fallback with your actual 
// centralized support email if environment variables are not configured.
const ATLAS_SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@atlas.app";

const LAST_UPDATED = "July 19, 2026";

const TOC_ITEMS = [
  { id: "acceptance-of-terms", number: 1, title: "Acceptance of Terms" },
  { id: "about-atlas", number: 2, title: "About ATLAS" },
  { id: "eligibility", number: 3, title: "Eligibility" },
  { id: "user-accounts", number: 4, title: "User Accounts" },
  { id: "account-security", number: 5, title: "Account Security" },
  { id: "atlas-features-and-services", number: 6, title: "ATLAS Features and Services" },
  { id: "user-created-content", number: 7, title: "User-Created Content" },
  { id: "ai-assistant-and-ai-features", number: 8, title: "AI Assistant and AI Features" },
  { id: "acceptable-use", number: 9, title: "Acceptable Use" },
  { id: "prohibited-activities", number: 10, title: "Prohibited Activities" },
  { id: "third-party-services", number: 11, title: "Third-Party Services" },
  { id: "notifications-and-reminders", number: 12, title: "Notifications and Reminders" },
  { id: "intellectual-property", number: 13, title: "Intellectual Property" },
  { id: "availability-and-changes", number: 14, title: "Availability and Changes to the Service" },
  { id: "data-and-privacy", number: 15, title: "Data and Privacy" },
  { id: "account-suspension-and-termination", number: 16, title: "Account Suspension and Termination" },
  { id: "disclaimers", number: 17, title: "Disclaimers" },
  { id: "limitation-of-liability", number: 18, title: "Limitation of Liability" },
  { id: "indemnification", number: 19, title: "Indemnification" },
  { id: "governing-law", number: 20, title: "Governing Law and Dispute Resolution" },
  { id: "changes-to-these-terms", number: 21, title: "Changes to These Terms" },
  { id: "severability", number: 22, title: "Severability" },
  { id: "entire-agreement", number: 23, title: "Entire Agreement" },
  { id: "contact-information", number: 24, title: "Contact Information" },
];

// ============================================================================
// STYLES & CSS CLASSES (Replaces inline style mutations)
// ============================================================================
const styles = `
  .atlas-terms-page {
    background-color: var(--bg, #0a0a0b);
    color: var(--text, #f5f5f7);
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .atlas-terms-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: var(--surface, #131316);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
    padding-top: env(safe-area-inset-top);
  }
  
  .atlas-terms-header-inner {
    max-width: 820px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .atlas-terms-back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 8px;
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    background-color: var(--surface-2, #161618);
    color: var(--text, #f5f5f7);
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .atlas-terms-back-btn:hover {
    background-color: var(--surface, #131316);
    border-color: var(--accent, #8b5cf6);
  }
  .atlas-terms-back-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }
  
  .atlas-terms-header-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text, #f5f5f7);
    flex-shrink: 0;
  }
  
  .atlas-terms-header-spacer { flex: 1; }
  
  .atlas-terms-header-updated {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    white-space: nowrap;
  }
  
  .atlas-terms-main {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .atlas-terms-container {
    max-width: 820px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .atlas-terms-hero { padding: 48px 0 40px; }
  
  .atlas-terms-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent, #8b5cf6);
    background-color: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 999px;
    padding: 5px 12px;
    margin-bottom: 16px;
  }
  
  .atlas-terms-hero-title {
    font-size: clamp(28px, 5vw, 36px);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text, #f5f5f7);
    margin: 0;
    line-height: 1.15;
  }
  
  .atlas-terms-hero-subtitle {
    margin-top: 8px;
    font-size: 14px;
    color: var(--text-muted, #71717a);
  }
  
  .atlas-terms-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
  }
  
  .atlas-terms-intro-text {
    font-size: 15px;
    line-height: 1.7;
    color: var(--text-muted, #a1a1aa);
    margin: 0;
  }
  
  .atlas-terms-intro-highlight {
    color: var(--text, #f5f5f7);
    font-weight: 500;
  }
  
  .atlas-terms-toc-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 48px;
  }
  
  .atlas-terms-toc-title {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted, #71717a);
    margin: 0 0 16px;
  }
  
  .atlas-terms-toc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2px;
  }
  
  .atlas-terms-toc-link {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text-muted, #a1a1aa);
    text-decoration: none;
    transition: color 0.15s ease, background-color 0.15s ease;
    cursor: pointer;
    border: none;
    background: transparent;
    text-align: left;
    width: 100%;
    font-family: inherit;
  }
  .atlas-terms-toc-link:hover {
    color: var(--text, #f5f5f7);
    background-color: var(--surface, #131316);
  }
  .atlas-terms-toc-link:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }
  
  .atlas-terms-toc-number {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent, #8b5cf6);
    min-width: 20px;
  }
  
  .atlas-terms-section {
    margin-bottom: 40px;
    scroll-margin-top: 80px; /* Offsets sticky header */
  }
  
  .atlas-terms-section-heading {
    display: flex;
    align-items: baseline;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text, #f5f5f7);
    margin: 0 0 12px;
  }
  
  .atlas-terms-section-number {
    font-size: 14px;
    font-weight: 700;
    color: var(--accent, #8b5cf6);
    font-variant-numeric: tabular-nums;
  }
  
  .atlas-terms-paragraph {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text-muted, #a1a1aa);
    margin: 0 0 12px;
  }
  
  .atlas-terms-list {
    margin: 8px 0 12px;
    padding-left: 20px;
    list-style-type: disc;
  }
  
  .atlas-terms-list-item {
    font-size: 15px;
    line-height: 1.75;
    color: var(--text-muted, #a1a1aa);
    margin-bottom: 4px;
  }
  
  .atlas-terms-strong {
    color: var(--text, #f5f5f7);
    font-weight: 500;
  }
  
  .atlas-terms-link {
    color: var(--accent, #8b5cf6);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.15s ease;
    cursor: pointer;
  }
  .atlas-terms-link:hover { border-bottom-color: var(--accent, #8b5cf6); }
  .atlas-terms-link:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
    border-radius: 2px;
  }
  
  .atlas-terms-callout {
    background-color: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 10px;
    padding: 16px 20px;
    margin: 12px 0;
  }
  
  .atlas-terms-callout-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-muted, #a1a1aa);
    margin: 0;
  }
  
  .atlas-terms-contact-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255,255,255,0.14));
    border-radius: 12px;
    padding: 28px;
    text-align: center;
  }
  
  .atlas-terms-contact-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text, #f5f5f7);
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  
  .atlas-terms-contact-subtitle {
    font-size: 14px;
    color: var(--text-muted, #71717a);
    margin: 0 0 20px;
    line-height: 1.6;
  }
  
  .atlas-terms-contact-email {
    display: inline-block;
    font-size: 16px;
    font-weight: 600;
    color: var(--accent, #8b5cf6);
    text-decoration: none;
    padding: 10px 24px;
    border-radius: 8px;
    border: 1px solid rgba(139, 92, 246, 0.25);
    background-color: rgba(139, 92, 246, 0.12);
    transition: background-color 0.15s ease;
    cursor: pointer;
  }
  .atlas-terms-contact-email:hover { background-color: rgba(139, 92, 246, 0.20); }
  .atlas-terms-contact-email:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }
  
  .atlas-terms-footer {
    border-top: 1px solid var(--border, rgba(255,255,255,0.08));
    margin-top: 48px;
    padding: 32px 0 48px;
    text-align: center;
  }
  
  .atlas-terms-footer-text {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    margin: 0;
    line-height: 1.6;
  }
  
  .atlas-terms-footer-brand {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted, #a1a1aa);
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }
  
  .atlas-terms-back-to-top {
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom));
    right: calc(20px + env(safe-area-inset-right));
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255,255,255,0.14));
    color: var(--text, #f5f5f7);
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
  .atlas-terms-back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .atlas-terms-back-to-top:hover {
    background-color: var(--surface, #131316);
    border-color: var(--accent, #8b5cf6);
  }
  .atlas-terms-back-to-top:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }
  
  /* Mobile Responsiveness */
  @media (max-width: 480px) {
    .atlas-terms-header-updated {
      display: none; /* Hide on small screens to prevent overflow */
    }
  }
  
  /* Reduced Motion Preferences */
  @media (prefers-reduced-motion: reduce) {
    * {
      scroll-behavior: auto !important;
      transition: none !important;
    }
  }
`;

// ============================================================================
// HELPER COMPONENTS
// ============================================================================
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Terms() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const topSentinelRef = useRef(null);
  
  // Fallback to standard SPA router if not globally provided
  const navigate = (path) => {
    if (window.history.pushState) {
      window.history.pushState({}, "", path);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      window.location.href = path;
    }
  };

  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleBack = useCallback(() => {
    // Safely navigate back without exiting the app if history is empty
    if (window.history.state && window.history.state.idx > 0) {
      window.history.back();
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleTocClick = useCallback((e, id) => {
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
  }, [prefersReducedMotion]);

  const handlePrivacyLink = useCallback((e) => {
    e.preventDefault();
    navigate("/privacy");
  }, [navigate]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  }, [prefersReducedMotion]);

  // Intersection Observer for performant Back-to-Top visibility
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

  // Hash initialization on mount
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
    <div className="atlas-terms-page">
      <style>{styles}</style>

      <header className="atlas-terms-header">
        <div className="atlas-terms-header-inner">
          <button
            className="atlas-terms-back-btn"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
          >
            <BackIcon />
          </button>
          <span className="atlas-terms-header-title">Terms and Conditions</span>
          <div className="atlas-terms-header-spacer" />
          <span className="atlas-terms-header-updated">Last Updated: {LAST_UPDATED}</span>
        </div>
      </header>

      <main className="atlas-terms-main">
        <div ref={topSentinelRef} />
        <div className="atlas-terms-container">
          
          {/* HERO */}
          <div className="atlas-terms-hero">
            <span className="atlas-terms-hero-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Legal
            </span>
            <h1 className="atlas-terms-hero-title">Terms and Conditions</h1>
            <p className="atlas-terms-hero-subtitle">
              Your agreement with ATLAS — Your Personal Life Operating System
            </p>
          </div>

          {/* INTRO */}
          <div className="atlas-terms-card">
            <p className="atlas-terms-intro-text">
              These Terms and Conditions govern your access to and use of the{" "}
              <span className="atlas-terms-intro-highlight">ATLAS</span> application and its
              related features and services. By creating an account, accessing, or
              using ATLAS, you agree to be bound by these Terms. If you do not agree
              with these Terms, you should not use ATLAS.
            </p>
          </div>

          {/* TABLE OF CONTENTS */}
          <nav aria-label="Terms and Conditions sections" className="atlas-terms-toc-card">
            <h2 className="atlas-terms-toc-title">Table of Contents</h2>
            <div className="atlas-terms-toc-grid">
              {TOC_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="atlas-terms-toc-link"
                  onClick={(e) => handleTocClick(e, item.id)}
                >
                  <span className="atlas-terms-toc-number">{item.number}.</span>
                  <span>{item.title}</span>
                </a>
              ))}
            </div>
          </nav>

          {/* 1. ACCEPTANCE OF TERMS */}
          <section id="acceptance-of-terms" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">1</span>
              Acceptance of Terms
            </h2>
            <p className="atlas-terms-paragraph">
              These Terms and Conditions constitute a legally binding agreement
              between you and ATLAS governing your access to and use of the ATLAS
              application, its features, and its related services. By accessing,
              creating an account for, or otherwise using ATLAS in any capacity,
              you acknowledge that you have read, understood, and agree to be bound
              by these Terms in their entirety.
            </p>
            <p className="atlas-terms-paragraph">
              If you do not agree with any provision of these Terms, you should not
              access or use ATLAS. Users who disagree with any part of these Terms
              are instructed to discontinue use of the application immediately and
              refrain from creating an account or submitting any content.
            </p>
            <p className="atlas-terms-paragraph">
              Your continued use of ATLAS following the publication of an updated
              version of these Terms may, subject to applicable law, constitute your
              acceptance of the revised Terms. It is your responsibility to review
              these Terms periodically to stay informed of any changes.
            </p>
          </section>

          {/* 2. ABOUT ATLAS */}
          <section id="about-atlas" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">2</span>
              About ATLAS
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS is a personal productivity application designed to help users
              organize, manage, and optimize their personal and academic
              productivity activities. ATLAS functions as a personal life operating
              system, bringing together multiple productivity tools into a single,
              unified interface.
            </p>
            <p className="atlas-terms-paragraph">
              ATLAS may provide features including, but not limited to:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Task management and to-do organization</li>
              <li className="atlas-terms-list-item">Habit tracking and streak monitoring</li>
              <li className="atlas-terms-list-item">Goal management and progress tracking</li>
              <li className="atlas-terms-list-item">Calendar functionality and event management</li>
              <li className="atlas-terms-list-item">Scheduling and time-blocking tools</li>
              <li className="atlas-terms-list-item">Focus sessions and distraction management</li>
              <li className="atlas-terms-list-item">Academic productivity tools and course management</li>
              <li className="atlas-terms-list-item">Productivity analytics and performance metrics</li>
              <li className="atlas-terms-list-item">AI-assisted productivity functionality and recommendations</li>
              <li className="atlas-terms-list-item">AI scheduling and intelligent task prioritization</li>
              <li className="atlas-terms-list-item">Reminders and push notifications</li>
              <li className="atlas-terms-list-item">Other productivity-related features that may be developed and introduced over time</li>
            </ul>
            <p className="atlas-terms-paragraph">
              The specific features available within ATLAS may change, improve, be
              restructured, or evolve over time as the application is updated,
              refined, and expanded. The availability of individual features may
              vary depending on your device, platform, account configuration, and
              the current version of the application.
            </p>
          </section>

          {/* 3. ELIGIBILITY */}
          <section id="eligibility" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">3</span>
              Eligibility
            </h2>
            <p className="atlas-terms-paragraph">
              You must be legally capable of entering into a binding agreement under
              the laws applicable to you in your jurisdiction in order to use ATLAS.
              By accessing or using ATLAS, you represent and warrant that you meet
              this requirement.
            </p>
            <p className="atlas-terms-paragraph">
              If you are below the age at which you can independently consent to use
              online services in your jurisdiction, you may only use ATLAS with the
              involvement and permission of a parent or legal guardian who has
              reviewed and agreed to these Terms on your behalf. Your parent or
              guardian is responsible for your use of ATLAS and any content you
              submit through the application.
            </p>
            <p className="atlas-terms-paragraph">
              You are responsible for ensuring that your access to and use of ATLAS
              complies with all laws, regulations, and restrictions applicable to
              you in your jurisdiction. ATLAS is not responsible for verifying your
              eligibility and does not accept responsibility for unauthorized use by
              individuals who do not meet these eligibility requirements.
            </p>
          </section>

          {/* 4. USER ACCOUNTS */}
          <section id="user-accounts" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">4</span>
              User Accounts
            </h2>
            <p className="atlas-terms-paragraph">
              Certain ATLAS functionality may require you to create and maintain a
              user account. When creating an account, you agree to provide accurate,
              current, and complete information where requested and to update that
              information as necessary to keep it accurate.
            </p>
            <p className="atlas-terms-paragraph">You must not:</p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Impersonate another person or misrepresent your identity</li>
              <li className="atlas-terms-list-item">Create accounts using unauthorized, false, or fraudulent information</li>
              <li className="atlas-terms-list-item">Use another person's account without their explicit permission</li>
              <li className="atlas-terms-list-item">Attempt to gain unauthorized access to another user's account through any means</li>
              <li className="atlas-terms-list-item">Create multiple accounts for the purpose of circumventing restrictions or abusing the service</li>
            </ul>
            <p className="atlas-terms-paragraph">
              ATLAS may support authentication methods including email-based
              authentication and Google authentication where available. The specific
              authentication options presented to you may depend on your device,
              platform, and current application configuration.
            </p>
            <p className="atlas-terms-paragraph">
              You are responsible for maintaining the accuracy of your account
              information and for all activity that occurs under your account. If you
              believe your account information is no longer accurate or has been
              compromised, you should update it promptly or contact ATLAS support.
            </p>
          </section>

          {/* 5. ACCOUNT SECURITY */}
          <section id="account-security" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">5</span>
              Account Security
            </h2>
            <p className="atlas-terms-paragraph">
              You are responsible for maintaining the confidentiality and security of
              your account credentials, including any passwords, authentication
              tokens, or linked third-party credentials used to access ATLAS. You
              should not share your password or authentication credentials with any
              unauthorized individual.
            </p>
            <p className="atlas-terms-paragraph">
              If you believe that your account has been compromised, accessed without
              authorization, or that your credentials have been exposed, you must
              promptly take appropriate action, which may include changing your
              password, revoking linked third-party access, and contacting ATLAS
              support. ATLAS is not responsible for any loss or damage arising from
              unauthorized access to your account due to your failure to maintain
              credential security.
            </p>
            <p className="atlas-terms-paragraph">
              ATLAS may implement reasonable technical and organizational security
              measures designed to protect user accounts and the data stored within
              the application. However, no system can be guaranteed to be completely
              secure, and ATLAS cannot guarantee that unauthorized access, security
              incidents, or data breaches will never occur.
            </p>
          </section>

          {/* 6. ATLAS FEATURES AND SERVICES */}
          <section id="atlas-features-and-services" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">6</span>
              ATLAS Features and Services
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS provides productivity tools intended to assist users with
              organizing and managing their personal, academic, and professional
              activities. Features may include tasks, habits, goals, calendars,
              schedules, focus sessions, academic information, productivity
              statistics, AI-assisted functionality, reminders, and other
              productivity-related tools.
            </p>
            <p className="atlas-terms-paragraph">
              While ATLAS is designed to support your productivity, you remain
              solely responsible for:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Managing your own schedules and commitments</li>
              <li className="atlas-terms-list-item">Verifying important deadlines, dates, and obligations independently</li>
              <li className="atlas-terms-list-item">Reviewing and acting upon reminders in a timely manner</li>
              <li className="atlas-terms-list-item">Confirming the accuracy of calendar information and event details</li>
              <li className="atlas-terms-list-item">Making personal decisions regarding your time, priorities, and activities</li>
              <li className="atlas-terms-list-item">Ensuring important information stored in ATLAS is independently backed up where appropriate</li>
            </ul>
            <p className="atlas-terms-paragraph">
              ATLAS should be considered a productivity assistance tool and not a
              guaranteed or infallible system for preventing missed deadlines,
              appointments, assignments, examinations, meetings, or other
              obligations. ATLAS does not assume responsibility for outcomes
              resulting from your reliance on the application as your sole
              organizational tool.
            </p>
          </section>

          {/* 7. USER-CREATED CONTENT */}
          <section id="user-created-content" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">7</span>
              User-Created Content
            </h2>
            <p className="atlas-terms-paragraph">
              You may create, enter, store, and manage content within ATLAS,
              including but not limited to:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Tasks, subtasks, and to-do items</li>
              <li className="atlas-terms-list-item">Habits and habit-tracking entries</li>
              <li className="atlas-terms-list-item">Goals and milestone definitions</li>
              <li className="atlas-terms-list-item">Calendar events and scheduled activities</li>
              <li className="atlas-terms-list-item">Schedules, routines, and time blocks</li>
              <li className="atlas-terms-list-item">Focus session records and configurations</li>
              <li className="atlas-terms-list-item">Academic information including courses, assignments, and grades</li>
              <li className="atlas-terms-list-item">AI prompts, questions, and instructions submitted to AI features</li>
              <li className="atlas-terms-list-item">Productivity-related notes, tags, and metadata</li>
              <li className="atlas-terms-list-item">Any other content you enter, upload, or generate within ATLAS</li>
            </ul>
            <p className="atlas-terms-paragraph">
              You retain full responsibility for all content you submit to or store
              within ATLAS. You must ensure that you have all necessary rights,
              permissions, and authorizations to enter, store, and use any content
              submitted to ATLAS, and that your content does not infringe upon the
              intellectual property rights, privacy rights, or any other rights of
              third parties.
            </p>
            <p className="atlas-terms-paragraph">
              You must not use ATLAS to store, process, or distribute content that
              violates applicable law, infringes on the rights of others, or is
              otherwise unlawful, harmful, threatening, abusive, harassing,
              defamatory, or otherwise objectionable.
            </p>
            <p className="atlas-terms-paragraph">
              By submitting content to ATLAS, you grant ATLAS the limited rights
              necessary to process, store, transmit, display, and otherwise operate
              on your content solely as necessary to provide the application's
              functionality to you. ATLAS does not claim ownership of your personal
              content. You retain all ownership and intellectual property rights in
              the content you create and store within ATLAS.
            </p>
          </section>

          {/* 8. AI ASSISTANT AND AI FEATURES */}
          <section id="ai-assistant-and-ai-features" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">8</span>
              AI Assistant and AI Features
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS may provide AI-powered functionality designed to assist with
              productivity-related activities, including but not limited to task
              suggestions, schedule optimization, habit recommendations, study
              assistance, and productivity analysis. These AI features are intended
              to supplement your own judgment and decision-making.
            </p>
            <p className="atlas-terms-paragraph">AI features within ATLAS may process:</p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">User prompts, questions, and instructions</li>
              <li className="atlas-terms-list-item">Messages and conversational inputs</li>
              <li className="atlas-terms-list-item">Relevant productivity context, such as existing tasks, habits, goals, and schedules</li>
              <li className="atlas-terms-list-item">Relevant application information needed to generate useful responses</li>
            </ul>
            <p className="atlas-terms-paragraph">
              AI-generated responses are produced automatically by machine learning
              models and may sometimes be incorrect, incomplete, outdated,
              misleading, or otherwise unsuitable for your particular situation. You
              are responsible for reviewing and verifying all AI-generated
              information before acting on it or relying on it for any purpose.
            </p>
            <div className="atlas-terms-callout">
              <p className="atlas-terms-callout-text">
                <span className="atlas-terms-strong">Important:</span> ATLAS AI features
                should not be treated as a substitute for qualified professional
                advice. AI-generated content must not be relied upon as professional
                medical advice, legal advice, financial advice, mental health
                advice, emergency guidance, or any other form of regulated
                professional advice. Always consult a qualified professional for
                matters requiring specialized expertise.
              </p>
            </div>
            <p className="atlas-terms-paragraph">
              You remain solely responsible for any decisions you make and any
              actions you take based on AI-generated responses within ATLAS. ATLAS
              does not guarantee the accuracy, completeness, reliability,
              timeliness, or suitability of any AI-generated output, and disclaims
              all responsibility for consequences arising from reliance on such
              output.
            </p>
          </section>

          {/* 9. ACCEPTABLE USE */}
          <section id="acceptable-use" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">9</span>
              Acceptable Use
            </h2>
            <p className="atlas-terms-paragraph">
              You agree to use ATLAS responsibly, lawfully, and in accordance with
              all applicable local, national, and international laws and
              regulations. You may use ATLAS for legitimate personal, academic,
              productivity, organizational, and other lawful purposes.
            </p>
            <p className="atlas-terms-paragraph">
              You must respect the security, integrity, and availability of the
              ATLAS application and its supporting infrastructure. This includes
              refraining from any activity that could damage, disable, overburden,
              or impair the application or interfere with any other user's use of
              the service.
            </p>
            <p className="atlas-terms-paragraph">
              You agree to use ATLAS in a manner that is consistent with its
              intended purpose as a personal productivity tool and to refrain from
              any use that could harm ATLAS, its operators, other users, or third
              parties.
            </p>
          </section>

          {/* 10. PROHIBITED ACTIVITIES */}
          <section id="prohibited-activities" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">10</span>
              Prohibited Activities
            </h2>
            <p className="atlas-terms-paragraph">
              The following activities are strictly prohibited while using ATLAS.
              You must not:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Use ATLAS for any unlawful, illegal, or fraudulent purpose</li>
              <li className="atlas-terms-list-item">Attempt unauthorized access to accounts, systems, networks, or data belonging to ATLAS or other users</li>
              <li className="atlas-terms-list-item">Interfere with the security features, authentication mechanisms, or access controls of the application</li>
              <li className="atlas-terms-list-item">Attempt to bypass, circumvent, or disable authentication, authorization, or other security controls</li>
              <li className="atlas-terms-list-item">Introduce viruses, malware, spyware, ransomware, or any other malicious software or harmful code</li>
              <li className="atlas-terms-list-item">Attempt to disrupt, overload, or disable ATLAS infrastructure, servers, networks, or supporting systems</li>
              <li className="atlas-terms-list-item">Perform abusive, excessive, or disproportionate automated requests, bot activity, or API calls</li>
              <li className="atlas-terms-list-item">Scrape, extract, harvest, or collect data from ATLAS without explicit authorization</li>
              <li className="atlas-terms-list-item">Reverse engineer, decompile, disassemble, or otherwise attempt to derive source code from ATLAS where prohibited by applicable law</li>
              <li className="atlas-terms-list-item">Exploit vulnerabilities, bugs, or errors in the application for any purpose</li>
              <li className="atlas-terms-list-item">Misuse AI functionality, including submitting harmful, abusive, or prohibited prompts or attempting to extract system information through AI features</li>
              <li className="atlas-terms-list-item">Impersonate other individuals, organizations, or entities</li>
              <li className="atlas-terms-list-item">Use ATLAS to violate the intellectual property rights, privacy rights, or other rights of any person or entity</li>
              <li className="atlas-terms-list-item">Use ATLAS to harm, threaten, harass, defraud, abuse, intimidate, or stalk any person</li>
            </ul>
            <p className="atlas-terms-paragraph">
              Violations of these prohibited activities may result in restriction,
              suspension, or permanent termination of your access to ATLAS, and may
              be reported to relevant authorities where appropriate. ATLAS reserves
              the right to take any action it deems reasonably necessary to address
              violations and protect the integrity of the application and its users.
            </p>
          </section>

          {/* 11. THIRD-PARTY SERVICES */}
          <section id="third-party-services" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">11</span>
              Third-Party Services
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS may rely on third-party providers, services, and infrastructure
              to deliver certain functionality. These may include:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Authentication providers, including email authentication and Google authentication services</li>
              <li className="atlas-terms-list-item">Database infrastructure and data storage services</li>
              <li className="atlas-terms-list-item">Cloud computing and hosting services</li>
              <li className="atlas-terms-list-item">Google authentication and identity services</li>
              <li className="atlas-terms-list-item">AI service providers and machine learning model APIs</li>
              <li className="atlas-terms-list-item">Hosting and deployment infrastructure providers</li>
              <li className="atlas-terms-list-item">Content delivery networks and other performance-related services</li>
            </ul>
            <p className="atlas-terms-paragraph">
              The availability, performance, and reliability of some ATLAS
              functionality may depend on these third-party services. Disruptions,
              outages, changes, or discontinuations of third-party services may
              affect ATLAS in ways that are outside of ATLAS's reasonable control.
            </p>
            <p className="atlas-terms-paragraph">
              Third-party services may operate under their own terms and conditions,
              privacy policies, and service agreements. You are encouraged to review
              the terms and policies of any third-party services you interact with
              through ATLAS. To the extent permitted by applicable law, ATLAS is not
              responsible for the practices, availability, or conduct of
              third-party services.
            </p>
          </section>

          {/* 12. NOTIFICATIONS AND REMINDERS */}
          <section id="notifications-and-reminders" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">12</span>
              Notifications and Reminders
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS may provide notifications and reminders relating to various
              aspects of your productivity, including:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Task due dates and task-related alerts</li>
              <li className="atlas-terms-list-item">Habit reminders and streak notifications</li>
              <li className="atlas-terms-list-item">Goal milestones and progress updates</li>
              <li className="atlas-terms-list-item">Calendar event reminders and event-start notifications</li>
              <li className="atlas-terms-list-item">Schedule and time-block alerts</li>
              <li className="atlas-terms-list-item">Focus session start and end notifications</li>
              <li className="atlas-terms-list-item">Academic activity reminders, including assignment and exam alerts</li>
              <li className="atlas-terms-list-item">Other productivity-related notifications and informational messages</li>
            </ul>
            <div className="atlas-terms-callout">
              <p className="atlas-terms-callout-text">
                <span className="atlas-terms-strong">No Guarantee of Delivery:</span> ATLAS
                cannot guarantee that any notification or reminder will be
                successfully delivered or received. You should not rely solely on
                ATLAS notifications for time-sensitive or critical obligations.
              </p>
            </div>
            <p className="atlas-terms-paragraph">
              Notification delivery may be affected by various factors, including:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Device settings and notification preferences configured by the user</li>
              <li className="atlas-terms-list-item">Operating system restrictions and notification management policies</li>
              <li className="atlas-terms-list-item">Battery optimization and power management features that may limit background activity</li>
              <li className="atlas-terms-list-item">Internet connectivity and network availability</li>
              <li className="atlas-terms-list-item">Notification permissions granted or denied by the user or the operating system</li>
              <li className="atlas-terms-list-item">Background processing limitations imposed by the device or operating system</li>
              <li className="atlas-terms-list-item">Technical issues, bugs, or infrastructure problems</li>
            </ul>
            <p className="atlas-terms-paragraph">
              You remain responsible for independently tracking important deadlines,
              appointments, assignments, examinations, meetings, and other
              obligations. ATLAS should be used as a supplementary tool rather than
              your sole method of managing time-sensitive commitments.
            </p>
          </section>

          {/* 13. INTELLECTUAL PROPERTY */}
          <section id="intellectual-property" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">13</span>
              Intellectual Property
            </h2>
            <p className="atlas-terms-paragraph">
              The ATLAS application, excluding user-created content, and its
              associated materials may be protected by applicable intellectual
              property laws, including copyright, trademark, and other proprietary
              rights. Protected materials may include:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Software and application code</li>
              <li className="atlas-terms-list-item">Proprietary source code, where applicable</li>
              <li className="atlas-terms-list-item">User interface design and interaction patterns</li>
              <li className="atlas-terms-list-item">Visual design elements, including layout, color schemes, and typography choices</li>
              <li className="atlas-terms-list-item">Branding, including the ATLAS name, logo, and associated marks</li>
              <li className="atlas-terms-list-item">Graphics, icons, illustrations, and other visual assets</li>
              <li className="atlas-terms-list-item">Original written content, documentation, and help materials</li>
              <li className="atlas-terms-list-item">Application architecture, structure, and organization of features</li>
            </ul>
            <p className="atlas-terms-paragraph">
              Users receive only the limited, non-exclusive, non-transferable right
              to access and use ATLAS in accordance with these Terms. This right is
              personal to you and does not include any right to redistribute,
              sublicense, or commercialize the application or its components.
            </p>
            <p className="atlas-terms-paragraph">
              You may not copy, reproduce, distribute, sell, license, commercially
              exploit, or otherwise misuse protected ATLAS intellectual property,
              except where explicitly authorized by these Terms or permitted by
              applicable law. Any unauthorized use may constitute a violation of
              intellectual property laws and may result in legal action.
            </p>
          </section>

          {/* 14. AVAILABILITY AND CHANGES TO THE SERVICE */}
          <section id="availability-and-changes" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">14</span>
              Availability and Changes to the Service
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS may periodically add new features, remove existing features,
              modify current functionality, improve performance, perform
              maintenance, release updates, or change technical infrastructure. The
              application is under continuous development, and changes may be made
              at any time without prior notice unless required by applicable law.
            </p>
            <p className="atlas-terms-paragraph">
              ATLAS does not guarantee uninterrupted, continuous, or error-free
              availability of the application or any specific feature. Access to
              ATLAS may occasionally be affected by:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Scheduled or unscheduled maintenance</li>
              <li className="atlas-terms-list-item">Software updates and deployment activities</li>
              <li className="atlas-terms-list-item">Infrastructure failures or technical malfunctions</li>
              <li className="atlas-terms-list-item">Third-party service outages or disruptions</li>
              <li className="atlas-terms-list-item">Internet connectivity issues or network problems</li>
              <li className="atlas-terms-list-item">Circumstances beyond ATLAS's reasonable control, including natural disasters, power outages, and other force majeure events</li>
            </ul>
            <p className="atlas-terms-paragraph">
              Where practical and feasible, reasonable efforts may be made to
              maintain reliable service availability, communicate planned
              maintenance in advance, and restore service promptly in the event of
              disruptions. However, ATLAS is not liable for any downtime,
              interruption, or unavailability of the service.
            </p>
          </section>

          {/* 15. DATA AND PRIVACY */}
          <section id="data-and-privacy" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">15</span>
              Data and Privacy
            </h2>
            <p className="atlas-terms-paragraph">
              The collection, processing, storage, transmission, and handling of
              personal information associated with ATLAS is described separately in
              the ATLAS Privacy Policy. The Privacy Policy explains what information
              is collected, how it is used, how it is protected, and what choices
              you have regarding your data.
            </p>
            <p className="atlas-terms-paragraph">
              Your use of ATLAS is also governed by the ATLAS Privacy Policy, which
              is incorporated into these Terms by reference. You are encouraged to
              review the Privacy Policy to understand ATLAS's data practices.
            </p>
            <p className="atlas-terms-paragraph">
              <a
                href="/privacy"
                className="atlas-terms-link"
                onClick={handlePrivacyLink}
              >
                Read the ATLAS Privacy Policy →
              </a>
            </p>
          </section>

          {/* 16. ACCOUNT SUSPENSION AND TERMINATION */}
          <section id="account-suspension-and-termination" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">16</span>
              Account Suspension and Termination
            </h2>
            <p className="atlas-terms-paragraph">
              You may stop using ATLAS at any time. Where account deletion
              functionality is available within the application, you may request or
              initiate the deletion of your account and associated data through the
              application's settings or account management interface.
            </p>
            <p className="atlas-terms-paragraph">
              ATLAS may restrict, suspend, or terminate your access to the
              application where reasonably necessary, including in situations
              involving:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Serious or repeated violations of these Terms</li>
              <li className="atlas-terms-list-item">Illegal activity or conduct that violates applicable law</li>
              <li className="atlas-terms-list-item">Fraud, deception, or misrepresentation</li>
              <li className="atlas-terms-list-item">Abuse, harassment, or harmful behavior directed at other users or ATLAS personnel</li>
              <li className="atlas-terms-list-item">Security threats or activities that compromise the integrity of the application</li>
              <li className="atlas-terms-list-item">Unauthorized access to accounts, systems, or data</li>
              <li className="atlas-terms-list-item">Harmful activity, including the introduction of malware or malicious code</li>
              <li className="atlas-terms-list-item">Misuse of ATLAS services, AI features, or infrastructure</li>
            </ul>
            <p className="atlas-terms-paragraph">
              Where appropriate, practical, and legally required, reasonable notice
              may be provided before suspension or termination takes effect. In
              cases involving security threats, illegal activity, or imminent harm,
              ATLAS may take immediate action without prior notice. Upon
              termination, your right to access and use ATLAS ceases immediately.
            </p>
          </section>

          {/* 17. DISCLAIMERS */}
          <section id="disclaimers" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">17</span>
              Disclaimers
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS is provided on an "as available" and, to the extent permitted by
              applicable law, an "as is" basis. Except as expressly stated in these
              Terms or required by applicable law, ATLAS disclaims all warranties
              and conditions, whether express, implied, or statutory.
            </p>
            <p className="atlas-terms-paragraph">ATLAS does not guarantee that:</p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">The application will always be available or accessible without interruption</li>
              <li className="atlas-terms-list-item">Every feature will always function correctly or without errors</li>
              <li className="atlas-terms-list-item">All information displayed or generated within the application will always be accurate or error-free</li>
              <li className="atlas-terms-list-item">AI-generated information will always be accurate, relevant, or appropriate</li>
              <li className="atlas-terms-list-item">Notifications and reminders will always be delivered successfully and on time</li>
              <li className="atlas-terms-list-item">User productivity outcomes, academic performance, or personal results will improve as a result of using ATLAS</li>
              <li className="atlas-terms-list-item">Data synchronization across devices will never experience delays, conflicts, or errors</li>
              <li className="atlas-terms-list-item">The application will be free from vulnerabilities, bugs, or security issues</li>
            </ul>
            <p className="atlas-terms-paragraph">
              Nothing in these Terms is intended to exclude, restrict, or modify any
              warranties, rights, or remedies that cannot lawfully be excluded,
              restricted, or modified under applicable consumer protection laws or
              other mandatory legal provisions. Where such warranties or rights
              apply, they are preserved to the full extent permitted by law.
            </p>
          </section>

          {/* 18. LIMITATION OF LIABILITY */}
          <section id="limitation-of-liability" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">18</span>
              Limitation of Liability
            </h2>
            <p className="atlas-terms-paragraph">
              To the maximum extent permitted by applicable law, neither ATLAS nor
              its operators, developers, contributors, or affiliates shall be liable
              for any indirect, incidental, special, consequential, punitive, or
              similar damages or losses arising from or related to your use of, or
              inability to use, ATLAS.
            </p>
            <p className="atlas-terms-paragraph">
              This limitation applies to losses or damages resulting from, but not
              limited to:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Missed or undelivered notifications and reminders</li>
              <li className="atlas-terms-list-item">Missed deadlines, appointments, assignments, examinations, or other obligations</li>
              <li className="atlas-terms-list-item">Incorrect, incomplete, or misleading AI-generated responses</li>
              <li className="atlas-terms-list-item">Data synchronization problems, data loss, or data corruption</li>
              <li className="atlas-terms-list-item">Temporary or prolonged service interruptions or unavailability</li>
              <li className="atlas-terms-list-item">Third-party service failures, outages, or changes</li>
              <li className="atlas-terms-list-item">User reliance on automatically generated information, schedules, or recommendations</li>
              <li className="atlas-terms-list-item">Unauthorized access to your account or data due to credential compromise</li>
              <li className="atlas-terms-list-item">Any other matter relating to the application or these Terms</li>
            </ul>
            <p className="atlas-terms-paragraph">
              This limitation of liability provision does not attempt to exclude or
              limit any liability that cannot lawfully be excluded or limited under
              applicable law, including liability for death or personal injury
              caused by negligence, fraud, fraudulent misrepresentation, or any
              other liability that is mandated by applicable statute.
            </p>
          </section>

          {/* 19. INDEMNIFICATION */}
          <section id="indemnification" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">19</span>
              Indemnification
            </h2>
            <p className="atlas-terms-paragraph">
              To the extent permitted by applicable law, you agree to be
              responsible for and to indemnify and hold harmless ATLAS and its
              operators, developers, contributors, and affiliates from and against
              any claims, damages, losses, liabilities, costs, and expenses
              (including reasonable legal fees) arising from or related to:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Your unlawful or improper misuse of ATLAS</li>
              <li className="atlas-terms-list-item">Your violation of these Terms or any provision contained herein</li>
              <li className="atlas-terms-list-item">Your infringement of the intellectual property rights, privacy rights, or other rights of any third party through content you submit or actions you take within ATLAS</li>
              <li className="atlas-terms-list-item">Your violation of applicable laws or regulations in connection with your use of ATLAS</li>
            </ul>
            <p className="atlas-terms-paragraph">
              This indemnification provision is written reasonably and does not
              override any mandatory consumer rights or protections that apply to
              you under applicable law. Nothing in this section requires you to
              indemnify ATLAS for losses arising from ATLAS's own negligence,
              willful misconduct, or breach of these Terms.
            </p>
          </section>

          {/* 20. GOVERNING LAW AND DISPUTE RESOLUTION */}
          <section id="governing-law" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">20</span>
              Governing Law and Dispute Resolution
            </h2>
            <p className="atlas-terms-paragraph">
              These Terms and any dispute or claim arising from or related to them
              or to your use of ATLAS shall be interpreted and governed by the
              applicable laws of the jurisdiction in which the ATLAS application is
              operated and made available, subject to any mandatory consumer
              protection laws and jurisdictional rights that apply to you in your
              jurisdiction of residence.
            </p>
            <p className="atlas-terms-paragraph">
              Where a dispute arises in connection with your use of ATLAS, you and
              ATLAS agree to first attempt to resolve the dispute informally through
              good-faith communication. If the dispute cannot be resolved
              informally, it shall be resolved through the appropriate dispute
              resolution mechanisms available under applicable law, which may
              include mediation, arbitration, or proceedings before a court of
              competent jurisdiction, depending on the nature of the dispute and the
              rights available to you under applicable consumer protection
              legislation.
            </p>
            <p className="atlas-terms-paragraph">
              Nothing in these Terms deprives you of any mandatory consumer rights
              or remedies available to you under the laws of your jurisdiction of
              residence, nor does it prevent you from pursuing such rights through
              the appropriate legal channels.
            </p>
          </section>

          {/* 21. CHANGES TO THESE TERMS */}
          <section id="changes-to-these-terms" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">21</span>
              Changes to These Terms
            </h2>
            <p className="atlas-terms-paragraph">
              ATLAS reserves the right to update or modify these Terms and
              Conditions periodically. Updates may be made to reflect:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">New ATLAS features and functionality being introduced</li>
              <li className="atlas-terms-list-item">Changes to existing functionality or user interface</li>
              <li className="atlas-terms-list-item">Changes to business practices or operational policies</li>
              <li className="atlas-terms-list-item">Security requirements and best practices</li>
              <li className="atlas-terms-list-item">Legal, regulatory, or compliance requirements</li>
              <li className="atlas-terms-list-item">Clarifications or corrections to existing provisions</li>
            </ul>
            <p className="atlas-terms-paragraph">
              The "Last Updated" date displayed at the top of this page indicates
              when these Terms were most recently revised. You are encouraged to
              review these Terms periodically to stay informed of any changes.
            </p>
            <p className="atlas-terms-paragraph">
              Where required by applicable law, users will be appropriately informed
              of material changes to these Terms before they take effect. Your
              continued use of ATLAS after updated Terms become effective may, where
              permitted by applicable law, constitute your acceptance of the revised
              Terms. If you do not agree to the updated Terms, you should
              discontinue use of ATLAS.
            </p>
          </section>

          {/* 22. SEVERABILITY */}
          <section id="severability" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">22</span>
              Severability
            </h2>
            <p className="atlas-terms-paragraph">
              If any provision of these Terms is determined by a court, tribunal, or
              other competent authority to be invalid, illegal, or unenforceable,
              that provision shall be severed from these Terms and the remaining
              provisions shall continue in full force and effect to the maximum
              extent permitted by applicable law.
            </p>
            <p className="atlas-terms-paragraph">
              If any invalid or unenforceable provision can be modified to make it
              valid and enforceable while preserving the original intent of the
              parties, such modification shall be deemed to be incorporated. The
              invalidity or unenforceability of any provision in one jurisdiction
              does not affect its validity or enforceability in any other
              jurisdiction.
            </p>
          </section>

          {/* 23. ENTIRE AGREEMENT */}
          <section id="entire-agreement" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">23</span>
              Entire Agreement
            </h2>
            <p className="atlas-terms-paragraph">
              These Terms and Conditions, together with the ATLAS Privacy Policy and
              any other applicable policies explicitly referenced or incorporated
              into these Terms, constitute the entire and complete agreement between
              you and ATLAS governing your access to and use of the application,
              subject to applicable law.
            </p>
            <p className="atlas-terms-paragraph">
              These Terms supersede all prior or contemporaneous agreements,
              communications, and understandings, whether oral or written, relating
              to the subject matter covered herein. Any prior versions of these
              Terms are replaced and no longer in effect upon publication of the
              current version.
            </p>
            <p className="atlas-terms-paragraph">
              If there is any conflict between these Terms and another ATLAS policy
              or document, these Terms shall take precedence with respect to the
              subject matter of the conflict, unless the other document expressly
              states otherwise.
            </p>
          </section>

          {/* 24. CONTACT INFORMATION */}
          <section id="contact-information" className="atlas-terms-section">
            <h2 className="atlas-terms-section-heading">
              <span className="atlas-terms-section-number">24</span>
              Contact Information
            </h2>
            <p className="atlas-terms-paragraph">
              If you have any questions, concerns, or inquiries regarding these
              Terms and Conditions, your account, or your use of ATLAS, you may
              contact ATLAS support. ATLAS welcomes feedback and is committed to
              addressing your concerns in a timely and professional manner.
            </p>
            <p className="atlas-terms-paragraph">
              You may contact ATLAS regarding:
            </p>
            <ul className="atlas-terms-list">
              <li className="atlas-terms-list-item">Questions about these Terms and Conditions or the Privacy Policy</li>
              <li className="atlas-terms-list-item">Account-related concerns, including access, security, and deletion requests</li>
              <li className="atlas-terms-list-item">Legal inquiries and formal notices</li>
              <li className="atlas-terms-list-item">Service-related concerns, including bug reports and feature requests</li>
              <li className="atlas-terms-list-item">General questions about using ATLAS and its features</li>
            </ul>
            <div className="atlas-terms-contact-card">
              <h3 className="atlas-terms-contact-title">ATLAS Support</h3>
              <p className="atlas-terms-contact-subtitle">
                We typically respond to inquiries within a reasonable timeframe.
                Please include relevant details when contacting us so we can assist
                you effectively.
              </p>
              <a
                href={`mailto:${ATLAS_SUPPORT_EMAIL}`}
                className="atlas-terms-contact-email"
                aria-label={`Email ATLAS Support at ${ATLAS_SUPPORT_EMAIL}`}
              >
                {ATLAS_SUPPORT_EMAIL}
              </a>
            </div>
          </section>

          <footer className="atlas-terms-footer">
            <p className="atlas-terms-footer-brand">ATLAS</p>
            <p className="atlas-terms-footer-text">
              Your Personal Life Operating System
            </p>
            <p style={{ marginTop: "8px" }} className="atlas-terms-footer-text">
              © {new Date().getFullYear()} ATLAS. All rights reserved.
              <br />
              Last Updated: {LAST_UPDATED}
            </p>
          </footer>
        </div>
      </main>

      <button 
        className={`atlas-terms-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
      >
        <ArrowUpIcon />
      </button>
    </div>
  );
}