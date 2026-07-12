import { useEffect, useState, useRef } from 'react'
import { motion, animate } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  ChartColumn, TrendingUp, TrendingDown, Flame, Target, Activity, Sparkles,
  CalendarDays, CircleCheck, Gauge, Clock
} from 'lucide-react'
import { supabase } from './lib/supabase'
import ProgressRing from './ProgressRing'
import Sparkline from './Sparkline'
import TiltCard from './TiltCard'

const PALETTE = ['#7C5CFF', '#F0876C', '#6CC7F0', '#8CF06C', '#FDBA74', '#F87171', '#34D399', '#60A5FA']

function hashOf(input) {
  const str = String(input || '')
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function CountUp({ value, suffix, style }) {
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

  return <span style={style}>{display}{suffix || ''}</span>
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px',
      padding: '8px 12px', fontSize: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontWeight: 700 }}>{payload[0].value} tasks</p>
    </div>
  )
}

function Analytics({ userId }) {
  const [weekData, setWeekData] = useState([])
  const [habitData, setHabitData] = useState([])
  const [goalData, setGoalData] = useState([])
  const [prevWeekTotal, setPrevWeekTotal] = useState(0)
  const [bestDay, setBestDay] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: tasks }, { data: habits }, { data: goals }] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('habits').select('*'),
      supabase.from('goals').select('*')
    ])

    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const count = (tasks || []).filter(function (t) { return t.created_at && t.created_at.startsWith(key) }).length
      days.push({ day: label, tasks: count })
    }
    setWeekData(days)

    const maxDay = days.reduce(function (best, d) { return (!best || d.tasks > best.tasks) ? d : best }, null)
    setBestDay(maxDay && maxDay.tasks > 0 ? maxDay : null)

    let prevTotal = 0
    for (let i = 13; i >= 7; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      prevTotal += (tasks || []).filter(function (t) { return t.created_at && t.created_at.startsWith(key) }).length
    }
    setPrevWeekTotal(prevTotal)

    setHabitData((habits || []).map(function (h) { return { id: h.id, name: h.name, streak: h.streak } }))
    setGoalData((goals || []).map(function (g) {
      return { id: g.id, name: g.title, progress: g.progress, target: g.target, created_at: g.created_at }
    }))

    const combined = []
    ;(tasks || []).forEach(function (t) { combined.push({ type: 'task', label: t.title, created_at: t.created_at, done: t.progress === 100 }) })
    ;(habits || []).forEach(function (h) { combined.push({ type: 'habit', label: h.name, created_at: h.created_at }) })
    ;(goals || []).forEach(function (g) { combined.push({ type: 'goal', label: g.title, created_at: g.created_at }) })
    combined.sort(function (a, b) { return new Date(b.created_at) - new Date(a.created_at) })
    setActivity(combined.slice(0, 6))

    setLoading(false)
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>

  const totalTasks = weekData.reduce(function (a, d) { return a + d.tasks }, 0)
  const bestStreak = habitData.length ? Math.max.apply(null, habitData.map(function (h) { return h.streak })) : 0
  const avgGoal = goalData.length ? Math.round(goalData.reduce(function (a, g) { return a + g.progress }, 0) / goalData.length) : 0
  const taskTrendPct = prevWeekTotal > 0 ? Math.round(((totalTasks - prevWeekTotal) / prevWeekTotal) * 100) : null

  const taskComponent = Math.min(100, (totalTasks / 7) * 20)
  const habitComponent = habitData.length ? Math.min(100, (bestStreak / 30) * 100) : 0
  const goalComponent = avgGoal
  const activeComponents = [totalTasks > 0, habitData.length > 0, goalData.length > 0].filter(Boolean).length
  const productivityScore = activeComponents > 0
    ? Math.round((taskComponent + habitComponent + goalComponent) / (activeComponents || 1))
    : null

  const insights = []
  if (taskTrendPct !== null) {
    insights.push({
      icon: taskTrendPct >= 0 ? TrendingUp : TrendingDown,
      color: taskTrendPct >= 0 ? '#34D399' : '#F87171',
      text: 'Task creation ' + (taskTrendPct >= 0 ? 'increased' : 'decreased') + ' ' + Math.abs(taskTrendPct) + '% vs last week.'
    })
  }
  if (bestDay) {
    insights.push({ icon: CalendarDays, color: '#6CC7F0', text: 'You created the most tasks on ' + bestDay.day + ' this week.' })
  }
  if (habitData.length > 0) {
    const topHabit = habitData.reduce(function (best, h) { return (!best || h.streak > best.streak) ? h : best }, null)
    if (topHabit && topHabit.streak > 0) {
      insights.push({ icon: Flame, color: '#F0876C', text: '"' + topHabit.name + '" has your longest streak at ' + topHabit.streak + ' days.' })
    }
  }
  const closestGoal = goalData.filter(function (g) { return g.progress < 100 }).sort(function (a, b) { return b.progress - a.progress })[0]
  if (closestGoal) {
    insights.push({ icon: Target, color: '#7C5CFF', text: "You're closest to finishing \"" + closestGoal.name + '" at ' + closestGoal.progress + '%.' })
  }

  return (
    <div className="an-page">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="an-hero">
        <p className="an-hero-eyebrow">Productivity overview</p>
        <div className="an-hero-row">
          <ProgressRing value={productivityScore || 0} size={72} strokeWidth={6} color="#7C5CFF" />
          <div>
            <h2 className="an-hero-score">{productivityScore !== null ? productivityScore : '—'}<span className="an-hero-score-sub">/100</span></h2>
            <p className="an-hero-sub">Productivity score <span className="an-hero-note">(simple estimate)</span></p>
          </div>
        </div>
      </motion.div>

      <div className="an-kpi-grid">
        <TiltCard><KpiCard icon={ChartColumn} color="#7C5CFF" label="Tasks created (7d)" value={totalTasks} trend={taskTrendPct} sparkline={weekData.map(function (d) { return d.tasks })} delay={0} /></TiltCard>
        <TiltCard><KpiCard icon={Flame} color="#F0876C" label="Best habit streak" value={bestStreak} suffix=" days" delay={0.05} /></TiltCard>
        <TiltCard><KpiCard icon={Target} color="#6CC7F0" label="Avg goal progress" value={avgGoal} suffix="%" delay={0.1} /></TiltCard>
        <TiltCard><KpiCard icon={Gauge} color="#8CF06C" label="Productivity score" value={productivityScore} placeholder={productivityScore === null} suffix="/100" delay={0.15} /></TiltCard>
        <TiltCard><KpiCard icon={Clock} color="#FDBA74" label="Weekly focus hours" placeholder placeholderText="Not tracked yet" delay={0.2} /></TiltCard>
        <TiltCard><KpiCard icon={Activity} color="#F87171" label="Consistency score" placeholder placeholderText="Coming soon" delay={0.25} /></TiltCard>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="card an-main-chart">
        <p className="an-section-title">Tasks created this week</p>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tasks" stroke="#7C5CFF" strokeWidth={2.5} fill="url(#taskGradient)" animationDuration={900} dot={{ r: 3, fill: '#7C5CFF' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {habitData.length > 0 && (
        <div>
          <p className="an-section-title-outer">Habit analytics</p>
          <div className="an-habit-grid">
            {habitData.map(function (h, i) {
              const color = PALETTE[hashOf(h.id) % PALETTE.length]
              const pct = Math.min(100, Math.round((h.streak / 30) * 100))
              return (
                <motion.div key={h.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card an-habit-card">
                  <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                    <ProgressRing value={pct} size={52} strokeWidth={4} color={color} />
                    <div className="an-ring-center"><Flame size={16} color={color} /></div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="an-habit-name">{h.name}</p>
                    <p className="an-habit-streak"><CountUp value={h.streak} /> day streak</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {goalData.length > 0 && (
        <div>
          <p className="an-section-title-outer">Goal analytics</p>
          <div className="an-goal-grid">
            {goalData.map(function (g, i) {
              const color = PALETTE[hashOf(g.id) % PALETTE.length]
              const status = g.progress >= 100 ? 'Complete' : g.progress >= 60 ? 'On track' : g.progress >= 20 ? 'In progress' : 'Just started'
              let estimateText = 'Not enough data yet'
              if (g.created_at && g.progress > 0 && g.progress < 100) {
                const daysElapsed = Math.max(1, Math.round((Date.now() - new Date(g.created_at)) / 86400000))
                const totalEstimate = daysElapsed / (g.progress / 100)
                const remaining = Math.round(totalEstimate - daysElapsed)
                if (remaining > 0 && remaining < 3650) {
                  estimateText = '~' + remaining + ' day' + (remaining !== 1 ? 's' : '') + ' left (est.)'
                }
              } else if (g.progress >= 100) {
                estimateText = 'Completed'
              }
              return (
                <motion.div key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }} className="card an-goal-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                      <ProgressRing value={g.progress} size={48} strokeWidth={4} color={color} />
                      <div className="an-ring-center" style={{ fontSize: '10px', fontWeight: 700 }}>{g.progress}%</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="an-goal-name">{g.name}</p>
                      {g.target && <p className="an-goal-target">{g.target}</p>}
                    </div>
                    <span className="an-status-chip" style={{ color: color, borderColor: color }}>{status}</span>
                  </div>
                  <div className="an-goal-bar-track">
                    <motion.div className="an-goal-bar-fill" style={{ background: color }} initial={{ width: 0 }} animate={{ width: g.progress + '%' }} transition={{ duration: 0.7 }} />
                  </div>
                  <p className="an-goal-estimate">{estimateText}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {insights.length > 0 && (
        <div className="card an-insights">
          <div className="an-insights-title">
            <Sparkles size={15} color="#7C5CFF" />
            <p className="an-section-title" style={{ marginBottom: 0 }}>Insights</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.map(function (ins, i) {
              const Icon = ins.icon
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="an-insight-row">
                  <Icon size={14} color={ins.color} />
                  <span>{ins.text}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {activity.length > 0 && (
        <div className="card an-activity">
          <p className="an-section-title">Recent activity</p>
          <div className="an-timeline">
            {activity.map(function (a, i) {
              const Icon = a.type === 'task' ? CircleCheck : a.type === 'habit' ? Flame : Target
              const color = a.type === 'task' ? '#7C5CFF' : a.type === 'habit' ? '#F0876C' : '#6CC7F0'
              const verb = a.type === 'task' ? (a.done ? 'Completed task' : 'Added task') : a.type === 'habit' ? 'Started tracking habit' : 'Set goal'
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="an-timeline-row">
                  <div className="an-timeline-dot" style={{ background: color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{verb}</span>: {a.label}
                  </div>
                  <Icon size={13} color={color} />
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        .an-page { display: flex; flex-direction: column; gap: 20px; }
        .an-hero { padding: 4px 2px 8px; }
        .an-hero-eyebrow { font-size: 12px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.04em; margin-bottom: 12px; }
        .an-hero-row { display: flex; align-items: center; gap: 16px; }
        .an-hero-score { font-size: 34px; font-weight: 700; letter-spacing: -0.02em; }
        .an-hero-score-sub { font-size: 16px; color: var(--text-muted); font-weight: 500; }
        .an-hero-sub { font-size: 12.5px; color: var(--text-muted); margin-top: 2px; }
        .an-hero-note { font-size: 11px; }

        .an-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
        .an-kpi-card { padding: 18px; }
        .an-kpi-icon { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .an-kpi-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
        .an-kpi-value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
        .an-kpi-trend { display: flex; align-items: center; gap: 3px; font-size: 11px; margin-top: 4px; }
        .an-kpi-placeholder { font-size: 12px; color: var(--text-muted); font-style: italic; margin-top: 6px; }

        .an-main-chart { padding: 20px; }
        .an-section-title { font-size: 14px; font-weight: 600; margin-bottom: 16px; }
        .an-section-title-outer { font-size: 14px; font-weight: 600; margin-bottom: 12px; }

        .an-habit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .an-habit-card { padding: 16px; display: flex; align-items: center; gap: 12px; }
        .an-ring-center { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
        .an-habit-name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .an-habit-streak { font-size: 11.5px; color: var(--text-muted); margin-top: 2px; }

        .an-goal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
        .an-goal-card { padding: 16px; }
        .an-goal-name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .an-goal-target { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .an-status-chip { font-size: 10px; font-weight: 600; border: 1px solid; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
        .an-goal-bar-track { width: 100%; height: 6px; background: var(--bg); border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
        .an-goal-bar-fill { height: 100%; border-radius: 4px; }
        .an-goal-estimate { font-size: 11px; color: var(--text-muted); }

        .an-insights { padding: 20px; }
        .an-insights-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
        .an-insight-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface-2); border-radius: 10px; font-size: 12.5px; }

        .an-activity { padding: 20px; }
        .an-timeline { display: flex; flex-direction: column; gap: 4px; }
        .an-timeline-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 12.5px; color: var(--text); border-bottom: 1px solid var(--border); }
        .an-timeline-row:last-child { border-bottom: none; }
        .an-timeline-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      `}</style>
    </div>
  )
}

function KpiCard({ icon, color, label, value, suffix, trend, sparkline, placeholder, placeholderText, delay }) {
  const Icon = icon
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: delay }} className="card an-kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="an-kpi-icon" style={{ background: color }}><Icon size={16} color="#fff" /></div>
          <p className="an-kpi-label">{label}</p>
          {placeholder ? (
            <p className="an-kpi-placeholder">{placeholderText || 'No data yet'}</p>
          ) : (
            <>
              <p className="an-kpi-value"><CountUp value={value || 0} suffix={suffix} /></p>
              {trend !== null && trend !== undefined && (
                <div className="an-kpi-trend" style={{ color: trend >= 0 ? '#34D399' : '#F87171' }}>
                  {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {Math.abs(trend)}% vs last week
                </div>
              )}
            </>
          )}
        </div>
        {sparkline && <Sparkline data={sparkline} width={50} height={28} color={color} />}
      </div>
    </motion.div>
  )
}

export default Analytics