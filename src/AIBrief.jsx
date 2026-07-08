import { useEffect, useState } from 'react'
import { ghostButton } from './styles'
import { supabase } from './lib/supabase'

function AIBrief({ userId }) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { generateBrief() }, [])

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
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: 'You are a concise personal assistant. Given the user\'s tasks, habits, and events for today, write a short, warm, 2-3 sentence daily brief. Mention what to prioritize. No markdown, no headers, just plain sentences.' },
            { role: 'user', content: summary }
          ],
          max_tokens: 150
        })
      })
      const data = await res.json()

      if (data.error) {
        console.error('Groq error:', data.error)
        setBrief("Your daily brief isn't available right now. Check your AI key in Settings.")
      } else {
        setBrief(data.choices?.[0]?.message?.content || "Nothing to report yet — add a task or habit to get started.")
      }
    } catch (err) {
      console.error('AI Brief fetch failed:', err)
      setBrief("Your daily brief isn't available right now — try again shortly.")
    }
    setLoading(false)
  }

  return (
    <div>
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Thinking...</p>
      ) : (
        <p style={{ fontSize: '15px', lineHeight: '1.6' }}>{brief}</p>
      )}
      <button onClick={generateBrief} disabled={loading} style={{ ...ghostButton, marginTop: '14px', fontSize: '12px', padding: '7px 14px' }}>
        Regenerate
      </button>
    </div>
  )
}

export default AIBrief