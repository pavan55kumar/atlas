import { useState } from 'react'
import { Sun, Moon, Download, Lock, Mail } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton } from './styles'

function Settings({ user, theme, onToggleTheme }) {
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [exporting, setExporting] = useState(false)

  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg('Error: ' + error.message)
    } else {
      setPasswordMsg('Password updated successfully.')
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
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section title="Account" icon={<Mail size={15} />}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Signed in as</p>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>{user.email}</p>
      </Section>

      <Section title="Change Password" icon={<Lock size={15} />}>
        <form onSubmit={updatePassword} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="password"
            value={newPassword}
            onChange={function (e) { setNewPassword(e.target.value) }}
            placeholder="New password"
            style={{ ...inputStyle, flex: '1 1 200px' }}
          />
          <button type="submit" style={primaryButton}>Update</button>
        </form>
        {passwordMsg && <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '10px' }}>{passwordMsg}</p>}
      </Section>

      <Section title="Appearance" icon={theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Currently using {theme === 'dark' ? 'dark' : 'light'} mode
          </p>
          <button onClick={onToggleTheme} style={ghostButton}>
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </Section>

      <Section title="Your Data" icon={<Download size={15} />}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Download everything Atlas has stored for you as a JSON file.
        </p>
        <button onClick={exportData} disabled={exporting} style={ghostButton}>
          {exporting ? 'Preparing export...' : 'Export my data'}
        </button>
      </Section>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '14px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-muted)' }}>
        {icon}
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

export default Settings