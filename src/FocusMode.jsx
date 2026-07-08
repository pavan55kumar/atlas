import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { primaryButton, ghostButton } from './styles'

const PRESETS = [
  { label: 'Focus', minutes: 25 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 }
]

function FocusMode() {
  const [mode, setMode] = useState(PRESETS[0])
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode.label === 'Focus') setSessionsToday(s => s + 1)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  function selectMode(preset) {
    setMode(preset)
    setSecondsLeft(preset.minutes * 60)
    setRunning(false)
  }

  function reset() {
    setSecondsLeft(mode.minutes * 60)
    setRunning(false)
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const progress = 1 - secondsLeft / (mode.minutes * 60)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => selectMode(p)}
            style={mode.label === p.label ? primaryButton : ghostButton}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', width: '260px', height: '260px', marginBottom: '32px' }}>
        <svg width="260" height="260" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="130" cy="130" r="118" fill="none" stroke="var(--border)" strokeWidth="10" />
          <circle
            cx="130" cy="130" r="118" fill="none"
            stroke="var(--accent)" strokeWidth="10"
            strokeDasharray={2 * Math.PI * 118}
            strokeDashoffset={2 * Math.PI * 118 * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
        }}>
          <span style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {mins}:{secs}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {mode.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={() => setRunning(r => !r)}
          style={{ ...primaryButton, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {running ? <Pause size={15} /> : <Play size={15} />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} style={{ ...ghostButton, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RotateCcw size={15} />
          Reset
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        {sessionsToday} focus session{sessionsToday !== 1 ? 's' : ''} completed today
      </p>
    </div>
  )
}

export default FocusMode