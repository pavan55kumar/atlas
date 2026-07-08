import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

function AIChat({ userId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Atlas assistant. Ask me about your tasks, habits, goals, or schedule." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function fetchContext() {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: tasks }, { data: habits }, { data: goals }, { data: notes }, { data: events }] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('habits').select('*'),
      supabase.from('goals').select('*'),
      supabase.from('notes').select('title, tag'),
      supabase.from('calendar_events').select('*').gte('event_date', today)
    ])

    return `
Tasks: ${tasks?.map(t => `${t.title} (${t.progress === 100 ? 'done' : 'pending'})`).join(', ') || 'none'}
Habits: ${habits?.map(h => `${h.name} (streak ${h.streak})`).join(', ') || 'none'}
Goals: ${goals?.map(g => `${g.title} — ${g.target || ''} (${g.progress}%)`).join(', ') || 'none'}
Notes: ${notes?.map(n => `${n.title}${n.tag ? ` [${n.tag}]` : ''}`).join(', ') || 'none'}
Upcoming events: ${events?.map(e => `${e.title} on ${e.event_date}${e.event_time ? ' at ' + e.event_time.slice(0,5) : ''}`).join(', ') || 'none'}
    `.trim()
  }

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const context = await fetchContext()

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
              content: `You are Atlas, a helpful personal productivity assistant. You have access to the user's real data below. Answer naturally and conversationally, referencing specific items when relevant. Keep responses concise (2-4 sentences unless asked for detail). You cannot take actions (create/edit/delete) yet — if asked to do so, say you can't yet but can help them think it through.\n\nUser's current data:\n${context}`
            },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 300
        })
      })

      const data = await res.json()
      if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble responding right now. Please try again shortly." }])
      } else {
        const reply = data.choices?.[0]?.message?.content || "I didn't quite catch that — could you rephrase?"
        setMessages([...newMessages, { role: 'assistant', content: reply }])
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Something went wrong reaching the AI. Please try again." }])
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '520px' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              borderRadius: '14px',
              fontSize: '13px',
              lineHeight: '1.5',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
              color: m.role === 'user' ? '#fff' : 'var(--text)'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--surface-2)', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} /> Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your tasks, habits, goals..."
          style={{ ...inputStyle, flex: 1 }}
          disabled={loading}
        />
        <button type="submit" style={{ ...primaryButton, display: 'flex', alignItems: 'center', gap: '6px' }} disabled={loading}>
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

export default AIChat