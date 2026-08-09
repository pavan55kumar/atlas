import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Sun, Moon, LogOut, Search, Menu } from 'lucide-react'

import AmbientBackground from './AmbientBackground'
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
// Info children live UNDER About in the hierarchy.
const INFO_CHILD_PAGES = ['/privacy', '/terms', '/changelog', '/licenses']

// Level is used only to decide push vs replace when navigating forward.
//   0 -> Overview (root)
//   1 -> normal dashboard pages + About (flattened: back always -> Overview, except About's children)
//   2 -> Info children (back -> About)
const getInfoLevel = (path) => {
  if (path === '/' || path === '/overview') return 0
  if (path === '/about') return 1
  if (INFO_CHILD_PAGES.includes(path)) return 2
  return 1 // Normal dashboard pages are Level 1 (flatten to Overview on back)
}

// Deterministic back-target resolver for native Android back button.
// Returns the path to navigate to, or null if we are at the root (Overview)
// and should exit the app.
const getBackTarget = (path) => {
  if (path === '/' || path === '/overview') return null     // root -> exit
  if (INFO_CHILD_PAGES.includes(path)) return '/about'      // info child -> About
  if (path === '/about') return '/'                          // About -> Overview
  return '/'                                                 // any normal page -> Overview
}

// ---------------------------------------------------------------
// PERF: All of the styles/markup below are 100% static (no props/state
// dependency), so they are hoisted to module scope.
// ---------------------------------------------------------------

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

const rootFlexStyle = { display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }
const headerRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }
const headerLeftStyle = { display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }
const headerTitleWrapStyle = { minWidth: 0 }
const headerActionsStyle = { display: 'flex', gap: '8px', flexShrink: 0 }
const badgeStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  padding: '5px 12px', borderRadius: '999px',
  border: '1px solid var(--border)', background: 'var(--surface-2)',
  marginBottom: '12px'
}
const badgeDotStyle = { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }
const badgeTextStyle = { fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-muted)' }
const titleStyle = { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }

