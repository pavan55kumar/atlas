import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, Plus, Trash2, ShieldAlert, Sparkles, SlidersHorizontal,
  Circle, Clock3, Flame, Target, Zap, ListTodo, AlarmClock, CalendarDays, Flag, TrendingUp, Award
} from 'lucide-react'
import { supabase } from './lib/supabase'

// Premium Theme Adaptive Glassmorphic Stylesheet (Linear & Arc inspired)
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --tasks-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
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
    --aurora-primary: #ffe3d8; /* Peach sphere */
    --aurora-secondary: #dce5ff; /* Soft periwinkle sphere */
    --aurora-tertiary: #eedcff; /* Pale lavender sphere */
    --sparkline-color: #6366f1;
  }

  .tasks-wrapper {
    font-family: var(--tasks-font);
    color: var(--text-primary);
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: 20px 0;
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

  .sphere-tertiary {
    top: 40%;
    left: 40%;
    width: 350px;
    height: 350px;
    background: var(--aurora-tertiary);
  }

  /* --- Hero Header --- */
  .subjects-hero-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 32px 40px;
    margin-bottom: 32px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
  }

  .hero-info-area h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 6px 0;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .hero-info-area p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
  }

  .hero-meta-badges {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .semester-pill {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
  }

  .sgpa-badge-glowing {
    background: linear-gradient(135deg, #ffeaa7 0%, #e1b12c 100%);
    color: #0c0b11;
    font-size: 12px;
    font-weight: 800;
    padding: 6px 16px;
    border-radius: 100px;
    box-shadow: 0 4px 12px rgba(225, 177, 44, 0.3);
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

  /* --- Task Creation Section --- */
  .task-form-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
  }

  .input-group {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  .task-input {
    flex: 1;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 14px;
    padding: 14px 18px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .task-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .task-input:focus {
    outline: none;
    border-color: var(--input-focus-border);
    background: var(--input-bg);
    box-shadow: 0 0 0 3px var(--input-focus-glow);
  }

  .btn-add {
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 14px 24px;
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

  .btn-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--btn-primary-glow);
  }

  /* Selector options */
  .priority-options {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
  }

  .priority-btn {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 100px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .priority-btn.active.high {
    background: rgba(239, 68, 68, 0.12);
    border-color: #ef4444;
    color: #f87171;
  }

  .priority-btn.active.medium {
    background: rgba(124, 58, 237, 0.12);
    border-color: #7c3aed;
    color: #a78bfa;
  }

  .priority-btn.active.low {
    background: rgba(16, 185, 129, 0.12);
    border-color: #10b981;
    color: #34d399;
  }

  /* --- Segmented Filter Navigation --- */
  .filter-tabs-wrapper {
    position: relative;
    display: flex;
    gap: 4px;
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    padding: 4px;
    border-radius: 14px;
    margin-bottom: 24px;
    z-index: 10;
    width: max-content;
  }

  .filter-tab {
    position: relative;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 20px;
    border-radius: 10px;
    transition: color 0.2s ease;
    outline: none;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .filter-tab:hover {
    color: var(--text-primary);
  }

  .filter-tab.active {
    color: var(--text-primary);
  }

  .active-tab-indicator {
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: 4px;
    right: 4px;
    background: var(--glass-bg);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 0;
  }

  .tab-count-badge {
    font-size: 10px;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    padding: 1px 6px;
    border-radius: 6px;
    margin-left: 2px;
  }

  /* --- Subject Display Grid --- */
  .tasks-list-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    z-index: 10;
    position: relative;
  }

  .task-quest-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  .task-quest-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
  }

  .task-quest-card.high-p { border-left: 4px solid #ef4444; }
  .task-quest-card.medium-p { border-left: 4px solid #7c3aed; }
  .task-quest-card.low-p { border-left: 4px solid #10b981; }

  /* Premium Custom Checkbox node */
  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    flex: 1;
    min-width: 0;
  }

  .custom-checkbox-node {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--checkbox-border);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .checkbox-wrapper:hover .custom-checkbox-node {
    border-color: #5c47f5;
  }

  .custom-checkbox-node.checked {
    background-color: #5c47f5;
    border-color: #5c47f5;
    box-shadow: 0 0 10px rgba(92, 71, 245, 0.4);
  }

  .custom-checkbox-node svg {
    color: #ffffff;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .custom-checkbox-node.checked svg {
    opacity: 1;
  }

  .task-quest-title {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    transition: all 0.2s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-quest-title.completed {
    text-decoration: line-through;
    color: var(--text-secondary);
    opacity: 0.6;
  }

  /* Action Buttons */
  .card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .quest-priority-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 4px 10px;
    border-radius: 100px;
    cursor: pointer;
    user-select: none;
    transition: transform 0.2s;
  }

  .quest-priority-badge:hover {
    transform: scale(1.05);
  }

  .quest-priority-badge.badge-high {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .quest-priority-badge.badge-medium {
    background: rgba(124, 58, 237, 0.12);
    color: #a78bfa;
    border: 1px solid rgba(124, 58, 237, 0.2);
  }

  .quest-priority-badge.badge-low {
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  .btn-delete-quest {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-delete-quest:hover {
    background: rgba(239, 68, 68, 0.08);
    color: #f87171;
  }

  /* --- Adaptive Empty State --- */
  .empty-quest-state {
    text-align: center;
    padding: 60px 20px;
    border-radius: 28px;
    border: 1.5px dashed var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
  }

  .empty-state-vector-frame {
    width: 280px;
    height: 180px;
    margin: 0 auto 24px auto;
  }

  /* SVG Adaptive Properties inside styles */
  .empty-svg-sky { fill: var(--input-bg); }
  .empty-svg-accent { fill: #5c47f5; opacity: 0.15; }
  .empty-svg-terrain-back { fill: var(--glass-bg); opacity: 0.8; }
  .empty-svg-terrain-front { fill: var(--glass-bg); }
  .empty-svg-silhouette { fill: var(--text-primary); opacity: 0.9; }
  .empty-svg-stroke { stroke: var(--text-primary); opacity: 0.9; }

  .empty-quest-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 6px;
  }

  .empty-quest-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 340px;
    margin: 0 auto;
    line-height: 1.5;
  }

  /* Responsive media queries */
  @media (max-width: 768px) {
    .stats-carousel-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 12px;
      padding-bottom: 12px;
      margin-bottom: 24px;
      -webkit-overflow-scrolling: touch;
    }
    
    .stats-carousel-grid::-webkit-scrollbar {
      display: none;
    }

    .kpi-card-glass {
      flex: 0 0 82%;
      scroll-snap-align: start;
    }

    .tasks-list-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .task-quest-card {
      min-height: auto;
      padding: 16px;
      border-radius: 14px;
    }

    .task-form-card {
      padding: 16px;
      border-radius: 16px;
    }

    .input-group {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    
    .task-input {
      width: 100% !important;
    }

    .btn-add {
      width: 100% !important;
      justify-content: center;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .stats-carousel-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all') // 'all' | 'active' | 'completed'

  // Responsive device tracking state
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchTasks()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTasks(data)
    setLoading(false)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    const { error } = await supabase
      .from('tasks')
      .insert([{ title, user_id: userId, priority, progress: 0 }])
    if (!error) { 
      setTitle('')
      fetchTasks() 
    }
  }

  // Cyclic priority updating triggered directly on click
  async function cyclePriority(task) {
    const priorities = ['low', 'medium', 'high']
    const nextIndex = (priorities.indexOf(task.priority) + 1) % priorities.length
    const nextPriority = priorities[nextIndex]

    const { error } = await supabase
      .from('tasks')
      .update({ priority: nextPriority })
      .eq('id', task.id)
      
    if (!error) fetchTasks()
  }

  async function toggleDone(task) {
    const newProgress = task.progress === 100 ? 0 : 100
    await supabase.from('tasks').update({ progress: newProgress }).eq('id', task.id)
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  // Filter tasks computed on the fly
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return task.progress !== 100
    if (currentFilter === 'completed') return task.progress === 100
    return true
  })

  const totalTasksCount = tasks.length
  const completedCount = tasks.filter(t => t.progress === 100).length
  const activeCount = totalTasksCount - completedCount
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0

  return (
    <div className="tasks-wrapper">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" style={{ top: '10%', left: '5%' }} />
      <div className="aurora-blur-sphere sphere-secondary" style={{ bottom: '20%', right: '5%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 70%)' }} />

      {/* --- Page Hero Header --- */}
      <motion.div 
        className="subjects-hero-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <div className="hero-info-area">
          <h1>Productivity Workspace</h1>
          <p>Organize objectives, evaluate priority levels, and track active performance.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">Focused Sprint</span>
          {completionRate > 0 && <span className="sgpa-badge-glowing">{completionRate}% Done</span>}
        </div>
      </motion.div>

      {/* --- Top Academic Summary Grid --- */}
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
        {/* KPI: Total Modules */}
        <SummaryCard 
          label="Active Tasks" 
          value={activeCount} 
          icon={<ListTodo size={16} />}
          desc={`${completedCount} tasks accomplished`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
        />
        
        {/* KPI: Total Credits */}
        <SummaryCard 
          label="Completed" 
          value={completedCount} 
          icon={<CheckCircle2 size={16} />}
          desc={`${activeCount} objectives remaining`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
        />

        {/* KPI: SGPA Card with Gold Emblem */}
        <motion.div 
          className="kpi-card-glass"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Completion Rate</span>
            <span className="kpi-icon-wrapper" style={{ color: '#e1b12c' }}>
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: '#e1b12c' }}>
            {completionRate}%
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc">Based on total logged tasks.</span>
            <div className="golden-trophy-badge" style={{ position: 'absolute', width: '28px', height: '28px', bottom: '12px', right: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #ffeaa7 0%, #e1b12c 100%)', boxShadow: '0 4px 12px rgba(225, 177, 44, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} color="#0c0b11" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        {/* KPI: Gradation Completion */}
        <SummaryCard 
          label="Total Objectives" 
          value={totalTasksCount} 
          icon={<Target size={16} />}
          desc="Overall task logs on list"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
        />
      </motion.div>

      {/* --- Task Creation Section --- */}
      <motion.div 
        className="task-form-card"
        initial={{ opacity: 0, y: 15 }}
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
            <motion.button 
              type="submit" 
              className="btn-add"
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Task</span>
            </motion.button>
          </div>
          
          <div className="priority-options">
            <span style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Priority:</span>
            <button 
              type="button" 
              className={`priority-btn ${priority === 'low' ? 'active low' : ''}`}
              onClick={() => setPriority('low')}
            >
              ⚡ Low
            </button>
            <button 
              type="button" 
              className={`priority-btn ${priority === 'medium' ? 'active medium' : ''}`}
              onClick={() => setPriority('medium')}
            >
              🔮 Medium
            </button>
            <button 
              type="button" 
              className={`priority-btn ${priority === 'high' ? 'active high' : ''}`}
              onClick={() => setPriority('high')}
            >
              🔥 High
            </button>
          </div>
        </form>
      </motion.div>

      {/* --- Segmented Filter Navigation --- */}
      <div className="filter-tabs-wrapper">
        <button 
          className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`} 
          onClick={() => setCurrentFilter('all')}
        >
          <span>All Tasks</span>
          <span className="tab-count-badge">{totalTasksCount}</span>
        </button>
        <button 
          className={`filter-tab ${currentFilter === 'active' ? 'active' : ''}`} 
          onClick={() => setCurrentFilter('active')}
        >
          <span>Active</span>
          <span className="tab-count-badge">{activeCount}</span>
        </button>
        <button 
          className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`} 
          onClick={() => setCurrentFilter('completed')}
        >
          <span>Completed</span>
          <span className="tab-count-badge">{completedCount}</span>
        </button>
        
        {/* Animated Background Indicator overlay */}
        <motion.div 
          className="active-tab-indicator"
          layoutId="activeTabIndicator"
          animate={{
            x: currentFilter === 'all' ? 0 : currentFilter === 'active' ? (isMobile ? 104 : 108) : (isMobile ? 186 : 194)
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{ width: currentFilter === 'all' ? (isMobile ? 100 : 104) : currentFilter === 'active' ? (isMobile ? 78 : 82) : (isMobile ? 106 : 110) }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center' }}>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        
        /* Flawless Adaptive SVG Landscape Empty State */
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
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div 
                key={task.id} 
                className={`task-quest-card ${task.priority}-p`}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                whileHover={!isMobile ? { y: -2, transition: { duration: 0.2 } } : {}}
              >
                
                {/* Left Checkbox node */}
                <div className="checkbox-wrapper" onClick={() => toggleDone(task)}>
                  <div className={`custom-checkbox-node ${task.progress === 100 ? 'checked' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className={`task-quest-title ${task.progress === 100 ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="card-actions">
                  <span 
                    onClick={() => cyclePriority(task)}
                    className={`quest-priority-badge badge-${task.priority}`}
                    title="Click to toggle priority"
                  >
                    {task.priority === 'high' ? '🔥 High' : task.priority === 'medium' ? '🔮 Medium' : '⚡ Low'}
                  </span>
                  
                  <button onClick={() => deleteTask(task.id)} className="btn-delete-quest" title="Delete Task">
                    <Trash2 size={15} />
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

export default Tasks;