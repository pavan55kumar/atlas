import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from './lib/supabase'

function Analytics({ userId }) {
  const [weekData, setWeekData] = useState([])
  const [habitData, setHabitData] = useState([])
  const [goalData, setGoalData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: tasks }, { data: habits }, { data: goals }] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('habits').select('*'),
      supabase.from('goals').select('*')
    ])

    // Build last 7 days completion count (based on created_at as proxy, since we don't store completed_at)
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })
      const count = (tasks || []).filter(t => t.created_at?.startsWith(key)).length
      days.push({ day: label, tasks: count })
    }
    setWeekData(days)

    setHabitData((habits || []).map(h => ({ name: h.name, streak: h.streak })))
    setGoalData((goals || []).map(g => ({ name: g.title, progress: g.progress })))

    setLoading(false)
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>

  const totalTasks = weekData.reduce((a, d) => a + d.tasks, 0)
  const bestStreak = habitData.length ? Math.max(...habitData.map(h => h.streak)) : 0
  const avgGoal = goalData.length ? Math.round(goalData.reduce((a, g) => a + g.progress, 0) / goalData.length) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <SummaryCard label="Tasks created (7d)" value={totalTasks} />
        <SummaryCard label="Best habit streak" value={bestStreak} />
        <SummaryCard label="Average goal progress" value={`${avgGoal}%`} />
      </div>

      <div>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Tasks created this week</p>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="tasks" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {habitData.length > 0 && (
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Habit streaks</p>
          <div style={{ width: '100%', height: Math.max(habitData.length * 40, 100) }}>
            <ResponsiveContainer>
              <BarChart data={habitData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={12} width={90} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="streak" fill="#F0876C" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {goalData.length > 0 && (
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Goal progress</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goalData.map((g, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span>{g.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{g.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${g.progress}%`, height: '100%', background: '#6CC7F0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '16px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700 }}>{value}</p>
    </div>
  )
}

export default Analytics