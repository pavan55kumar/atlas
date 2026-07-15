import { useState, useEffect } from 'react'
import {
  Home, CheckCircle2, Flame, Target, Calendar, Timer,
  FileText, Wallet, BarChart3,
  GraduationCap, CalendarCheck, ClipboardList, TrendingUp, Award, BookOpen,
  Sparkles, ListOrdered,
  Settings, ChevronDown, X
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
      { key: 'focus', label: 'Focus Mode', icon: Timer }
    ]
  },
  {
    label: 'Workspace',
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
      { key: 'ai', label: 'AI Assistant', icon: Sparkles },
      { key: 'schedule-ai', label: 'AI Schedule', icon: ListOrdered }
    ]
  },
  {
    label: 'System',
    items: [
      { key: 'settings', label: 'Settings', icon: Settings }
    ]
  }
]

const ACADEMIC_KEYS = SECTIONS.find(function (s) { return s.label === 'Academics' }).items.map(function (i) { return i.key })

function NavList({ page, onNavigate, showAllLabels }) {
  const [openAcademics, setOpenAcademics] = useState(ACADEMIC_KEYS.indexOf(page) !== -1)

  useEffect(function () {
    if (ACADEMIC_KEYS.indexOf(page) !== -1) setOpenAcademics(true)
  }, [page])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {SECTIONS.map(function (section) {
        const isAcademics = section.collapsible
        const isOpen = isAcademics ? openAcademics : true
        return (
          <div key={section.label}>
            {showAllLabels && (
              <div
                onClick={isAcademics ? function () { setOpenAcademics(!openAcademics) } : undefined}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 10px', marginBottom: '6px', cursor: isAcademics ? 'pointer' : 'default'
                }}
              >
                <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                  {section.label.toUpperCase()}
                </span>
                {isAcademics && (
                  <ChevronDown
                    size={13}
                    color="var(--text-muted)"
                    style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
                  />
                )}
              </div>
            )}

            {isOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {section.items.map(function (item) {
                  const Icon = item.icon
                  const active = page === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={function () { onNavigate(item.key) }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: '10px',
                        border: 'none',
                        background: active ? 'var(--surface-2)' : 'transparent',
                        color: active ? 'var(--text)' : 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: 500,
                        textAlign: 'left',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Icon size={17} style={{ flexShrink: 0 }} />
                      {showAllLabels && item.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Sidebar({ page, onNavigate, mobileOpen, onCloseMobile }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div
        className="sidebar-desktop"
        onMouseEnter={function () { setExpanded(true) }}
        onMouseLeave={function () { setExpanded(false) }}
        style={{
          width: expanded ? '230px' : '72px',
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          padding: '24px 12px',
          minHeight: '100vh',
          transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden'
        }}
      >
        <p style={{
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em',
          color: 'var(--text-muted)', padding: '0 10px', marginBottom: '20px', whiteSpace: 'nowrap'
        }}>
          {expanded ? 'ATLAS' : 'A'}
        </p>
        <NavList page={page} onNavigate={onNavigate} showAllLabels={expanded} />
      </div>

      {mobileOpen && (
        <>
          <div
            onClick={onCloseMobile}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '250px',
            background: 'var(--surface)', borderRight: '1px solid var(--border)',
            padding: '20px 12px', zIndex: 999, overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text)' }}>ATLAS</span>
              <button
                onClick={onCloseMobile}
                style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} color="var(--text)" />
              </button>
            </div>
            <NavList
              page={page}
              onNavigate={function (key) { onNavigate(key); onCloseMobile() }}
              showAllLabels={true}
            />
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none; }
        }
      `}</style>
    </>
  )
}

export default Sidebar