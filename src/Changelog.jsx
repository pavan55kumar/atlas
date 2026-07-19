import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Zap, Shield, Wrench, Gauge, Palette,
  Brain, Calendar, CheckCircle2, Flame, Target, FileText,
  DollarSign, BarChart3, GraduationCap, Timer, Moon, Smartphone,
  Globe, Wand2, Lock, ChevronDown, Rocket, ArrowUp
} from 'lucide-react';

// ============================================================
// ADD NEW RELEASES AT THE TOP OF THIS ARRAY
// The first item is automatically treated as the latest release.
// ============================================================

const RELEASES = [
  {
    version: '1.0.0',
    date: 'July 2026',
    title: 'Initial Public Release',
    description: 'The first public version of ATLAS, bringing productivity, academics, planning, focus, and AI together in one unified workspace.',
    status: 'Stable',
    groups: [
      {
        title: 'AI & Intelligence',
        type: 'feature',
        items: [
          { icon: Brain, title: 'AI Assistant', description: 'Intelligent assistance directly inside ATLAS.' },
          { icon: Calendar, title: 'AI Schedule', description: 'AI-assisted schedule planning and optimization.' }
        ]
      },
      {
        title: 'Productivity',
        type: 'feature',
        items: [
          { icon: CheckCircle2, title: 'Tasks', description: 'Create and manage tasks with priorities and deadlines.' },
          { icon: Flame, title: 'Habits', description: 'Build streaks and track daily habits.' },
          { icon: Target, title: 'Goals', description: 'Set, track, and achieve your personal goals.' },
          { icon: Calendar, title: 'Calendar', description: 'View and manage your schedule.' },
          { icon: FileText, title: 'Notes', description: 'Capture thoughts and ideas.' },
          { icon: Timer, title: 'Focus Mode', description: 'Deep work sessions with distraction blocking.' }
        ]
      },
      {
        title: 'Insights & Management',
        type: 'feature',
        items: [
          { icon: DollarSign, title: 'Expenses', description: 'Track spending and manage finances.' },
          { icon: BarChart3, title: 'Analytics', description: 'Visualize productivity trends and metrics.' }
        ]
      },
      {
        title: 'Academics',
        type: 'feature',
        items: [
          { icon: GraduationCap, title: 'Academic Workspace', description: 'Subjects, attendance, assignments, CGPA planner, and study planner.' }
        ]
      },
      {
        title: 'Platform',
        type: 'feature',
        items: [
          { icon: Smartphone, title: 'Android Support', description: 'Native Android app built with Capacitor.' },
          { icon: Globe, title: 'Progressive Web App', description: 'Installable, offline-capable web application.' }
        ]
      },
      {
        title: 'Experience & Security',
        type: 'feature',
        items: [
          { icon: Moon, title: 'Dark & Light Theme', description: 'Beautiful themes that adapt to your preference.' },
          { icon: Wand2, title: 'Smooth Animations', description: 'Polished micro-interactions and transitions.' },
          { icon: Lock, title: 'Secure Authentication', description: 'Bank-grade security powered by Supabase.' }
        ]
      }
    ]
  }
];

// ============================================================
// CHANGE TYPE CONFIGURATION
// ============================================================

const CHANGE_TYPES = {
  feature: { label: 'NEW', icon: Sparkles, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.25)' },
  improvement: { label: 'IMPROVED', icon: Zap, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.25)' },
  fix: { label: 'FIXED', icon: Wrench, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)' },
  security: { label: 'SECURITY', icon: Shield, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)' },
  performance: { label: 'PERFORMANCE', icon: Gauge, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.25)' },
  ui: { label: 'UI/UX', icon: Palette, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.25)' }
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'feature', label: 'Features' },
  { id: 'improvement', label: 'Improvements' },
  { id: 'fix', label: 'Fixes' },
  { id: 'security', label: 'Security' },
  { id: 'performance', label: 'Performance' },
  { id: 'ui', label: 'UI/UX' }
];

// ============================================================
// STYLES
// ============================================================

