import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
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
      .insert([{ title, user_id: userId, priority: 'medium', progress: 0 }])

    if (!error) {
      setTitle('')
      fetchTasks()
    }
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

  return (
    <div>
      <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: '13px'
          }}
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
      ) : tasks.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No tasks yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {tasks.map((task) => (
            <div key={task.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px'
            }}>
              <span
                onClick={() => toggleDone(task)}
                style={{
                  cursor: 'pointer',
                  textDecoration: task.progress === 100 ? 'line-through' : 'none',
                  color: task.progress === 100 ? 'var(--text-muted)' : 'var(--text)'
                }}
              >
                {task.title}
              </span>
              <span
                onClick={() => deleteTask(task.id)}
                style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Tasks