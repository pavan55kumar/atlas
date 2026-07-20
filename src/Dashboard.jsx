import { useState, useEffect, useRef } from 'react'
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

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // --- Refs that mirror the latest state for the native back listener ---
  // The Capacitor backButton listener is registered ONCE (see useEffect below),
  // so it must read the latest values via refs to avoid stale closures.
  const pathnameRef = useRef(location.pathname)
  const searchOpenRef = useRef(searchOpen)
  const mobileNavOpenRef = useRef(mobileNavOpen)

  useEffect(() => { pathnameRef.current = location.pathname }, [location.pathname])
  useEffect(() => { searchOpenRef.current = searchOpen }, [searchOpen])
  useEffect(() => { mobileNavOpenRef.current = mobileNavOpen }, [mobileNavOpen])

  // --- Web/PWA modal-history refs (unchanged behavior) ---
  const hasModalHistory = useRef(false)
  const pendingNavigation = useRef(null)

  // Unified navigation handler used by Sidebar, Overview, About, Search, etc.
  // - Native Android: deterministic. We still pick push vs replace to keep the
  //   WebView history tidy, but the hardware back button is fully resolved by
  //   the Capacitor listener using getBackTarget().
  // - Web/PWA: same level rules, PLUS the modal-history dance so opening a
  //   modal then navigating doesn't corrupt browser history.
  const handleNavigate = (path) => {
    let target = path.startsWith('/') ? path : `/${path}`

    // /overview is just an alias for the root.
    if (target === '/overview' || target === 'overview') {
      target = '/'
    }

    const isNative = Capacitor.isNativePlatform()

    // Web/PWA only: if a modal is currently open and has a dummy history entry,
    // pop that entry first, then perform the real navigation in the popstate
    // handler. This prevents history corruption on browser back.
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
      // Always replace when going to root so Overview is the single root entry.
      navigate(target, { replace: true })
    } else if (targetLevel > currentLevel) {
      // Stepping DOWN the hierarchy (Overview -> About, About -> Privacy, etc.)
      navigate(target)
    } else {
      // Same level or moving up/sideways: replace to preserve flatten-to-root
      // semantics so back from any normal page always lands on Overview.
      navigate(target, { replace: true })
    }

    setMobileNavOpen(false)
    setSearchOpen(false)
  }

  const closeSearch = () => {
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
  }

  const closeMobileNav = () => {
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

  // Web/PWA: push a dummy history state when a modal opens so browser back
  // closes the modal instead of leaving the page.
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return

    if ((searchOpen || mobileNavOpen) && !hasModalHistory.current) {
      window.history.pushState({ isModal: true }, '')
      hasModalHistory.current = true
    }
  }, [searchOpen, mobileNavOpen])

  // Web/PWA: popstate listener to close modals or finish pending navigation.
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
  // Registered EXACTLY ONCE on mount. Reads latest state from refs.
  // Never re-registered on route/state changes -> no accumulation,
  // no stale closures, no double events.
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    let active = true
    let listener

    const handleBack = () => {
      if (!active) return

      // Always read the LATEST values from refs.
      const currentPath = pathnameRef.current
      const search = searchOpenRef.current
      const mobileNav = mobileNavOpenRef.current

      // PRIORITY 1: Search modal open -> close it only.
      if (search) {
        setSearchOpen(false)
        return
      }

      // PRIORITY 2: Mobile sidebar/drawer open -> close it only.
      if (mobileNav) {
        setMobileNavOpen(false)
        return
      }

      // PRIORITY 3-6: Deterministic, pathname-based back resolution.
      // We deliberately do NOT use window.history.state.idx or navigate(-1),
      // because the Capacitor WebView history can contain unexpected entries.
      const backTarget = getBackTarget(currentPath)

      if (backTarget) {
        // Use replace so the back target becomes the new "current" entry
        // and repeated back presses remain predictable.
        navigate(backTarget, { replace: true })
      } else {
        // On Overview (root) -> exit the Android app.
        App.exitApp()
      }
    }

    App.addListener('backButton', handleBack).then((l) => {
      if (active) {
        listener = l
      } else {
        // Component already unmounted before the listener resolved.
        l.remove()
      }
    })

    return () => {
      active = false
      if (listener) listener.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // <-- empty deps: register once

  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const isOverview = location.pathname === '/' || location.pathname === '/overview'
  const currentTitle = isOverview ? `${greeting}, ${displayName}` : (pathToTitle[location.pathname] || 'Atlas')

  return (
    <>
      <AmbientBackground />

      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
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
                  {/* /overview is an alias for the root, never two entries. */}
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
                  {/* Info children receive onNavigate so their visible Back buttons
                      can explicitly return to /about instead of window.history.back(). */}
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
    </>
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