import { lazy, Suspense, memo, useEffect, useState } from 'react'
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

const RingKpi = memo(function RingKpi({ icon, accent, label, value, sub, delay, ringValue, ringColor, isHoverable }) {
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

const TrendKpi = memo(function TrendKpi({ icon, accent, label, value, sub, delay, trend, trendColor, isHoverable }) {
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

const QuickAction = memo(function QuickAction({ icon, label, color, onClick, isHoverable }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={isHoverable ? { y: -4, scale: 1.02, boxShadow: '0 12px 28px -8px ' + color + '45' } : undefined}
      whileTap={{ scale: 0.96 }}
      transition={springTap}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '18px 8px', borderRadius: '14px', border: '1px solid var(--border)',
        background: 'color-mix(in srgb, var(--surface-2) 92%, ' + color + ' 5%)',
        color: 'var(--text)', fontSize: '12px', fontWeight: 600
      }}
    >
      <div style={{
        width: '30px', height: '30px', borderRadius: '9px',
        background: 'linear-gradient(135deg, ' + color + ', var(--accent-hover))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        boxShadow: '0 4px 14px ' + color + '50, inset 0 1px 1px rgba(255,255,255,0.35)'
      }}>
        {icon}
      </div>
      {label}
    </motion.button>
  )
})

function Overview({ userId, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [taskTrend, setTaskTrend] = useState([])
  const [isHoverable, setIsHoverable] = useState(false)

  useEffect(function () { fetchStats() }, [])

  useEffect(function () {
    setIsHoverable(window.matchMedia('(hover: hover)').matches)
  }, [])

  async function fetchStats() {
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
    setTaskTrend(days)

    setRecentTasks((tasks || []).slice(0, 4))
    setStats({
      pending: pending, completed: completed, habitCount: (habits || []).length, doneToday: doneToday,
      longestStreak: longestStreak, goalCount: (goals || []).length, goalAvg: goalAvg, events: events || []
    })
  }

  if (!stats) {
    return (
      <div className="ov-page">
        <SkeletonKpiRow />
      </div>
    )
  }

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

  return (
    <div className="ov-page">

      {/* 1. Entrance Animation: Hero */}
      <motion.div
        {...fadeUp(0)}
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
      </motion.div>

      {/* 2. Entrance Animation: KPI Grid */}
      <motion.div {...fadeUp(0.1)} className="ov-kpi-grid">
        <MemoTiltCard><TrendKpi icon={<CheckCircle2 size={17} color="#fff" />} accent="#6C6CF0" label="Tasks" value={stats.pending} sub={stats.completed + ' completed'} trend={taskTrend} trendColor="#6C6CF0" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><RingKpi icon={<Flame size={17} color="#fff" />} accent="#F0876C" label="Habit streak" value={stats.longestStreak} sub={stats.doneToday + '/' + stats.habitCount + ' done today'} ringValue={habitPct} ringColor="#F0876C" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><RingKpi icon={<Target size={17} color="#fff" />} accent="#6CC7F0" label="Goals" value={stats.goalAvg + '%'} sub={stats.goalCount + ' active'} ringValue={stats.goalAvg} ringColor="#6CC7F0" isHoverable={isHoverable} /></MemoTiltCard>
        <MemoTiltCard><TrendKpi icon={<CalIcon size={17} color="#fff" />} accent="#8CF06C" label="Today" value={stats.events.length} sub="events scheduled" trend={[1, 2, 1, 3, 2, 4, stats.events.length || 1]} trendColor="#8CF06C" isHoverable={isHoverable} /></MemoTiltCard>
      </motion.div>

      {/* 3. Entrance Animation: Two Column Row 1 */}
      <motion.div {...fadeUp(0.2)} className="ov-two-col">
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
          <motion.button whileHover={isHoverable ? { x: 2 } : undefined} whileTap={{ scale: 0.96 }} transition={springTap} className="ov-ai-cta" onClick={function () { onNavigate('ai') }}>
            Chat with Atlas AI <ArrowRight size={13} />
          </motion.button>
        </div>

        <div className="card ov-schedule-panel ov-glass">
          <p className="ov-section-title">Today's Schedule</p>
          {stats.events.length === 0 ? (
            <div className="empty-state">
              <CalIcon size={26} className="ov-breathing-icon" />
              <span style={{ fontWeight: 500 }}>Nothing planned today</span>
              <span>Enjoy your free time.</span>
            </div>
          ) : (
            <div className="ov-timeline">
              {stats.events.map(function (ev) {
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
          )}
        </div>
      </motion.div>

      {/* 4. Entrance Animation: Two Column Row 2 */}
      <motion.div {...fadeUp(0.3)} className="ov-two-col">
        <div className="card ov-glass">
          <p className="ov-section-title">Recent Tasks</p>
          {recentTasks.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTasks.map(function (t) {
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
          )}
        </div>

        <div className="card ov-glass">
          <p className="ov-section-title">Quick Actions</p>
          <div className="ov-quick-grid">
            <QuickAction icon={<PlusCircle size={16} />} label="Task" color="#6C6CF0" onClick={function () { onNavigate('tasks') }} isHoverable={isHoverable} />
            <QuickAction icon={<Flame size={16} />} label="Habit" color="#F0876C" onClick={function () { onNavigate('habits') }} isHoverable={isHoverable} />
            <QuickAction icon={<Target size={16} />} label="Goal" color="#6CC7F0" onClick={function () { onNavigate('goals') }} isHoverable={isHoverable} />
            <QuickAction icon={<CalIcon size={16} />} label="Event" color="#8CF06C" onClick={function () { onNavigate('calendar') }} isHoverable={isHoverable} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Overview