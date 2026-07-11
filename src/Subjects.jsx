import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, deleteX } from './styles'

function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSubjects() }, [])

  async function fetchSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setSubjects(data)
    setLoading(false)
  }

  async function addSubject(e) {
    e.preventDefault()
    if (!name.trim() || !credits) return
    const { error } = await supabase
      .from('subjects')
      .insert([{ name, credits: parseInt(credits), faculty, user_id: userId }])
    if (!error) { setName(''); setCredits(''); setFaculty(''); fetchSubjects() }
  }

  async function updateGrade(subject, value) {
    const gp = value === '' ? null : parseFloat(value)
    await supabase.from('subjects').update({ grade_point: gp }).eq('id', subject.id)
    fetchSubjects()
  }

  async function deleteSubject(id) {
    await supabase.from('subjects').delete().eq('id', id)
    fetchSubjects()
  }

  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0)
  const gradedSubjects = subjects.filter(s => s.grade_point !== null && s.grade_point !== undefined)
  const gradedCredits = gradedSubjects.reduce((a, s) => a + (s.credits || 0), 0)
  const sgpa = gradedCredits > 0
    ? (gradedSubjects.reduce((a, s) => a + s.grade_point * s.credits, 0) / gradedCredits).toFixed(2)
    : null

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <SummaryCard label="Subjects" value={subjects.length} />
        <SummaryCard label="Total Credits" value={totalCredits} />
        <SummaryCard label="SGPA" value={sgpa ?? '—'} />
        <SummaryCard label="Graded" value={`${gradedSubjects.length}/${subjects.length}`} />
      </div>

      <form onSubmit={addSubject} style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Subject name..."
          style={{ ...inputStyle, flex: '2 1 140px' }}
        />
        <input
          type="number"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          placeholder="Credits"
          style={{ ...inputStyle, width: '90px' }}
        />
        <input
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          placeholder="Faculty (optional)"
          style={{ ...inputStyle, flex: '1 1 120px' }}
        />
        <button type="submit" style={primaryButton}>Add</button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : subjects.length === 0 ? (
        <div className="empty-state"><GraduationCap size={28} /><span>No subjects added yet — add your first one above</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {subjects.map((s) => (
            <div key={s.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '13px', padding: '12px', borderRadius: '10px', background: 'var(--surface-2)', flexWrap: 'wrap', gap: '8px'
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                  {s.credits} credits{s.faculty ? ` · ${s.faculty}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Grade pt"
                  defaultValue={s.grade_point ?? ''}
                  onBlur={(e) => updateGrade(s, e.target.value)}
                  style={{ ...inputStyle, width: '80px', fontSize: '12px' }}
                />
                <span onClick={() => deleteSubject(s.id)} style={deleteX}>✕</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '14px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 700 }}>{value}</p>
    </div>
  )
}

export default Subjects