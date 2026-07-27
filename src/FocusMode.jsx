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

// ---------------------------------------------------------------------------
// Module-level store — lives outside the component, so it survives
// FocusMode unmounting/remounting (which happens on every page navigation,
// since this app's router only keeps the active route's component mounted).
// It resets only if the JS process itself restarts (app fully killed/
// cleared from recents), which matches exactly what was asked: timers
// should survive switching presets and navigating around the app, but it's
// fine if a full app kill clears them.
//
// Each mode keeps its OWN remaining time independently. Only one mode can
// be "running" at a time (there's a single Play/Pause control in the UI),
// but switching which mode is displayed never resets or stops anything —
// it only changes what's shown.
// ---------------------------------------------------------------------------
const focusStore = {
  remainingByMode: {
    Focus: PRESETS[0].minutes * 60,
    'Short Break': PRESETS[1].minutes * 60,
    'Long Break': PRESETS[2].minutes * 60
  },
  activeModeLabel: PRESETS[0].label, // which preset is currently displayed
  runningModeLabel: null,            // which preset's timer is actually counting down, or null
  targetEndTime: null,               // Date.now() + remaining*1000 — wall-clock source of truth while running
  sessionsToday: 0
}

// If the running mode's countdown has actually elapsed (checked via real
// wall-clock time, not tick count), finalize it: zero it out, bump
// sessionsToday if it was a Focus session, and stop the "running" state.
// This is what makes completion correct even if it happened while the
// component was unmounted (e.g. the user was on a different page) — the
// elapsed time is computed from timestamps, not from ticks that would have
// simply stopped existing while unmounted.
function finalizeIfExpired() {
  const { runningModeLabel, targetEndTime } = focusStore
  if (!runningModeLabel || targetEndTime === null) return null
  if (Date.now() >= targetEndTime) {
    focusStore.remainingByMode[runningModeLabel] = 0
    const completedFocus = runningModeLabel === 'Focus'
    focusStore.runningModeLabel = null
    focusStore.targetEndTime = null
    if (completedFocus) focusStore.sessionsToday += 1
    return { completedFocus }
  }
  return null
}

// The seconds to display for a given mode: if it's the one actively
// running, compute live from the wall-clock target end time; otherwise
// return its last stored (paused) value.
function getDisplaySeconds(modeLabel) {
  if (focusStore.runningModeLabel === modeLabel && focusStore.targetEndTime !== null) {
    return Math.max(0, Math.round((focusStore.targetEndTime - Date.now()) / 1000))
  }
  return focusStore.remainingByMode[modeLabel]
}

