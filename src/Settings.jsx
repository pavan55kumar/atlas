import { useState } from 'react'
import { Sun, Moon, Download, Lock, Check, Eye, EyeOff } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

function Settings({ user, theme, onToggleTheme }) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const initial = (user.email || '?').charAt(0).toUpperCase()

  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('Must be at least 6 characters.')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('Password updated.')
      setNewPassword('')
    }
  }

  async function exportData() {
    setExporting(true)
    const tables = ['tasks', 'habits', 'goals', 'notes', 'calendar_events', 'expenses', 'subjects', 'attendance', 'assignments']
    const result = {}

    for (const table of tables) {
      const { data } = await supabase.from(table).select('*')
      result[table] = data || []
    }

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'atlas-data-export.json'
    a.click()
    URL.revokeObjectURL(url)

    setExporting(false)
    setExported(true)
    setTimeout(function () { setExported(false) }, 2500)
  }

  return (
    <div style={{ maxWidth: '520px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, flexShrink: 0
        }}>
          {initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>Atlas account</p>
        </div>
      </div>

      <Row
        label="Appearance"
        description={'Currently using ' + (theme === 'dark' ? 'dark' : 'light') + ' mode'}
      >
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </Row>

      <div style={{ padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Lock size={15} color="var(--text-muted)" />
          <p style={{ fontSize: '13.5px', fontWeight: 600 }}>Password</p>
        </div>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>Update your account password</p>

        <form onSubmit={updatePassword} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={function (e) { setNewPassword(e.target.value) }}
              placeholder="New password"
              style={{ ...inputStyle, width: '100%', paddingRight: '38px' }}
            />
            <span
              onClick={function () { setShowPassword(!showPassword) }}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </span>
          </div>
          <button type="submit" disabled={savingPassword} style={primaryButton}>
            {savingPassword ? '...' : 'Update'}
          </button>
        </form>
        {passwordMsg && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{passwordMsg}</p>}
      </div>

      <Row
        label="Export your data"
        description="Download everything Atlas stores for you as a JSON file"
      >
        <button
          onClick={exportData}
          disabled={exporting}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--border)',
            background: exported ? 'var(--accent)' : 'var(--surface-2)',
            color: exported ? '#fff' : 'var(--text)',
            fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap'
          }}
        >
          {exported ? <Check size={14} /> : <Download size={14} />}
          {exporting ? 'Preparing...' : exported ? 'Downloaded' : 'Export'}
        </button>
      </Row>
    </div>
  )
}

function Row({ label, description, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '16px', padding: '18px 0', borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{description}</p>
      </div>
      {children}
    </div>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative', width: '52px', height: '28px', borderRadius: '999px',
        border: '1px solid var(--border)', background: isDark ? 'var(--accent)' : 'var(--surface-2)',
        flexShrink: 0, cursor: 'pointer'
      }}
    >
      <div style={{
        position: 'absolute', top: '2px', left: isDark ? '26px' : '2px',
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {isDark ? <Moon size={12} color="var(--accent)" /> : <Sun size={12} color="#F0876C" />}
      </div>
    </button>
  )
}

export default Settings