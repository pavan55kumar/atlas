import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, Search, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import Overview from './Overview'
import Tasks from './Tasks'
import Habits from './Habits'
import CalendarWidget from './Calendar'
import Goals from './Goals'
import Notes from './Notes'
import Analytics from './Analytics'
import FocusMode from './FocusMode'
import AISchedule from './AISchedule'
import Expenses from './Expenses'
import Subjects from './Subjects'
import AttendanceTracker from './AttendanceTracker'
import AssignmentManager from './AssignmentManager'
import CGPAPlanner from './CGPAPlanner'
import GradePredictor from './GradePredictor'
import StudyPlanner from './StudyPlanner'
import AIChat from './AIChat'
import SearchModal from './SearchModal'
import Settings from './Settings'
import { color } from 'framer-motion'

const titles = {
  tasks: 'Tasks', habits: 'Habits', goals: 'Goals', calendar: 'Calendar',
  ai: 'AI Assistant', analytics: 'Analytics', settings: 'Settings', notes: 'Notes',
  focus: 'Focus Mode', 'schedule-ai': 'AI Schedule', expenses: 'Expenses',
  subjects: 'Subjects', attendance: 'Attendance', assignments: 'Assignments',
  cgpa: 'CGPA Planner', 'grade-predictor': 'Grade Predictor', 'study-planner': 'Study Planner'
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [page, setPage] = useState('overview')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(function () {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return function () { window.removeEventListener('keydown', handleKey) }
  }, [])

  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        page={page}
        onNavigate={setPage}
        mobileOpen={mobileNavOpen}
        onCloseMobile={function () { setMobileNavOpen(false) }}
      />

      <div style={{ flex: 1, maxWidth: '1040px', minWidth: 0 }}>
        <div style={headerWrap}>
          <div className="dash-header-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
              <button
                className="mobile-menu-btn"
                onClick={function () { setMobileNavOpen(true) }}
                style={mobileMenuButtonStyle}
              >
                <Menu size={16} />
              </button>
             <div style={{ minWidth: 0 }}>
 <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  }}
>

  <span
    style={{
      fontSize: 13,
      color: "var(--text-muted)",
      fontWeight: 500
    }}
  >
    {greeting}
  </span>

  <h1
    style={{
      fontSize: 54,
      fontWeight: 700,
      lineHeight: 1,
      letterSpacing: "-0.05em",
      margin: 0
    }}
  >
    {page === "overview"
      ? `Welcome back, ${displayName}`
      : titles[page]}
  </h1>

  <span
    style={{
      fontSize: 16,
      color: "var(--text-muted)"
    }}
  >
    {dateStr}
  </span>

</div>
</div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={function () { setSearchOpen(true) }} style={iconButton}>
                <Search size={16} />
              </button>
              <button onClick={onToggleTheme} style={iconButton}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={onLogout} style={iconButton}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="dash-content-pad">
          {page === 'overview' && <Overview userId={user.id} onNavigate={setPage} />}
          {page === 'tasks' && <PageCard><Tasks userId={user.id} /></PageCard>}
          {page === 'habits' && <PageCard><Habits userId={user.id} /></PageCard>}
          {page === 'goals' && <PageCard><Goals userId={user.id} /></PageCard>}
          {page === 'notes' && <PageCard><Notes userId={user.id} /></PageCard>}
          {page === 'calendar' && <PageCard><CalendarWidget userId={user.id} /></PageCard>}
          {page === 'analytics' && <PageCard><Analytics userId={user.id} /></PageCard>}
          {page === 'focus' && <PageCard><FocusMode /></PageCard>}
          {page === 'schedule-ai' && <PageCard><AISchedule /></PageCard>}
          {page === 'expenses' && <PageCard><Expenses userId={user.id} /></PageCard>}
          {page === 'subjects' && <PageCard><Subjects userId={user.id} /></PageCard>}
          {page === 'attendance' && <PageCard><AttendanceTracker userId={user.id} /></PageCard>}
          {page === 'assignments' && <PageCard><AssignmentManager userId={user.id} /></PageCard>}
          {page === 'cgpa' && <PageCard><CGPAPlanner userId={user.id} /></PageCard>}
          {page === 'grade-predictor' && <PageCard><GradePredictor /></PageCard>}
          {page === 'study-planner' && <PageCard><StudyPlanner userId={user.id} /></PageCard>}
          {page === 'ai' && <PageCard><AIChat userId={user.id} /></PageCard>}
          {page === 'settings' && (
  <PageCard>
    <Settings user={user} theme={theme} onToggleTheme={onToggleTheme} />
  </PageCard>
)}
        </div>

        {searchOpen && (
          <SearchModal userId={user.id} onNavigate={setPage} onClose={function () { setSearchOpen(false) }} />
        )}
      </div>

      <style>{`
        .mobile-menu-btn { display: none; }
        .dash-header-pad { padding: 40px 48px 28px; }
        .dash-content-pad { padding: 0 48px 48px; }
        .dash-header-title { font-size: 26px; }
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .dash-header-pad { padding: 20px 16px 16px; }
          .dash-content-pad { padding: 0 16px 32px; }
          .dash-header-title { font-size: 19px; }
        }
      `}</style>
    </div>
  )
}

function PageCard({ children }) {
  return <div className="card" style={{ padding: '32px', borderRadius: '24px' }}>{children}</div>
}

const headerWrap = {
  position: 'relative',
  overflow: 'visible',
  background: 'transparent',
  paddingBottom: '8px'
}

const iconButton = {
  width: 46,
  height: 46,
  borderRadius: 16,
 background: "rgb(255, 255, 255)",
  border: "1px solid rgba(255,255,255,.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
transition: ".25s"

}

const mobileMenuButtonStyle = {
  width: '34px',
  height: '34px',
  borderRadius: '9px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '2px'
}

export default Dashboard