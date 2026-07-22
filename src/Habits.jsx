import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import {
  Flame, Target, Brain, Zap, Award, Sparkles, TrendingUp, CircleCheck,
  CalendarDays, Rocket, Star, Heart, Apple, Coffee, BookOpen, Moon, Sun,
  Timer, Medal, MoreVertical, Trash2
} from 'lucide-react'
import { supabase } from './lib/supabase'
import ProgressRing from './ProgressRing'
import Sparkline from './Sparkline'
// NEW
import { scheduleHabitReminder, cancelHabitReminder } from './notifications'

const ICONS = [Flame, Target, Brain, Zap, Award, Sparkles, TrendingUp, CircleCheck, CalendarDays, Rocket, Star, Heart, Apple, Coffee, BookOpen, Moon, Sun, Timer, Medal]
const PALETTE = ['#7C5CFF', '#F0876C', '#6CC7F0', '#8CF06C', '#FDBA74', '#F87171', '#34D399', '#60A5FA']

function hashOf(input) {
  const str = String(input)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function badgeFor(streak) {
  if (streak >= 30) return { label: 'Master', icon: Medal }
  if (streak >= 14) return { label: 'Strong', icon: Rocket }
  if (streak >= 7) return { label: 'On Fire', icon: Flame }
  if (streak >= 3) return { label: 'Building', icon: Sparkles }
  return null
}

// ---------------------------------------------------------------------------
// Local calendar date helpers
// ---------------------------------------------------------------------------
function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateKey(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

function formatLastCompleted(dateStr, today) {
  if (!dateStr) return 'Never'
  if (dateStr === today) return 'Today'
  const yesterday = toDateKey(addDays(parseDateKey(today), -1))
  if (dateStr === yesterday) return 'Yesterday'
  return parseDateKey(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function CountUp({ value, style }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(function () {
    const controls = animate(prevRef.current, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: function (v) { setDisplay(Math.round(v)) }
    })
    prevRef.current = value
    return function () { controls.stop() }
  }, [value])

  return <span style={style}>{display}</span>
}

function Confetti() {
  const dots = Array.from({ length: 14 })
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {dots.map(function (_, i) {
        const angle = (i / dots.length) * Math.PI * 2
        const dist = 40 + Math.random() * 30
        const x = Math.cos(angle) * dist
        const y = Math.sin(angle) * dist
        const color = PALETTE[i % PALETTE.length]
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: x, y: y, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '6px', height: '6px', borderRadius: '2px',
              background: color
            }}
          />
        )
      })}
    </div>
  )
}

