import { useState } from 'react'
import { Home, CheckCircle2, Flame, Target, Calendar, Sparkles, BarChart3, Settings, FileText, Timer, ListOrdered,Wallet } from 'lucide-react'
const navItems = [
  { key: 'overview', label: 'Overview', icon: Home },
  { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
  { key: 'habits', label: 'Habits', icon: Flame },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'focus', label: 'Focus Mode', icon: Timer },
  { key: 'schedule-ai', label: 'AI Schedule', icon: ListOrdered },
  { key: 'ai', label: 'AI Assistant', icon: Sparkles },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'notes', label: 'Notes', icon: FileText },
  { key: 'expenses', label: 'Expenses', icon: Wallet },
]

function Sidebar({ page, onNavigate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        width: expanded ? '220px' : '72px',
        flexShrink: 0,
        background: 'transparent',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border)',
        padding: '24px 12px',
        minHeight: '100vh',
        transition: 'width 0.3s cubic-bezier(.22,1,.36,1)',
        overflow: 'hidden'
      }}
    >
      <p style={{
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        padding: '0 10px',
        marginBottom: '24px',
        whiteSpace: 'nowrap'
      }}>
        {expanded ? 'ATLAS' : 'A'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map(({ key, label, icon: Icon }) => {
          const active = page === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
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
              {expanded && label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar