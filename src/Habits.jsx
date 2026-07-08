import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, deleteX } from './styles'

function Habits({ userId }) {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState({}) // { habit_id: Set of 'YYYY-MM-DD' }
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchHabits() }, [])

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
    ;(logsData || []).forEach(l => {
      if (!map[l.habit_id]) map[l.habit_id] = new Set()
      map[l.habit_id].add(l.completed_date)
    })
    setLogs(map)
    setLoading(false)
  }

  async function addHabit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const { error } = await supabase
      .from('habits')
      .insert([{ name, user_id: userId, streak: 0 }])
    if (!error) { setName(''); fetchHabits() }
  }

  async function markDoneToday(habit) {
    const today = new Date().toISOString().split('T')[0]
    if (habit.last_completed === today) return

    await supabase.from('habits')
      .update({ streak: habit.streak + 1, last_completed: today })
      .eq('id', habit.id)

    await supabase.from('habit_logs')
      .insert([{ habit_id: habit.id, user_id: userId, completed_date: today }])

    fetchHabits()
  }

  async function deleteHabit(id) {
    await supabase.from('habits').delete().eq('id', id)
    await supabase.from('habit_logs').delete().eq('habit_id', id)
    fetchHabits()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <form onSubmit={addHabit} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a habit..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : habits.length === 0 ? (
        <div className="empty-state"><Flame size={28} /><span>No habits tracked yet</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {habits.map((habit) => {
            const doneToday = habit.last_completed === today
            const habitLogs = logs[habit.id] || new Set()
            return (
              <div key={habit.id} style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span
                    onClick={() => markDoneToday(habit)}
                    style={{
                      cursor: doneToday ? 'default' : 'pointer',
                      fontSize: '13px',
                      color: doneToday ? 'var(--accent)' : 'var(--text)'
                    }}
                  >
                    {doneToday ? '✅' : '⬜'} {habit.name} — 🔥 {habit.streak}
                  </span>
                  <span onClick={() => deleteHabit(habit.id)} style={deleteX}>✕</span>
                </div>
                <Heatmap completedDates={habitLogs} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Heatmap({ completedDates }) {
  // Build last 14 weeks (98 days) grid, 7 rows (days) x 14 cols (weeks)
  const totalDays = 98
  const cells = []
  const today = new Date()

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    cells.push({ date: key, done: completedDates.has(key) })
  }

  // Group into columns of 7 (weeks), reading top-to-bottom then left-to-right
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div style={{ display: 'flex', gap: '3px', overflowX: 'auto', paddingBottom: '2px' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {week.map((cell, ci) => (
            <div
              key={ci}
              title={cell.date}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: cell.done ? 'var(--accent)' : 'var(--border)',
                opacity: cell.done ? 1 : 0.5
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Habits