const styles = `
  .atlas-changelog-container {
    max-width: 820px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }

  /* ===== HEADER ===== */
  .atlas-changelog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .atlas-changelog-back-btn {
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
  .atlas-changelog-back-btn:hover, .atlas-changelog-back-btn:focus-visible {
    background: var(--surface);
    border-color: var(--accent);
    outline: none;
  }
  .atlas-changelog-title-block {
    flex: 1;
    min-width: 0;
  }
  .atlas-changelog-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .atlas-changelog-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 4px 0 0 0;
  }

  /* ===== LATEST RELEASE HERO ===== */
  .atlas-changelog-hero {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 28px;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  .atlas-changelog-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 10%, var(--accent) 50%, transparent 90%);
    opacity: 0.6;
  }
  .atlas-changelog-hero-glow {
    position: absolute;
    top: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%);
    pointer-events: none;
  }
  .atlas-changelog-hero-content {
    position: relative;
    z-index: 1;
  }
  .atlas-changelog-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 999px;
    padding: 4px 10px;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .atlas-changelog-hero-version {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 8px;
  }
  .atlas-changelog-hero-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .atlas-changelog-hero-number {
    font-size: 32px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .atlas-changelog-hero-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .atlas-changelog-hero-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
  }
  .atlas-changelog-hero-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--text-muted);
    opacity: 0.5;
  }
  .atlas-changelog-hero-date {
    font-size: 14px;
    color: var(--text-muted);
  }
  .atlas-changelog-hero-desc {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-muted);
    margin: 0 0 16px 0;
  }
  .atlas-changelog-hero-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 8px;
    padding: 4px 10px;
  }
  .atlas-changelog-hero-status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }

  /* ===== FILTERS ===== */
  .atlas-changelog-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }
  .atlas-changelog-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  .atlas-changelog-filter-btn:hover {
    color: var(--text);
    border-color: var(--accent);
  }
  .atlas-changelog-filter-btn.active {
    color: var(--accent);
    background: rgba(139, 92, 246, 0.1);
    border-color: rgba(139, 92, 246, 0.3);
  }
  .atlas-changelog-filter-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ===== TIMELINE ===== */
  .atlas-changelog-timeline {
    position: relative;
    padding-left: 28px;
  }
  .atlas-changelog-timeline::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 12px;
    bottom: 12px;
    width: 2px;
    background: linear-gradient(to bottom, var(--border) 0%, var(--border) 100%);
  }
  .atlas-changelog-timeline-item {
    position: relative;
    margin-bottom: 20px;
  }
  .atlas-changelog-timeline-item:last-child {
    margin-bottom: 0;
  }
  .atlas-changelog-timeline-node {
    position: absolute;
    left: -28px;
    top: 24px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--border);
    z-index: 1;
    transition: border-color 0.2s ease;
  }
  .atlas-changelog-timeline-item:hover .atlas-changelog-timeline-node {
    border-color: var(--accent);
  }
  .atlas-changelog-timeline-item.latest .atlas-changelog-timeline-node {
    background: var(--accent);
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  }

  /* ===== RELEASE CARD ===== */
  .atlas-changelog-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    transition: border-color 0.2s ease;
  }
  .atlas-changelog-card:hover {
    border-color: var(--accent);
  }
  .atlas-changelog-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }
  .atlas-changelog-card-version-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .atlas-changelog-card-version {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.01em;
  }
  .atlas-changelog-latest-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 6px;
    padding: 2px 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .atlas-changelog-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 6px;
    padding: 2px 8px;
  }
  .atlas-changelog-card-date {
    font-size: 13px;
    color: var(--text-muted);
  }
  .atlas-changelog-card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px 0;
    letter-spacing: -0.01em;
  }
  .atlas-changelog-card-desc {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted);
    margin: 0 0 16px 0;
  }

  /* ===== FEATURE GROUPS ===== */
  .atlas-changelog-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .atlas-changelog-group {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
  }
  .atlas-changelog-group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }
  .atlas-changelog-group-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
  .atlas-changelog-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 6px;
    padding: 2px 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .atlas-changelog-group-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .atlas-changelog-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .atlas-changelog-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--surface);
    color: var(--accent);
    flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .atlas-changelog-item-content {
    flex: 1;
    min-width: 0;
  }
  .atlas-changelog-item-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 2px 0;
  }
  .atlas-changelog-item-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }

  /* ===== EXPAND/COLLAPSE ===== */
  .atlas-changelog-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px 0 0 0;
    font-family: inherit;
    transition: opacity 0.2s ease;
  }
  .atlas-changelog-expand-btn:hover {
    opacity: 0.8;
  }
  .atlas-changelog-expand-btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 4px;
  }
  .atlas-changelog-expand-icon {
    transition: transform 0.2s ease;
  }
  .atlas-changelog-expand-icon.expanded {
    transform: rotate(180deg);
  }

  /* ===== EMPTY STATE ===== */
  .atlas-changelog-empty {
    text-align: center;
    padding: 48px 20px;
    color: var(--text-muted);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
  }

  /* ===== BACK TO TOP ===== */
  .atlas-changelog-back-to-top {
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
  .atlas-changelog-back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  .atlas-changelog-back-to-top:hover {
    background-color: var(--surface);
    border-color: var(--accent);
  }
  .atlas-changelog-back-to-top:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 640px) {
    .atlas-changelog-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .atlas-changelog-hero {
      padding: 20px;
    }
    .atlas-changelog-hero-number {
      font-size: 26px;
    }
    .atlas-changelog-card {
      padding: 20px;
    }
    .atlas-changelog-group {
      padding: 14px;
    }
    .atlas-changelog-timeline {
      padding-left: 24px;
    }
    .atlas-changelog-timeline::before {
      left: 5px;
    }
    .atlas-changelog-timeline-node {
      left: -24px;
      width: 12px;
      height: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
`;

