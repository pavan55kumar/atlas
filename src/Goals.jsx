import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, miniButton, deleteX } from './styles'

/* ─────────────────────────────────────────────────────────────────────────
 * GOAL LOGIC HELPERS
 * ---------------------------------------------------------------------
 * The old implementation treated "progress" as an arbitrary 0-100 number
 * that the user nudged with +10 / -10 buttons. That has no relationship
 * to what the goal actually means ("read 20 books", "run 100 km", etc).
 *
 * The new model tracks real quantities:
 *   target_value  -> the numeric goal (e.g. 20)
 *   unit          -> the unit of measure (e.g. "books")
 *   current_value -> how far the user actually is (e.g. 8)
 *   progress      -> DERIVED value, always = (current / target) * 100,
 *                    clamped to [0, 100]. Never stored as a "source of
 *                    truth" that can drift from current/target.
 *   status        -> 'in_progress' | 'completed'
 *   completed_at  -> timestamp set the moment current_value reaches target
 *
 * Suggested DB migration (run once against Supabase, safe/no-op if the
 * columns already exist):
 *
 *   alter table goals add column if not exists target_value numeric;
 *   alter table goals add column if not exists current_value numeric default 0;
 *   alter table goals add column if not exists unit text;
 *   alter table goals add column if not exists status text default 'in_progress';
 *   alter table goals add column if not exists completed_at timestamptz;
 *
 * The code below is written to work BOTH before and after that migration
 * has been applied, so nothing breaks for existing data or environments
 * that haven't run it yet (see the try/fallback blocks in addGoal and
 * updateCurrentValue, and normalizeGoal() below).
 * ────────────────────────────────────────────────────────────────────── */

// Splits a free-text target like "20 books" into { targetValue, unit }.
// Falls back gracefully if the user only typed a number, or only typed
// a word with no number.
function parseTargetInput(input) {
  if (!input) return { targetValue: 0, unit: '' }
  const trimmed = String(input).trim()
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*(.*)$/)
  if (match) {
    const targetValue = parseFloat(match[1])
    const unit = match[2].trim()
    return { targetValue: isNaN(targetValue) ? 0 : targetValue, unit }
  }
  // No leading number found (e.g. user typed "books") - keep it as the
  // unit/label and leave target_value at 0 rather than guessing.
  return { targetValue: 0, unit: trimmed }
}

// Rebuilds the human-readable "target" string used for display, so the
// UI badge looks exactly the same as before ("20 books").
function formatTargetDisplay(targetValue, unit) {
  if (!targetValue && !unit) return ''
  return unit ? `${targetValue} ${unit}` : `${targetValue}`
}

// Single source of truth for turning (current, target) into a clamped
// 0-100 percentage. Rounded for clean display.
function computeProgress(currentValue, targetValue) {
  if (!targetValue || targetValue <= 0) return 0
  const pct = (currentValue / targetValue) * 100
  return Math.min(100, Math.max(0, Math.round(pct)))
}

