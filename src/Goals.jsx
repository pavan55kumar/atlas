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

  // --- Premium UI Style Objects ---
  const formStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    width: '100%',
  }

  const customInputStyle = {
    ...inputStyle,
    flex: '1 1 180px',
    backgroundColor: 'var(--surface-1, rgba(255, 255, 255, 0.03))',
    border: '1px solid var(--border-color, rgba(128, 128, 128, 0.15))',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-main, inherit)',
    transition: 'all 0.2s ease',
    outline: 'none',
  }

  const customPrimaryButtonStyle = {
    ...primaryButton,
    background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.1s ease, opacity 0.2s ease',
    boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)',
  }

  const cardStyle = {
    background: 'var(--surface-2, rgba(255, 255, 255, 0.05))',
    border: '1px solid var(--border-color, rgba(128, 128, 128, 0.12))',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  }

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  }

  const goalTitleContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  }

  const goalTitleStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-main, inherit)',
    letterSpacing: '-0.01em',
  }

  const targetBadgeStyle = {
    fontSize: '11px',
    fontWeight: '500',
    background: 'var(--surface-3, rgba(128, 128, 128, 0.1))',
    color: 'var(--text-muted, #8a8a93)',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(128, 128, 128, 0.1)',
  }

  const customDeleteStyle = {
    ...deleteX,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    color: 'var(--text-muted, #8a8a93)',
    fontSize: '12px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
  }

  const progressTrackStyle = {
    width: '100%',
    height: '8px',
    background: 'var(--bg, rgba(0, 0, 0, 0.25))',
    borderRadius: '999px',
    overflow: 'hidden',
    position: 'relative',
  }

  const progressFillStyle = {
    height: '100%',
    background: 'var(--goals-color, linear-gradient(90deg, #8B5CF6, #EC4899))',
    borderRadius: '999px',
    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  }

  const cardFooterStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const percentStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--goals-color, #8B5CF6)',
  }

  const controlGroupStyle = {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  }

  const customMiniButtonStyle = {
    ...miniButton,
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color, rgba(128, 128, 128, 0.15))',
    backgroundColor: 'var(--surface-3, rgba(255, 255, 255, 0.04))',
    color: 'var(--text-main, inherit)',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    padding: 0,
    lineHeight: 1,
  }

  const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '40px 24px',
    borderRadius: '16px',
    border: '1px dashed var(--border-color, rgba(128, 128, 128, 0.2))',
    backgroundColor: 'var(--surface-1, rgba(255, 255, 255, 0.01))',
    color: 'var(--text-muted, #8a8a93)',
    textAlign: 'center',
  }

  return (
    <div>
      {/* Search and Creation Form */}
      <form onSubmit={addGoal} style={formStyle}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal name..."
          style={customInputStyle}
        />
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target (e.g. 20 books)"
          style={customInputStyle}
        />
        <button type="submit" style={customPrimaryButtonStyle}>
          Add
        </button>
      </form>

      {/* Main content list */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>
          Loading...
        </p>
      ) : goals.length === 0 ? (
        <div style={emptyStateStyle}>
          <Target size={32} style={{ opacity: 0.8 }} />
          <span style={{ fontSize: '13px', fontWeight: '500' }}>
            Set your first goal to start tracking progress
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map((goal) => (
            <div key={goal.id} style={cardStyle} className="goal-card">
              
              {/* Header: Title and Delete Option */}
              <div style={cardHeaderStyle}>
                <div style={goalTitleContainer}>
                  <span style={goalTitleStyle}>{goal.title}</span>
                  {goal.target && (
                    <span style={targetBadgeStyle}>{goal.target}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => deleteGoal(goal.id)}
                  style={customDeleteStyle}
                  title="Delete goal"
                >
                  ✕
                </button>
              </div>

              {/* Progress Track */}
              <div style={progressTrackStyle}>
                <div style={{ ...progressFillStyle, width: `${goal.progress}%` }} />
              </div>

              {/* Controls & Percentage display */}
              <div style={cardFooterStyle}>
                <span style={percentStyle}>{goal.progress}% completed</span>
                <div style={controlGroupStyle}>
                  <button
                    type="button"
                    onClick={() => updateProgress(goal, -10)}
                    style={customMiniButtonStyle}
                    title="Decrease progress"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProgress(goal, 10)}
                    style={customMiniButtonStyle}
                    title="Increase progress"
                  >
                    +
                  </button>
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