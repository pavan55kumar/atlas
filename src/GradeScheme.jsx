import { useEffect, useState } from 'react'
import { Plus, Trash2, Sparkles, Settings2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton } from './styles'

function makeId() {
  return Math.random().toString(36).slice(2, 9)
}

function GradeScheme({ userId }) {
  const [components, setComponents] = useState([])
  const [schemeRowId, setSchemeRowId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [marks, setMarks] = useState({})
  const [result, setResult] = useState(null)
  const [editing, setEditing] = useState(false)

  useEffect(function () { loadScheme() }, [])

  async function loadScheme() {
    const { data } = await supabase
      .from('grade_schemes')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (data && data.length > 0) {
      setSchemeRowId(data[0].id)
      setComponents(data[0].components || [])
      setEditing(false)
    } else {
      setComponents([
        { id: makeId(), name: 'CIE 1', max: 50, weight: 20 },
        { id: makeId(), name: 'CIE 2', max: 50, weight: 20 },
        { id: makeId(), name: 'Assignment', max: 50, weight: 10 },
        { id: makeId(), name: 'Semester Exam', max: 100, weight: 50 }
      ])
      setEditing(true)
    }
    setLoading(false)
  }

  function addComponent() {
    setComponents(function (prev) {
      return prev.concat([{ id: makeId(), name: '', max: 100, weight: 0 }])
    })
  }

  function updateComponent(id, field, value) {
    setComponents(function (prev) {
      return prev.map(function (c) {
        if (c.id !== id) return c
        const next = Object.assign({}, c)
        next[field] = field === 'name' ? value : Number(value)
        return next
      })
    })
  }

  function removeComponent(id) {
    setComponents(function (prev) { return prev.filter(function (c) { return c.id !== id } ) })
  }

  const totalWeight = components.reduce(function (a, c) { return a + (Number(c.weight) || 0) }, 0)
  const weightValid = totalWeight === 100

  async function saveScheme() {
    setSaving(true)
    setSaveMsg('')

    const payload = { user_id: userId, components: components }

    let error
    if (schemeRowId) {
      const res = await supabase.from('grade_schemes').update(payload).eq('id', schemeRowId)
      error = res.error
    } else {
      const res = await supabase.from('grade_schemes').insert([payload]).select()
      error = res.error
      if (!error && res.data && res.data[0]) setSchemeRowId(res.data[0].id)
    }

    setSaving(false)
    if (error) {
      setSaveMsg('Error: ' + error.message)
    } else {
      setSaveMsg('Scheme saved.')
      setEditing(false)
      setTimeout(function () { setSaveMsg('') }, 2000)
    }
  }

  function predict(e) {
    e.preventDefault()
    let totalPct = 0
    let anyEntered = false

    components.forEach(function (c) {
      const obtained = Number(marks[c.id])
      if (!isNaN(obtained) && marks[c.id] !== '' && marks[c.id] !== undefined) {
        anyEntered = true
        const pctOfComponent = (obtained / (c.max || 1)) * c.weight
        totalPct += pctOfComponent
      }
    })

    if (!anyEntered) {
      setResult({ error: 'Enter marks for at least one component.' })
      return
    }

    let grade, gradePoint
    if (totalPct >= 90) { grade = 'O'; gradePoint = 10 }
    else if (totalPct >= 80) { grade = 'A+'; gradePoint = 9 }
    else if (totalPct >= 70) { grade = 'A'; gradePoint = 8 }
    else if (totalPct >= 60) { grade = 'B+'; gradePoint = 7 }
    else if (totalPct >= 50) { grade = 'B'; gradePoint = 6 }
    else if (totalPct >= 40) { grade = 'C'; gradePoint = 5 }
    else { grade = 'F'; gradePoint = 0 }

    setResult({ totalPct: totalPct.toFixed(1), grade: grade, gradePoint: gradePoint })
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
          Your grading scheme — set this up once to match your college's exact marking system.
        </p>
        {!editing && (
          <button onClick={function () { setEditing(true) }} style={{ ...ghostButton, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings2 size={13} /> Edit scheme
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {components.map(function (c) {
              return (
                <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={c.name}
                    onChange={function (e) { updateComponent(c.id, 'name', e.target.value) }}
                    placeholder="Component name"
                    style={{ ...inputStyle, flex: '2 1 120px' }}
                  />
                  <input
                    type="number"
                    value={c.max}
                    onChange={function (e) { updateComponent(c.id, 'max', e.target.value) }}
                    placeholder="Max marks"
                    style={{ ...inputStyle, width: '90px' }}
                  />
                  <div style={{ position: 'relative', width: '90px' }}>
                    <input
                      type="number"
                      value={c.weight}
                      onChange={function (e) { updateComponent(c.id, 'weight', e.target.value) }}
                      placeholder="Weight"
                      style={{ ...inputStyle, width: '100%', paddingRight: '22px' }}
                    />
                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: 'var(--text-muted)' }}>%</span>
                  </div>
                  <span onClick={function () { removeComponent(c.id) }} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Trash2 size={15} />
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={addComponent} style={{ ...ghostButton, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={13} /> Add component
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12.5px', color: weightValid ? '#6EE7B7' : '#FCA5A5' }}>
                Total weight: {totalWeight}%{weightValid ? '' : ' (must equal 100%)'}
              </span>
              <button onClick={saveScheme} disabled={!weightValid || saving} style={primaryButton}>
                {saving ? 'Saving...' : 'Save scheme'}
              </button>
            </div>
          </div>
          {saveMsg && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>{saveMsg}</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
          {components.map(function (c) {
            return (
              <div key={c.id} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: '13px',
                padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)'
              }}>
                <span>{c.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>out of {c.max} · {c.weight}%</span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Predict your grade</p>
        <form onSubmit={predict} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {components.map(function (c) {
            return (
              <div key={c.id}>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                  {c.name || 'Component'} (/{c.max})
                </label>
                <input
                  type="number"
                  min="0"
                  max={c.max}
                  value={marks[c.id] || ''}
                  onChange={function (e) { setMarks(Object.assign({}, marks, { [c.id]: e.target.value })) }}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            )
          })}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ ...primaryButton, width: '100%', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Sparkles size={14} /> Predict
            </button>
          </div>
        </form>

        {result && (
          result.error ? (
            <p style={{ color: '#FCA5A5', fontSize: '13px' }}>{result.error}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <ResultCard label="Total Score" value={result.totalPct + '%'} />
              <ResultCard label="Expected Grade" value={result.grade} accent />
              <ResultCard label="Grade Point" value={result.gradePoint} />
            </div>
          )
        )}
      </div>
    </div>
  )
}

function ResultCard({ label, value, accent }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '14px' }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '22px', fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</p>
    </div>
  )
}

export default GradeScheme