function FocusMode() {
  const [displayedModeLabel, setDisplayedModeLabelState] = useState(focusStore.activeModeLabel)
  const [runningModeLabel, setRunningModeLabelState] = useState(focusStore.runningModeLabel)
  const [sessionsToday, setSessionsTodayState] = useState(focusStore.sessionsToday)
  const [justCompleted, setJustCompleted] = useState(false)
  // Forces a re-render every second while a timer is running, so the
  // wall-clock-derived display value stays live. The actual countdown math
  // never depends on this counter — it's purely a "please re-render" nudge.
  const [, setTick] = useState(0)

  const intervalRef = useRef(null)
  const celebrateTimeoutRef = useRef(null)
  const quoteRef = useRef(QUOTES[Math.floor(Math.random() * QUOTES.length)])

  const mode = PRESETS.find(function (p) { return p.label === displayedModeLabel }) || PRESETS[0]
  const running = runningModeLabel === displayedModeLabel
  const secondsLeft = getDisplaySeconds(displayedModeLabel)

  // On mount: silently catch up if the running timer actually finished
  // while this component was unmounted (e.g. the user was on the Tasks or
  // Calendar page). No celebration bubble here — that moment already
  // passed while they were away; celebration only fires for completions
  // witnessed live via the ticking interval below.
  useEffect(function () {
    const result = finalizeIfExpired()
    if (result) {
      setRunningModeLabelState(null)
      setSessionsTodayState(focusStore.sessionsToday)
    }
  }, [])

  useEffect(function () {
    return function () {
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current)
    }
  }, [])

  // Ticking effect — runs whenever ANY mode is actively running, regardless
  // of which mode is currently displayed. This is what makes a Long Break
  // timer keep counting down for real while you're looking at Short Break,
  // or have navigated to a completely different page in the app: the
  // interval just re-renders every second, and the actual remaining value
  // is always recomputed from the stored wall-clock target, so it's
  // self-correcting even after being throttled while backgrounded.
  useEffect(function () {
    if (!runningModeLabel) return

    intervalRef.current = setInterval(function () {
      const result = finalizeIfExpired()
      if (result) {
        setRunningModeLabelState(null)
        if (result.completedFocus) {
          setSessionsTodayState(focusStore.sessionsToday)
          setJustCompleted(true)
          celebrateTimeoutRef.current = setTimeout(function () { setJustCompleted(false) }, 1800)
        }
      }
      setTick(function (t) { return t + 1 })
    }, 1000)

    return function () { clearInterval(intervalRef.current) }
  }, [runningModeLabel])

  function selectMode(preset) {
    // CHANGED: switching the displayed preset no longer resets its stored
    // remaining time, and no longer stops whichever mode is actually
    // running — it only changes which mode's countdown/controls are shown.
    focusStore.activeModeLabel = preset.label
    setDisplayedModeLabelState(preset.label)
  }

  function toggleRunning() {
    if (running) {
      // Pause: freeze the currently displayed (and running) mode's
      // remaining time, computed from real elapsed wall-clock time.
      const remaining = getDisplaySeconds(displayedModeLabel)
      focusStore.remainingByMode[displayedModeLabel] = remaining
      focusStore.runningModeLabel = null
      focusStore.targetEndTime = null
      setRunningModeLabelState(null)
    } else {
      // Starting a different mode freezes whatever else was running at its
      // current wall-clock-computed remaining first — only one countdown
      // can be "active" at a time, matching the single Play/Pause control.
      if (focusStore.runningModeLabel && focusStore.runningModeLabel !== displayedModeLabel) {
        const prevRemaining = getDisplaySeconds(focusStore.runningModeLabel)
        focusStore.remainingByMode[focusStore.runningModeLabel] = prevRemaining
      }
      const startFrom = focusStore.remainingByMode[displayedModeLabel]
      focusStore.runningModeLabel = displayedModeLabel
      focusStore.targetEndTime = Date.now() + startFrom * 1000
      setRunningModeLabelState(displayedModeLabel)
    }
  }

  function reset() {
    // Reset only affects the currently displayed mode.
    focusStore.remainingByMode[displayedModeLabel] = mode.minutes * 60
    if (focusStore.runningModeLabel === displayedModeLabel) {
      focusStore.runningModeLabel = null
      focusStore.targetEndTime = null
      setRunningModeLabelState(null)
    }
    setTick(function (t) { return t + 1 })
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

          <svg
    width="100%"
    height="100%"
    viewBox="0 0 280 280"
    preserveAspectRatio="xMidYMid meet" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="140" cy="140" r="126" fill="none" stroke="var(--border)" strokeWidth="3" opacity="0.5" />
            <circle cx="140" cy="140" r="126" fill="none" stroke={modeAccent} strokeWidth="3" opacity="0.15" strokeDasharray="1 7" />
            <circle
              cx="140" cy="140" r="118" fill="none"
              stroke={modeAccent} strokeWidth="7"
              strokeDasharray={2 * Math.PI * 118}
              strokeDashoffset={2 * Math.PI * 118 * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset .85s cubic-bezier(.22,1,.36,1)', filter: 'drop-shadow(0 0 8px ' + modeAccent + ')' }}
            />
          </svg>

          <div className="focus-timer-center">
            <AnimatePresence mode="wait">
              <motion.span
  className="focus-time-text"
  animate={{
    scale: running ? [1, 1.01, 1] : 1
  }}
  transition={{
    duration: 1,
    ease: "easeInOut",
    repeat: running ? Infinity : 0
  }}
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
            onClick={toggleRunning}
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

        .focus-timer-wrap{
    position:relative;
    width:min(280px,85vw);
    aspect-ratio:1;
    margin:0 auto 36px;
    display:flex;
    justify-content:center;
    align-items:center;
}
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