// ============================================================
// SUBCOMPONENTS
// ============================================================

function LatestReleaseHero({ release }) {
  return (
    <div className="atlas-changelog-hero">
      <div className="atlas-changelog-hero-glow" />
      <div className="atlas-changelog-hero-content">
        <div className="atlas-changelog-hero-badge">
          <Sparkles size={12} />
          Latest Release
        </div>
        <div className="atlas-changelog-hero-version">
          <span className="atlas-changelog-hero-name">ATLAS</span>
          <span className="atlas-changelog-hero-number">Version {release.version}</span>
        </div>
        <div className="atlas-changelog-hero-meta">
          <span className="atlas-changelog-hero-title">{release.title}</span>
          <span className="atlas-changelog-hero-dot" />
          <span className="atlas-changelog-hero-date">{release.date}</span>
        </div>
        <p className="atlas-changelog-hero-desc">{release.description}</p>
        {release.status && (
          <div className="atlas-changelog-hero-status">
            <span className="atlas-changelog-hero-status-dot" />
            {release.status} Release
          </div>
        )}
      </div>
    </div>
  );
}

function ReleaseCard({ release, isLatest, filter, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  const filteredGroups = useMemo(() => {
    if (filter === 'all') return release.groups;
    return release.groups
      .map(group => ({
        ...group,
        items: group.items.filter(item => item.type === filter || group.type === filter)
      }))
      .filter(group => group.items.length > 0);
  }, [release.groups, filter]);

  const hasContent = filteredGroups.length > 0;
  const totalItems = release.groups.reduce((sum, g) => sum + g.items.length, 0);
  const shouldShowExpandButton = totalItems > 6 && filter === 'all';

  const releaseId = `release-${release.version.replace(/\./g, '-')}`;

  return (
    <article id={releaseId} className="atlas-changelog-card">
      <div className="atlas-changelog-card-header">
        <div className="atlas-changelog-card-version-row">
          <span className="atlas-changelog-card-version">v{release.version}</span>
          {isLatest && (
            <span className="atlas-changelog-latest-badge">
              <Rocket size={10} />
              Latest
            </span>
          )}
          {release.status && !isLatest && (
            <span className="atlas-changelog-status-badge">
              <span className="atlas-changelog-hero-status-dot" />
              {release.status}
            </span>
          )}
        </div>
        <span className="atlas-changelog-card-date">{release.date}</span>
      </div>
      <h3 className="atlas-changelog-card-title">{release.title}</h3>
      <p className="atlas-changelog-card-desc">{release.description}</p>

      {hasContent ? (
        <>
          <div className="atlas-changelog-groups">
            {(shouldShowExpandButton && !expanded ? filteredGroups.slice(0, 2) : filteredGroups).map((group, idx) => {
              const config = CHANGE_TYPES[group.type] || CHANGE_TYPES.feature;
              const TypeIcon = config.icon;
              return (
                <div key={idx} className="atlas-changelog-group">
                  <div className="atlas-changelog-group-header">
                    <h4 className="atlas-changelog-group-title">{group.title}</h4>
                    <span 
                      className="atlas-changelog-type-badge"
                      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
                    >
                      <TypeIcon size={10} />
                      {config.label}
                    </span>
                  </div>
                  <ul className="atlas-changelog-group-items">
                    {group.items.map((item, itemIdx) => {
                      const ItemIcon = item.icon || config.icon;
                      return (
                        <li key={itemIdx} className="atlas-changelog-item">
                          <span className="atlas-changelog-item-icon">
                            <ItemIcon size={14} />
                          </span>
                          <div className="atlas-changelog-item-content">
                            <p className="atlas-changelog-item-title">{item.title}</p>
                            {item.description && (
                              <p className="atlas-changelog-item-desc">{item.description}</p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          {shouldShowExpandButton && (
            <button 
              className="atlas-changelog-expand-btn"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls={`${releaseId}-details`}
            >
              {expanded ? 'Show less' : `Show all ${totalItems} changes`}
              <ChevronDown 
                size={14} 
                className={`atlas-changelog-expand-icon ${expanded ? 'expanded' : ''}`}
              />
            </button>
          )}
        </>
      ) : (
        <p className="atlas-changelog-card-desc" style={{ fontStyle: 'italic' }}>
          No {filter} changes in this release.
        </p>
      )}
    </article>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Changelog() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/about');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const latestRelease = RELEASES[0];
  const hasMultipleReleases = RELEASES.length > 1;

  return (
    <main className="atlas-changelog-container">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="atlas-changelog-header">
        <button 
          className="atlas-changelog-back-btn" 
          onClick={handleBack}
          aria-label="Navigate back to About ATLAS"
          title="Back to About"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="atlas-changelog-title-block">
          <h1 className="atlas-changelog-title">What's New</h1>
          <p className="atlas-changelog-subtitle">
            Discover the latest features, improvements, and enhancements added to ATLAS.
          </p>
        </div>
      </header>

      {/* LATEST RELEASE HERO */}
      <LatestReleaseHero release={latestRelease} />

      {/* FILTERS (only show if multiple releases exist) */}
      {hasMultipleReleases && (
        <div className="atlas-changelog-filters" role="tablist" aria-label="Filter releases by type">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              className={`atlas-changelog-filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              role="tab"
              aria-selected={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* TIMELINE */}
      {RELEASES.length === 0 ? (
        <div className="atlas-changelog-empty">
          No releases to display yet.
        </div>
      ) : (
        <div className="atlas-changelog-timeline">
          <AnimatePresence>
            {RELEASES.map((release, idx) => (
              <motion.div
                key={release.version}
                className={`atlas-changelog-timeline-item ${idx === 0 ? 'latest' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div className="atlas-changelog-timeline-node" />
                <ReleaseCard 
                  release={release}
                  isLatest={idx === 0}
                  filter={activeFilter}
                  defaultExpanded={idx === 0}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* BACK TO TOP */}
      <button 
        className={`atlas-changelog-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
      >
        <ArrowUp size={20} />
      </button>
    </main>
  );
}