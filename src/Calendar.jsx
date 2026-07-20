import { useEffect, useState, memo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Clock3, Sparkles, Brain, CircleCheck,
  CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './Calendar.css'

const ease = [0.22, 1, 0.36, 1]

function getWeekDates(anchor) {
  const start = new Date(anchor)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
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
  const [shiftDirection, setShiftDirection] = useState(1)

  const [isMobile, setIsMobile] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [composerRipples, setComposerRipples] = useState([])
  const [fabRipples, setFabRipples] = useState([])

  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    fetchEvents()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
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
      .insert([{ title, user_id: userId, event_date: date, event_time: time || null }])
    if (!error) {
      setTitle('')
      setDate('')
      setTime('')
      setIsMobileDrawerOpen(false)
      fetchEvents()
    }
  }

  async function deleteEvent(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    fetchEvents()
  }

  function spawnRipple(e, setter) {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now() + Math.random()
    setter((prev) => [...prev, { id, x, y, size }])
    setTimeout(() => {
      setter((prev) => prev.filter((r) => r.id !== id))
    }, 650)
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
    setShiftDirection(delta)
    setWeekAnchor(d)
    setSelectedDay(null)
  }

  function handleDayKeyDown(e, key, isSelected) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedDay(isSelected ? null : key)
    }
  }

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : []

  const todayEventsCount = eventsByDate[today]?.length || 0
  const upcomingCount = events.filter(ev => new Date(ev.event_date) >= new Date()).length
  const completedEventsCount = events.filter(ev => new Date(ev.event_date) < new Date()).length
  const totalEventsThisMonth = events.length
  const monthProgressRate = totalEventsThisMonth > 0
    ? Math.round((completedEventsCount / totalEventsThisMonth) * 100)
    : 0

  const motionOK = !prefersReducedMotion

  function renderEventList(list, emptyTitle, emptySub, tag) {
    if (list.length === 0) {
      return (
        <div className="empty-events-banner">
          <div className="empty-icon-badge"><Clock3 size={18} /></div>
          <span className="empty-banner-title">{emptyTitle}</span>
          {emptySub && <p className="empty-banner-sub">{emptySub}</p>}
          <button
            type="button"
            className="btn-empty-add"
            onClick={() => (isMobile ? setIsMobileDrawerOpen(true) : document.querySelector('.composer-input.title')?.focus())}
          >
            <Plus size={14} /> Add event
          </button>
        </div>
      )
    }
    return list.map((ev, index) => (
      <div className="timeline-event-wrapper" key={ev.id}>
        <div className="timeline-time-col">
          {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
        </div>
        <div className="timeline-rail-col">
          <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} />
        </div>
        <div className="event-card-tactile">
          <div className="event-card-text">
            <h4 className="event-title-main">{ev.title}</h4>
            <div className="event-meta-info">
              <span className="meta-tag">{tag}</span>
              <span>·</span>
              <span>Active timeline</span>
            </div>
          </div>
          <button onClick={() => deleteEvent(ev.id)} className="btn-delete-event" aria-label={`Delete ${ev.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ))
  }

  return (
    <div className="calendar-dashboard">
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="aurora-blur-sphere sphere-tertiary" />
      <div className="calendar-noise-overlay" aria-hidden="true" />

      {/* --- Double Pane Dashboard Panel Layout --- */}
      <div className="calendar-dashboard-layout">

        <div className="left-pane">

          {/* --- KPI Summary Grid --- */}
          <div className="stats-carousel-grid">
            <SummaryCard
              label="Today's Events"
              value={todayEventsCount}
              icon={<CalendarClock size={15} />}
              desc="Due within 24 hours"
              sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
              accent="#f59e0b"
            />
            <SummaryCard
              label="Upcoming"
              value={upcomingCount}
              icon={<Clock3 size={15} />}
              desc="Scheduled events"
              sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
              accent="#60a5fa"
            />
            <SummaryCard
              label="Focus Score"
              value="9.2"
              icon={<Brain size={15} />}
              desc="Target: 9.5 scale"
              sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
              accent="#8b5cf6"
            />
            <SummaryCard
              label="Accomplished"
              value={completedEventsCount}
              icon={<CircleCheck size={15} />}
              desc="Finished logs"
              sparklinePath="M0,4 C10,12 20,2 30,8 C40,14 50,2 60,15"
              accent="#10b981"
            />
          </div>

          {/* Calendar weekly ribbon navigation */}
          <div className="calendar-nav-card">
            <div className="calendar-nav-header">
              <AnimatePresence mode="wait">
                <motion.span
                  key={weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  className="active-month-text"
                  initial={motionOK ? { opacity: 0, y: -6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={motionOK ? { opacity: 0, y: 6 } : {}}
                  transition={{ duration: motionOK ? 0.25 : 0, ease }}
                >
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </motion.span>
              </AnimatePresence>
              <div className="nav-controls-box">
                <motion.button
                  onClick={() => shiftWeek(-1)}
                  className="btn-nav-arrow"
                  aria-label="Previous week"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  onClick={() => shiftWeek(1)}
                  className="btn-nav-arrow"
                  aria-label="Next week"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={weekDates[0].toISOString().split('T')[0]}
                className="week-days-ribbon"
                initial={motionOK ? { opacity: 0, x: shiftDirection > 0 ? 26 : -26 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={motionOK ? { opacity: 0, x: shiftDirection > 0 ? -26 : 26 } : {}}
                transition={{ duration: motionOK ? 0.3 : 0, ease }}
              >
                {weekDates.map(d => {
                  const key = d.toISOString().split('T')[0]
                  const isToday = key === today
                  const dayEvents = eventsByDate[key] || []
                  const isSelected = selectedDay === key
                  return (
                    <motion.div
                      key={key}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      onKeyDown={(e) => handleDayKeyDown(e, key, isSelected)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (isToday ? ' (today)' : '')}
                      className={`day-ribbon-card ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                      animate={{ y: isSelected ? -3 : 0, scale: isSelected ? 1.03 : 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="day-label-text">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="day-number-text">{d.getDate()}</span>
                      {isToday && <div className="today-glow-dot" />}
                      {dayEvents.length > 0 && !isToday && (
                        <div style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: isSelected ? '#ffffff' : 'var(--accent-purple-light)',
                        }} />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive selected day / today's timeline */}
          <div className="timeline-container">
            <h3 style={{ fontSize: 'clamp(14px, 3.2vw, 15px)', fontWeight: 700, margin: '0 0 var(--space-sm) 0' }}>
              {selectedDay ? (
                new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              ) : (
                "Today's Timeline"
              )}
            </h3>

            <div className="timeline-axis">
              {selectedDay
                ? renderEventList(selectedEvents, 'Nothing Scheduled', 'You have no events allocated for this day.', 'Course module')
                : renderEventList(eventsByDate[today] || [], 'No Events Scheduled Today', null, 'Today')}
            </div>
          </div>

        </div>

        {/* Right Pane: Event composer & AI Suggestions */}
        <div className="right-pane">

          {!isMobile && (
            <div className="composer-card-glass">
              <h3 className="composer-title">Create Schedule Node</h3>
              <form onSubmit={addEvent} className="composer-form">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  className="composer-input title"
                  aria-label="Event title"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="composer-input date-picker"
                  aria-label="Event date"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="composer-input time-picker"
                  aria-label="Event time"
                />
                <motion.button
                  type="submit"
                  className="btn-composer-add"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  onPointerDown={(e) => spawnRipple(e, setComposerRipples)}
                >
                  <span className="btn-composer-content">
                    <Plus size={16} />
                    <span>Add Event</span>
                  </span>
                  <span className="btn-ripple-layer">
                    {composerRipples.map((r) => (
                      <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
                    ))}
                  </span>
                </motion.button>
              </form>
            </div>
          )}

          {/* AI Insights & suggestions */}
          <div className="ai-assistant-card">
            <h3 style={{ fontSize: 'clamp(14px, 3.2vw, 15px)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="ai-sparkle-icon"><Sparkles size={16} color="var(--accent-amber)" /></span>
              <span>Atlas AI Suggestions</span>
            </h3>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" style={{ background: 'var(--accent-amber)', boxShadow: '0 0 6px rgba(245, 158, 11, 0.45)' }} />
              <div>
                You have <strong>3 hours free</strong> in your afternoon slot. Schedule a focus session?
              </div>
            </motion.div>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" style={{ background: 'var(--accent-red)', boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)' }} />
              <div>
                Assignment due tomorrow. Ensure preparation notes are reviewed.
              </div>
            </motion.div>
          </div>

          {/* Radial progress card */}
          <div className="month-radial-card">
            <div className="month-radial-text">
              <h3>Month Completion</h3>
              <p>Based on overall metrics.</p>
            </div>

            <div className="radial-progress-wrap">
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.path
                  fill="none"
                  stroke="url(#gradientRing)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: monthProgressRate / 100 }}
                  transition={{ duration: motionOK ? 1.2 : 0, ease }}
                />
                <defs>
                  <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radial-progress-label">
                {monthProgressRate}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Floating Action Drawer */}
      {isMobile && (
        <>
          <motion.button
            className="mobile-floating-add-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            onPointerDown={(e) => spawnRipple(e, setFabRipples)}
            aria-label="Add event"
            animate={{ y: scrolled ? -3 : 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <Plus size={24} strokeWidth={2.5} style={{ position: 'relative', zIndex: 3 }} />
            <span className="btn-ripple-layer">
              {fabRipples.map((r) => (
                <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
              ))}
            </span>
          </motion.button>

          <AnimatePresence>
            {isMobileDrawerOpen && (
              <motion.div
                className="mobile-drawer-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ flex: 1 }} onClick={() => setIsMobileDrawerOpen(false)} />

                <motion.div
                  className="mobile-drawer-body"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                >
                  <h3 className="composer-title" style={{ margin: 0 }}>Add Event Node</h3>

                  <form onSubmit={addEvent} className="composer-form">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Event title..."
                      className="composer-input"
                      aria-label="Event title"
                    />
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="composer-input"
                        style={{ flex: 1, minWidth: 0 }}
                        aria-label="Event date"
                      />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="composer-input"
                        style={{ flex: 1, minWidth: 0 }}
                        aria-label="Event time"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="composer-input"
                        style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-composer-add" style={{ flex: 2, justifyContent: 'center' }}>
                        <span className="btn-composer-content" style={{ justifyContent: 'center', width: '100%' }}>Add Event</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  )
}

const SummaryCard = memo(function SummaryCard({ label, value, icon, desc, sparklinePath, accent }) {
  const gradId = 'cal-spark-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const accentColor = accent || '#8b5cf6'
  
  return (
    <div className="kpi-card-glass" tabIndex={0}>
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper" style={{ background: accentColor + '22', color: accentColor }}>{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        <svg viewBox="0 0 60 20" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d={sparklinePath}
            stroke={`url(#${gradId})`}
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
})

export default CalendarWidget