const dashboardStyles = `
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
`

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // --- Refs that mirror the latest state for the native back listener ---
  const pathnameRef = useRef(location.pathname)
  const searchOpenRef = useRef(searchOpen)
  const mobileNavOpenRef = useRef(mobileNavOpen)
  const logoutConfirmOpenRef = useRef(logoutConfirmOpen)

  useEffect(() => { pathnameRef.current = location.pathname }, [location.pathname])
  useEffect(() => { searchOpenRef.current = searchOpen }, [searchOpen])
  useEffect(() => { mobileNavOpenRef.current = mobileNavOpen }, [mobileNavOpen])
  useEffect(() => { logoutConfirmOpenRef.current = logoutConfirmOpen }, [logoutConfirmOpen])

  // --- Web/PWA modal-history refs ---
  const hasModalHistory = useRef(false)
  const pendingNavigation = useRef(null)

  const handleNavigate = useCallback((path) => {
    let target = path.startsWith('/') ? path : `/${path}`

    if (target === '/overview' || target === 'overview') {
      target = '/'
    }

    const isNative = Capacitor.isNativePlatform()

    if (!isNative && (searchOpen || mobileNavOpen) && hasModalHistory.current) {
      if (!pendingNavigation.current) {
        pendingNavigation.current = target
        hasModalHistory.current = false
        window.history.back()
      } else {
        pendingNavigation.current = target
      }
      return
    }

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

    setMobileNavOpen(false)
    setSearchOpen(false)
  }, [searchOpen, mobileNavOpen, location.pathname, navigate])

  const closeSearch = useCallback(() => {
    if (!searchOpen) return
    if (Capacitor.isNativePlatform()) {
      setSearchOpen(false)
      return
    }
    if (hasModalHistory.current) {
      hasModalHistory.current = false
      window.history.back()
    } else {
      setSearchOpen(false)
    }
  }, [searchOpen])

  const closeMobileNav = useCallback(() => {
    if (!mobileNavOpen) return
    if (Capacitor.isNativePlatform()) {
      setMobileNavOpen(false)
      return
    }
    if (hasModalHistory.current) {
      hasModalHistory.current = false
      window.history.back()
    } else {
      setMobileNavOpen(false)
    }
  }, [mobileNavOpen])

  // Cmd/Ctrl + K shortcut + Escape for Web modals
  useEffect(() => {
    function handleKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Close logout modal on Escape
      if (e.key === 'Escape' && logoutConfirmOpenRef.current) {
        setLogoutConfirmOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Web/PWA: push a dummy history state when a modal opens
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return

    if ((searchOpen || mobileNavOpen) && !hasModalHistory.current) {
      window.history.pushState({ isModal: true }, '')
      hasModalHistory.current = true
    }
  }, [searchOpen, mobileNavOpen])

  // Web/PWA: popstate listener
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

  // ---------------------------------------------------------------
  // Capacitor Native Android Back Button Handler
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let active = true
    let listener

    const handleBack = () => {
      if (!active) return

      const currentPath = pathnameRef.current
      const search = searchOpenRef.current
      const mobileNav = mobileNavOpenRef.current
      const logoutConfirm = logoutConfirmOpenRef.current

      // PRIORITY 1: Logout confirm open -> close it only.
      if (logoutConfirm) {
        setLogoutConfirmOpen(false)
        return
      }

      // PRIORITY 2: Search modal open -> close it only.
      if (search) {
        setSearchOpen(false)
        return
      }

      // PRIORITY 3: Mobile sidebar/drawer open -> close it only.
      if (mobileNav) {
        setMobileNavOpen(false)
        return
      }

      // PRIORITY 4-6: Deterministic, pathname-based back resolution.
      const backTarget = getBackTarget(currentPath)

      if (backTarget) {
        navigate(backTarget, { replace: true })
      } else {
        App.exitApp()
      }
    }

    App.addListener('backButton', handleBack).then((l) => {
      if (active) {
        listener = l
      } else {
        l.remove()
      }
    })

    return () => {
      active = false
      if (listener) listener.remove()
    }
  }, [])

  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const isOverview = location.pathname === '/' || location.pathname === '/overview'
  const currentTitle = isOverview ? `${greeting}, ${displayName}` : (pathToTitle[location.pathname] || 'Atlas')

  return (
    <>
      <AmbientBackground />

      <div style={rootFlexStyle}>
        <Sidebar
          page={
            location.pathname === '/' || location.pathname === '/overview'
              ? 'overview'
              : location.pathname.slice(1)
          }
          onNavigate={handleNavigate}
          mobileOpen={mobileNavOpen}
          onCloseMobile={closeMobileNav}
        />

        <div style={{ flex: 1, maxWidth: '1040px', minWidth: 0 }}>
          <div style={headerWrap}>
            <div className="dash-header-pad" style={headerRowStyle}>
              <div style={headerLeftStyle}>
                <button
                  className="mobile-menu-btn"
                  onClick={() => setMobileNavOpen(true)}
                  style={mobileMenuButtonStyle}
                >
                  <Menu size={16} />
                </button>
                <div style={headerTitleWrapStyle}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={badgeStyle}
                  >
                    <span style={badgeDotStyle} />
                    <span style={badgeTextStyle}>
                      {dateStr}
                    </span>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="dash-header-title"
                    style={titleStyle}
                  >
                    {currentTitle}
                  </motion.h1>
                </div>
              </div>

              <div style={headerActionsStyle}>
                <button onClick={() => setSearchOpen(true)} style={iconButton}>
                  <Search size={16} />
                </button>
                <button onClick={onToggleTheme} style={iconButton}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {/* Changed to open confirmation modal */}
                <button onClick={() => setLogoutConfirmOpen(true)} style={iconButton}>
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
                  <Route path="/privacy" element={<PageCard><PrivacyPolicy onNavigate={handleNavigate} /></PageCard>} />
                  <Route path="/terms" element={<PageCard><Terms onNavigate={handleNavigate} /></PageCard>} />
                  <Route path="/licenses" element={<PageCard><Licenses onNavigate={handleNavigate} /></PageCard>} />
                  <Route path="/changelog" element={<PageCard><Changelog onNavigate={handleNavigate} /></PageCard>} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>  

          {searchOpen && (
            <SearchModal userId={user.id} onNavigate={handleNavigate} onClose={closeSearch} />
          )}
        </div>

        <style>{dashboardStyles}</style>
      </div>

      {/* Premium Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutConfirmOpen && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-modal-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '28px',
                maxWidth: '360px',
                width: '100%',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
              }}
            >
              <h3 id="logout-modal-title" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                Log out of Atlas?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  autoFocus
                  onClick={() => setLogoutConfirmOpen(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setLogoutConfirmOpen(false)
                    onLogout()
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// PERF: memoized wrapper
const PageCard = memo(function PageCard({ children }) {
  return <div className="card" style={{ padding: '32px', borderRadius: '24px' }}>{children}</div>
})

export default Dashboard