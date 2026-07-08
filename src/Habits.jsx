import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function Habits({ userId }) {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
  }, [])

  async function fetchHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setHabits(data)
    setLoading(false)
  }

  async function addHabit(e) {
    e.preventDefault()
    if (!name.trim()) return

    const { error } = await supabase
      .from('habits')
      .insert([{ name, user_id: userId, streak: 0 }])

    if (!error) {
      setName('')
      fetchHabits()
    }
  }

  async function markDoneToday(habit) {
    const today = new Date().toISOString().split('T')[0]

    if (habit.last_completed === today) return // already done today

    const { error } = await supabase
      .from('habits')
      .update({
        streak: habit.streak + 1,
        last_completed: today
      })
      .eq('id', habit.id)

    if (!error) fetchHabits()
  }

  async function deleteHabit(id) {
    await supabase.from('habits').delete().eq('id', id)
    fetchHabits()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <form onSubmit={addHabit} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a habit..."
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: '13px'
          }}
        />
        <button type="submit" style={{
          padding: '8px 12px',
          borderRadius: '6px',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px'
        }}>
          Add
        </button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : habits.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No habits yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {habits.map((habit) => {
            const doneToday = habit.last_completed === today
            return (
              <div key={habit.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px'
              }}>
                <span
                  onClick={() => markDoneToday(habit)}
                  style={{
                    cursor: doneToday ? 'default' : 'pointer',
                    color: doneToday ? 'var(--accent)' : 'var(--text)'
                  }}
                >
                  {doneToday ? '✅' : '⬜'} {habit.name} — 🔥 {habit.streak}
                </span>
                <span
                  onClick={() => deleteHabit(habit.id)}
                  style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  ✕
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Habits