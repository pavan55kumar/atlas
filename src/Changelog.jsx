import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ChevronUp, Milestone, Zap, Layers, Monitor } from 'lucide-react';

// ============================================================================
// ADD NEW RELEASES AT THE TOP OF THIS ARRAY
// The first item (index 0) automatically receives the "LATEST" status & badge.
// ============================================================================
const RELEASES = [
  {
    version: "1.0.0",
    date: "July 2026",
    title: "Initial Public Release",
    description: "The first public version of ATLAS, bringing productivity, academics, planning, focus, and AI together in one workspace.",
    status: "Stable",
    groups: [
      {
        title: "AI & Intelligence",
        items: [
          {
            title: "AI Assistant",
            description: "Personal AI companion offering intelligent workspace insights and research assistance directly inside ATLAS."
          },
          {
            title: "AI Schedule",
            description: "AI-assisted planning to optimize and prioritize tasks within your daily timeline automatically."
          }
        ]
      },
      {
        title: "Productivity Core",
        items: [
          {
            title: "Tasks & To-Dos",
            description: "Modern high-performance task manager with subtasks, prioritization, and tracking views."
          },
          {
            title: "Habit Tracking",
            description: "Create and reinforce positive routines with streaks, target metrics, and progress logs."
          },
          {
            title: "Goal Management",
            description: "Structure long-term aspirations into clear, actionable milestones with progress bars."
          },
          {
            title: "Unified Calendar",
            description: "Consolidated events, schedules, and reminders integrated directly into your day."
          },
          {
            title: "Notes Workspace",
            description: "Rich text editing and notebook organization for all your concepts, project details, and daily thoughts."
          },
          {
            title: "Focus Mode",
            description: "A distraction-free focus session tool powered by pomodoro techniques to enhance deep work."
          }
        ]
      },
      {
        title: "Insights & Management",
        items: [
          {
            title: "Expense Ledger",
            description: "Track personal expenses, categorize budgets, and manage financial outflows directly in the platform."
          },
          {
            title: "Productivity Analytics",
            description: "Comprehensive charts, productivity metrics, and activity tracking showing your operational output."
          }
        ]
      },
      {
        title: "Academic Hub",
        items: [
          {
            title: "Academic Workspace",
            description: "Comprehensive workspace to organize courses, manage subjects, track attendance, and log assignment deadlines."
          }
        ]
      },
      {
        title: "Multi-Platform Core",
        items: [
          {
            title: "Android Application Support",
            description: "Fully featured native mobile app runtime packaged with Capacitor for on-the-go productivity."
          },
          {
            title: "Progressive Web App (PWA)",
            description: "Deploy and install ATLAS directly as an offline-compatible web application on desktop or iOS."
          }
        ]
      },
      {
        title: "Platform Experience & Security",
        items: [
          {
            title: "Dark & Light Theme Support",
            description: "Adaptive themes designed to reduce eye strain, automatically matching system profile settings."
          },
          {
            title: "Smooth Animations",
            description: "Ultra-responsive dynamic transitions powered by physical springs and Framer Motion."
          },
          {
            title: "Secure Authentication",
            description: "Bulletproof account protection and sign-ins powered securely by Supabase auth layers."
          }
        ]
      }
    ]
  }
];

// ============================================================================
// STYLING — Futuristic releasing-timeline rules
// ============================================================================
const stylesCSS = `
  .changelog-container {
    max-width: 820px;
    margin: 0 auto;
    color: var(--text, #f5f5f7);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif;
    box-sizing: border-box;
    position: relative;
  }

  @media (prefers-reduced-motion: reduce) {
    .changelog-container {
      scroll-behavior: auto !important;
    }
    .changelog-back-btn, .changelog-release-card, .changelog-badge, .changelog-btt-btn {
      transition: none !important;
    }
  }

  .changelog-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
    padding-top: 8px;
  }

  .changelog-back-btn {
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

  .changelog-back-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
    border-color: var(--text-muted, #71717a);
  }

  .changelog-back-btn:active {
    transform: scale(0.97);
  }

  .changelog-back-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }

  .changelog-header-content {
    flex: 1;
    min-width: 0;
  }

  .changelog-title {
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 6px 0;
    color: var(--text, #f5f5f7);
    line-height: 1.2;
  }

  .changelog-subtitle {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    margin: 0;
    line-height: 1.4;
  }

  .changelog-timeline-section {
    position: relative;
    padding-left: 24px;
    margin-top: 32px;
  }

  .changelog-timeline-line {
    position: absolute;
    left: 7px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background-color: var(--border, rgba(255, 255, 255, 0.08));
    z-index: 1;
  }

  .changelog-release-wrapper {
    position: relative;
    margin-bottom: 40px;
  }

  .changelog-release-wrapper:last-child {
    margin-bottom: 0;
  }

  .changelog-timeline-node {
    position: absolute;
    left: -23px;
    top: 16px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: var(--surface, #131316);
    border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
    z-index: 2;
    box-sizing: border-box;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .changelog-release-wrapper.latest .changelog-timeline-node {
    border-color: var(--accent, #8b5cf6);
    background-color: var(--accent, #8b5cf6);
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
  }

  .changelog-release-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: border-color 0.15s ease;
  }

  .changelog-release-wrapper.latest .changelog-release-card {
    border-color: rgba(139, 92, 246, 0.25);
    background-image: linear-gradient(165deg, rgba(139, 92, 246, 0.02) 0%, transparent 100%);
  }

  .changelog-card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .changelog-badges-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .changelog-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .changelog-badge-latest {
    color: var(--text, #f5f5f7);
    background-color: var(--accent, #8b5cf6);
    border: 1px solid var(--accent, #8b5cf6);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .changelog-badge-version {
    color: var(--text, #f5f5f7);
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  }

  .changelog-badge-status {
    color: var(--accent, #8b5cf6);
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
  }

  .changelog-date {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    font-weight: 500;
  }

  .changelog-release-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--text, #f5f5f7);
    letter-spacing: -0.01em;
  }

  .changelog-release-description {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted, #a1a1aa);
    margin: 0 0 24px 0;
  }

  .changelog-groups {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .changelog-group {
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 16px;
  }

  .changelog-group-title {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent, #8b5cf6);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 0 0 14px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .changelog-items-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (min-width: 640px) {
    .changelog-items-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .changelog-item {
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.05));
    border-radius: 10px;
    padding: 12px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .changelog-item-bullet {
    color: var(--accent, #8b5cf6);
    flex-shrink: 0;
    margin-top: 2px;
    display: flex;
    align-items: center;
  }

  .changelog-item-content {
    flex: 1;
    min-width: 0;
  }

  .changelog-item-title {
    font-size: 13.5px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--text, #f5f5f7);
  }

  .changelog-item-description {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted, #71717a);
    margin: 0;
  }

  .changelog-btt-btn {
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

  .changelog-btt-btn.visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .changelog-btt-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
  }

  .changelog-btt-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }

  .changelog-footer {
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 24px;
    padding-bottom: 12px;
    text-align: center;
    margin-top: 24px;
  }

  .changelog-footer-text {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-muted, #71717a);
    margin: 0 0 6px 0;
  }
`;

