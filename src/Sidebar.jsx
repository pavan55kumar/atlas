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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                className={`atlas-section-header ${isCollapsible ? 'is-collapsible' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 14px',
                  marginBottom: '8px',
                  minHeight: '38px',
                  borderRadius: '8px',
                  cursor: isCollapsible ? 'pointer' : 'default',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                <span className="atlas-section-label">
                  {section.label.toUpperCase()}
                </span>
                {isCollapsible && (
                  <motion.div
                    className="atlas-section-chevron"
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronDown size={14} />
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
                  style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }}
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
                          padding: '10px 14px',
                          borderRadius: '10px',
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
                          minHeight: '42px',
                        }}
                      >
                        {active && (
                          <motion.span
                            layoutId="active-nav-indicator"
                            style={{
                              position: 'absolute',
                              left: '4px',
                              top: '25%',
                              bottom: '25%',
                              width: '3px',
                              borderRadius: '2px',
                              backgroundColor: 'var(--accent)',
                              boxShadow: '0 0 8px var(--accent)',
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

  const pushedHistoryRef = useRef(false)

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'

      window.history.pushState({ atlasDrawerOpen: true }, '')
      pushedHistoryRef.current = true

      const handlePopState = () => {
        pushedHistoryRef.current = false
        onCloseMobile()
      }
      const handleEsc = (e) => e.key === 'Escape' && closeDrawer()

      window.addEventListener('popstate', handlePopState)
      window.addEventListener('keydown', handleEsc)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('popstate', handlePopState)
        window.removeEventListener('keydown', handleEsc)
      }
    } else {
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen])

  function closeDrawer() {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false
      window.history.back()
    } else {
      onCloseMobile()
    }
  }

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
          width: expanded ? '220px' : '72px',
          flexShrink: 0,
          padding: '20px 10px',
          minHeight: '100vh',
          transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          borderRight: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '0 8px', marginBottom: '24px', height: '36px' }}>
          <img
            src="/pwa-512x512.png"
            alt="Atlas"
            className="atlas-logo"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
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
                  fontSize: '13px',
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
              onClick={closeDrawer}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
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
                width: '240px',
                maxWidth: '85vw',
                borderRight: '1px solid var(--border)',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '4px 0 32px rgba(0,0,0,0.35)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 14px 14px',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 2,
                background: 'var(--surface)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                  <img
                    src="/pwa-512x512.png"
                    alt="Atlas"
                    className="atlas-logo"
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                  />
                  <span className="atlas-brand-text" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.15em' }}>ATLAS</span>
                </div>
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="atlas-close-btn"
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 10px' }}>
                <NavList
                  page={page}
                  onNavigate={(key) => {
                    onNavigate(key)
                    closeDrawer()
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
          background-color: var(--surface);
        }

        .atlas-sidebar-shell::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 0%, rgba(139, 92, 246, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 70% 100%, rgba(108, 199, 240, 0.03) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .atlas-mobile-drawer {
          transform: translateZ(0);
        }

        .sidebar-desktop > * {
          position: relative;
          z-index: 1;
        }

        .atlas-logo {
          box-shadow: 0 0 0 1px var(--border), 0 4px 10px rgba(124, 58, 237, 0.15);
        }
        .atlas-brand-text {
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }

        .atlas-section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--text-muted);
        }
        .atlas-section-label::before {
          content: '';
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.6;
        }

        .atlas-section-header {
          transition: background 0.2s ease;
        }
        .atlas-section-header.is-collapsible:active {
          background: var(--surface-2);
        }
        @media (hover: hover) {
          .atlas-section-header.is-collapsible:hover {
            background: var(--surface-2);
          }
        }
        .atlas-section-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          opacity: 0.7;
          flex-shrink: 0;
        }

        .sidebar-nav-item {
          background: transparent;
          color: var(--text-muted);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        @media (hover: hover) {
          .sidebar-nav-item:hover {
            background: var(--surface-2);
            color: var(--text);
          }
        }
        .sidebar-nav-item:active {
          transform: scale(0.98);
          background: var(--surface-2);
        }

        .sidebar-nav-item.active {
          background: color-mix(in srgb, var(--accent) 12%, var(--surface));
          color: var(--text);
          border-color: color-mix(in srgb, var(--accent) 20%, transparent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .sidebar-nav-item.active svg {
          color: var(--accent);
        }

        .atlas-close-btn {
          background: var(--surface-2);
          color: var(--text);
          transition: all 0.2s ease;
        }
        .atlas-close-btn:hover {
          background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
          border-color: var(--accent);
        }
        .atlas-close-btn:active {
          transform: scale(0.95);
        }

        .sidebar-nav-item:focus-visible,
        .atlas-section-header:focus-visible,
        .atlas-close-btn:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
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
          color: transparent;
        }

        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default Sidebar