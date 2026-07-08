import { useEffect, useState, useCallback } from 'react'
import { Search, CheckCircle2, Flame, Target, FileText, Calendar } from 'lucide-react'
import { supabase } from './lib/supabase'

const iconMap = {
  tasks: CheckCircle2,
  habits: Flame,
  goals: Target,
  notes: FileText,
  calendar: Calendar
}

function SearchModal({ userId, onNavigate, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)

    const [tasks, habits, goals, notes, events] = await Promise.all([
      supabase.from('tasks').select('id, title').ilike('title', `%${q}%`).limit(4),
      supabase.from('habits').select('id, name').ilike('name', `%${q}%`).limit(4),
      supabase.from('goals').select('id, title').ilike('title', `%${q}%`).limit(4),
      supabase.from('notes').select('id, title').ilike('title', `%${q}%`).limit(4),
      supabase.from('calendar_events').select('id, title').ilike('title', `%${q}%`).limit(4)
    ])

    const combined = [
      ...(tasks.data || []).map(t => ({ page: 'tasks', label: t.title })),
      ...(habits.data || []).map(h => ({ page: 'habits', label: h.name })),
      ...(goals.data || []).map(g => ({ page: 'goals', label: g.title })),
      ...(notes.data || []).map(n => ({ page: 'notes', label: n.title })),
      ...(events.data || []).map(e => ({ page: 'calendar', label: e.title }))
    ]
    setResults(combined)
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, runSearch])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh', zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px', maxWidth: '90vw', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: '16px',
          boxShadow: 'var(--card-shadow)', overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, habits, goals, notes, events..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '5px' }}>
            Esc
          </span>
        </div>

        <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
          {loading && <p style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-muted)' }}>Searching...</p>}

          {!loading && query && results.length === 0 && (
            <p style={{ padding: '16px 18px', fontSize: '13px', color: 'var(--text-muted)' }}>No results found</p>
          )}

          {!loading && results.map((r, i) => {
            const Icon = iconMap[r.page]
            return (
              <div
                key={i}
                onClick={() => { onNavigate(r.page); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 18px', cursor: 'pointer', fontSize: '13px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon size={15} color="var(--text-muted)" />
                <span>{r.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {r.page}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SearchModal