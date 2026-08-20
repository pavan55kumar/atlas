import { lazy, Suspense, memo, useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Flame, Target, Calendar as CalIcon, PlusCircle,
  Brain, Sparkles, Clock3, ArrowRight
} from 'lucide-react'
import { supabase } from './lib/supabase'
import ProgressRing from './ProgressRing'
import Sparkline from './Sparkline'
import TiltCard from './TiltCard'
import { SkeletonKpiRow } from './Skeleton'
import './Overview.css'

// Lazy load AIBrief to prevent blocking the initial render of the Overview
const AIBrief = lazy(() => import('./AIBrief'))

// Memoize heavy visual components to prevent unnecessary re-renders
const MemoSparkline = memo(Sparkline)
const MemoProgressRing = memo(ProgressRing)
const MemoTiltCard = memo(TiltCard)

const ease = [0.22, 1, 0.36, 1]
const springTap = { type: 'spring', stiffness: 380, damping: 22 }
const fadeUp = function (delay) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: delay || 0, ease: ease }
  }
}

// PERF: The 4 fade-up configs used in render are always the same 4 delay
// values (0, 0.1, 0.2, 0.3). Hoisted to module scope so they're computed
// once instead of allocating 3 new objects per render.
const heroFade = fadeUp(0)
const kpiGridFade = fadeUp(0.1)
const twoColFade1 = fadeUp(0.2)
const twoColFade2 = fadeUp(0.3)

// PERF: Icons passed into memo()'d components as props. A fresh JSX element
// every render defeats React.memo's shallow prop comparison, so these are
// hoisted to constants since they never change.
const taskIcon = <CheckCircle2 size={17} color="#fff" />
const habitIcon = <Flame size={17} color="#fff" />
const goalIcon = <Target size={17} color="#fff" />
const eventIcon = <CalIcon size={17} color="#fff" />
const quickTaskIcon = <PlusCircle size={16} />
const quickHabitIcon = <Flame size={16} />
const quickGoalIcon = <Target size={16} />
const quickEventIcon = <CalIcon size={16} />

// FIX: removed the unused `delay` prop (was destructured but never
// referenced in either component, causing the "defined but never used"
// warning).
const RingKpi = memo(function RingKpi({ icon, accent, label, value, sub, ringValue, ringColor, isHoverable }) {
  return (
    <motion.div
      whileHover={isHoverable ? { y: -4 } : undefined}
      whileTap={{ scale: 0.985 }}
      transition={springTap}
      className="card ov-glass ov-kpi-card"
      style={{ boxShadow: '0 8px 30px rgba(20,8,42,0.3)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px ' + accent + '55, inset 0 1px 1px rgba(255,255,255,0.35)' }}>
              {icon}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', opacity: 0.85 }}>{label}</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.75 }}>{sub}</p>
        </div>
        <div
          style={{
            position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: '50%',
            boxShadow: '0 0 20px ' + ringColor + '40, 0 0 6px ' + ringColor + '35'
          }}
        >
          <MemoProgressRing value={ringValue} size={56} strokeWidth={5} color={ringColor} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800
          }}>
            {ringValue}%
          </div>
        </div>
      </div>
    </motion.div>
  )
})

const TrendKpi = memo(function TrendKpi({ icon, accent, label, value, sub, trend, trendColor, isHoverable }) {
  return (
    <motion.div
      whileHover={isHoverable ? { y: -4 } : undefined}
      whileTap={{ scale: 0.985 }}
      transition={springTap}
      className="card ov-glass ov-kpi-card"
      style={{ boxShadow: '0 8px 30px rgba(20,8,42,0.3)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px ' + accent + '55, inset 0 1px 1px rgba(255,255,255,0.35)' }}>
              {icon}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', opacity: 0.85 }}>{label}</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>{value}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.75 }}>{sub}</p>
        </div>
        <div style={{ filter: 'drop-shadow(0 0 8px ' + trendColor + '55)' }}>
          <MemoSparkline data={trend} color={trendColor} />
        </div>
      </div>
    </motion.div>
  )
})

