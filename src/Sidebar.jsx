import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, CheckCircle2, Flame, Target, Calendar, Timer,
  FileText, Wallet, BarChart3,
  GraduationCap, CalendarCheck, ClipboardList, TrendingUp, Award, BookOpen,
  Sparkles, ListOrdered,
  Settings, Info, ChevronDown, X
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'

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

// ---------------------------------------------------------------
// PERF: Static style objects hoisted to module scope. These were
// previously re-created on every render (and, for the nav items, on
// every render of every item in every section) with no dependency on
// props/state. Only the genuinely dynamic bits (fontWeight based on
// `active`, cursor based on `isCollapsible`, width based on `expanded`)
// stay inline. Visual output is unchanged.
// ---------------------------------------------------------------

const NAV_LIST_CONTAINER_STYLE = { display: 'flex', flexDirection: 'column', gap: '16px' }

const SECTION_HEADER_BASE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 14px',
  marginBottom: '8px',
  minHeight: '38px',
  borderRadius: '8px',
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  WebkitUserSelect: 'none',
}

const SECTION_CONTENT_STYLE = { overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '3px' }

const NAV_ITEM_BASE_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid transparent',
  fontSize: '13px',
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
}

const ACTIVE_INDICATOR_STYLE = {
  position: 'absolute',
  left: '4px',
  top: '25%',
  bottom: '25%',
  width: '3px',
  borderRadius: '2px',
  backgroundColor: 'var(--accent)',
  boxShadow: '0 0 8px var(--accent)',
}

const NAV_ICON_STYLE = { flexShrink: 0, transition: 'color 0.2s ease' }

const LOGO_STYLE = {
  width: '30px',
  height: '30px',
  borderRadius: '8px',
  objectFit: 'cover',
  flexShrink: 0
}

const LOGO_ROW_STYLE = { display: 'flex', alignItems: 'center', gap: '11px', padding: '0 8px', marginBottom: '24px', height: '36px' }

const BRAND_TEXT_STYLE = {
  fontSize: '13px',
  fontWeight: 800,
  letterSpacing: '0.15em',
  whiteSpace: 'nowrap'
}

const SIDEBAR_SHELL_BASE_STYLE = {
  flexShrink: 0,
  padding: '20px 10px',
  minHeight: '100vh',
  transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
  overflow: 'hidden',
  position: 'relative',
  zIndex: 10,
  borderRight: '1px solid var(--border)'
}

const MOBILE_BACKDROP_STYLE = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  zIndex: 998
}

const MOBILE_DRAWER_STYLE = {
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
}

const MOBILE_DRAWER_HEADER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 14px 14px',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: 'var(--surface)'
}

const MOBILE_HEADER_LOGO_ROW_STYLE = { display: 'flex', alignItems: 'center', gap: '11px' }

const MOBILE_BRAND_TEXT_STYLE = { fontSize: '13px', fontWeight: 800, letterSpacing: '0.15em' }

const CLOSE_BTN_STYLE = {
  width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0, cursor: 'pointer'
}

const MOBILE_NAV_CONTENT_STYLE = { flex: 1, overflowY: 'auto', padding: '16px 10px' }

const NavList = memo(function NavList({ page, onNavigate, showAllLabels }) {
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

  const toggleSection = useCallback((label) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  }, [])

  const handleSectionKey = useCallback((e, label) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSection(label);
    }
  }, [toggleSection])

  return (
    <div style={NAV_LIST_CONTAINER_STYLE}>
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
                  ...SECTION_HEADER_BASE_STYLE,
                  cursor: isCollapsible ? 'pointer' : 'default',
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
                  style={SECTION_CONTENT_STYLE}
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
                          ...NAV_ITEM_BASE_STYLE,
                          fontWeight: active ? 600 : 500,
                        }}
                      >
                        {active && (
                          <motion.span
                            layoutId="active-nav-indicator"
                            style={ACTIVE_INDICATOR_STYLE}
                          />
                        )}
                        <Icon size={18} style={NAV_ICON_STYLE} />
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
})

