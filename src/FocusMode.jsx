import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Flame, Clock } from 'lucide-react'

const PRESETS = [
  { label: 'Focus', minutes: 25 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 }
]

const QUOTES = [
  'Small steps, done daily, win.',
  'Deep work is a superpower.',
  'One focused hour beats five distracted ones.',
  'Protect this time — it protects your goals.',
  'Progress, not perfection.'
]

function FocusMode() {
  const [mode, setMode] = useState(PRESETS[0])
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60)
  const [running, setRunning] = useState(false)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [justCompleted, setJustCompleted] = useState(false)
  const intervalRef = useRef(null)
  const quoteRef = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)])

  useEffect(function () {
    if (running) {
      intervalRef.current = setInterval(function () {
        setSecondsLeft(function (prev) {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode.label === 'Focus') {
              setSessionsToday(function (s) { return s + 1 })
              setJustCompleted(true)
              setTimeout(function () { setJustCompleted(false) }, 1800)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return function () { clearInterval(intervalRef.current) }
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

  const finishTime = (function () {
    const d = new Date()
    d.setSeconds(d.getSeconds() + secondsLeft)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  })()

  const modeAccent = mode.label === 'Focus' ? '#7C5CFF' : mode.label === 'Short Break' ? '#34D399' : '#6CC7F0'

  return (
    <div className="focus-page">
      <div className="focus-aurora" style={{ background: modeAccent }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="focus-content"
      >
        <div className="focus-switcher">
          {PRESETS.map(function (p) {
            const active = mode.label === p.label
            return (
              <button
                key={p.label}
                onClick={function () { selectMode(p) }}
                className="focus-switch-btn"
                style={{ color: active ? '#fff' : 'var(--text-muted)' }}
              >
                {active && (
                  <motion.div
                    layoutId="focus-switch-indicator"
                    className="focus-switch-indicator"
                    style={{ background: modeAccent }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>{p.label}</span>
              </button>
            )
          })}
        </div>

        <motion.div
          className="focus-timer-wrap"
          animate={running ? { scale: [1, 1.012, 1] } : { scale: 1 }}
          transition={running ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          <div className="focus-ring-glow" style={{ background: modeAccent, opacity: running ? 0.35 : 0.18 }} />

          <svg width="280" height="280" viewBox="0 0 280 280" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r="126" fill="none" stroke="var(--border)" strokeWidth="3" opacity="0.5" />
            <circle cx="140" cy="140" r="126" fill="none" stroke={modeAccent} strokeWidth="3" opacity="0.15" strokeDasharray="1 7" />
            <circle
              cx="140" cy="140" r="118" fill="none"
              stroke={modeAccent} strokeWidth="7"
              strokeDasharray={2 * Math.PI * 118}
              strokeDashoffset={2 * Math.PI * 118 * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease', filter: 'drop-shadow(0 0 8px ' + modeAccent + ')' }}
            />
          </svg>

          <div className="focus-timer-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={mins + ':' + secs}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="focus-time-text"
              >
                {mins}:{secs}
              </motion.span>
            </AnimatePresence>
            <span className="focus-mode-label" style={{ color: modeAccent }}>{mode.label}</span>
            <span className="focus-quote">{quoteRef.current}</span>
          </div>

          <AnimatePresence>
            {justCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="focus-celebrate"
                style={{ boxShadow: '0 0 60px ' + modeAccent }}
              >
                Session complete ✨
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="focus-controls">
          <motion.button
            onClick={function () { setRunning(function (r) { return !r }) }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="focus-primary-btn"
            style={{ background: 'linear-gradient(135deg, ' + modeAccent + ', var(--accent-hover))' }}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'Pause' : 'Start'}
          </motion.button>
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="focus-ghost-btn"
          >
            <RotateCcw size={15} />
            Reset
          </motion.button>
        </div>

        <div className="focus-stats-row">
          <div className="focus-stat">
            <Flame size={14} color={modeAccent} />
            <span>{sessionsToday} session{sessionsToday !== 1 ? 's' : ''} today</span>
          </div>
          {running && (
            <div className="focus-stat">
              <Clock size={14} color={modeAccent} />
              <span>Finishes at {finishTime}</span>
            </div>
          )}
        </div>
      </motion.div>

      <style>{`
        .focus-page {
          position: relative; display: flex; align-items: center; justify-content: center;
          min-height: 480px; overflow: hidden; border-radius: 24px;
        }
        .focus-aurora {
          position: absolute; top: -30%; left: 50%; transform: translateX(-50%);
          width: 480px; height: 480px; border-radius: 50%; filter: blur(90px);
          opacity: 0.12; pointer-events: none; transition: background 0.5s ease;
        }
        .focus-content {
          position: relative; z-index: 1; display: flex; flex-direction: column;
          align-items: center; padding: 20px 0;
        }
        .focus-switcher {
          display: flex; gap: 4px; padding: 4px; border-radius: 999px;
          background: var(--surface-2); border: 1px solid var(--border); margin-bottom: 36px;
        }
        .focus-switch-btn {
          position: relative; padding: 8px 18px; border-radius: 999px; border: none;
          background: transparent; font-size: 12.5px; font-weight: 600; overflow: hidden;
        }
        .focus-switch-indicator { position: absolute; inset: 0; border-radius: 999px; z-index: 0; }

        .focus-timer-wrap { position: relative; width: 280px; height: 280px; margin-bottom: 36px; }
        .focus-ring-glow {
          position: absolute; inset: 20px; border-radius: 50%; filter: blur(40px);
          transition: opacity 0.4s ease, background 0.5s ease; pointer-events: none;
        }
        .focus-timer-center {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 6px; text-align: center; padding: 0 30px;
        }
        .focus-time-text { font-size: 52px; font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
        .focus-mode-label { font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .focus-quote { font-size: 11.5px; color: var(--text-muted); margin-top: 8px; max-width: 180px; line-height: 1.4; }
        .focus-celebrate {
          position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
          background: var(--surface); border: 1px solid var(--border); border-radius: 999px;
          padding: 8px 18px; font-size: 12px; font-weight: 600; white-space: nowrap;
        }

        .focus-controls { display: flex; gap: 10px; margin-bottom: 24px; }
        .focus-primary-btn {
          display: flex; align-items: center; gap: 7px; padding: 13px 28px; border-radius: 14px;
          border: none; color: #fff; font-size: 13.5px; font-weight: 600;
        }
        .focus-ghost-btn {
          display: flex; align-items: center; gap: 6px; padding: 13px 20px; border-radius: 14px;
          border: 1px solid var(--border); background: var(--surface-2); color: var(--text); font-size: 13px; font-weight: 500;
        }

        .focus-stats-row { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .focus-stat { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--text-muted); }

        @media (max-width: 480px) {
          .focus-timer-wrap { width: 230px; height: 230px; }
          .focus-time-text { font-size: 40px; }
        }
      `}</style>
    </div>
  )
}

export default FocusMode