// UX/PERF FIX: inline style objects (border, background, boxShadow, font
// sizing) were rebuilt from scratch on every render and hard-coded to one
// fixed size. Moved to CSS classes (.ov-quick-action / .ov-quick-icon-wrap)
// so the browser can cache the computed style and — critically — so a
// `transition` on background/border-color actually exists (see Overview.css).
// Added a `compact` variant so the exact same component/logic can be reused
// inside the Command Center hero card at a smaller footprint, instead of
// duplicating the quick-action markup and click handlers a second time.
const QuickAction = memo(function QuickAction({ icon, label, color, onClick, isHoverable, compact }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={isHoverable ? { y: compact ? -3 : -4, scale: 1.02, boxShadow: '0 12px 28px -8px ' + color + '45' } : undefined}
      whileTap={{ scale: 0.96 }}
      transition={springTap}
      className={'ov-quick-action' + (compact ? ' ov-quick-action-compact' : '')}
      style={{
        background: 'color-mix(in srgb, var(--surface-2) 92%, ' + color + ' 5%)'
      }}
    >
      <div
        className={'ov-quick-icon-wrap' + (compact ? ' ov-quick-icon-compact' : '')}
        style={{
          background: 'linear-gradient(135deg, ' + color + ', var(--accent-hover))',
          boxShadow: '0 4px 14px ' + color + '50, inset 0 1px 1px rgba(255,255,255,0.35)'
        }}
      >
        {icon}
      </div>
      <span className="ov-quick-label">{label}</span>
    </motion.button>
  )
})

const RecentTasksList = memo(function RecentTasksList({ tasks }) {
  if (tasks.length === 0) {
    return <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks yet</p>
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tasks.map(function (t) {
        const done = t.progress === 100
        const priorityColor = t.priority === 'high' ? '#F87171' : t.priority === 'low' ? '#34D399' : '#FDBA74'
        return (
          <div
            key={t.id}
            className="ov-task-row"
            style={{ borderLeftColor: done ? 'var(--border)' : priorityColor }}
          >
            <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text)', fontSize: '13px' }}>
              {t.title}
            </span>
            <span className="ov-task-chip" style={{ color: done ? 'var(--text-muted)' : priorityColor, borderColor: done ? 'var(--border)' : priorityColor }}>
              {done ? 'Done' : 'Pending'}
            </span>
          </div>
        )
      })}
    </div>
  )
})