// ============================================================================
// COMPONENT HELPERS
// ============================================================================
const getGroupIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes('ai') || t.includes('intelligence')) {
    return <Sparkles size={12} />;
  }
  if (t.includes('productivity') || t.includes('core')) {
    return <Zap size={12} />;
  }
  if (t.includes('insights') || t.includes('analytics') || t.includes('management')) {
    return <Milestone size={12} />;
  }
  if (t.includes('academic')) {
    return <Layers size={12} />;
  }
  return <Monitor size={12} />;
};

// ============================================================================
// MAIN EXPORT
// ============================================================================
export default function Changelog() {
  const navigate = useNavigate();
  const [showBtt, setShowBtt] = useState(false);

  const handleBack = () => {
    navigate('/about');
  };

  const handleScrollToTop = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  // Passive scroll listener for the Back-to-Top visibility
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
    <div className="changelog-container">
      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />

      {/* ============================================================ HEADER */}
      <header className="changelog-header">
        <button
          className="changelog-back-btn"
          onClick={handleBack}
          aria-label="Navigate back to About ATLAS"
          title="Back to About"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="changelog-header-content">
          <h1 className="changelog-title">What's New</h1>
          <p className="changelog-subtitle">
            Discover the latest improvements, features, and enhancements added to Atlas.
          </p>
        </div>
      </header>

      {/* ============================================================ TIMELINE RELEASE LIST */}
      <main className="changelog-timeline-section">
        <div className="changelog-timeline-line" aria-hidden="true" />

        {RELEASES.map((release, index) => {
          const isLatest = index === 0;
          return (
            <article
              key={release.version}
              id={`release-${release.version.replace(/\./g, '-')}`}
              className={`changelog-release-wrapper ${isLatest ? 'latest' : ''}`}
            >
              <div className="changelog-timeline-node" aria-hidden="true" />
              
              <div className="changelog-release-card">
                <header className="changelog-card-header">
                  <div className="changelog-badges-row">
                    {isLatest && (
                      <span className="changelog-badge changelog-badge-latest">
                        <Sparkles size={10} />
                        Latest
                      </span>
                    )}
                    <span className="changelog-badge changelog-badge-version">
                      Version {release.version}
                    </span>
                    {release.status && (
                      <span className="changelog-badge changelog-badge-status">
                        {release.status}
                      </span>
                    )}
                  </div>
                  <time className="changelog-date" dateTime="2026-07">
                    {release.date}
                  </time>
                </header>

                <h2 className="changelog-release-title">{release.title}</h2>
                <p className="changelog-release-description">{release.description}</p>

                <div className="changelog-groups">
                  {release.groups.map((group) => (
                    <section key={group.title} className="changelog-group">
                      <h3 className="changelog-group-title">
                        {getGroupIcon(group.title)}
                        {group.title}
                      </h3>
                      <div className="changelog-items-grid">
                        {group.items.map((item) => (
                          <div key={item.title} className="changelog-item">
                            <span className="changelog-item-bullet" aria-hidden="true">
                              ✦
                            </span>
                            <div className="changelog-item-content">
                              <h4 className="changelog-item-title">{item.title}</h4>
                              <p className="changelog-item-description">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </main>

      {/* ============================================================ FOOTER */}
      <footer className="changelog-footer">
        <p className="changelog-footer-text">
          ATLAS is continually evolving with new features and enhancements.
        </p>
        <p className="changelog-footer-text">
          Thank you for being part of our journey. All product updates are rolled out automatically.
        </p>
      </footer>

      {/* ============================================================ BACK TO TOP */}
      <button
        className={`changelog-btt-btn ${showBtt ? 'visible' : ''}`}
        onClick={handleScrollToTop}
        aria-label="Back to top"
        title="Scroll to top"
      >
        <ChevronUp size={18} />
      </button>
    </div>
  );
}