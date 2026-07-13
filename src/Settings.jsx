import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Download, Lock, Check, Eye, EyeOff, User, Shield, KeyRound,
  Palette, Sparkles, BadgeCheck, Database, Settings2, SlidersHorizontal, Info
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

const ACCENTS = ['#7C5CFF', '#F0876C', '#6CC7F0', '#8CF06C', '#F87171', '#FDBA74']
const TABLES = ['tasks', 'habits', 'goals', 'notes', 'calendar_events', 'expenses', 'subjects', 'attendance', 'assignments']

function loadPref(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : JSON.parse(v)
  } catch (e) {
    return fallback
  }
}

function savePref(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch (e) { }
}

function passwordStrength(pw) {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

function Settings({ user, theme, onToggleTheme }) {
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)

  const [accent, setAccent] = useState(function () { return loadPref('atlas-accent', '#7C5CFF') })
  const [compact, setCompact] = useState(function () { return loadPref('atlas-compact', false) })
  const [glass, setGlass] = useState(function () { return loadPref('atlas-glass', false) })
  const [blur, setBlur] = useState(function () { return loadPref('atlas-blur', 12) })
  const [reducedMotion, setReducedMotion] = useState(function () { return loadPref('atlas-reduced-motion', false) })

  useEffect(function () {
    document.documentElement.style.setProperty('--accent', accent)
    savePref('atlas-accent', accent)
  }, [accent])

  useEffect(function () {
    document.documentElement.setAttribute('data-density', compact ? 'compact' : 'default')
    savePref('atlas-compact', compact)
  }, [compact])

  useEffect(function () {
    document.documentElement.setAttribute('data-glass', glass ? 'on' : 'off')
    document.documentElement.style.setProperty('--card-blur', blur + 'px')
    savePref('atlas-glass', glass)
    savePref('atlas-blur', blur)
  }, [glass, blur])

  useEffect(function () {
    document.documentElement.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false')
    savePref('atlas-reduced-motion', reducedMotion)
  }, [reducedMotion])

  const initial = (user.email || '?').charAt(0).toUpperCase()

  async function updatePassword(e) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordMsg('Must be at least 6 characters.')
      setPasswordSuccess(false)
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)
    if (error) {
      setPasswordMsg(error.message)
      setPasswordSuccess(false)
    } else {
      setPasswordMsg('Password updated successfully.')
      setPasswordSuccess(true)
      setNewPassword('')
      setTimeout(function () { setPasswordSuccess(false) }, 2200)
    }
  }

  async function exportData() {
    setExporting(true)
    const result = {}

    for (const table of TABLES) {
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

  const strength = passwordStrength(newPassword)
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['#F87171', '#F87171', '#FDBA74', '#8CF06C', '#34D399'][strength]

  return (
    <div className="set-page">
      {/* Account */}
      <SectionHeader icon={User} label="Account" delay={0} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} whileHover={{ y: -2 }} className="card set-account-card">
        <div className="set-account-glow" />
        <div className="set-avatar-wrap">
          <div className="set-avatar">{initial}</div>
          <span className="set-online-dot" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="set-email">{user.email}</p>
          <span className="set-member-chip"><BadgeCheck size={11} /> Atlas Member</span>
        </div>
      </motion.div>

      {/* Appearance */}
      <SectionHeader icon={Palette} label="Appearance" delay={0.05} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card set-row">
        <div>
          <p className="set-row-title">Theme</p>
          <p className="set-row-desc">Currently using {theme === 'dark' ? 'dark' : 'light'} mode</p>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </motion.div>

      {/* Security */}
      <SectionHeader icon={Shield} label="Security" delay={0.1} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card set-security-card">
        <div className="set-row-title-line">
          <KeyRound size={15} color="var(--text-muted)" />
          <p className="set-row-title">Password</p>
          <span className="set-badge"><Shield size={10} /> Protected</span>
        </div>
        <p className="set-row-desc" style={{ marginBottom: '12px' }}>Update your account password</p>

        <form onSubmit={updatePassword} style={{ display: 'flex', gap: '8px', marginBottom: newPassword ? '10px' : 0 }}>
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
          <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={savingPassword} style={primaryButton}>
            {savingPassword ? '...' : 'Update'}
          </motion.button>
        </form>

        {newPassword && (
          <div style={{ marginBottom: '8px' }}>
            <div className="set-strength-track">
              <motion.div className="set-strength-fill" style={{ background: strengthColor }} initial={{ width: 0 }} animate={{ width: (strength / 4) * 100 + '%' }} transition={{ duration: 0.3 }} />
            </div>
            <p style={{ fontSize: '11px', color: strengthColor, marginTop: '4px' }}>{strengthLabel}</p>
          </div>
        )}

        <AnimatePresence>
          {passwordMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: '12px', color: passwordSuccess ? '#34D399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {passwordSuccess && <Check size={12} />} {passwordMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Data & Privacy */}
      <SectionHeader icon={Database} label="Data & Privacy" delay={0.15} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="card set-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <p className="set-row-title">Export your data</p>
          <p className="set-row-desc">Download everything Atlas stores for you as a JSON file</p>
          <p className="set-row-desc" style={{ fontSize: '11px', marginTop: '4px' }}>
            Includes: {TABLES.join(', ')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={exportData}
          disabled={exporting}
          className="set-export-btn"
          style={{ background: exported ? '#34D399' : 'var(--surface-2)', color: exported ? '#fff' : 'var(--text)' }}
        >
          {exported ? <Check size={14} /> : <Download size={14} />}
          {exporting ? 'Preparing...' : exported ? 'Downloaded' : 'Export'}
        </motion.button>
      </motion.div>

      {/* Application (frontend-only) */}
      <SectionHeader icon={SlidersHorizontal} label="Application" delay={0.2} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="card set-app-card">
        <p className="set-row-title" style={{ marginBottom: '10px' }}>Accent color</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          {ACCENTS.map(function (c) {
            return (
              <button
                key={c}
                onClick={function () { setAccent(c) }}
                className="set-swatch"
                style={{ background: c, outline: accent === c ? '2px solid #fff' : 'none', outlineOffset: '2px' }}
              />
            )
          })}
        </div>

        <ToggleRow label="Compact mode" desc="Tighter spacing across cards" checked={compact} onChange={setCompact} />
        <ToggleRow label="Glass effect" desc="Frosted blur behind cards" checked={glass} onChange={setGlass} />
        {glass && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>Blur intensity</p>
            <input type="range" min="0" max="24" value={blur} onChange={function (e) { setBlur(Number(e.target.value)) }} style={{ width: '100%' }} />
          </div>
        )}
        <ToggleRow label="Reduced motion" desc="Reduces some CSS animations (glow, shimmer)" checked={reducedMotion} onChange={setReducedMotion} last />
      </motion.div>

      {/* About */}
      <SectionHeader icon={Info} label="About Atlas" delay={0.25} />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="card set-about-card">
        <motion.div
          className="set-about-logo"
          animate={{ rotate: [0, 3, 0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={18} color="#fff" />
        </motion.div>
        <div>
          <p className="set-row-title">Atlas</p>
          <p className="set-row-desc">Your personal life operating system</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Version 1.0.0 · Running smoothly</p>
        </div>
      </motion.div>

      <style>{`
        .set-page { display: flex; flex-direction: column; gap: 8px; max-width: 620px; }

        .set-section-header { display: flex; align-items: center; gap: 8px; margin: 20px 0 10px; }
        .set-section-header:first-child { margin-top: 0; }
        .set-section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--text-muted); text-transform: uppercase; }

        .set-account-card { position: relative; overflow: hidden; display: flex; align-items: center; gap: 16px; padding: 22px; }
        .set-account-glow {
          position: absolute; top: -50%; right: -20%; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(124,92,255,0.2), transparent 65%); pointer-events: none;
        }
        .set-avatar-wrap { position: relative; flex-shrink: 0; }
        .set-avatar {
          width: 54px; height: 54px; border-radius: 50%; color: #fff;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700;
        }
        .set-online-dot {
          position: absolute; bottom: 1px; right: 1px; width: 12px; height: 12px; border-radius: 50%;
          background: #34D399; border: 2px solid var(--surface); animation: set-blink 2s ease-in-out infinite;
        }
        @keyframes set-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .set-email { font-size: 14.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; position: relative; z-index: 1; }
        .set-member-chip {
          display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600;
          color: var(--accent); background: var(--surface-2); padding: 3px 9px; border-radius: 999px; margin-top: 6px;
        }

        .set-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; }
        .set-row-title { font-size: 13.5px; font-weight: 600; }
        .set-row-title-line { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .set-row-desc { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }

        .set-security-card { padding: 20px; }
        .set-badge {
          display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600;
          color: #34D399; background: rgba(52,211,153,0.12); padding: 2px 8px; border-radius: 999px; margin-left: auto;
        }
        .set-strength-track { width: 100%; height: 5px; background: var(--bg); border-radius: 4px; overflow: hidden; }
        .set-strength-fill { height: 100%; border-radius: 4px; }

        .set-export-btn {
          display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px;
          border: 1px solid var(--border); font-size: 13px; font-weight: 500; white-space: nowrap; flex-shrink: 0;
        }

        .set-app-card { padding: 20px; }
        .set-swatch { width: 28px; height: 28px; border-radius: 50%; border: none; cursor: pointer; }

        .set-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .set-toggle-row.last { border-bottom: none; }
        .set-toggle-label { font-size: 13px; font-weight: 500; }
        .set-toggle-desc { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

        .set-about-card { display: flex; align-items: center; gap: 14px; padding: 20px; }
        .set-about-logo {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          display: flex; align-items: center; justify-content: center;
        }
      `}</style>
    </div>
  )
}

function SectionHeader({ icon, label, delay }) {
  const Icon = icon
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: delay }} className="set-section-header">
      <Icon size={13} color="var(--text-muted)" />
      <span className="set-section-label">{label}</span>
    </motion.div>
  )
}

function ToggleRow({ label, desc, checked, onChange, last }) {
  return (
    <div className={last ? 'set-toggle-row last' : 'set-toggle-row'}>
      <div>
        <p className="set-toggle-label">{label}</p>
        <p className="set-toggle-desc">{desc}</p>
      </div>
      <MiniToggle checked={checked} onToggle={function () { onChange(!checked) }} />
    </div>
  )
}

function MiniToggle({ checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative', width: '40px', height: '22px', borderRadius: '999px',
        border: '1px solid var(--border)', background: checked ? 'var(--accent)' : 'var(--surface-2)', flexShrink: 0
      }}
    >
      <motion.div
        animate={{ left: checked ? '20px' : '2px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ position: 'absolute', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff' }}
      />
    </button>
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
      <motion.div
        animate={{ left: isDark ? '26px' : '2px' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute', top: '2px',
          width: '22px', height: '22px', borderRadius: '50%',
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isDark ? <Moon size={12} color="var(--accent)" /> : <Sun size={12} color="#F0876C" />}
      </motion.div>
    </button>
  )
}

export default Settings