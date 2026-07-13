import { useEffect, useState } from 'react'
import { CheckCircle2, Plus, Trash2, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react'
import { supabase } from './lib/supabase'

// Premium adaptive styles supporting flawless automatic Dark/Light theme transitions
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  /* Semantic Variables - Automatically switches colors based on active theme class */
  :root {
    --tasks-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --card-bg: #161522;
    --card-border: rgba(255, 255, 255, 0.05);
    --text-main: #ffffff;
    --text-sub: #8e8c9d;
    --input-bg: #1b1928;
    --input-text: #ffffff;
    --metric-bg: rgba(22, 21, 34, 0.6);
    --tab-active-bg: rgba(255, 255, 255, 0.06);
    --checkbox-border: rgba(255, 255, 255, 0.2);
    --list-hover-bg: rgba(27, 25, 42, 0.85);
    --empty-dashed-border: rgba(255, 255, 255, 0.08);
  }

  /* Target standard light mode container hooks */
  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --card-bg: #ffffff;
    --card-border: rgba(15, 23, 42, 0.08);
    --text-main: #0f172a;
    --text-sub: #64748b;
    --input-bg: #f8fafc;
    --input-text: #0f172a;
    --metric-bg: rgba(241, 245, 249, 0.9);
    --tab-active-bg: rgba(15, 23, 42, 0.06);
    --checkbox-border: rgba(15, 23, 42, 0.2);
    --list-hover-bg: rgba(241, 245, 249, 0.7);
    --empty-dashed-border: rgba(15, 23, 42, 0.12);
  }

  .tasks-wrapper {
    font-family: var(--tasks-font);
    color: var(--text-main);
    max-width: 900px;
    margin: 0 auto;
  }

  /* Header overview metrics grid */
  .metrics-grid {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-card {
    flex: 1;
    background: var(--metric-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .metric-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-main);
  }

  /* Form and controls styling */
  .task-form-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .input-group {
    display: flex;
    gap: 10px;
  }

  .task-input {
    flex: 1;
    background: var(--input-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 14px 18px;
    color: var(--input-text);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.25s ease;
  }

  .task-input::placeholder {
    color: var(--text-sub);
    opacity: 0.7;
  }

  .task-input:focus {
    outline: none;
    border-color: #5c47f5;
    background: var(--card-bg);
    box-shadow: 0 0 0 3px rgba(92, 71, 245, 0.2);
  }

  .btn-add {
    background: linear-gradient(135deg, #7c3aed 0%, #5c47f5 100%);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(92, 71, 245, 0.3);
  }

  .btn-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(92, 71, 245, 0.45);
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
    border: 1px solid var(--card-border);
    color: var(--text-sub);
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

  /* Filter navigation tabs */
  .filter-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 1px solid var(--card-border);
    padding-bottom: 14px;
    margin-bottom: 20px;
  }

  .filter-tab {
    background: none;
    border: none;
    color: var(--text-sub);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 16px;
    border-radius: 100px;
    transition: all 0.2s ease;
  }

  .filter-tab:hover {
    color: var(--text-main);
  }

  .filter-tab.active {
    background: var(--tab-active-bg);
    color: var(--text-main);
  }

  /* Cards List Grid */
  .tasks-list-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .task-quest-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .task-quest-card:hover {
    transform: translateY(-2px);
    border-color: var(--card-border);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
    background: var(--list-hover-bg);
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
    color: var(--text-main);
    transition: all 0.2s ease;
  }

  .task-quest-title.completed {
    text-decoration: line-through;
    color: var(--text-sub);
    opacity: 0.7;
  }

  /* Action Buttons */
  .card-actions {
    display: flex;
    align-items: center;
    gap: 12px;
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
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.15);
  }

  .quest-priority-badge.badge-medium {
    background: rgba(124, 58, 237, 0.1);
    color: #7c3aed;
    border: 1px solid rgba(124, 58, 237, 0.15);
  }

  .quest-priority-badge.badge-low {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.15);
  }

  .btn-delete-quest {
    background: none;
    border: none;
    color: var(--text-sub);
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
    color: #ef4444;
  }

  /* --- Adaptive Empty State Styling --- */
  .empty-quest-state {
    text-align: center;
    padding: 40px 20px;
    border-radius: 24px;
    border: 1px dashed var(--empty-dashed-border);
    background: var(--metric-bg);
    margin-top: 10px;
  }

  .empty-state-vector-frame {
    width: 280px;
    height: 180px;
    margin: 0 auto 24px auto;
  }

  /* SVG Adaptive Properties inside styles */
  .empty-svg-sky { fill: var(--input-bg); }
  .empty-svg-accent { fill: #5c47f5; opacity: 0.15; }
  .empty-svg-terrain-back { fill: var(--card-bg); opacity: 0.8; }
  .empty-svg-terrain-front { fill: var(--card-bg); }
  .empty-svg-silhouette { fill: var(--text-main); opacity: 0.9; }
  .empty-svg-stroke { stroke: var(--text-main); opacity: 0.9; }

  .empty-quest-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 6px;
  }

  .empty-quest-subtitle {
    font-size: 13px;
    color: var(--text-sub);
    max-width: 320px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all') // 'all' | 'active' | 'completed'

  useEffect(() => { fetchTasks() }, [])

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

  return (
    <div className="tasks-wrapper">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      {/* Header Metric Overview Badges */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase' }}>Active Tasks</div>
            <div className="metric-value">{activeCount}</div>
          </div>
          <ShieldAlert size={20} color="#7c3aed" opacity="0.8" />
        </div>
        <div className="metric-card">
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
            <div className="metric-value" style={{ color: '#10b981' }}>{completedCount}</div>
          </div>
          <Sparkles size={20} color="#10b981" opacity="0.8" />
        </div>
      </div>

      {/* Modern Task Form */}
      <div className="task-form-card">
        <form onSubmit={addTask}>
          <div className="input-group">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="task-input"
            />
            <button type="submit" className="btn-add">
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Task</span>
            </button>
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
      </div>

      {/* Navigation tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>
          All Tasks ({totalTasksCount})
        </button>
        <button className={`filter-tab ${currentFilter === 'active' ? 'active' : ''}`} onClick={() => setCurrentFilter('active')}>
          Active ({activeCount})
        </button>
        <button className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`} onClick={() => setCurrentFilter('completed')}>
          Completed ({completedCount})
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-sub)', fontSize: '13px', textAlign: 'center' }}>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (
        
        /* Flawless Adaptive SVG Landscape */
        <div className="empty-quest-state">
          <svg className="empty-state-vector-frame" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background Sky using theme variable */}
            <rect width="300" height="180" rx="16" className="empty-svg-sky" />
            <circle cx="150" cy="90" r="50" className="empty-svg-accent" />
            
            {/* Silhouette details */}
            <g transform="translate(142, 60)">
              <line x1="8" y1="10" x2="8" y2="40" className="empty-svg-stroke" strokeWidth="2" />
              <path d="M5,15 Q8,8 11,15 Z" className="empty-svg-silhouette" />
              <circle cx="8" cy="11" r="2.5" className="empty-svg-silhouette" />
              <path d="M-10,35 Q8,42 26,35 Z" className="empty-svg-silhouette" />
            </g>

            {/* Flat Minimalist Scenery Hills */}
            <path d="M -20 180 Q 80 130 180 155 T 320 140 L 320 180 Z" className="empty-svg-terrain-back" />
            <path d="M -10 180 Q 90 145 150 162 T 310 150 L 310 180 Z" className="empty-svg-terrain-front" />

            {/* Tree Silhouettes */}
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
        <div className="tasks-list-grid">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`task-quest-card ${task.priority}-p`}>
              
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

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Tasks;