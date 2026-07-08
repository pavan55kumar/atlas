import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function AIBrief({ userId }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateBrief()
  }, [])

  async function generateBrief() {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const [{ data: tasks }, { data: habits }, { data: events }] = await Promise.all([
      supabase.from('tasks').select('*').neq('progress', 100),
      supabase.from('habits').select('*'),
      supabase.from('calendar_events').select('*').eq('event_date', today)
    ])

    const summary = `
Tasks not done: ${tasks?.map(t => t.title).join(', ') || 'none'}
Habits and streaks: ${habits?.map(h => `${h.name} (streak ${h.streak}, done today: ${h.last_completed === today})`).join('; ') || 'none'}
Today's events: ${events?.map(e => e.title).join(', ') || 'none scheduled'}
    `.trim()

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a concise personal assistant. Given the user\'s tasks, habits, and events for today, write a short, warm, 2-3 sentence daily brief. Mention what to prioritize. No markdown, no headers, just plain sentences.'
            },
            {
              role: 'user',
              content: summary
            }
          ],
          max_tokens: 150
        })
      })

      const data = await res.json()
      const text = data.choices?.[0]?.message?.content
      setBrief(text || 'Could not generate brief.')
    } catch (err) {
      setBrief('⚠️ Error generating brief: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Thinking...</p>
      ) : (
        <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{brief}</p>
      )}
      <button
        onClick={generateBrief}
        disabled={loading}
        style={{
          marginTop: '12px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🔄 Regenerate
      </button>
    </div>
  )
}

export default AIBrief