const ScheduleTimeline = memo(function ScheduleTimeline({ events }) {
  if (events.length === 0) {
    return (
      <div className="empty-state">
        <CalIcon size={26} className="ov-breathing-icon" />
        <span style={{ fontWeight: 500 }}>Nothing planned today</span>
        <span>Enjoy your free time.</span>
      </div>
    )
  }
  return (
    <div className="ov-timeline">
      {events.map(function (ev) {
        return (
          <div key={ev.id} className="ov-timeline-row">
            <div className="ov-timeline-dot" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="ov-timeline-title">{ev.title}</p>
            </div>
            {ev.event_time && (
              <span className="ov-timeline-chip">
                <Clock3 size={11} /> {ev.event_time.slice(0, 5)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
})

function Overview({ userId, onNavigate }) {
  const [stats, setStats] = useState(null)

  // Computed directly at render time (no state/effect needed) — cheap,
  // single matchMedia read, and safe under SSR via the typeof check.
  const isHoverable =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover)').matches

  const fetchStats = useCallback(async function () {
    const today = new Date().toISOString().split('T')[0]
    const results = await Promise.all([
      supabase.from('tasks').select('id, title, progress, priority, created_at').order('created_at', { ascending: false }),
      supabase.from('habits').select('streak, last_completed'),
      supabase.from('goals').select('progress'),
      supabase.from('calendar_events').select('id, title, event_time, event_date').eq('event_date', today)
    ])

    const tasks = results[0].data
    const habits = results[1].data
    const goals = results[2].data
    const events = results[3].data

    const pending = (tasks || []).filter(function (t) { return t.progress < 100 }).length
    const completed = (tasks || []).filter(function (t) { return t.progress === 100 }).length
    const doneToday = (habits || []).filter(function (h) { return h.last_completed === today }).length
    const longestStreak = (habits || []).length ? Math.max.apply(null, habits.map(function (h) { return h.streak })) : 0
    const goalAvg = (goals || []).length ? Math.round(goals.reduce(function (a, g) { return a + g.progress }, 0) / goals.length) : 0

    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const count = (tasks || []).filter(function (t) { return t.created_at && t.created_at.slice(0, 10) === key }).length
      days.push(count)
    }

    setStats({
      pending: pending, completed: completed, habitCount: (habits || []).length, doneToday: doneToday,
      longestStreak: longestStreak, goalCount: (goals || []).length, goalAvg: goalAvg, events: events || [],
      taskTrend: days, recentTasks: (tasks || []).slice(0, 4)
    })
    // FIX: was `[UserId]` — capital U doesn't exist anywhere in this file
    // (the prop is `userId`), so this threw a ReferenceError as soon as
    // React evaluated the dependency array, before fetchStats could even run.
  }, [userId])

  // FIX: this effect was missing entirely, so fetchStats was defined but
  // never called — stats stayed null forever and the page never left the
  // skeleton state. useCallback alone doesn't invoke a function, it only
  // memoizes the reference; something still has to call it on mount.
  useEffect(function () {
    fetchStats()
  }, [fetchStats])

  const goToAI = useCallback(function () { onNavigate('ai') }, [onNavigate])
  const goToTasks = useCallback(function () { onNavigate('tasks') }, [onNavigate])
  const goToHabits = useCallback(function () { onNavigate('habits') }, [onNavigate])
  const goToGoals = useCallback(function () { onNavigate('goals') }, [onNavigate])
  const goToCalendar = useCallback(function () { onNavigate('calendar') }, [onNavigate])

  const derived = useMemo(function () {
    if (!stats) return null
    const habitPct = stats.habitCount > 0 ? Math.round((stats.doneToday / stats.habitCount) * 100) : 0
    const taskComponent = (stats.pending + stats.completed) > 0 ? (stats.completed / (stats.pending + stats.completed)) * 100 : 0
    const activeComponents = [(stats.pending + stats.completed) > 0, stats.habitCount > 0, stats.goalCount > 0].filter(Boolean).length
    const productivityScore = activeComponents > 0
      ? Math.round((taskComponent + habitPct + stats.goalAvg) / (activeComponents || 1))
      : null

    let subtitle = "Let's make today count."
    if (stats.pending === 0 && stats.completed > 0) subtitle = "All caught up — nice work."
    else if (stats.completed > stats.pending && stats.completed > 0) subtitle = "You're ahead of schedule today."
    else if (habitPct >= 80 && stats.habitCount > 0) subtitle = 'Your habits are on point today.'

    const eventsTrend = [1, 2, 1, 3, 2, 4, stats.events.length || 1]

    return { habitPct: habitPct, productivityScore: productivityScore, subtitle: subtitle, eventsTrend: eventsTrend }
  }, [stats])

  if (!stats) {
    return (
      <div className="ov-page">
        <SkeletonKpiRow />
      </div>
    )
  }

  const habitPct = derived.habitPct
  const productivityScore = derived.productivityScore
  const subtitle = derived.subtitle

  return (
    <div className="ov-page">

      {/* 1. Entrance Animation: Hero
          UX FIX: Quick Actions now lives inside the Command Center card as a
          compact 4-icon row, so it's visible on first paint on a phone screen
          without the user having to scroll past the KPI grid and both
          two-column sections to reach it. */}
      <motion.div
        {...heroFade}
        whileHover={isHoverable ? { y: -2 } : undefined}
        transition={springTap}
        className="card ov-hero ov-glass"
      >
        <div className="ov-hero-glow" />
        <div className="ov-hero-glow ov-hero-glow-2" />
        <div className="ov-hero-inner">
          <div>
            <p className="ov-hero-eyebrow">
              <Sparkles size={12} /> Command Center
            </p>
            <p className="ov-hero-subtitle">{subtitle}</p>
          </div>
          {productivityScore !== null && (
            <div
              className="ov-hero-ring-wrap"
              style={{ boxShadow: '0 0 26px #7C5CFF40, 0 0 8px #7C5CFF30' }}
            >
              <MemoProgressRing value={productivityScore} size={64} strokeWidth={5} color="#7C5CFF" />
              <div className="ov-hero-ring-center">
                <span className="ov-hero-ring-value">{productivityScore}</span>
                <span className="ov-hero-ring-sub">score</span>
              </div>
            </div>
          )}
        </div>

        <div className="ov-hero-quick-row">
          <QuickAction icon={quickTaskIcon} label="Task" color="#6C6CF0" onClick={goToTasks} isHoverable={isHoverable} compact />
          <QuickAction icon={quickHabitIcon} label="Habit" color="#F0876C" onClick={goToHabits} isHoverable={isHoverable} compact />
          <QuickAction icon={quickGoalIcon} label="Goal" color="#6CC7F0" onClick={goToGoals} isHoverable={isHoverable} compact />
          <QuickAction icon={quickEventIcon} label="Event" color="#8CF06C" onClick={goToCalendar} isHoverable={isHoverable} compact />
        </div>
      </motion.div>

      {/* 2. Entrance Animation: KPI Grid */}
      <motion.div {...kpiGridFade} className="ov-kpi-grid">
        <MemoTiltCard><TrendKpi icon={taskIcon} accent="#6C6CF0" label="Tasks" value={stats.pending} sub={stats.completed + ' completed'} trend={stats.taskTrend} trendColor="#6C6CF0" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><RingKpi icon={habitIcon} accent="#F0876C" label="Habit streak" value={stats.longestStreak} sub={stats.doneToday + '/' + stats.habitCount + ' done today'} ringValue={habitPct} ringColor="#F0876C" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><RingKpi icon={goalIcon} accent="#6CC7F0" label="Goals" value={stats.goalAvg + '%'} sub={stats.goalCount + ' active'} ringValue={stats.goalAvg} ringColor="#6CC7F0" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><TrendKpi icon={eventIcon} accent="#8CF06C" label="Today" value={stats.events.length} sub="events scheduled" trend={derived.eventsTrend} trendColor="#8CF06C" isHoverable={isHoverable} /></MemoTiltCard>
      </motion.div>

      {/* 3. Entrance Animation: Two Column Row 1 */}
      <motion.div {...twoColFade1} className="ov-two-col">
        <div className="card ov-ai-panel ov-glass">
          <div className="ov-ai-header">
            <div className="ov-ai-orb">
              <Brain size={16} color="#fff" />
            </div>
            <div>
              <p className="ov-ai-title">Atlas AI</p>
              <p className="ov-ai-caption">Your daily summary</p>
            </div>
          </div>
          <Suspense fallback={<div style={{ height: '80px', opacity: 0.5 }}>Loading AI insights...</div>}>
            <AIBrief userId={userId} />
          </Suspense>
          <motion.button whileHover={isHoverable ? { x: 2 } : undefined} whileTap={{ scale: 0.96 }} transition={springTap} className="ov-ai-cta" onClick={goToAI}>
            Chat with Atlas AI <ArrowRight size={13} />
          </motion.button>
        </div>

        <div className="card ov-schedule-panel ov-glass">
          <p className="ov-section-title">Today's Schedule</p>
          <ScheduleTimeline events={stats.events} />
        </div>
      </motion.div>

      {/* 4. Entrance Animation: Recent Tasks.
          Quick Actions used to live here as a second column — moved into the
          hero above, so this section is now a single full-width card instead
          of a two-column row with a now-redundant panel. */}
      <motion.div {...twoColFade2} className="card ov-glass">
        <p className="ov-section-title">Recent Tasks</p>
        <RecentTasksList tasks={stats.recentTasks} />
      </motion.div>
    </div>
  )
}

export default memo(Overview)