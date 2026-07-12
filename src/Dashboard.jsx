import { useState, useEffect } from 'react'
import { motion ,AnimatePresence  } from 'framer-motion'

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
import GradeScheme from './GradeScheme'
import StudyPlanner from './StudyPlanner'
import AIChat from './AIChat'
import SearchModal from './SearchModal'
import Settings from './Settings'


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
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '999px',
      border: '1px solid var(--border)', background: 'var(--surface-2)',
      marginBottom: '12px'
    }}
  >
    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
      {dateStr}
    </span>
  </motion.div>
  <motion.h1
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.08 }}
    className="dash-header-title"
    style={{ fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}
  >
    {page === 'overview' ? greeting + ', ' + displayName : titles[page]}
  </motion.h1>
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
  <AnimatePresence mode="wait">
    <motion.div
      key={page}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
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
      {page === 'study-planner' && <PageCard><StudyPlanner userId={user.id} /></PageCard>}
      {page === 'ai' && <PageCard><AIChat userId={user.id} /></PageCard>}
      {page === 'settings' && (
        <PageCard>
          <Settings user={user} theme={theme} onToggleTheme={onToggleTheme} />
        </PageCard>
      )}
    </motion.div>
  </AnimatePresence>
</div>

        {searchOpen && (
          <SearchModal userId={user.id} onNavigate={setPage} onClose={function () { setSearchOpen(false) }} />
        )}
      </div>

      <style>{`
        .mobile-menu-btn { display: none; }
.dash-header-pad { padding: 44px 48px 32px; }
.dash-content-pad { padding: 0 48px 48px; }
.dash-header-title { font-size: 34px; font-family: 'Space Grotesk', 'Inter', sans-serif; }
@media (max-width: 768px) {
  .mobile-menu-btn { display: flex !important; }
  .dash-header-pad { padding: 20px 16px 16px; }
  .dash-content-pad { padding: 0 16px 32px; }
  .dash-header-title { font-size: 24px; }
}
      `}</style>
    </div>
  )
}

function PageCard({ children }) {
  return <div className="card" style={{ padding: '32px', borderRadius: '24px' }}>{children}</div>
}

const headerWrap = {
  backgroundImage: 'radial-gradient(circle at 15% 0%, rgba(108,108,240,0.06), transparent 55%)'
}

const iconButton = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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