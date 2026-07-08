import { useState } from 'react'
import { Sparkles, ListOrdered } from 'lucide-react'
import { supabase } from './lib/supabase'
import { primaryButton } from './styles'

function AISchedule() {
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  async function generateSchedule() {
    setLoading(true)
    setHasRun(true)

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .neq('progress', 100)
      .order('created_at', { ascending: true })

    if (!tasks || tasks.length === 0) {
      setSuggestion("You have no pending tasks right now — nothing to schedule!")
      setLoading(false)
      return
    }

    const taskList = tasks.map(t => `- ${t.title} (priority: ${t.priority || 'unset'})`).join('\n')

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
              content: 'You are a productivity assistant. Given a list of pending tasks, suggest a sensible order to tackle them today, with a brief one-line reason for the top 1-2 picks. Format as a numbered list. Keep it concise — no more than 6 lines total.'
            },
            { role: 'user', content: `Here are my pending tasks:\n${taskList}` }
          ],
          max_tokens: 250
        })
      })
      const data = await res.json()
      if (data.error) {
        setSuggestion("Couldn't generate a schedule right now — try again shortly.")
      } else {
        setSuggestion(data.choices?.[0]?.message?.content || "Couldn't generate a schedule.")
      }
    } catch {
      setSuggestion("Something went wrong reaching the AI. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Let AI suggest the best order to tackle today's pending tasks.
        </p>
        <button
          onClick={generateSchedule}
          disabled={loading}
          style={{ ...primaryButton, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={14} />
          {loading ? 'Thinking...' : hasRun ? 'Regenerate' : 'Generate Schedule'}
        </button>
      </div>

      {!hasRun && (
        <div className="empty-state">
          <ListOrdered size={28} />
          <span>Click "Generate Schedule" to get an AI-suggested task order</span>
        </div>
      )}

      {hasRun && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: '12px', padding: '16px',
          fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap'
        }}>
          {loading ? 'Analyzing your tasks...' : suggestion}
        </div>
      )}
    </div>
  )
}

export default AISchedule