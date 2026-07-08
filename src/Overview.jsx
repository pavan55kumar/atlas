import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Flame, Target, Calendar as CalIcon, PlusCircle } from 'lucide-react'
import { supabase } from './lib/supabase'
import AIBrief from './AIBrief'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease }
})

function Overview({ userId, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: tasks }, { data: habits }, { data: goals }, { data: events }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('habits').select('streak, last_completed'),
      supabase.from('goals').select('progress'),
      supabase.from('calendar_events').select('*').eq('event_date', today)
    ])

    const pending = tasks?.filter(t => t.progress < 100).length || 0
    const completed = tasks?.filter(t => t.progress === 100).length || 0
    const doneToday = habits?.filter(h => h.last_completed === today).length || 0
    const longestStreak = habits?.length ? Math.max(...habits.map(h => h.streak)) : 0
    const goalAvg = goals?.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0

    setRecentTasks((tasks || []).slice(0, 4))
    setStats({ pending, completed, habitCount: habits?.length || 0, doneToday, longestStreak, goalCount: goals?.length || 0, goalAvg, events: events || [] })
  }

  if (!stats) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <Kpi delay={0} icon={<CheckCircle2 size={17} color="#fff" />} accent="#6C6CF0" label="Tasks" value={stats.pending} sub={`${stats.completed} completed`} />
        <Kpi delay={0.05} icon={<Flame size={17} color="#fff" />} accent="#F0876C" label="Habit streak" value={stats.longestStreak} sub={`${stats.doneToday}/${stats.habitCount} done today`} />
        <Kpi delay={0.1} icon={<Target size={17} color="#fff" />} accent="#6CC7F0" label="Goals" value={`${stats.goalAvg}%`} sub={`${stats.goalCount} active`} />
        <Kpi delay={0.15} icon={<CalIcon size={17} color="#fff" />} accent="#8CF06C" label="Today" value={stats.events.length} sub="events scheduled" />
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
              {stats.events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>{ev.title}</span>
                  {ev.event_time && <span style={{ color: 'var(--text-muted)' }}>{ev.event_time.slice(0, 5)}</span>}
                </div>
              ))}
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
              {recentTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ textDecoration: t.progress === 100 ? 'line-through' : 'none', color: t.progress === 100 ? 'var(--text-muted)' : 'var(--text)' }}>{t.title}</span>
                  {t.progress === 100 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>done</span>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.35)} className="card">
          <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <QuickAction icon={<PlusCircle size={15} />} label="Task" onClick={() => onNavigate('tasks')} />
            <QuickAction icon={<Flame size={15} />} label="Habit" onClick={() => onNavigate('habits')} />
            <QuickAction icon={<Target size={15} />} label="Goal" onClick={() => onNavigate('goals')} />
            <QuickAction icon={<CalIcon size={15} />} label="Event" onClick={() => onNavigate('calendar')} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Kpi({ icon, accent, label, value, sub, delay }) {
  return (
    <motion.div {...fadeUp(delay)} className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</p>
    </motion.div>
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