import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, miniButton, deleteX } from './styles'

function Goals({ userId }) {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGoals() }, [])

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
    if (!error) { setTitle(''); setTarget(''); fetchGoals() }
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

  return (
    <div>
      <form onSubmit={addGoal} style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
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
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : goals.length === 0 ? (
        <div className="empty-state"><Target size={28} /><span>Set your first goal to start tracking progress</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {goals.map((goal) => (
            <div key={goal.id} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px' }}>
                <span>{goal.title} {goal.target && <span style={{ color: 'var(--text-muted)' }}>· {goal.target}</span>}</span>
                <span onClick={() => deleteGoal(goal.id)} style={deleteX}>✕</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ width: `${goal.progress}%`, height: '100%', background: 'var(--goals-color)', transition: 'width 0.3s ease' }} />
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

export default Goals