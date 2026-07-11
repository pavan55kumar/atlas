import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, deleteX } from './styles'

function AssignmentManager({ userId }) {
  const [assignments, setAssignments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from('assignments').select('*').order('due_date', { ascending: true }),
      supabase.from('subjects').select('*')
    ])
    setAssignments(a || [])
    setSubjects(s || [])
    setLoading(false)
  }

  async function addAssignment(e) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    const { error } = await supabase
      .from('assignments')
      .insert([{ title, subject_id: subjectId || null, due_date: dueDate, completed: false, user_id: userId }])
    if (!error) { setTitle(''); setSubjectId(''); setDueDate(''); fetchAll() }
  }

  async function toggleComplete(a) {
    await supabase.from('assignments').update({ completed: !a.completed }).eq('id', a.id)
    fetchAll()
  }

  async function deleteAssignment(id) {
    await supabase.from('assignments').delete().eq('id', id)
    fetchAll()
  }

  function subjectName(id) {
    return subjects.find(s => s.id === id)?.name || null
  }

  const today = new Date().toISOString().split('T')[0]

  function getStatus(a) {
    if (a.completed) return { label: 'Done', color: '#6EE7B7' }
    if (a.due_date < today) return { label: 'Late', color: '#FCA5A5' }
    const daysLeft = Math.ceil((new Date(a.due_date) - new Date(today)) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 2) return { label: `${daysLeft}d left`, color: '#FDBA74' }
    return { label: `${daysLeft}d left`, color: 'var(--text-muted)' }
  }

  const pending = assignments.filter(a => !a.completed)
  const completed = assignments.filter(a => a.completed)

  return (
    <div>
      <form onSubmit={addAssignment} style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Assignment title..."
          style={{ ...inputStyle, flex: '2 1 140px' }}
        />
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 120px' }}
        >
          <option value="">No subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : assignments.length === 0 ? (
        <div className="empty-state"><ClipboardList size={28} /><span>No assignments yet — add your first one above</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pending.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>PENDING</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pending.map(a => (
                  <AssignmentRow key={a.id} a={a} status={getStatus(a)} subjectName={subjectName(a.subject_id)} onToggle={toggleComplete} onDelete={deleteAssignment} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>COMPLETED</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {completed.map(a => (
                  <AssignmentRow key={a.id} a={a} status={getStatus(a)} subjectName={subjectName(a.subject_id)} onToggle={toggleComplete} onDelete={deleteAssignment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AssignmentRow({ a, status, subjectName, onToggle, onDelete }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '13px', padding: '10px 12px', borderRadius: '10px', background: 'var(--surface-2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input type="checkbox" checked={a.completed} onChange={() => onToggle(a)} style={{ cursor: 'pointer' }} />
        <div>
          <span style={{ textDecoration: a.completed ? 'line-through' : 'none', color: a.completed ? 'var(--text-muted)' : 'var(--text)' }}>
            {a.title}
          </span>
          {subjectName && <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '11px' }}>· {subjectName}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '11px', color: status.color, fontWeight: 600 }}>{status.label}</span>
        <span onClick={() => onDelete(a.id)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>✕</span>
      </div>
    </div>
  )
}

export default AssignmentManager