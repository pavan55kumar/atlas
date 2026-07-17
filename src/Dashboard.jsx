import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
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
import StudyPlanner from './StudyPlanner'
import AIChat from './AIChat'
import SearchModal from './SearchModal'
import Settings from './Settings'
import About from './About'
import PrivacyPolicy from './PrivacyPolicy'
import Terms from './Terms'
import Licenses from './Licenses'
import Changelog from './Changelog'

const pathToTitle = {
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/goals': 'Goals',
  '/calendar': 'Calendar',
  '/notes': 'Notes',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/about': 'About Atlas',
  '/ai': 'AI Assistant',
  '/focus': 'Focus Mode',
  '/schedule-ai': 'AI Schedule',
  '/expenses': 'Expenses',
  '/subjects': 'Subjects',
  '/attendance': 'Attendance',
  '/assignments': 'Assignments',
  '/cgpa': 'CGPA Planner',
  '/study-planner': 'Study Planner',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms & Conditions',
  '/licenses': 'Open Source Licenses',
  '/changelog': "What's New"
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()

  // Helper to allow child components to navigate seamlessly 
  // (handles both '/tasks' and 'tasks' formats)
  const handleNavigate = (path) => {
    const target = path.startsWith('/') ? path : `/${path}`
    navigate(target)
    setMobileNavOpen(false)
    setSearchOpen(false)
  }

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Capacitor Native Android Back Button Handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let listener
    App.addListener('backButton', () => {
      if (searchOpen) {
        setSearchOpen(false)
        return
      }

      if (mobileNavOpen) {
        setMobileNavOpen(false)
        return
      }

      // Check if there's a previous page in React Router history
      const canGoBack = window.history.state && window.history.state.idx > 0
      
      if (canGoBack) {
        navigate(-1)
      } else if (location.pathname !== '/') {
        navigate('/')
      } else {
        App.exitApp()
      }
    }).then(l => {
      listener = l
    })

    return () => {
      listener?.remove()
    }
  }, [searchOpen, mobileNavOpen, location.pathname, navigate])

  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const isOverview = location.pathname === '/'
  const currentTitle = isOverview ? `${greeting}, ${displayName}` : (pathToTitle[location.pathname] || 'Atlas')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activePath={location.pathname}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div style={{ flex: 1, maxWidth: '1040px', minWidth: 0 }}>
        <div style={headerWrap}>
          <div className="dash-header-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileNavOpen(true)}
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
                  {currentTitle}
                </motion.h1>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(true)} style={iconButton}>
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
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Overview userId={user.id} onNavigate={handleNavigate} />} />
                <Route path="/tasks" element={<PageCard><Tasks userId={user.id} /></PageCard>} />
                <Route path="/habits" element={<PageCard><Habits userId={user.id} /></PageCard>} />
                <Route path="/goals" element={<PageCard><Goals userId={user.id} /></PageCard>} />
                <Route path="/notes" element={<PageCard><Notes userId={user.id} /></PageCard>} />
                <Route path="/calendar" element={<PageCard><CalendarWidget userId={user.id} /></PageCard>} />
                <Route path="/analytics" element={<PageCard><Analytics userId={user.id} /></PageCard>} />
                <Route path="/focus" element={<PageCard><FocusMode /></PageCard>} />
                <Route path="/schedule-ai" element={<PageCard><AISchedule /></PageCard>} />
                <Route path="/expenses" element={<PageCard><Expenses userId={user.id} /></PageCard>} />
                <Route path="/subjects" element={<PageCard><Subjects userId={user.id} /></PageCard>} />
                <Route path="/attendance" element={<PageCard><AttendanceTracker userId={user.id} /></PageCard>} />
                <Route path="/assignments" element={<PageCard><AssignmentManager userId={user.id} /></PageCard>} />
                <Route path="/cgpa" element={<PageCard><CGPAPlanner userId={user.id} /></PageCard>} />
                <Route path="/study-planner" element={<PageCard><StudyPlanner userId={user.id} /></PageCard>} />
                <Route path="/ai" element={<PageCard><AIChat userId={user.id} /></PageCard>} />
                <Route path="/settings" element={<PageCard><Settings user={user} theme={theme} onToggleTheme={onToggleTheme} /></PageCard>} />
                <Route path="/about" element={<PageCard><About onNavigate={handleNavigate} /></PageCard>} />
                <Route path="/privacy" element={<PageCard><PrivacyPolicy /></PageCard>} />
                <Route path="/terms" element={<PageCard><Terms /></PageCard>} />
                <Route path="/licenses" element={<PageCard><Licenses /></PageCard>} />
                <Route path="/changelog" element={<PageCard><Changelog /></PageCard>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>

        {searchOpen && (
          <SearchModal userId={user.id} onNavigate={handleNavigate} onClose={() => setSearchOpen(false)} />
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