// Normalizes a row coming back from Supabase into the shape the UI
// expects, regardless of whether it's a fresh row (new schema) or an
// older row that only ever had { target, progress }.
function normalizeGoal(raw) {
  const hasNewSchema = raw.target_value !== undefined && raw.target_value !== null

  if (hasNewSchema) {
    const targetValue = Number(raw.target_value) || 0
    const currentValue = Number(raw.current_value) || 0
    const unit = raw.unit || ''
    const progress = computeProgress(currentValue, targetValue)
    const isComplete = targetValue > 0 && currentValue >= targetValue

    return {
      ...raw,
      target_value: targetValue,
      current_value: currentValue,
      unit,
      progress,
      status: raw.status || (isComplete ? 'completed' : 'in_progress'),
      completed_at: raw.completed_at || null,
      target: raw.target || formatTargetDisplay(targetValue, unit),
    }
  }

  // Legacy row: only has `target` (free text) and a manually-set
  // `progress` percentage. Reconstruct the best-guess current_value so
  // the goal keeps working under the new logic without losing data.
  const { targetValue, unit } = parseTargetInput(raw.target)
  const legacyProgress = Number(raw.progress) || 0
  const currentValue = targetValue > 0 ? Math.round((legacyProgress / 100) * targetValue) : 0
  const progress = computeProgress(currentValue, targetValue)
  const isComplete = targetValue > 0 && currentValue >= targetValue

  return {
    ...raw,
    target_value: targetValue,
    current_value: currentValue,
    unit,
    progress,
    status: isComplete ? 'completed' : 'in_progress',
    completed_at: raw.completed_at || null,
    target: raw.target,
  }
}

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
    if (!error) setGoals((data || []).map(normalizeGoal))
    setLoading(false)
  }

  async function addGoal(e) {
    e.preventDefault()
    if (!title.trim()) return

    // Split "20 books" -> target_value: 20, unit: "books"
    const { targetValue, unit } = parseTargetInput(target)

    const newGoalPayload = {
      title,
      target,             // kept as-is for backward-compatible display
      target_value: targetValue,
      current_value: 0,
      unit,
      progress: 0,
      status: 'in_progress',
      user_id: userId,
    }

    let { data, error } = await supabase
      .from('goals')
      .insert([newGoalPayload])
      .select()

    if (error) {
      // The richer columns may not exist yet on this environment - fall
      // back to the original minimal schema so goal creation never breaks.
      const legacyPayload = { title, target, user_id: userId, progress: 0 }
      const fallback = await supabase.from('goals').insert([legacyPayload]).select()
      data = fallback.data
      error = fallback.error
    }

    if (!error && data && data[0]) {
      setTitle('')
      setTarget('')
      // Update local state directly instead of refetching everything.
      setGoals((prev) => [normalizeGoal(data[0]), ...prev])
    }
  }

  // Increments/decrements the goal's real current_value (not a raw
  // percentage). Progress, status, and completed_at are all derived
  // from this single change.
  async function updateCurrentValue(goal, delta) {
    // Once a goal is completed, block further increments. Decrements are
    // still allowed, since that's how a completion gets intentionally undone.
    if (goal.status === 'completed' && delta > 0) return

    const targetValue = goal.target_value || 0
    let newCurrentValue = (goal.current_value || 0) + delta

    // Never go negative, and never exceed the target.
    if (newCurrentValue < 0) newCurrentValue = 0
    if (targetValue > 0 && newCurrentValue > targetValue) newCurrentValue = targetValue

    const newProgress = computeProgress(newCurrentValue, targetValue)
    const isComplete = targetValue > 0 && newCurrentValue >= targetValue
    const newStatus = isComplete ? 'completed' : 'in_progress'
    // Reaching the target stamps completed_at; dropping back below it
    // (an intentional "undo") clears that timestamp again.
    const newCompletedAt = isComplete
      ? (goal.completed_at || new Date().toISOString())
      : null

    const updatePayload = {
      current_value: newCurrentValue,
      progress: newProgress,
      status: newStatus,
      completed_at: newCompletedAt,
    }

    const { error } = await supabase.from('goals').update(updatePayload).eq('id', goal.id)

    if (error) {
      // Fallback for environments still on the legacy schema, where only
      // `progress` exists.
      await supabase.from('goals').update({ progress: newProgress }).eq('id', goal.id)
    }

    // Update local state immediately - avoids an extra round-trip fetch.
    setGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, ...updatePayload } : g))
    )
  }

  async function deleteGoal(id) {
    await supabase.from('goals').delete().eq('id', id)
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  // --- Premium UI Style Objects (unchanged) ---
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
                    onClick={() => updateCurrentValue(goal, -1)}
                    style={customMiniButtonStyle}
                    title="Decrease progress"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentValue(goal, 1)}
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