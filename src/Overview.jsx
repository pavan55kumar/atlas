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
const springTap = { type: 'spring', stiffness: 380, damping: 22 }
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
      <div className="ov-ambient-bg" aria-hidden="true">
        <span className="ov-particle ov-particle-1" />
        <span className="ov-particle ov-particle-2" />
        <span className="ov-particle ov-particle-3" />
        <span className="ov-speck ov-speck-1" />
        <span className="ov-speck ov-speck-2" />
        <span className="ov-speck ov-speck-3" />
        <span className="ov-speck ov-speck-4" />
      </div>

      <motion.div {...fadeUp(0)} whileHover={{ y: -2 }} transition={springTap} className="card ov-hero ov-glass">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
              className="ov-hero-ring-wrap"
              style={{ boxShadow: '0 0 26px #7C5CFF40, 0 0 8px #7C5CFF30' }}
            >
              <ProgressRing value={productivityScore} size={64} strokeWidth={5} color="#7C5CFF" />
              <div className="ov-hero-ring-center">
                <span className="ov-hero-ring-value">{productivityScore}</span>
                <span className="ov-hero-ring-sub">score</span>
              </div>
            </motion.div>
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
        <motion.div {...fadeUp(0.25)} whileHover={{ y: -3 }} transition={springTap} className="card ov-ai-panel ov-glass">
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
          <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.96 }} transition={springTap} className="ov-ai-cta" onClick={function () { onNavigate('ai') }}>
            Chat with Atlas AI <ArrowRight size={13} />
          </motion.button>
        </motion.div>

        <motion.div {...fadeUp(0.3)} whileHover={{ y: -3 }} transition={springTap} className="card ov-schedule-panel ov-glass">
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
                  <motion.div key={ev.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.05, ease }} className="ov-timeline-row">
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
        <motion.div {...fadeUp(0.35)} whileHover={{ y: -3 }} transition={springTap} className="card ov-glass">
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
                    transition={{ duration: 0.3, delay: i * 0.04, ease }}
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

        <motion.div {...fadeUp(0.4)} whileHover={{ y: -3 }} transition={springTap} className="card ov-glass">
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
        .ov-page { position: relative; display: flex; flex-direction: column; gap: 16px; }

        /* ---------- Ambient background ---------- */
        .ov-ambient-bg {
          position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none;
        }
        .ov-particle {
          position: absolute; border-radius: 50%; filter: blur(70px);
          background: radial-gradient(circle, rgba(124,92,255,0.16), rgba(124,92,255,0) 70%);
          animation: ov-drift 22s ease-in-out infinite;
        }
        .ov-particle-1 { width: 420px; height: 420px; top: -10%; left: -8%; animation-duration: 26s; }
        .ov-particle-2 { width: 360px; height: 360px; bottom: -12%; right: -6%; background: radial-gradient(circle, rgba(108,199,240,0.12), rgba(108,199,240,0) 70%); animation-duration: 30s; animation-delay: -6s; }
        .ov-particle-3 { width: 300px; height: 300px; top: 40%; left: 45%; background: radial-gradient(circle, rgba(240,135,108,0.08), rgba(240,135,108,0) 70%); animation-duration: 34s; animation-delay: -14s; }
        @keyframes ov-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, 4%) scale(1.06); }
          66% { transform: translate(-3%, -2%) scale(0.97); }
        }
        .ov-speck {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: rgba(124,92,255,0.35); animation: ov-float 14s ease-in-out infinite;
        }
        .ov-speck-1 { top: 18%; left: 22%; animation-duration: 16s; }
        .ov-speck-2 { top: 60%; left: 78%; animation-duration: 19s; animation-delay: -4s; background: rgba(108,199,240,0.3); }
        .ov-speck-3 { top: 75%; left: 30%; animation-duration: 21s; animation-delay: -9s; }
        .ov-speck-4 { top: 30%; left: 85%; animation-duration: 17s; animation-delay: -2s; background: rgba(240,135,108,0.28); }
        @keyframes ov-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-22px) translateX(8px); opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ov-particle, .ov-speck { animation: none; }
        }

        /* ---------- Premium glass surface (applies on top of existing .card) ---------- */
        .card.ov-glass {
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(165deg,
              color-mix(in srgb, var(--surface) 90%, #0a0a10 10%) 0%,
              color-mix(in srgb, var(--surface) 78%, #050507 22%) 100%);
          border: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 12%);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.05) inset,
            0 22px 44px -20px rgba(38,14,74,0.55),
            0 6px 18px -10px rgba(38,14,74,0.45);
          transition: box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .card.ov-glass:hover {
          border-color: color-mix(in srgb, var(--border) 45%, #7C5CFF 25%);
          box-shadow:
            0 1px 0 0 rgba(255,255,255,0.07) inset,
            0 28px 54px -18px rgba(48,18,92,0.6),
            0 8px 22px -8px rgba(48,18,92,0.5);
        }
        .card.ov-glass::before {
          content: ''; position: absolute; top: 0; left: 6%; right: 6%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
          pointer-events: none;
        }
        .card.ov-glass::after {
          content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        .ov-hero {
          border-radius: 24px; padding: 22px 24px;
        }
        .ov-hero-glow {
          position: absolute; top: -60%; left: -10%; width: 60%; height: 220%;
          background: radial-gradient(circle, rgba(124,92,255,0.22), transparent 65%);
          pointer-events: none;
        }
        .ov-hero-glow-2 {
          top: auto; bottom: -70%; left: auto; right: -15%; width: 50%; height: 200%;
          background: radial-gradient(circle, rgba(108,199,240,0.10), transparent 68%);
        }
        .ov-hero-inner { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .ov-hero-eyebrow { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; color: #9C8CFF; margin-bottom: 8px; text-transform: uppercase; text-shadow: 0 0 18px rgba(124,92,255,0.35); }
        .ov-hero-subtitle { font-size: 15px; color: var(--text-muted); opacity: 0.9; }
        .ov-hero-ring-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; border-radius: 50%; }
        .ov-hero-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ov-hero-ring-value { font-size: 15px; font-weight: 800; line-height: 1; letter-spacing: -0.01em; }
        .ov-hero-ring-sub { font-size: 8px; color: var(--text-muted); opacity: 0.75; letter-spacing: 0.03em; }

        .ov-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }

        .ov-two-col { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .ov-two-col { grid-template-columns: 1fr; } }

        .ov-ai-panel { position: relative; }
        .ov-ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ov-ai-orb {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #8C6CFF, #6C3CEF);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 18px rgba(124,92,255,0.55), inset 0 1px 1px rgba(255,255,255,0.4);
          animation: ov-pulse 2.4s ease-in-out infinite;
        }
        @keyframes ov-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(124,92,255,0.45), inset 0 1px 1px rgba(255,255,255,0.35); }
          50% { box-shadow: 0 0 26px rgba(124,92,255,0.8), inset 0 1px 1px rgba(255,255,255,0.45); }
        }
        .ov-ai-title { font-size: 13px; font-weight: 800; letter-spacing: -0.01em; }
        .ov-ai-caption { font-size: 11px; color: var(--text-muted); opacity: 0.8; }
        .ov-ai-cta {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 14px;
          background: transparent; border: none; color: #9C8CFF; font-size: 12.5px; font-weight: 700;
        }

        .ov-section-title { font-size: 15px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.01em; }

        .ov-breathing-icon { animation: ov-breathe 3s ease-in-out infinite; }
        @keyframes ov-breathe {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }

        .ov-timeline { display: flex; flex-direction: column; gap: 4px; }
        .ov-timeline-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .ov-timeline-row:last-child { border-bottom: none; }
        .ov-timeline-dot { width: 6px; height: 6px; border-radius: 50%; background: #8CF06C; flex-shrink: 0; box-shadow: 0 0 8px #8CF06C90; }
        .ov-timeline-title { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ov-timeline-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); opacity: 0.85; white-space: nowrap; }

        .ov-task-row {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: color-mix(in srgb, var(--surface-2) 92%, #7C5CFF 4%);
          border-left: 3px solid var(--border);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          transition: background 0.25s ease;
        }
        .ov-task-chip { font-size: 10px; font-weight: 700; border: 1px solid; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }

        .ov-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      `}</style>
    </div>
  )
}

function RingKpi({ icon, accent, label, value, sub, delay, ringValue, ringColor }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -4 }}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.15, ease }}
          style={{
            position: 'relative', width: '56px', height: '56px', flexShrink: 0, borderRadius: '50%',
            boxShadow: '0 0 20px ' + ringColor + '40, 0 0 6px ' + ringColor + '35'
          }}
        >
          <ProgressRing value={ringValue} size={56} strokeWidth={5} color={ringColor} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800
          }}>
            {ringValue}%
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function TrendKpi({ icon, accent, label, value, sub, delay, trend, trendColor }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -4 }}
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
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.15, ease }}
          style={{ filter: 'drop-shadow(0 0 8px ' + trendColor + '55)' }}
        >
          <Sparkline data={trend} color={trendColor} />
        </motion.div>
      </div>
    </motion.div>
  )
}

function QuickAction({ icon, label, color, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 28px -8px ' + color + '45' }}
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
}

export default Overview