function Habits({ userId }) {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({})
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [celebrateId, setCelebrateId] = useState(null)
  const [isHoverable, setIsHoverable] = useState(false)

  const pendingCompletionsRef = useRef(new Set())
  const celebrateTimeoutRef = useRef(null)

  useEffect(function () { fetchHabits() }, [])

  useEffect(function () {
    setIsHoverable(window.matchMedia('(hover: hover)').matches)
  }, [])

  useEffect(function () {
    return function () {
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current)
    }
  }, [])

  useEffect(function () {
    if (!menuOpenId) return

    function handleOutside(e) {
      if (!e.target.closest('.habit-menu-btn') && !e.target.closest('.habit-menu')) {
        setMenuOpenId(null)
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setMenuOpenId(null)
    }

    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return function () {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpenId])

  async function fetchHabits() {
    const { data: habitsData, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setHabits(habitsData)

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('habit_id, completed_date')

    const map = {}
    ;(logsData || []).forEach(function (l) {
      if (!map[l.habit_id]) map[l.habit_id] = new Set()
      map[l.habit_id].add(l.completed_date)
    })
    setLogs(map)
    setLoading(false)
  }

  async function addHabit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name, user_id: userId, streak: 0 }])
      .select()
    if (!error && data && data[0]) {
      setHabits(function (prev) { return [data[0], ...prev] })
      setName('')
      // NEW: schedule the daily habit reminder now that we have the real DB id
      scheduleHabitReminder(data[0])
    }
  }

  async function markDoneToday(habit) {
    if (pendingCompletionsRef.current.has(habit.id)) return
    pendingCompletionsRef.current.add(habit.id)

    try {
      const today = toDateKey(new Date())

      if (habit.last_completed === today) return
      if (logs[habit.id] && logs[habit.id].has(today)) return

      const yesterday = toDateKey(addDays(new Date(), -1))

      let newStreak
      if (!habit.last_completed) {
        newStreak = 1
      } else if (habit.last_completed === yesterday) {
        newStreak = habit.streak + 1
      } else {
        newStreak = 1
      }

      const { error: updateError } = await supabase.from('habits')
        .update({ streak: newStreak, last_completed: today })
        .eq('id', habit.id)
      if (updateError) return

      const { error: logError } = await supabase.from('habit_logs')
        .insert([{ habit_id: habit.id, user_id: userId, completed_date: today }])
      if (logError) return

      setHabits(function (prev) {
        return prev.map(function (h) {
          return h.id === habit.id ? { ...h, streak: newStreak, last_completed: today } : h
        })
      })
      setLogs(function (prev) {
        const next = { ...prev }
        const set = new Set(next[habit.id] || [])
        set.add(today)
        next[habit.id] = set
        return next
      })

      setCelebrateId(habit.id)
      if (celebrateTimeoutRef.current) clearTimeout(celebrateTimeoutRef.current)
      celebrateTimeoutRef.current = setTimeout(function () {
        setCelebrateId(null)
        celebrateTimeoutRef.current = null
      }, 1100)
    } finally {
      pendingCompletionsRef.current.delete(habit.id)
    }
  }

  async function deleteHabit(id) {
    setMenuOpenId(null)
    await supabase.from('habits').delete().eq('id', id)
    await supabase.from('habit_logs').delete().eq('habit_id', id)
    // NEW: cancel the pending reminder for this habit
    cancelHabitReminder(id)
    setHabits(function (prev) { return prev.filter(function (h) { return h.id !== id } ) })
    setLogs(function (prev) {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const today = toDateKey(new Date())

  return (
    <div className="habits-page">
      <form onSubmit={addHabit} className="habits-add-form">
        <input
          value={name}
          onChange={function (e) { setName(e.target.value) }}
          placeholder="Add a habit..."
          className="habits-input"
        />
        <button type="submit" className="habits-add-btn">Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : habits.length === 0 ? (
        <div className="empty-state"><Flame size={28} /><span>No habits tracked yet</span></div>
      ) : (
        <motion.div
          className="habits-grid"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence>
            {habits.map(function (habit) {
              const doneToday = habit.last_completed === today
              const habitLogs = logs[habit.id] || new Set()
              const iconIndex = hashOf(habit.id) % ICONS.length
              const Icon = ICONS[iconIndex]
              const accent = PALETTE[iconIndex % PALETTE.length]

              let completedLast30 = 0
              const sparklineData = []
              for (let i = 29; i >= 0; i--) {
                const d = addDays(new Date(), -i)
                const key = toDateKey(d)
                const done = habitLogs.has(key)
                if (done) completedLast30++
                if (i < 7) sparklineData.push(done ? 1 : 0)
              }
              const completionPct = Math.round((completedLast30 / 30) * 100)
              const xp = habit.streak * 10
              const badge = badgeFor(habit.streak)
              const BadgeIcon = badge ? badge.icon : null

              return (
                <motion.div
                  key={habit.id}
                  layout
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={isHoverable ? { y: -6, rotate: -0.4 } : undefined}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="habit-card"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px var(--border)',
                    zIndex: menuOpenId === habit.id ? 5 : 0
                  }}
                >
                  <div className="habit-card-glow-clip">
                    <div className="habit-card-glow" style={{ background: accent }} />
                  </div>

                  <div className="habit-card-top">
                    <div className="habit-icon-chip" style={{ background: accent }}>
                      <Icon size={18} color="#fff" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p className="habit-name">{habit.name}</p>
                      <span className="habit-tag">Daily habit</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <button
                        className="habit-menu-btn"
                        onClick={function () { setMenuOpenId(menuOpenId === habit.id ? null : habit.id) }}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {menuOpenId === habit.id && (
                        <div className="habit-menu">
                          <button className="habit-menu-item" onClick={function () { deleteHabit(habit.id) }}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="habit-card-mid">
                    <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                      <ProgressRing value={completionPct} size={64} strokeWidth={5} color={accent} />
                      <div className="habit-ring-label">
                        <CountUp value={completionPct} style={{ fontSize: '13px', fontWeight: 700 }} />
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>%</span>
                      </div>
                      {celebrateId === habit.id && <Confetti />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="habit-stat-row">
                        <span className="habit-stat-label">Streak</span>
                        <span className="habit-stat-value">
                          <CountUp value={habit.streak} /> <Flame size={12} color={accent} style={{ verticalAlign: '-1px' }} />
                        </span>
                      </div>
                      <div className="habit-stat-row">
                        <span className="habit-stat-label">XP</span>
                        <span className="habit-stat-value"><CountUp value={xp} /></span>
                      </div>
                      <div className="habit-stat-row">
                        <span className="habit-stat-label">Last done</span>
                        <span className="habit-stat-value" style={{ fontSize: '11px' }}>{formatLastCompleted(habit.last_completed, today)}</span>
                      </div>
                    </div>

                    <Sparkline data={sparklineData} width={56} height={30} color={accent} />
                  </div>

                  {badge && (
                    <div className="habit-badge" style={{ borderColor: accent, color: accent }}>
                      <BadgeIcon size={11} />
                      {badge.label}
                    </div>
                  )}

                  <div className="habit-heatmap-wrap">
                    <Heatmap completedDates={habitLogs} accent={accent} />
                  </div>

                  <motion.button
                    onClick={function () { markDoneToday(habit) }}
                    whileTap={{ scale: 0.95 }}
                    disabled={doneToday}
                    className="habit-complete-btn"
                    style={{
                      background: doneToday ? 'var(--surface-2)' : accent,
                      color: doneToday ? 'var(--text-muted)' : '#fff',
                      cursor: doneToday ? 'default' : 'pointer'
                    }}
                  >
                    <CircleCheck size={14} />
                    {doneToday ? 'Completed today' : 'Mark done'}
                  </motion.button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <style>{`
        .habits-page { position: relative; }
        .habits-add-form { display: flex; gap: 8px; margin-bottom: 24px; }
        .habits-input {
          flex: 1; padding: 10px 12px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface-2);
          color: var(--text); font-size: 13px; outline: none;
        }
        .habits-add-btn {
          padding: 10px 18px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          color: #fff; font-size: 13px; font-weight: 600;
        }
        .habits-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }
        .habit-card {
          position: relative; background: var(--surface); border-radius: 26px;
          padding: 20px; backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .habit-card-glow-clip {
          position: absolute; inset: 0; border-radius: 26px;
          overflow: hidden; pointer-events: none; z-index: 0;
        }
        .habit-card-glow {
          position: absolute; top: -40px; right: -40px; width: 140px; height: 140px;
          border-radius: 50%; filter: blur(50px); opacity: 0.18; pointer-events: none;
        }
        .habit-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; position: relative; z-index: 2; }
        .habit-icon-chip {
          width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .habit-name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .habit-tag { font-size: 10.5px; color: var(--text-muted); }
        .habit-menu-btn {
          width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border);
          background: var(--surface-2); color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
        }
        .habit-menu {
          position: absolute; right: 0; top: 34px; background: var(--surface-2);
          border: 1px solid var(--border); border-radius: 10px; padding: 4px;
          z-index: 20; min-width: 110px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .habit-menu-item {
          display: flex; align-items: center; gap: 6px; width: 100%;
          padding: 8px 10px; border-radius: 7px; border: none; background: transparent;
          color: #F87171; font-size: 12.5px; text-align: left;
        }
        .habit-menu-item:hover { background: var(--surface); }
        .habit-card-mid { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; position: relative; z-index: 1; }
        .habit-ring-label {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; line-height: 1;
        }
        .habit-stat-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
        .habit-stat-label { color: var(--text-muted); }
        .habit-stat-value { font-weight: 600; }
        .habit-badge {
          display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600;
          border: 1px solid; padding: 3px 9px; border-radius: 999px; margin-bottom: 12px;
        }
        .habit-heatmap-wrap { margin-bottom: 14px; position: relative; z-index: 1; }
        .habit-complete-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; border-radius: 12px; border: none; font-size: 12.5px; font-weight: 600;
          position: relative; z-index: 1;
        }
      `}</style>
    </div>
  )
}

function Heatmap({ completedDates, accent }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const todayKey = toDateKey(today)

  const cells = []
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    const key = toDateKey(d)
    cells.push({
      date: key,
      done: completedDates.has(key),
      isFuture: key > todayKey
    })
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '2px' }}>
      {weeks.map(function (week, wi) {
        return (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {week.map(function (cell, ci) {
              if (!cell) {
                return <div key={ci} style={{ width: '9px', height: '9px' }} />
              }
              return (
                <div
                  key={ci}
                  title={cell.date}
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '2px',
                    background: cell.done ? accent : 'var(--border)',
                    opacity: cell.isFuture ? 0.15 : (cell.done ? 1 : 0.5)
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default Habits