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
  // Initialize open state for all collapsible sections dynamically
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    SECTIONS.forEach((s) => {
      if (s.collapsible) {
        initial[s.label] = s.items.some((i) => i.key === page);
      }
    });
    return initial;
  });

  // Ensure the section containing the active page is always open
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  {section.label.toUpperCase()}
                </span>
                {isCollapsible && (
                  <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </motion.div>
                )}
              </div>
            )}

            <AnimatePresence initial={false}>
              {/* 
                Render items if:
                1. It's not collapsible 
                2. It is collapsible but open 
                3. The sidebar is collapsed (showAllLabels is false) - we must show all icons!
              */}
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
                          border: 'none',
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
                              top: '20%',
                              bottom: '20%',
                              width: '3px',
                              borderRadius: '0 4px 4px 0',
                              background: 'var(--accent)',
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

  // Scroll lock & Escape key for mobile drawer
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
        className="sidebar-desktop"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: expanded ? '240px' : '76px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          minHeight: '100vh',
          transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
          backgroundColor: 'var(--surface)'
        }}
      >
       <div style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  padding: '0 10px', 
  marginBottom: '24px', 
  height: '40px' 
}}>
  <img
    src="/pwa-512x512.png"
    alt="Atlas"
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
        style={{
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: 'var(--text)',
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
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '288px',
                maxWidth: '85vw',
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                boxShadow: '4px 0 32px rgba(0,0,0,0.2)'
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
                background: 'var(--surface)',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
  src="/pwa-512x512.png"
  alt="Atlas"
  style={{
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    objectFit: 'cover',
    flexShrink: 0
  }}
/>
                  <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text)' }}>ATLAS</span>
                </div>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close menu"
                  style={{
                    width: '44px', height: '44px', borderRadius: '12px', border: '1px solid var(--border)',
                    background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, cursor: 'pointer', color: 'var(--text)'
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
        .sidebar-nav-item {
          background: transparent;
          color: var(--text-muted);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .sidebar-nav-item.active {
          background: var(--surface-2);
          color: var(--text);
        }
        .sidebar-nav-item.active svg {
          color: var(--accent);
        }
        @media (hover: hover) {
          .sidebar-nav-item:hover {
            background: rgba(139, 92, 246, 0.08);
            color: var(--text);
          }
          .sidebar-nav-item.active:hover {
            background: var(--surface-2);
          }
        }
        .sidebar-nav-item:active {
          background: rgba(139, 92, 246, 0.15);
        }
        
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </>
  )
}

export default Sidebar