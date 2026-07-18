import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, CheckCircle2, Flame, Target, Calendar, Timer,
  FileText, Wallet, BarChart3,
  GraduationCap, CalendarCheck, ClipboardList, TrendingUp, Award, BookOpen,
  Sparkles, ListOrdered,
  Settings, Info, ChevronDown, X
} from 'lucide-react'

const SECTIONS = [
  {
    label: 'Main',
    items: [
      { key: 'overview', label: 'Overview', icon: Home },
      { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
      { key: 'habits', label: 'Habits', icon: Flame },
      { key: 'goals', label: 'Goals', icon: Target },
      { key: 'calendar', label: 'Calendar', icon: Calendar },
      { key: 'focus', label: 'Focus Mode', icon: Timer },
      { key: 'ai', label: 'AI Assistant', icon: Sparkles }
    ]
  },
  {
    label: 'Workspace',
    collapsible: true,
    items: [
      { key: 'notes', label: 'Notes', icon: FileText },
      { key: 'expenses', label: 'Expenses', icon: Wallet },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 }
    ]
  },
  {
    label: 'Academics',
    collapsible: true,
    items: [
      { key: 'subjects', label: 'Subjects', icon: GraduationCap },
      { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { key: 'assignments', label: 'Assignments', icon: ClipboardList },
      { key: 'cgpa', label: 'CGPA Planner', icon: TrendingUp },
      { key: 'study-planner', label: 'Study Planner', icon: BookOpen }
    ]
  },
  {
    label: 'AI',
    items: [
      { key: 'schedule-ai', label: 'AI Schedule', icon: ListOrdered }
    ]
  },
  {
    label: 'System',
    collapsible: true,
    items: [
      { key: 'settings', label: 'Settings', icon: Settings },
      { key: 'about', label: 'Info', icon: Info }
    ]
  }
]

function NavList({ page, onNavigate, showAllLabels }) {
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    SECTIONS.forEach((s) => {
      if (s.collapsible) {
        initial[s.label] = s.items.some((i) => i.key === page);
      }
    });
    return initial;
  });

  useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev };
      SECTIONS.forEach((s) => {
        if (s.collapsible && s.items.some((i) => i.key === page)) {
          next[s.label] = true;
        }
      });
      return next;
    });
  }, [page]);

  const toggleSection = (label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSectionKey = (e, label) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(label);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {SECTIONS.map((section) => {
        const isCollapsible = section.collapsible;
        const isOpen = isCollapsible ? openSections[section.label] : true;

        return (
          <div key={section.label}>
            {showAllLabels && (
              <div
                onClick={isCollapsible ? () => toggleSection(section.label) : undefined}
                onKeyDown={isCollapsible ? (e) => handleSectionKey(e, section.label) : undefined}
                role={isCollapsible ? 'button' : undefined}
                tabIndex={isCollapsible ? 0 : undefined}
                aria-expanded={isCollapsible ? isOpen : undefined}
                className="atlas-section-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                  marginBottom: '8px',
                  cursor: isCollapsible ? 'pointer' : 'default',
                  outline: 'none',
                }}
              >
                <span className="atlas-section-label" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>
                  {section.label.toUpperCase()}
                </span>
                {isCollapsible && (
                  <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} color="var(--text-tertiary)" />
                  </motion.div>
                )}
              </div>
            )}

            <AnimatePresence initial={false}>
              {(!isCollapsible || isOpen || !showAllLabels) && (
                <motion.div
                  initial={showAllLabels ? { height: 0, opacity: 0 } : false}
                  animate={showAllLabels ? { height: 'auto', opacity: 1 } : { opacity: 1 }}
                  exit={showAllLabels ? { height: 0, opacity: 0 } : { opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const active = page === item.key

                    return (
                      <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        aria-current={active ? 'page' : undefined}
                        className={`sidebar-nav-item ${active ? 'active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: '1px solid transparent',
                          fontSize: '13px',
                          fontWeight: active ? 600 : 500,
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                          position: 'relative',
                          outline: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          WebkitTouchCallout: 'none',
                          userSelect: 'none',
                          WebkitUserSelect: 'none',
                          cursor: 'pointer',
                          minHeight: '44px',
                        }}
                      >
                        {active && (
                          <motion.span
                            layoutId="active-nav-indicator"
                            style={{
                              position: 'absolute',
                              left: '0',
                              top: '25%',
                              bottom: '25%',
                              width: '3px',
                              borderRadius: '0 4px 4px 0',
                              background: 'linear-gradient(to bottom, #d07eff, #8b5cf6)',
                              boxShadow: '0 0 8px rgba(208, 126, 255, 0.6), 0 0 4px rgba(245, 158, 11, 0.3)',
                            }}
                          />
                        )}
                        <Icon size={18} style={{ flexShrink: 0, transition: 'color 0.2s ease' }} />
                        {showAllLabels && item.label}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function Sidebar({ page, onNavigate, mobileOpen, onCloseMobile }) {
  const [expanded, setExpanded] = useState(false)
  const hoverTimeout = useRef(null)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      const handleEsc = (e) => e.key === 'Escape' && onCloseMobile()
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleEsc)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileOpen, onCloseMobile])

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setExpanded(true), 150)
  }
  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current)
    setExpanded(false)
  }

  return (
    <>
      <div
        className="sidebar-desktop atlas-sidebar-shell"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: expanded ? '240px' : '76px',
          flexShrink: 0,
          padding: '24px 12px',
          minHeight: '100vh',
          transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          borderRight: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px', marginBottom: '28px', height: '40px' }}>
          <img
            src="/pwa-512x512.png"
            alt="Atlas"
            className="atlas-logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="atlas-brand-text"
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.15em',
                  whiteSpace: 'nowrap'
                }}
              >
                ATLAS
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <NavList page={page} onNavigate={onNavigate} showAllLabels={expanded} />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onCloseMobile}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                zIndex: 998
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="atlas-sidebar-shell atlas-mobile-drawer"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '288px',
                maxWidth: '85vw',
                borderRight: '1px solid var(--border)',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '4px 0 40px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 16px 16px',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src="/pwa-512x512.png"
                    alt="Atlas"
                    className="atlas-logo"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <span className="atlas-brand-text" style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.15em' }}>ATLAS</span>
                </div>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close menu"
                  className="atlas-close-btn"
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
                <NavList
                  page={page}
                  onNavigate={(key) => {
                    onNavigate(key)
                    onCloseMobile()
                  }}
                  showAllLabels={true}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .atlas-sidebar-shell {
          background-color: rgba(6, 6, 9, 0.75);
          backdrop-filter: blur(16px) saturate(140%);
          -webkit-backdrop-filter: blur(16px) saturate(140%);
        }

        /* Replaced heavy SVG with lightweight CSS radial gradients for Chrome stability */
        .atlas-sidebar-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 10%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(208, 126, 255, 0.04) 0%, transparent 40%);
          pointer-events: none;
          z-index: 0;
        }

        /* Force GPU acceleration to prevent white screen on mobile Chrome */
        .atlas-mobile-drawer {
          transform: translateZ(0);
        }

        .sidebar-desktop > * {
          position: relative;
          z-index: 1;
        }

        .atlas-logo {
          box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(208, 126, 255, 0.25);
        }
        .atlas-brand-text {
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #d07eff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .atlas-section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .atlas-section-label::before {
          content: '';
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d07eff, #8b5cf6);
          box-shadow: 0 0 6px rgba(208, 126, 255, 0.6);
        }

        .sidebar-nav-item {
          background: transparent;
          color: var(--text-muted);
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        @media (hover: hover) {
          .sidebar-nav-item:hover {
            background: rgba(255, 255, 255, 0.04);
            color: var(--text);
            border-color: rgba(139, 92, 246, 0.15);
            box-shadow: inset 0 0 12px rgba(139, 92, 246, 0.05);
          }
        }
        .sidebar-nav-item:active {
          background: rgba(139, 92, 246, 0.12);
          transform: scale(0.98);
        }

        .sidebar-nav-item.active {
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%);
          color: #ffffff;
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 1px 0 0 rgba(208, 126, 255, 0.4);
        }
        .sidebar-nav-item.active svg {
          color: #d07eff;
          filter: drop-shadow(0 0 4px rgba(208, 126, 255, 0.5));
        }

        .atlas-close-btn {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--text);
          transition: all 0.2s ease;
        }
        .atlas-close-btn:hover {
          background: rgba(208, 126, 255, 0.1);
          border-color: rgba(208, 126, 255, 0.3);
        }
        .atlas-close-btn:active {
          transform: scale(0.95);
          background: rgba(208, 126, 255, 0.2);
        }

        /* =========================================
           LIGHT THEME OVERRIDES
           ========================================= */
        body.light-theme .atlas-sidebar-shell,
        body.light .atlas-sidebar-shell,
        .light-theme .atlas-sidebar-shell,
        .light .atlas-sidebar-shell,
        [data-theme="light"] .atlas-sidebar-shell {
          background-color: rgba(248, 250, 252, 0.85);
          border-color: rgba(15, 23, 42, 0.06);
        }

        body.light-theme .atlas-sidebar-shell::before,
        body.light .atlas-sidebar-shell::before,
        .light-theme .atlas-sidebar-shell::before,
        .light .atlas-sidebar-shell::before,
        [data-theme="light"] .atlas-sidebar-shell::before {
          background: 
            radial-gradient(circle at 30% 10%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(208, 126, 255, 0.05) 0%, transparent 40%);
        }

        body.light-theme .atlas-brand-text,
        body.light .atlas-brand-text,
        .light-theme .atlas-brand-text,
        .light .atlas-brand-text,
        [data-theme="light"] .atlas-brand-text {
          background: linear-gradient(135deg, #0f172a 0%, #6d5ef2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        body.light-theme .sidebar-nav-item.active,
        body.light .sidebar-nav-item.active,
        .light-theme .sidebar-nav-item.active,
        .light .sidebar-nav-item.active,
        [data-theme="light"] .sidebar-nav-item.active {
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0.4) 100%);
          color: #0f172a;
          border-color: rgba(99, 102, 241, 0.2);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08), inset 1px 0 0 rgba(99, 102, 241, 0.3);
        }
        
        body.light-theme .sidebar-nav-item.active svg,
        body.light .sidebar-nav-item.active svg,
        .light-theme .sidebar-nav-item.active svg,
        .light .sidebar-nav-item.active svg,
        [data-theme="light"] .sidebar-nav-item.active svg {
          color: #6d5ef2;
          filter: none;
        }

        body.light-theme .sidebar-nav-item:hover,
        body.light .sidebar-nav-item:hover,
        .light-theme .sidebar-nav-item:hover,
        .light .sidebar-nav-item:hover,
        [data-theme="light"] .sidebar-nav-item:hover {
          background: rgba(15, 23, 42, 0.04);
          border-color: rgba(99, 102, 241, 0.1);
        }

        body.light-theme .atlas-close-btn,
        body.light .atlas-close-btn,
        .light-theme .atlas-close-btn,
        .light .atlas-close-btn,
        [data-theme="light"] .atlas-close-btn {
          background: rgba(255, 255, 255, 0.6);
          color: #0f172a;
        }
        
        body.light-theme .atlas-close-btn:hover,
        body.light .atlas-close-btn:hover,
        .light-theme .atlas-close-btn:hover,
        .light .atlas-close-btn:hover,
        [data-theme="light"] .atlas-close-btn:hover {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.2);
        }
        
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </>
  )
}

export default Sidebar