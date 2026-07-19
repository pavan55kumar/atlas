import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
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

// --- Navigation Hierarchy Helpers ---
const INFO_CHILD_PAGES = ['/privacy', '/terms', '/changelog', '/licenses'];

const getInfoLevel = (path) => {
  if (path === '/') return 0;
  if (path === '/about') return 1;
  if (INFO_CHILD_PAGES.includes(path)) return 2;
  return 1; // Normal pages are treated as Level 1 to preserve flattening to Overview
};

const getBackTarget = (path) => {
  if (path === '/') return null; 
  if (path === '/about') return '/';
  if (INFO_CHILD_PAGES.includes(path)) return '/about';
  return '/'; // Normal pages go back to Overview
};

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  
  const location = useLocation()
  const navigate = useNavigate()

  // Refs to manage history and prevent race conditions/double events
  const hasModalHistory = useRef(false)
  const pendingNavigation = useRef(null)

  // Helper to allow child components to navigate seamlessly 
  // Builds the history stack correctly to support the back hierarchy
  const handleNavigate = (path) => {
    let target = path.startsWith('/') ? path : `/${path}`
    
    // Ensure Overview navigation always targets the root path '/' 
    if (target === '/overview' || target === 'overview') {
      target = '/'
    }

    // If a modal is open on Web, we must close it and pop its dummy history state
    // before performing the actual navigation to avoid history corruption.
    if (!Capacitor.isNativePlatform() && (searchOpen || mobileNavOpen)) {
      if (hasModalHistory.current) {
        if (!pendingNavigation.current) {
          pendingNavigation.current = target
          hasModalHistory.current = false
          window.history.back()
        } else {
          pendingNavigation.current = target
        }
        return
      }
    }

    const currentLevel = getInfoLevel(location.pathname)
    const targetLevel = getInfoLevel(target)
    const isTargetOverview = target === '/'

    // If navigating to Overview, replace to keep it as the root
    if (isTargetOverview) {
      navigate(target, { replace: true })
    } 
    // If stepping DOWN the info hierarchy (e.g., Overview -> About, About -> Privacy), push
    else if (targetLevel > currentLevel) {
      navigate(target)
    }
    // For all other cases (e.g., normal page to normal page, about to normal page), 
    // preserve the flatten behavior (replace) so back goes to Overview.
    else {
      navigate(target, { replace: true })
    }
    
    setMobileNavOpen(false)
    setSearchOpen(false)
  }

  const closeSearch = () => {
    if (!searchOpen) return
    if (Capacitor.isNativePlatform()) {
      setSearchOpen(false)
    } else if (mobileNavOpen) {
      setSearchOpen(false)
    } else if (hasModalHistory.current) {
      hasModalHistory.current = false
      window.history.back()
    } else {
      setSearchOpen(false)
    }
  }

  const closeMobileNav = () => {
    if (!mobileNavOpen) return
    if (Capacitor.isNativePlatform()) {
      setMobileNavOpen(false)
    } else if (searchOpen) {
      setMobileNavOpen(false)
    } else if (hasModalHistory.current) {
      hasModalHistory.current = false
      window.history.back()
    } else {
      setMobileNavOpen(false)
    }
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

  // Web Browser & PWA: Push dummy history state when modal opens
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return

    if ((searchOpen || mobileNavOpen) && !hasModalHistory.current) {
      window.history.pushState({ isModal: true }, '')
      hasModalHistory.current = true
    }
  }, [searchOpen, mobileNavOpen])

  // Web Browser & PWA: Listen for popstate to close modals gracefully
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return

    const handlePopState = () => {
      if (pendingNavigation.current) {
        const target = pendingNavigation.current
        pendingNavigation.current = null
        
        const currentLevel = getInfoLevel(location.pathname)
        const targetLevel = getInfoLevel(target)
        const isTargetOverview = target === '/'

        if (isTargetOverview) {
          navigate(target, { replace: true })
        } else if (targetLevel > currentLevel) {
          navigate(target)
        } else {
          navigate(target, { replace: true })
        }
        
        setSearchOpen(false)
        setMobileNavOpen(false)
        hasModalHistory.current = false
      } else if (searchOpen) {
        setSearchOpen(false)
        hasModalHistory.current = false
      } else if (mobileNavOpen) {
        setMobileNavOpen(false)
        hasModalHistory.current = false
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [searchOpen, mobileNavOpen, location.pathname, navigate])

  // Capacitor Native Android Back Button Handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let active = true
    let listener

    App.addListener('backButton', () => {
      if (!active) return
      
      if (searchOpen) {
        setSearchOpen(false)
        return
      }
      if (mobileNavOpen) {
        setMobileNavOpen(false)
        return
      }

      // Check React Router's internal history stack
      const historyCanGoBack = window.history.state && window.history.state.idx > 0
      
      if (historyCanGoBack) {
        navigate(-1)
      } else {
        // If no history, use the hierarchy to determine back target
        const backTarget = getBackTarget(location.pathname)
        if (backTarget) {
          navigate(backTarget, { replace: true })
        } else {
          // On Overview with no history, exit the app
          App.exitApp()
        }
      }
    }).then(l => {
      if (active) {
        listener = l
      } else {
        l.remove()
      }
    })

    return () => {
      active = false
      listener?.remove()
    }
  }, [searchOpen, mobileNavOpen, location.pathname, navigate])

  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const isOverview = location.pathname === '/' || location.pathname === '/overview'
  const currentTitle = isOverview ? `${greeting}, ${displayName}` : (pathToTitle[location.pathname] || 'Atlas')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activePath={location.pathname}
        onNavigate={handleNavigate}
        mobileOpen={mobileNavOpen}
        onCloseMobile={closeMobileNav}
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
                {/* Safely redirect any accidental direct routes to /overview back to / */}
                <Route path="/overview" element={<Navigate to="/" replace />} />
                
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
          <SearchModal userId={user.id} onNavigate={handleNavigate} onClose={closeSearch} />
        )}
      </div>

      <style>{`
        .mobile-menu-btn { display: none; }
        .dash-header-pad { padding: 44px 48px 32px; }
        .dash-content-pad { padding: 0 48px 48px; }
        .dash-header-title { font-size: 34px; font-family: 'Space Grotesk', 'Inter', sans-serif; }
        @media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex !important;
  }

  .dash-header-pad {
    padding-top: calc(20px + env(safe-area-inset-top, 0px));
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 16px;
  }

  .dash-content-pad {
    padding: 0 16px 32px;
  }

  .dash-header-title {
    font-size: 24px;
  }
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