import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Plus, Trash2, Sparkles,
  Flame, Target, Zap, ListTodo, Flag, TrendingUp, CalendarDays
} from 'lucide-react'
import { supabase } from './lib/supabase'
// NEW
import { scheduleTaskReminder, cancelTaskReminder } from './notifications'
import './Tasks.css'

const ease = [0.22, 1, 0.36, 1]

const PRIORITY_META = {
  low: { label: 'Low', color: '#10b981', Icon: Zap },
  medium: { label: 'Medium', color: '#f59e0b', Icon: Flag },
  high: { label: 'High', color: '#ef4444', Icon: Flame }
}

// Simple in-memory cache scoped by userId to prevent refetches on navigation
const taskCache = {}

function Tasks({ userId }) {
  const [tasks, setTasks] = useState(taskCache[userId] || [])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  // NEW: due date, optional
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(!taskCache[userId])
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [isHoverable, setIsHoverable] = useState(false)
  const [ripples, setRipples] = useState([])

  // track pending ripple-removal timeouts so they can be cleared on unmount.
  const rippleTimeoutsRef = useRef(new Set())

  const fetchTasks = useCallback(async () => {
    // If we have cache, don't show loading state, just refresh silently
    if (!taskCache[userId]) setLoading(true)

    const { data, error } = await supabase
      .from('tasks')
      // CHANGED: added due_date to the selected columns
      .select('id, title, user_id, priority, progress, created_at, due_date')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      taskCache[userId] = data
      setTasks(data)
    }
    setLoading(false)
    setInitialLoaded(true)
  }, [userId])

  useEffect(() => {
    // Detect hover capability once to disable hover animations on touch devices
    setIsHoverable(window.matchMedia('(hover: hover)').matches)
    fetchTasks()
  }, [fetchTasks])

  // clear any pending ripple timeouts when the component unmounts
  useEffect(() => {
    return () => {
      rippleTimeoutsRef.current.forEach((id) => clearTimeout(id))
      rippleTimeoutsRef.current.clear()
    }
  }, [])

  const addTask = useCallback(async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const tempId = `temp-${Date.now()}`
    const newTask = {
      id: tempId,
      title,
      user_id: userId,
      priority,
      progress: 0,
      created_at: new Date().toISOString(),
      // NEW
      due_date: dueDate || null
    }

    // Optimistic update
    setTasks(prev => [newTask, ...prev])
    setTitle('')
    setDueDate('')

    const { data, error } = await supabase
      .from('tasks')
      // CHANGED: include due_date on insert
      .insert([{ title, user_id: userId, priority, progress: 0, due_date: newTask.due_date }])
      .select()

    if (!error && data) {
      // Reconcile with actual DB ID
      setTasks(prev => prev.map(t => t.id === tempId ? data[0] : t))
      taskCache[userId] = taskCache[userId] ? [data[0], ...taskCache[userId]] : [data[0]]
      // NEW: schedule the reminder now that we have the real DB id
      scheduleTaskReminder(data[0])
    } else {
      // Rollback on failure
      setTasks(prev => prev.filter(t => t.id !== tempId))
      console.error('Failed to add task:', error)
    }
  }, [title, priority, dueDate, userId])

  const cyclePriority = useCallback(async (task) => {
    const priorities = ['low', 'medium', 'high']
    const nextIndex = (priorities.indexOf(task.priority) + 1) % priorities.length
    const nextPriority = priorities[nextIndex]

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: nextPriority } : t))

    const { error } = await supabase
      .from('tasks')
      .update({ priority: nextPriority })
      .eq('id', task.id)

    if (error) {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, priority: task.priority } : t))
      console.error('Failed to update priority:', error)
    } else if (taskCache[userId]) {
      const idx = taskCache[userId].findIndex(t => t.id === task.id)
      if (idx !== -1) taskCache[userId][idx].priority = nextPriority
    }
  }, [userId])

  const toggleDone = useCallback(async (task) => {
    const newProgress = task.progress === 100 ? 0 : 100

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: newProgress } : t))

    const { error } = await supabase
      .from('tasks')
      .update({ progress: newProgress })
      .eq('id', task.id)

    if (error) {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, progress: task.progress } : t))
      console.error('Failed to toggle task:', error)
    } else if (taskCache[userId]) {
      const idx = taskCache[userId].findIndex(t => t.id === task.id)
      if (idx !== -1) taskCache[userId][idx].progress = newProgress
      // NEW: completed -> cancel reminder; un-completed -> reschedule it
      scheduleTaskReminder({ ...task, progress: newProgress })
    }
  }, [userId])

  const deleteTask = useCallback(async (id) => {
    const oldTask = tasks.find(t => t.id === id)

    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== id))

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      // Rollback on failure
      if (oldTask) setTasks(prev => [oldTask, ...prev])
      console.error('Failed to delete task:', error)
    } else if (taskCache[userId]) {
      taskCache[userId] = taskCache[userId].filter(t => t.id !== id)
      // NEW
      cancelTaskReminder(id)
    }
  }, [tasks, userId])

  const spawnRipple = useCallback((e) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now() + Math.random()
    setRipples(prev => [...prev, { id, x, y, size }])

    // store the timeout id so it can be cancelled on unmount
    const timeoutId = setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id))
      rippleTimeoutsRef.current.delete(timeoutId)
    }, 650)
    rippleTimeoutsRef.current.add(timeoutId)
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (currentFilter === 'active') return task.progress !== 100
      if (currentFilter === 'completed') return task.progress === 100
      return true
    })
  }, [tasks, currentFilter])

  const stats = useMemo(() => {
    const totalTasksCount = tasks.length
    const completedCount = tasks.filter(t => t.progress === 100).length
    const activeCount = totalTasksCount - completedCount
    const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0
    return { totalTasksCount, completedCount, activeCount, completionRate }
  }, [tasks])

  const isLoadingInitial = loading && !tasks.length

  return (
    <div className="tasks-wrapper" style={{ touchAction: 'pan-y' }}>
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="tasks-noise-overlay" aria-hidden="true" />

      {/* 1. Productivity Workspace Hero Card */}
      <motion.div
        className="subjects-hero-header"
        initial={initialLoaded ? false : { opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      >
        <div className="hero-info-area">
          <div className="workspace-console-tag">
            <div className="workspace-console-dot" />
            <span>Workspace Console</span>
          </div>
          <h1>Productivity Workspace</h1>
          <p>Organize objectives, evaluate priority levels, and track active performance.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">Focused Sprint</span>
          {stats.completionRate > 0 && <span className="sgpa-badge-glowing">{stats.completionRate}% Done</span>}
        </div>
        <div className="hero-visual-stack">
          <div className="visual-card-element visual-card-element-1" />
          <div className="visual-card-element visual-card-element-2" />
          <div className="visual-card-element visual-card-element-3" />
        </div>
      </motion.div>

      {/* 2. Statistics Carousel */}
      <div className="stats-carousel-grid">
        <SummaryCard
          label="Active Tasks"
          value={stats.activeCount}
          icon={<ListTodo size={15} />}
          desc={`${stats.completedCount} accomplished`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
          accent="#60a5fa"
          isLoading={isLoadingInitial}
          initialLoaded={initialLoaded}
          isHoverable={isHoverable}
        />

        <SummaryCard
          label="Completed"
          value={stats.completedCount}
          icon={<CheckCircle2 size={15} />}
          desc={`${stats.activeCount} remaining`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
          accent="#10b981"
          isLoading={isLoadingInitial}
          initialLoaded={initialLoaded}
          isHoverable={isHoverable}
        />

        <motion.div
          className="kpi-card-glass"
          initial={initialLoaded ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
          whileHover={isHoverable ? { y: -4, transition: { duration: 0.25 } } : undefined}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Completion Rate</span>
            <span className="kpi-icon-wrapper" style={{ background: 'rgba(225, 177, 44, 0.16)', color: 'var(--accent-gold)' }}>
              <TrendingUp size={14} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: 'var(--accent-gold)', opacity: isLoadingInitial ? 0 : 1 }}>
            {stats.completionRate}%
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc" style={{ opacity: isLoadingInitial ? 0 : 1 }}>Overall performance metrics.</span>
            <div className="golden-trophy-badge" style={{ position: 'absolute', width: '26px', height: '26px', bottom: '12px', right: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #ffe9a8 0%, #e1b12c 100%)', boxShadow: '0 4px 10px rgba(225, 177, 44, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#0c0b11" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        <SummaryCard
          label="Total Objectives"
          value={stats.totalTasksCount}
          icon={<Target size={15} />}
          desc="Overall logged tasks"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
          accent="#8b5cf6"
          isLoading={isLoadingInitial}
          initialLoaded={initialLoaded}
          isHoverable={isHoverable}
        />
      </div>

      {/* 2b. Swipe indicator dots (mobile) */}
      <div className="carousel-pager-dots">
        <span className="pager-dot active" />
        <span className="pager-dot" />
        <span className="pager-dot" />
        <span className="pager-dot" />
      </div>

      {/* 3. Add Task Section */}
      <motion.div
        className="task-form-card"
        initial={initialLoaded ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80 }}
      >
        <form onSubmit={addTask}>
          <div className="input-group">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="task-input"
            />
            {/* NEW: optional due-date picker. Reuses .task-input's existing
                style so it doesn't introduce new visual language. */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="task-input"
              style={{ flex: '0 0 150px', cursor: 'pointer' }}
              aria-label="Due date (optional)"
            />
            <motion.button
              type="submit"
              className="btn-add"
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              onPointerDown={spawnRipple}
            >
              <span className="btn-add-content">
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Task</span>
              </span>
              <span className="btn-ripple-layer">
                {ripples.map((r) => (
                  <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
                ))}
              </span>
            </motion.button>
          </div>

          <div className="priority-options">
            <span className="priority-label">Priority</span>
            <div className="priority-segment">
              {['low', 'medium', 'high'].map((p) => {
                const meta = PRIORITY_META[p]
                const Icon = meta.Icon
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${isActive ? 'active ' + p : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    <span className="priority-dot" style={{ background: meta.color }} />
                    <Icon size={13} strokeWidth={2.25} />
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </motion.div>

      {/* 4. Filter Tabs */}
      <div className="filter-tabs-wrapper">
        <button className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>
          {currentFilter === 'all' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">All Tasks</span>
          <span className="tab-count-badge">{stats.totalTasksCount}</span>
        </button>
        <button className={`filter-tab ${currentFilter === 'active' ? 'active' : ''}`} onClick={() => setCurrentFilter('active')}>
          {currentFilter === 'active' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">Active</span>
          <span className="tab-count-badge">{stats.activeCount}</span>
        </button>
        <button className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`} onClick={() => setCurrentFilter('completed')}>
          {currentFilter === 'completed' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">Completed</span>
          <span className="tab-count-badge">{stats.completedCount}</span>
        </button>
      </div>

      {/* 5. Tasks List / Empty State */}
      {isLoadingInitial ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-quest-state">
          <svg className="empty-state-vector-frame" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="180" rx="16" className="empty-svg-sky" />
            <circle cx="150" cy="90" r="50" className="empty-svg-accent" />
            <g transform="translate(142, 60)">
              <line x1="8" y1="10" x2="8" y2="40" className="empty-svg-stroke" strokeWidth="2" />
              <path d="M5,15 Q8,8 11,15 Z" className="empty-svg-silhouette" />
              <circle cx="8" cy="11" r="2.5" className="empty-svg-silhouette" />
              <path d="M-10,35 Q8,42 26,35 Z" className="empty-svg-silhouette" />
            </g>
            <path d="M -20 180 Q 80 130 180 155 T 320 140 L 320 180 Z" className="empty-svg-terrain-back" />
            <path d="M -10 180 Q 90 145 150 162 T 310 150 L 310 180 Z" className="empty-svg-terrain-front" />
            <g transform="translate(40, 105) scale(0.6)">
              <line x1="20" y1="80" x2="20" y2="20" className="empty-svg-stroke" strokeWidth="3" />
              <line x1="20" y1="50" x2="5" y2="35" className="empty-svg-stroke" strokeWidth="2" />
              <line x1="20" y1="35" x2="35" y2="20" className="empty-svg-stroke" strokeWidth="2" />
            </g>
            <g transform="translate(240, 115) scale(0.5)">
              <line x1="20" y1="80" x2="20" y2="20" className="empty-svg-stroke" strokeWidth="3" />
              <line x1="20" y1="45" x2="32" y2="30" className="empty-svg-stroke" strokeWidth="2" />
            </g>
          </svg>
          <h4 className="empty-quest-title">Your task list is clear</h4>
          <p className="empty-quest-subtitle">
            No pending tasks. Add a new task above to get started!
          </p>
        </div>
      ) : (
        <motion.div
          className="tasks-list-grid"
          initial={initialLoaded ? false : "hidden"}
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                className={`task-quest-card ${task.priority}-p`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                whileHover={isHoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
                whileTap={{ scale: 0.99 }}
              >
                <div className="checkbox-wrapper" onClick={() => toggleDone(task)}>
                  <div className={`custom-checkbox-node ${task.progress === 100 ? 'checked' : ''}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className={`task-quest-title ${task.progress === 100 ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                </div>

                <div className="card-actions">
                  {/* NEW: small due-date chip, only rendered when a due date exists. */}
                  {task.due_date && (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)',
                        border: '1px solid var(--glass-border)', padding: '5px 9px',
                        borderRadius: '100px', whiteSpace: 'nowrap'
                      }}
                    >
                      <CalendarDays size={11} />
                      {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <PriorityBadge priority={task.priority} onClick={() => cyclePriority(task)} />
                  <button onClick={() => deleteTask(task.id)} className="btn-delete-quest" title="Delete Task">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

const PriorityBadge = memo(function PriorityBadge({ priority, onClick }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium
  const Icon = meta.Icon
  return (
    <span onClick={onClick} className={`quest-priority-badge badge-${priority}`} title="Click to toggle priority">
      <span className="badge-dot" style={{ background: meta.color }} />
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
    </span>
  )
})

const SummaryCard = memo(function SummaryCard({ label, value, icon, desc, sparklinePath, accent, isLoading, initialLoaded, isHoverable }) {
  const gradId = 'spark-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const accentColor = accent || '#8b5cf6'
  return (
    <motion.div
      className="kpi-card-glass"
      initial={initialLoaded ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0, transition: { type: 'spring' } }}
      whileHover={isHoverable ? { y: -4, transition: { duration: 0.25 } } : undefined}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper" style={{ background: accentColor + '22', color: accentColor }}>{icon}</span>
      </div>
      <div className="kpi-main-metric" style={{ opacity: isLoading ? 0 : 1 }}>{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc" style={{ opacity: isLoading ? 0 : 1 }}>{desc}</span>
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            d={sparklinePath}
            stroke={`url(#${gradId})`}
            strokeWidth="1.75"
            strokeLinecap="round"
            initial={initialLoaded ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.25 }}
          />
        </svg>
      </div>
    </motion.div>
  )
})

export default Tasks