import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Flame, Target, Calendar as CalIcon, PlusCircle,
  Brain, Sparkles, Clock3, Gauge, ArrowRight
} from 'lucide-react'
import { supabase } from './lib/supabase'
import AIBrief from './AIBrief'
import ProgressRing from './ProgressRing'
import Sparkline from './Sparkline'
import TiltCard from './TiltCard'
import { SkeletonKpiRow } from './Skeleton'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = function (delay) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: delay || 0, ease: ease }
  }
}

function Overview({ userId, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [taskTrend, setTaskTrend] = useState([])

  useEffect(function () { fetchStats() }, [])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]
    const results = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('habits').select('streak, last_completed'),
      supabase.from('goals').select('progress'),
      supabase.from('calendar_events').select('*').eq('event_date', today)
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

  if (!stats) return <SkeletonKpiRow />

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
      <motion.div {...fadeUp(0)} className="ov-hero">
        <div className="ov-hero-glow" />
        <div className="ov-hero-inner">
          <div>
            <p className="ov-hero-eyebrow">
              <Sparkles size={12} /> Command Center
            </p>
            <p className="ov-hero-subtitle">{subtitle}</p>
          </div>
          {productivityScore !== null && (
            <div className="ov-hero-ring-wrap">
              <ProgressRing value={productivityScore} size={64} strokeWidth={5} color="#7C5CFF" />
              <div className="ov-hero-ring-center">
                <span className="ov-hero-ring-value">{productivityScore}</span>
                <span className="ov-hero-ring-sub">score</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="ov-kpi-grid">
        <TiltCard><TrendKpi delay={0.05} icon={<CheckCircle2 size={17} color="#fff" />} accent="#6C6CF0" label="Tasks" value={stats.pending} sub={stats.completed + ' completed'} trend={taskTrend} trendColor="#6C6CF0" /></TiltCard>
        <TiltCard><RingKpi delay={0.1} icon={<Flame size={17} color="#fff" />} accent="#F0876C" label="Habit streak" value={stats.longestStreak} sub={stats.doneToday + '/' + stats.habitCount + ' done today'} ringValue={habitPct} ringColor="#F0876C" /></TiltCard>
        <TiltCard><RingKpi delay={0.15} icon={<Target size={17} color="#fff" />} accent="#6CC7F0" label="Goals" value={stats.goalAvg + '%'} sub={stats.goalCount + ' active'} ringValue={stats.goalAvg} ringColor="#6CC7F0" /></TiltCard>
        <TiltCard><TrendKpi delay={0.2} icon={<CalIcon size={17} color="#fff" />} accent="#8CF06C" label="Today" value={stats.events.length} sub="events scheduled" trend={[1, 2, 1, 3, 2, 4, stats.events.length || 1]} trendColor="#8CF06C" /></TiltCard>
      </div>

      <div className="ov-two-col">
        <motion.div {...fadeUp(0.25)} className="card ov-ai-panel">
          <div className="ov-ai-header">
            <div className="ov-ai-orb">
              <Brain size={16} color="#fff" />
            </div>
            <div>
              <p className="ov-ai-title">Atlas AI</p>
              <p className="ov-ai-caption">Your daily summary</p>
            </div>
          </div>
          <AIBrief userId={userId} />
          <button className="ov-ai-cta" onClick={function () { onNavigate('ai') }}>
            Chat with Atlas AI <ArrowRight size={13} />
          </button>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="card ov-schedule-panel">
          <p className="ov-section-title">Today's Schedule</p>
          {stats.events.length === 0 ? (
            <div className="empty-state">
              <CalIcon size={26} className="ov-breathing-icon" />
              <span style={{ fontWeight: 500 }}>Nothing planned today</span>
              <span>Enjoy your free time.</span>
            </div>
          ) : (
            <div className="ov-timeline">
              {stats.events.map(function (ev, i) {
                return (
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="ov-timeline-row">
                    <div className="ov-timeline-dot" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="ov-timeline-title">{ev.title}</p>
                    </div>
                    {ev.event_time && (
                      <span className="ov-timeline-chip">
                        <Clock3 size={11} /> {ev.event_time.slice(0, 5)}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="ov-two-col">
        <motion.div {...fadeUp(0.35)} className="card">
          <p className="ov-section-title">Recent Tasks</p>
          {recentTasks.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTasks.map(function (t, i) {
                const done = t.progress === 100
                const priorityColor = t.priority === 'high' ? '#F87171' : t.priority === 'low' ? '#34D399' : '#FDBA74'
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    whileHover={{ x: 3 }}
                    className="ov-task-row"
                    style={{ borderLeftColor: done ? 'var(--border)' : priorityColor }}
                  >
                    <span style={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text)', fontSize: '13px' }}>
                      {t.title}
                    </span>
                    <span className="ov-task-chip" style={{ color: done ? 'var(--text-muted)' : priorityColor, borderColor: done ? 'var(--border)' : priorityColor }}>
                      {done ? 'Done' : 'Pending'}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.4)} className="card">
          <p className="ov-section-title">Quick Actions</p>
          <div className="ov-quick-grid">
            <QuickAction icon={<PlusCircle size={16} />} label="Task" color="#6C6CF0" onClick={function () { onNavigate('tasks') }} />
            <QuickAction icon={<Flame size={16} />} label="Habit" color="#F0876C" onClick={function () { onNavigate('habits') }} />
            <QuickAction icon={<Target size={16} />} label="Goal" color="#6CC7F0" onClick={function () { onNavigate('goals') }} />
            <QuickAction icon={<CalIcon size={16} />} label="Event" color="#8CF06C" onClick={function () { onNavigate('calendar') }} />
          </div>
        </motion.div>
      </div>

      <style>{`
        .ov-page { display: flex; flex-direction: column; gap: 16px; }

        .ov-hero {
          position: relative; overflow: hidden; border-radius: 24px; padding: 22px 24px;
          background: var(--surface); border: 1px solid var(--border);
        }
        .ov-hero-glow {
          position: absolute; top: -60%; left: -10%; width: 60%; height: 220%;
          background: radial-gradient(circle, rgba(124,92,255,0.18), transparent 65%);
          pointer-events: none;
        }
        .ov-hero-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .ov-hero-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em; color: #7C5CFF; margin-bottom: 8px; text-transform: uppercase; }
        .ov-hero-subtitle { font-size: 15px; color: var(--text-muted); }
        .ov-hero-ring-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
        .ov-hero-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ov-hero-ring-value { font-size: 15px; font-weight: 700; line-height: 1; }
        .ov-hero-ring-sub { font-size: 8px; color: var(--text-muted); }

        .ov-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }

        .ov-two-col { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .ov-two-col { grid-template-columns: 1fr; } }

        .ov-ai-panel { position: relative; overflow: hidden; }
        .ov-ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ov-ai-orb {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #7C5CFF, #6C4CEF);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(124,92,255,0.5);
          animation: ov-pulse 2.4s ease-in-out infinite;
        }
        @keyframes ov-pulse {
          0%, 100% { box-shadow: 0 0 12px rgba(124,92,255,0.4); }
          50% { box-shadow: 0 0 22px rgba(124,92,255,0.7); }
        }
        .ov-ai-title { font-size: 13px; font-weight: 700; }
        .ov-ai-caption { font-size: 11px; color: var(--text-muted); }
        .ov-ai-cta {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
          background: transparent; border: none; color: #7C5CFF; font-size: 12.5px; font-weight: 600;
        }

        .ov-section-title { font-size: 15px; font-weight: 600; margin-bottom: 16px; }

        .ov-breathing-icon { animation: ov-breathe 3s ease-in-out infinite; }
        @keyframes ov-breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }

        .ov-timeline { display: flex; flex-direction: column; gap: 4px; }
        .ov-timeline-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .ov-timeline-row:last-child { border-bottom: none; }
        .ov-timeline-dot { width: 6px; height: 6px; border-radius: 50%; background: #8CF06C; flex-shrink: 0; }
        .ov-timeline-title { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ov-timeline-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); white-space: nowrap; }

        .ov-task-row {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 10px 12px; border-radius: 10px; background: var(--surface-2);
          border-left: 3px solid var(--border);
        }
        .ov-task-chip { font-size: 10px; font-weight: 600; border: 1px solid; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }

        .ov-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      `}</style>
    </div>
  )
}

function RingKpi({ icon, accent, label, value, sub, delay, ringValue, ringColor }) {
  return (
    <motion.div {...fadeUp(delay)} className="card" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
        </div>
        <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
          <ProgressRing value={ringValue} size={56} strokeWidth={5} color={ringColor} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700
          }}>
            {ringValue}%
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TrendKpi({ icon, accent, label, value, sub, delay, trend, trendColor }) {
  return (
    <motion.div {...fadeUp(delay)} className="card" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
        </div>
        <Sparkline data={trend} color={trendColor} />
      </div>
    </motion.div>
  )
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '18px 8px', borderRadius: '14px', border: '1px solid var(--border)',
        background: 'var(--surface-2)', color: 'var(--text)', fontSize: '12px', fontWeight: 500
      }}
    >
      <div style={{
        width: '30px', height: '30px', borderRadius: '9px',
        background: 'linear-gradient(135deg, ' + color + ', var(--accent-hover))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
      }}>
        {icon}
      </div>
      {label}
    </motion.button>
  )
}

export default Overview