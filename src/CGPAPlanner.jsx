import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

function CGPAPlanner({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [currentCGPA, setCurrentCGPA] = useState('')
  // CHANGED: was `completedCredits` — this college's CGPA is a simple average
  // of each semester's SGPA (not credit-weighted), so the input this formula
  // actually needs is a semester COUNT, not a credit total. Same Field
  // component/style, just repurposed.
  const [completedSemesters, setCompletedSemesters] = useState('')
  const [remainingSemesters, setRemainingSemesters] = useState('')
  // REMOVED: creditsPerSem — not a variable in the simple-average formula,
  // there was nothing correct to compute from it.
  const [targetCGPA, setTargetCGPA] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    supabase.from('subjects').select('*').then(({ data }) => setSubjects(data || []))
  }, [])

  const gradedSubjects = subjects.filter(s => s.grade_point !== null && s.grade_point !== undefined)
  const gradedCredits = gradedSubjects.reduce((a, s) => a + (s.credits || 0), 0)
  const liveSGPA = gradedCredits > 0
    ? (gradedSubjects.reduce((a, s) => a + s.grade_point * s.credits, 0) / gradedCredits).toFixed(2)
    : null

  function calculate(e) {
    e.preventDefault()
    const cur = parseFloat(currentCGPA)
    const completedSems = parseInt(completedSemesters)
    const remSems = parseInt(remainingSemesters)
    const target = parseFloat(targetCGPA)

    // CHANGED: use Number.isFinite instead of a plain falsy check, so a
    // legitimately-entered 0 doesn't get silently treated the same as an
    // empty field (falsy check would previously reject e.g. a valid "0"
    // completed semesters edge case the same way as a blank input).
    if (
      !Number.isFinite(cur) ||
      !Number.isFinite(completedSems) || completedSems <= 0 ||
      !Number.isFinite(remSems) || remSems <= 0 ||
      !Number.isFinite(target)
    ) {
      setResult({ error: 'Please fill in all fields with valid numbers.' })
      return
    }

    // ---------------------------------------------------------------
    // Simple-average CGPA model (matches this college's actual system):
    //   CGPA = average of each completed semester's SGPA (unweighted)
    // So to hit a target CGPA across ALL semesters (completed + remaining),
    // solve for the average SGPA still needed across the remaining ones:
    //
    //   totalSemesters       = completedSemesters + remainingSemesters
    //   requiredTotalPoints  = targetCGPA * totalSemesters
    //   currentPoints        = currentCGPA * completedSemesters
    //   neededPoints         = requiredTotalPoints - currentPoints
    //   requiredAvgSGPA      = neededPoints / remainingSemesters
    // ---------------------------------------------------------------
    const totalSemesters = completedSems + remSems
    const requiredTotalPoints = target * totalSemesters
    const currentPoints = cur * completedSems
    const neededPoints = requiredTotalPoints - currentPoints
    const requiredAvgSGPA = neededPoints / remSems

    const achievable = requiredAvgSGPA <= 10 && requiredAvgSGPA > 0

    setResult({
      requiredAvgSGPA: requiredAvgSGPA.toFixed(2),
      achievable,
      totalSemesters,
      remainingSemesters: remSems
    })
  }

  return (
    <div>
      {liveSGPA && (
        <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px' }}>
          Live SGPA from your graded subjects: <strong>{liveSGPA}</strong>
        </div>
      )}

      <form onSubmit={calculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <Field label="Current CGPA" value={currentCGPA} onChange={setCurrentCGPA} placeholder="6.67" />
        <Field label="Completed Semesters" value={completedSemesters} onChange={setCompletedSemesters} placeholder="4" />
        <Field label="Remaining Semesters" value={remainingSemesters} onChange={setRemainingSemesters} placeholder="4" />
        <Field label="Target CGPA" value={targetCGPA} onChange={setTargetCGPA} placeholder="9.00" />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" style={{ ...primaryButton, width: '100%' }}>Calculate</button>
        </div>
      </form>

      {result && (
        result.error ? (
          <p style={{ color: '#FCA5A5', fontSize: '13px' }}>{result.error}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'var(--surface-2)', borderRadius: '12px', padding: '18px',
              borderLeft: `3px solid ${result.achievable ? '#6EE7B7' : '#FCA5A5'}`
            }}>
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Required Average SGPA</p>
              <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                {result.requiredAvgSGPA} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>required SGPA / remaining semester</span>
              </p>
              <p style={{ fontSize: '12.5px', color: result.achievable ? '#6EE7B7' : '#FCA5A5' }}>
                {result.achievable
                  ? 'This target is realistically achievable.'
                  : 'This target requires SGPA above 10 or below 0 — not achievable with these numbers. Consider more semesters or a lower target.'}
              </p>
            </div>

            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>PROGRESS TOWARD TARGET</p>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((parseFloat(currentCGPA) / parseFloat(targetCGPA)) * 100, 100)}%`,
                  height: '100%', background: 'var(--accent)'
                }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {currentCGPA} of {targetCGPA} target
              </p>
            </div>
          </div>
        )
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, width: '100%' }}
      />
    </div>
  )
}

export default CGPAPlanner