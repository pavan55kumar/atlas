import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton, deleteX } from './styles'

function getWeekDates(anchor) {
  const start = new Date(anchor)
  const day = start.getDay()
  start.setDate(start.getDate() - day) // back up to Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function CalendarWidget({ userId }) {
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [weekAnchor, setWeekAnchor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => { fetchEvents() }, [])

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
      .insert([{ title, user_id: userId, event_date: date, event_time: time || null }])
    if (!error) { setTitle(''); setDate(''); setTime(''); fetchEvents() }
  }

  async function deleteEvent(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    fetchEvents()
  }

  const today = new Date().toISOString().split('T')[0]
  const weekDates = getWeekDates(weekAnchor)
  const eventsByDate = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.event_date]) eventsByDate[ev.event_date] = []
    eventsByDate[ev.event_date].push(ev)
  })

  function shiftWeek(delta) {
    const d = new Date(weekAnchor)
    d.setDate(d.getDate() + delta * 7)
    setWeekAnchor(d)
    setSelectedDay(null)
  }

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : []

  return (
    <div>
      <form onSubmit={addEvent} style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title..."
          style={{ ...inputStyle, flex: '1 1 100px' }}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle} />
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={() => shiftWeek(-1)} style={{ ...ghostButton, padding: '8px' }}><ChevronLeft size={15} /></button>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>
          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button onClick={() => shiftWeek(1)} style={{ ...ghostButton, padding: '8px' }}><ChevronRight size={15} /></button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {weekDates.map(d => {
              const key = d.toISOString().split('T')[0]
              const isToday = key === today
              const dayEvents = eventsByDate[key] || []
              const isSelected = selectedDay === key
              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  style={{
                    borderRadius: '10px',
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent)' : isToday ? 'var(--surface-2)' : 'transparent',
                    border: isToday && !isSelected ? '1px solid var(--accent)' : '1px solid var(--border)'
                  }}
                >
                  <p style={{
                    fontSize: '10px',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                    marginBottom: '4px'
                  }}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: isSelected ? '#fff' : 'var(--text)'
                  }}>
                    {d.getDate()}
                  </p>
                  {dayEvents.length > 0 && (
                    <div style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: isSelected ? '#fff' : 'var(--accent)',
                      margin: '4px auto 0'
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {selectedDay ? (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
              </p>
              {selectedEvents.length === 0 ? (
                <div className="empty-state"><Clock size={24} /><span>Nothing scheduled this day</span></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEvents.map(ev => <EventRow key={ev.id} ev={ev} onDelete={deleteEvent} />)}
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Click a day to see its events
            </p>
          )}
        </>
      )}
    </div>
  )
}

function EventRow({ ev, onDelete }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '13px', padding: '8px 10px', borderRadius: '8px', background: 'var(--surface-2)'
    }}>
      <span>{ev.title} {ev.event_time && <span style={{ color: 'var(--text-muted)' }}>· {ev.event_time.slice(0,5)}</span>}</span>
      <span onClick={() => onDelete(ev.id)} style={deleteX}>✕</span>
    </div>
  )
}

export default CalendarWidget