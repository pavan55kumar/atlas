import { useState } from 'react'
import { Sparkles, BookOpen } from 'lucide-react'
import { supabase } from './lib/supabase'
import { primaryButton, ghostButton } from './styles'

function StudyPlanner({ userId }) {
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [range, setRange] = useState('daily')

  async function generatePlan() {
    setLoading(true)
    setHasRun(true)

    const [{ data: subjects }, { data: assignments }, { data: tasks }] = await Promise.all([
      supabase.from('subjects').select('*'),
      supabase.from('assignments').select('*').eq('completed', false),
      supabase.from('tasks').select('*').neq('progress', 100)
    ])

    const subjectSummary = (subjects || [])
      .map(s => `${s.name} (${s.credits} credits${s.grade_point ? `, current grade point ${s.grade_point}` : ''})`)
      .join(', ') || 'no subjects added'

    const assignmentSummary = (assignments || [])
      .map(a => `${a.title} due ${a.due_date}`)
      .join(', ') || 'none pending'

    const taskSummary = (tasks || []).map(t => t.title).join(', ') || 'none'

    const rangeLabel = range === 'daily' ? 'today' : range === 'weekly' ? 'this week' : 'this month'

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: `You are a study planning assistant. Create a realistic, prioritized study plan for ${rangeLabel} based on the student's subjects, pending assignments, and general tasks. Consider subject credits (higher credits = more weight) and upcoming assignment deadlines (soonest = higher priority). Format as a short numbered list or time-blocked schedule. Keep it concise and practical — no long preamble.`
            },
            {
              role: 'user',
              content: `Subjects: ${subjectSummary}\nPending assignments: ${assignmentSummary}\nOther pending tasks: ${taskSummary}`
            }
          ],
          max_tokens: 350
        })
      })
      const data = await res.json()
      setPlan(data.error ? "Couldn't generate a plan right now — try again shortly." : (data.choices?.[0]?.message?.content || "No plan generated."))
    } catch {
      setPlan("Something went wrong reaching the AI.")
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['daily', 'weekly', 'monthly'].map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={range === r ? primaryButton : ghostButton}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          AI builds a {range} plan from your subjects, assignments, and tasks.
        </p>
        <button
          onClick={generatePlan}
          disabled={loading}
          style={{ ...primaryButton, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={14} />
          {loading ? 'Planning...' : hasRun ? 'Regenerate' : 'Generate Plan'}
        </button>
      </div>

      {!hasRun && (
        <div className="empty-state">
          <BookOpen size={28} />
          <span>Click "Generate Plan" to get an AI-built study schedule</span>
        </div>
      )}

      {hasRun && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: '12px', padding: '18px',
          fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap'
        }}>
          {loading ? 'Analyzing your subjects and deadlines...' : plan}
        </div>
      )}
    </div>
  )
}

export default StudyPlanner