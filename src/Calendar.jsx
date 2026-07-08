import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function CalendarWidget({ userId }) {
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })

    if (!error) setEvents(data)
    setLoading(false)
  }

  async function addEvent(e) {
    e.preventDefault()
    if (!title.trim() || !date) return

    const { error } = await supabase
      .from('calendar_events')
      .insert([{
        title,
        user_id: userId,
        event_date: date,
        event_time: time || null
      }])

    if (!error) {
      setTitle('')
      setDate('')
      setTime('')
      fetchEvents()
    }
  }

  async function deleteEvent(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    fetchEvents()
  }

  const today = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(ev => ev.event_date === today)
  const upcomingEvents = events.filter(ev => ev.event_date > today)

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
      <form onSubmit={addEvent} style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          style={{ ...inputStyle, flex: '1 1 100px' }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={inputStyle}
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
      ) : events.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nothing scheduled</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {todayEvents.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>TODAY</p>
              {todayEvents.map(ev => (
                <EventRow key={ev.id} ev={ev} onDelete={deleteEvent} />
              ))}
            </div>
          )}
          {upcomingEvents.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>UPCOMING</p>
              {upcomingEvents.map(ev => (
                <EventRow key={ev.id} ev={ev} onDelete={deleteEvent} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventRow({ ev, onDelete }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '13px',
      marginBottom: '4px'
    }}>
      <span>
        {ev.title} {ev.event_time && <span style={{ color: 'var(--text-muted)' }}>· {ev.event_time.slice(0,5)}</span>}
      </span>
      <span onClick={() => onDelete(ev.id)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>✕</span>
    </div>
  )
}

export default CalendarWidget