function Sidebar({ page, onNavigate, mobileOpen, onCloseMobile }) {
  const [expanded, setExpanded] = useState(false)
  const hoverTimeout = useRef(null)

  const pushedHistoryRef = useRef(false)

  // PERF: stabilized with useCallback so it can be safely used as an effect
  // dependency and doesn't get re-created (and re-passed to children) every render.
  const closeDrawer = useCallback(() => {
    // Native Android:
    // Never manipulate browser history.
    if (Capacitor.isNativePlatform()) {
      onCloseMobile()
      return
    }

    // Web/PWA:
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false
      window.history.back()
    } else {
      onCloseMobile()
    }
  }, [onCloseMobile])

 useEffect(() => {
  if (!mobileOpen) {
    document.body.style.overflow = ''
    return
  }

  document.body.style.overflow = 'hidden'

  // Native Android:
  // Do NOT manipulate browser/WebView history.
  // Dashboard handles the Android hardware back button.
  if (Capacitor.isNativePlatform()) {
    return () => {
      document.body.style.overflow = ''
    }
  }

  // Web/PWA only:
  // Add history entry so browser back closes the drawer.
  window.history.pushState({ atlasDrawerOpen: true }, '')
  pushedHistoryRef.current = true

  const handlePopState = () => {
    pushedHistoryRef.current = false
    onCloseMobile()
  }

  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeDrawer()
    }
  }

  window.addEventListener('popstate', handlePopState)
  window.addEventListener('keydown', handleEsc)

  return () => {
    document.body.style.overflow = ''
    window.removeEventListener('popstate', handlePopState)
    window.removeEventListener('keydown', handleEsc)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mobileOpen])

  // PERF: useCallback — hoverTimeout is a ref so this has no reactive deps
  // and never needs to be re-created across renders.
  const handleMouseEnter = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setExpanded(true), 150)
  }, [])
  const handleMouseLeave = useCallback(() => {
    clearTimeout(hoverTimeout.current)
    setExpanded(false)
  }, [])

  // PERF: stabilized so the mobile NavList doesn't get a fresh onNavigate
  // function identity (and thus skip its memo bail-out) on every render.
  const handleMobileNavigate = useCallback((key) => {
    onNavigate(key)
    closeDrawer()
  }, [onNavigate, closeDrawer])

  return (
    <>
      <div
        className="sidebar-desktop atlas-sidebar-shell"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          ...SIDEBAR_SHELL_BASE_STYLE,
          width: expanded ? '220px' : '72px',
        }}
      >
        <div style={LOGO_ROW_STYLE}>
          <img
            src="/pwa-512x512.png"
            alt="Atlas"
            className="atlas-logo"
            style={LOGO_STYLE}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="atlas-brand-text"
                style={BRAND_TEXT_STYLE}
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
              style={MOBILE_BACKDROP_STYLE}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="atlas-sidebar-shell atlas-mobile-drawer"
              style={MOBILE_DRAWER_STYLE}
            >
              <div style={MOBILE_DRAWER_HEADER_STYLE}>
                <div style={MOBILE_HEADER_LOGO_ROW_STYLE}>
                  <img
                    src="/pwa-512x512.png"
                    alt="Atlas"
                    className="atlas-logo"
                    style={LOGO_STYLE}
                  />
                  <span className="atlas-brand-text" style={MOBILE_BRAND_TEXT_STYLE}>ATLAS</span>
                </div>
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="atlas-close-btn"
                  style={CLOSE_BTN_STYLE}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={MOBILE_NAV_CONTENT_STYLE}>
                <NavList
                  page={page}
                  onNavigate={handleMobileNavigate}
                  showAllLabels={true}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{sidebarStyles}</style>
    </>
  )
}

// PERF: hoisted to module scope — this is a static string with no
// dependency on props/state, so it never needs to be re-created. Previously
// it was a fresh template literal on every render (including every hover
// in/out on desktop, since that toggles `expanded`), forcing the browser
// to re-parse/re-apply the whole stylesheet each time.
const sidebarStyles = `
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
`

export default Sidebar