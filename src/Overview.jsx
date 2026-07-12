import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Target, Calendar as CalIcon, PlusCircle } from 'lucide-react'
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

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <TrendKpi delay={0} icon={<CheckCircle2 size={17} color="#fff" />} accent="#6C6CF0" label="Tasks" value={stats.pending} sub={stats.completed + ' completed'} trend={taskTrend} trendColor="#6C6CF0" />
        <RingKpi delay={0.05} icon={<Flame size={17} color="#fff" />} accent="#F0876C" label="Habit streak" value={stats.longestStreak} sub={stats.doneToday + '/' + stats.habitCount + ' done today'} ringValue={habitPct} ringColor="#F0876C" />
        <RingKpi delay={0.1} icon={<Target size={17} color="#fff" />} accent="#6CC7F0" label="Goals" value={stats.goalAvg + '%'} sub={stats.goalCount + ' active'} ringValue={stats.goalAvg} ringColor="#6CC7F0" />
        <TrendKpi delay={0.15} icon={<CalIcon size={17} color="#fff" />} accent="#8CF06C" label="Today" value={stats.events.length} sub="events scheduled" trend={[1, 2, 1, 3, 2, 4, stats.events.length || 1]} trendColor="#8CF06C" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <motion.div {...fadeUp(0.2)} className="card">
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>ATLAS AI</p>
          <AIBrief userId={userId} />
        </motion.div>

        <motion.div {...fadeUp(0.25)} className="card">
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Today's Schedule</p>
          {stats.events.length === 0 ? (
            <div className="empty-state">
              <CalIcon size={26} />
              <span style={{ fontWeight: 500 }}>Nothing planned today</span>
              <span>Enjoy your free time.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.events.map(function (ev) {
                return (
                  <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{ev.title}</span>
                    {ev.event_time && <span style={{ color: 'var(--text-muted)' }}>{ev.event_time.slice(0, 5)}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }}>
        <motion.div {...fadeUp(0.3)} className="card">
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Recent Tasks</p>
          {recentTasks.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No tasks yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentTasks.map(function (t) {
                return (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ textDecoration: t.progress === 100 ? 'line-through' : 'none', color: t.progress === 100 ? 'var(--text-muted)' : 'var(--text)' }}>{t.title}</span>
                    {t.progress === 100 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>done</span>}
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.35)} className="card">
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <QuickAction icon={<PlusCircle size={15} />} label="Task" onClick={function () { onNavigate('tasks') }} />
            <QuickAction icon={<Flame size={15} />} label="Habit" onClick={function () { onNavigate('habits') }} />
            <QuickAction icon={<Target size={15} />} label="Goal" onClick={function () { onNavigate('goals') }} />
            <QuickAction icon={<CalIcon size={15} />} label="Event" onClick={function () { onNavigate('calendar') }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function RingKpi({ icon, accent, label, value, sub, delay, ringValue, ringColor }) {
  return (
    <TiltCard style={{}}>
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
    </TiltCard>
  )
}

function TrendKpi({ icon, accent, label, value, sub, delay, trend, trendColor }) {
  return (
    <TiltCard style={{}}>
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
    </TiltCard>
  )
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      padding: '16px 8px', borderRadius: '12px', border: '1px solid var(--border)',
      background: 'var(--surface-2)', color: 'var(--text)', fontSize: '12px', fontWeight: 500
    }}>
      {icon}
      {label}
    </button>
  )
}

export default Overview