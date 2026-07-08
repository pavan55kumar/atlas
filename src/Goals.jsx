import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function Goals({ userId }) {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  async function fetchGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setGoals(data)
    setLoading(false)
  }

  async function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return

    const { error } = await supabase
      .from('goals')
      .insert([{ title, target, user_id: userId, progress: 0 }])

    if (!error) {
      setTitle('')
      setTarget('')
      fetchGoals()
    }
  }

  async function updateProgress(goal, delta) {
    const newProgress = Math.min(100, Math.max(0, goal.progress + delta))
    await supabase.from('goals').update({ progress: newProgress }).eq('id', goal.id)
    fetchGoals()
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    fetchGoals()
  }

  const inputStyle = {
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '13px'
  }

  return (
    <div>
      <form onSubmit={addGoal} style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal name..."
          style={{ ...inputStyle, flex: '1 1 100px' }}
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target (e.g. 20 books)"
          style={{ ...inputStyle, flex: '1 1 100px' }}
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
      ) : goals.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No goals set</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map((goal) => (
            <div key={goal.id}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                marginBottom: '4px'
              }}>
                <span>
                  {goal.title} {goal.target && <span style={{ color: 'var(--text-muted)' }}>· {goal.target}</span>}
                </span>
                <span onClick={() => deleteGoal(goal.id)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>✕</span>
              </div>

              {/* Progress bar */}
              <div style={{
                width: '100%',
                height: '6px',
                background: 'var(--bg)',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: `${goal.progress}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{goal.progress}%</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => updateProgress(goal, -10)} style={miniButton}>−</button>
                  <button onClick={() => updateProgress(goal, 10)} style={miniButton}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const miniButton = {
  width: '22px',
  height: '22px',
  borderRadius: '4px',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  cursor: 'pointer',
  fontSize: '13px',
  lineHeight: '1'
}

export default Goals