import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CalendarDays, Clock3, AlarmClock, Sparkles, Brain, Target, CircleCheck, 
  Flame, Bell, Coffee, BookOpen, GraduationCap, CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2 
} from 'lucide-react'
import { supabase } from './lib/supabase'

// Premium Theme Adaptive Glassmorphic Stylesheet
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Handcrafted Dark Theme Colors (Linear/Arc style) */
    --canvas-bg: #090810;
    --glass-bg: rgba(18, 16, 30, 0.65);
    --glass-border: rgba(255, 255, 255, 0.05);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%);
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.6);
    --input-border: rgba(255, 255, 255, 0.06);
    --input-focus-border: #8b5cf6;
    --input-focus-glow: rgba(139, 92, 246, 0.25);
    
    /* Gradients matching your dark mockup */
    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.4);
    --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    /* Ambient sphere tints */
    --aurora-primary: rgba(139, 92, 246, 0.12);
    --aurora-secondary: rgba(236, 72, 153, 0.08);
    --aurora-tertiary: rgba(59, 130, 246, 0.08);
    --sparkline-color: #8b5cf6;
  }

  /* Handcrafted Light Theme Colors (Apple Settings / Notion style) */
  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f8fafc;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-glow: linear-gradient(135deg, rgba(92, 71, 245, 0.15) 0%, rgba(224, 83, 93, 0.15) 100%);
    --text-primary: #1e1b4b;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.75);
    --input-border: rgba(15, 23, 42, 0.08);
    --input-focus-border: #6366f1;
    --input-focus-glow: rgba(99, 102, 241, 0.15);
    
    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-glow: rgba(99, 102, 241, 0.2);
    --card-shadow: 0 15px 35px rgba(31, 38, 135, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    
    /* Light Theme soft pastel gradients */
    --aurora-primary: #ffe3d8;
    --aurora-secondary: #dce5ff;
    --aurora-tertiary: #eedcff;
    --sparkline-color: #6366f1;
  }

  /* Global browser reset for touch selection highlights */
  * {
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
  }

  .calendar-dashboard {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: 20px 12px;
    box-sizing: border-box;
    
    /* Disables zoom/pinch gestures and horizontal wiggle */
    touch-action: pan-y;
    overflow-x: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  /* --- Glowing Backdrop Aurora Spheres --- */
  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
    transition: background 0.5s ease;
  }

  .sphere-primary {
    top: 5%;
    left: -10%;
    width: 450px;
    height: 450px;
    background: var(--aurora-primary);
  }

  .sphere-secondary {
    bottom: 10%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: var(--aurora-secondary);
  }

  /* --- KPI Summary Grid --- */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    z-index: 10;
    position: relative;
  }

  .kpi-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 20px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }

  .kpi-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .kpi-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .kpi-icon-wrapper {
    color: var(--text-secondary);
    opacity: 0.8;
  }

  .kpi-main-metric {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 6px;
  }

  .kpi-desc-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .kpi-desc {
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 500;
    max-width: 60%;
  }

  /* --- Main workspace double pane layout --- */
  .calendar-dashboard-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 24px;
    z-index: 10;
    position: relative;
  }

  .left-pane {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .right-pane {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* --- Premium Event Creator Card --- */
  .composer-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .composer-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 16px 0;
    letter-spacing: -0.01em;
  }

  .composer-form {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    width: 100%;
  }

  .composer-input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text-primary); /* Corrected from undefined var */
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  }

  .composer-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .composer-input:focus {
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 3px var(--input-focus-glow);
  }

  .composer-input.title {
    flex: 2;
    min-width: 200px;
  }

  .composer-input.date-picker {
    width: 160px;
    cursor: pointer;
  }

  .composer-input.time-picker {
    width: 120px;
    cursor: pointer;
  }

  .btn-composer-add {
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 16px var(--btn-primary-glow);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .btn-composer-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--btn-primary-glow);
  }

  /* --- Premium Weekly Ribbon Layout --- */
  .calendar-nav-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .calendar-nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .active-month-text {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .nav-controls-box {
    display: flex;
    gap: 8px;
  }

  .btn-nav-arrow {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    width: 38px;
    height: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-nav-arrow:hover {
    background: var(--glass-border);
    transform: translateY(-1px);
  }

  .week-days-ribbon {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
  }

  .day-ribbon-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .day-ribbon-card:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .day-ribbon-card.is-selected {
    background: var(--btn-primary-bg);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px var(--btn-primary-glow);
  }

  .day-label-text {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .day-number-text {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .day-ribbon-card.is-selected .day-label-text,
  .day-ribbon-card.is-selected .day-number-text {
    color: #ffffff;
  }

  /* Current day glowing bullet */
  .today-glow-dot {
    width: 6px;
    height: 6px;
    background-color: #ffd166;
    border-radius: 50%;
    box-shadow: 0 0 10px #ffd166;
    position: absolute;
    bottom: 8px;
  }

  /* --- Timeline & Event Feed --- */
  .timeline-container {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .timeline-axis {
    position: relative;
    padding-left: 28px;
    margin-top: 16px;
  }

  .timeline-axis::before {
    content: '';
    position: absolute;
    top: 6px;
    bottom: 6px;
    left: 7px;
    width: 2px;
    background: var(--glass-border);
  }

  .timeline-node-dot {
    position: absolute;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
    border: 2px solid var(--canvas-bg);
    box-shadow: 0 0 0 3px var(--glass-border);
    z-index: 2;
  }

  .timeline-node-dot.active {
    background: #ff737b;
    box-shadow: 0 0 10px rgba(255, 115, 123, 0.4), 0 0 0 3px rgba(255, 115, 123, 0.2);
  }

  .timeline-event-wrapper {
    position: relative;
    margin-bottom: 24px;
  }

  .timeline-event-wrapper:last-child {
    margin-bottom: 0;
  }

  .timeline-time-col {
    font-size: 11px;
    font-weight: 800;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }

  .event-card-tactile {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .event-card-tactile:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
    background: rgba(255, 255, 255, 0.04);
  }

  .event-title-main {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 4px 0;
  }

  .event-meta-info {
    font-size: 11px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .meta-tag {
    background: var(--input-bg);
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 600;
  }

  .btn-delete-event {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-delete-event:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #ff737b;
  }

  /* --- Interactive Side Panels (AI, Progress) --- */
  .ai-assistant-card {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);
    border: 1px solid var(--glass-border-glow);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }

  .ai-suggestion-box {
    background: rgba(22, 21, 34, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: 14px;
    padding: 14px;
    margin-top: 14px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .ai-suggestion-box > div {
    min-width: 0;
    word-wrap: break-word;
  }

  .suggestion-bullet {
    width: 6px;
    height: 6px;
    background: #ffd166;
    border-radius: 50%;
    margin-top: 6px;
    box-shadow: 0 0 8px #ffd166;
    flex-shrink: 0;
  }

  .month-radial-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* --- Empty State --- */
  .empty-events-banner {
    text-align: center;
    padding: 40px 20px;
    border-radius: 20px;
    border: 1px dashed var(--glass-border);
    background: rgba(255, 255, 255, 0.01);
  }

  .empty-banner-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 12px 0 4px 0;
  }

  /* =========================================================================
     MOBILE DIRECTIVE LAYOUT - FIXED OVERLAPS, CLIPPING & SPACING
     ========================================================================= */
  @media (max-width: 768px) {
    .calendar-dashboard {
      /* Dynamic bottom padding lets screen scroll past Floating Action Button */
      padding-bottom: 120px !important; 
    }

    /* Elegant, balanced 2x2 grid to show all KPIs cleanly */
    .stats-carousel-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .kpi-card-glass {
      min-height: 95px;
      padding: 14px;
      border-radius: 16px;
    }

    .kpi-main-metric {
      font-size: 22px;
      margin-bottom: 2px;
    }

    .kpi-label {
      font-size: 9px;
    }

    .kpi-desc {
      font-size: 9px;
      max-width: 100%;
    }

    .calendar-dashboard-layout {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* Fixed 7-day ribbon grid so Saturday is never cut off */
    .week-days-ribbon {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .day-ribbon-card {
      padding: 10px 4px;
      border-radius: 12px;
      gap: 4px;
    }

    .day-label-text {
      font-size: 9px;
    }

    .day-number-text {
      font-size: 15px;
    }

    .today-glow-dot {
      width: 4px;
      height: 4px;
      bottom: 4px;
    }

    /* Collapse standard composer on mobile */
    .composer-card-glass {
      display: none; 
    }

    .month-radial-card {
      padding: 18px 20px;
    }

    .mobile-floating-add-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--btn-primary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 8px 24px var(--btn-primary-glow);
      z-index: 99;
      cursor: pointer;
      border: none;
    }

    .mobile-drawer-sheet {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(9, 8, 16, 0.85);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .mobile-drawer-body {
      background: var(--glass-bg);
      border-top: 1px solid var(--glass-border);
      border-radius: 30px 30px 0 0;
      padding: 30px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .composer-form {
      flex-direction: column;
      align-items: stretch;
    }

    .composer-input {
      width: 100% !important;
    }

    .btn-composer-add {
      width: 100%;
      justify-content: center;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .calendar-dashboard-layout {
      grid-template-columns: 1fr;
    }
    .stats-carousel-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

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

  // Mobile layout state handlers
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
      setIsMobileDrawerOpen(false) // Collapse mobile drawer upon success
      fetchEvents() 
    }
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

  // Precomputed analytics for stats panels
  const todayEventsCount = eventsByDate[today]?.length || 0
  const upcomingCount = events.filter(ev => new Date(ev.event_date) >= new Date()).length
  const completedEventsCount = events.filter(ev => new Date(ev.event_date) < new Date()).length
  const totalEventsThisMonth = events.length
  const monthProgressRate = totalEventsThisMonth > 0 
    ? Math.round((completedEventsCount / totalEventsThisMonth) * 100) 
    : 0

  return (
    <div className="calendar-dashboard">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />

      {/* --- KPI Summary Grid --- */}
      <motion.div 
        className="stats-carousel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        <SummaryCard 
          label="Today's Events" 
          value={todayEventsCount} 
          icon={<CalendarClock size={16} />}
          desc="Due within 24 hours"
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
        />
        <SummaryCard 
          label="Upcoming" 
          value={upcomingCount} 
          icon={<Clock3 size={16} />}
          desc="Scheduled events"
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
        />
        <SummaryCard 
          label="Focus Score" 
          value="9.2" 
          icon={<Brain size={16} />}
          desc="Target: 9.5 scale"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
        />
        <SummaryCard 
          label="Accomplished" 
          value={completedEventsCount} 
          icon={<CircleCheck size={16} />}
          desc="Finished logs"
          sparklinePath="M0,4 C10,12 20,2 30,8 C40,14 50,2 60,15"
        />
      </motion.div>

      {/* --- Double Pane Dashboard Panel Layout --- */}
      <div className="calendar-dashboard-layout">
        
        {/* Left Pane: Interactive Calendar weekly timeline */}
        <div className="left-pane">
          
          {/* Calendar weekly ribbon navigation */}
          <div className="calendar-nav-card">
            <div className="calendar-nav-header">
              <span className="active-month-text">
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <div className="nav-controls-box">
                <button onClick={() => shiftWeek(-1)} className="btn-nav-arrow"><ChevronLeft size={16} /></button>
                <button onClick={() => shiftWeek(1)} className="btn-nav-arrow"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="week-days-ribbon">
              {weekDates.map(d => {
                const key = d.toISOString().split('T')[0]
                const isToday = key === today
                const dayEvents = eventsByDate[key] || []
                const isSelected = selectedDay === key
                return (
                  <motion.div
                    key={key}
                    onClick={() => setSelectedDay(isSelected ? null : key)}
                    className={`day-ribbon-card ${isSelected ? 'is-selected' : ''}`}
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
                        background: isSelected ? '#ffffff' : '#ff737b',
                        marginTop: '4px'
                      }} />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Interactive selected day timeline view */}
          <div className="timeline-container">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0' }}>
              {selectedDay ? (
                new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              ) : (
                "Today's Timeline"
              )}
            </h3>

            <div className="timeline-axis">
              {selectedDay ? (
                selectedEvents.length === 0 ? (
                  <div className="empty-events-banner">
                    <Clock3 size={24} color="var(--text-tertiary)" style={{ margin: '0 auto 8px auto' }} />
                    <span className="empty-banner-title">Nothing Scheduled</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>You have no events allocated for this day.</p>
                  </div>
                ) : (
                  selectedEvents.map((ev, index) => (
                    <div className="timeline-event-wrapper" key={ev.id}>
                      <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} />
                      <div className="timeline-time-col">
                        {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
                      </div>
                      <div className="event-card-tactile">
                        <div>
                          <h4 className="event-title-main">{ev.title}</h4>
                          <div className="event-meta-info">
                            <span className="meta-tag">Course module</span>
                            <span>·</span>
                            <span>Active timeline</span>
                          </div>
                        </div>
                        <button onClick={() => deleteEvent(ev.id)} className="btn-delete-event">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Default Today View if no specific day is selected */
                (eventsByDate[today] || []).length === 0 ? (
                  <div className="empty-events-banner">
                    <Clock3 size={24} color="var(--text-tertiary)" style={{ margin: '0 auto 8px auto' }} />
                    <span className="empty-banner-title">No Events Scheduled Today</span>
                  </div>
                ) : (
                  (eventsByDate[today] || []).map((ev, index) => (
                    <div className="timeline-event-wrapper" key={ev.id}>
                      <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} />
                      <div className="timeline-time-col">
                        {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
                      </div>
                      <div className="event-card-tactile">
                        <div>
                          <h4 className="event-title-main">{ev.title}</h4>
                          <div className="event-meta-info">
                            <span className="meta-tag">Today</span>
                            <span>·</span>
                            <span>Active timeline</span>
                          </div>
                        </div>
                        <button onClick={() => deleteEvent(ev.id)} className="btn-delete-event">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>

        {/* Right Pane: Event creator composer & AI Suggestions */}
        <div className="right-pane">
          
          {/* Desktop-only Event Composer Form panel */}
          {!isMobile && (
            <div className="composer-card-glass">
              <h3 className="composer-title">Create Schedule Node</h3>
              <form onSubmit={addEvent} className="composer-form">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  className="composer-input title"
                />
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="composer-input date-picker" 
                />
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="composer-input time-picker" 
                />
                <button type="submit" className="btn-composer-add">
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </form>
            </div>
          )}

          {/* AI Insights & suggestions */}
          <div className="ai-assistant-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#e1b12c" />
              <span>Atlas AI Suggestions</span>
            </h3>
            
            <div className="ai-suggestion-box">
              <div className="suggestion-bullet" />
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                You have <strong>3 hours free</strong> in your afternoon slot. Schedule a focus session?
              </div>
            </div>

            <div className="ai-suggestion-box">
              <div className="suggestion-bullet" style={{ backgroundColor: '#ff737b', boxShadow: '0 0 8px #ff737b' }} />
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                Assignment due tomorrow. Ensure preparation notes are reviewed.
              </div>
            </div>
          </div>

          {/* Radial progress card */}
          <div className="month-radial-card">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0' }}>Month Completion</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Based on overall metrics.</p>
            </div>
            
            {/* SVG radial ring progress */}
            <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
              <svg width="60" height="60" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                <path fill="none" stroke="url(#gradientRing)" strokeWidth="3.5" strokeDasharray={`${monthProgressRate}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <defs>
                  <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ff737b" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '11px', fontWeight: 800 }}>
                {monthProgressRate}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* =========================================================================
         MOBILE NATIVE FLOATING ACTION DRAWER SYSTEM
         ========================================================================= */}
      {isMobile && (
        <>
          <button 
            className="mobile-floating-add-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>

          <AnimatePresence>
            {isMobileDrawerOpen && (
              <motion.div 
                className="mobile-drawer-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop closer */}
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
                    />
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        className="composer-input"
                        style={{ flex: 1 }}
                      />
                      <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        className="composer-input"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="composer-input" 
                        style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'none' }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-composer-add" style={{ flex: 2, justifyContent: 'center' }}>
                        Add Event
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

function SummaryCard({ label, value, icon, desc, sparklinePath }) {
  return (
    <motion.div 
      className="kpi-card-glass"
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper">{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        
        {/* Soft glowing vector micro-sparkline */}
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ opacity: 0.7 }}>
          <path d={sparklinePath} stroke="var(--sparkline-color)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}

export default CalendarWidget;