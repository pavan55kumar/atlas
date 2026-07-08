import { useState } from 'react'
import { Sun, Moon, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import Overview from './Overview'
import Tasks from './Tasks'
import Habits from './Habits'
import CalendarWidget from './Calendar'
import Goals from './Goals'
import Notes from './Notes'
import Analytics from './Analytics'
import { useEffect } from 'react'
import { Search } from 'lucide-react'
import SearchModal from './SearchModal'
import FocusMode from './FocusMode'
import AIChat from './AIChat'
import AISchedule from './AISchedule'
import Expenses from './Expenses'

const titles = {
  tasks: 'Tasks', habits: 'Habits', goals: 'Goals', calendar: 'Calendar',
  ai: 'AI Assistant', analytics: 'Analytics', settings: 'Settings' ,notes: 'Notes'
}

function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [page, setPage] = useState('overview')
  const [searchOpen, setSearchOpen] = useState(false)
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
  const displayName = user.email.split('@')[0].split('.')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar page={page} onNavigate={setPage} />

      <div style={{ flex: 1, maxWidth: '1040px' }}>
        <div style={headerWrap}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '40px 48px 28px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{greeting} 👋</p>
              {page === 'overview' ? (
                <>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>Welcome back, {displayName}</h1>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{dateStr}</p>
                </>
              ) : (
                <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em' }}>{titles[page]}</h1>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
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

        <div style={{ padding: '0 48px 48px' }}>
          {page === 'overview' && <Overview userId={user.id} onNavigate={setPage} />}
          {page === 'tasks' && <PageCard><Tasks userId={user.id} /></PageCard>}
          {page === 'habits' && <PageCard><Habits userId={user.id} /></PageCard>}
          {page === 'goals' && <PageCard><Goals userId={user.id} /></PageCard>}
           {page === 'notes' && <PageCard><Notes userId={user.id} /></PageCard>}
          {page === 'calendar' && <PageCard><CalendarWidget userId={user.id} /></PageCard>}
          {page === 'analytics' && <PageCard><Analytics userId={user.id} /></PageCard>}
          {page === 'focus' && <PageCard><FocusMode /></PageCard>}
{page === 'ai' && <PageCard><AIChat userId={user.id} /></PageCard>}
{page === 'schedule-ai' && <PageCard><AISchedule /></PageCard>}
{page === 'expenses' && <PageCard><Expenses userId={user.id} /></PageCard>}
{page === 'settings' && (
  <PageCard>
    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Coming soon.</p>
  </PageCard>
)}
        </div>
        {searchOpen && (
      <SearchModal userId={user.id} onNavigate={setPage} onClose={() => setSearchOpen(false)} />
    )}
      </div>
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

export default Dashboard