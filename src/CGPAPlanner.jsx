import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

function CGPAPlanner({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [currentCGPA, setCurrentCGPA] = useState('')
  const [completedCredits, setCompletedCredits] = useState('')
  const [remainingSemesters, setRemainingSemesters] = useState('')
  const [creditsPerSem, setCreditsPerSem] = useState('')
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
    const done = parseFloat(completedCredits)
    const sems = parseInt(remainingSemesters)
    const perSem = parseFloat(creditsPerSem)
    const target = parseFloat(targetCGPA)

    if (!cur || !done || !sems || !perSem || !target) {
      setResult({ error: 'Please fill in all fields with valid numbers.' })
      return
    }

    const remainingCredits = sems * perSem
    const totalCredits = done + remainingCredits

    // Required average SGPA across remaining semesters (equal each sem)
    const requiredTotalPoints = target * totalCredits
    const currentPoints = cur * done
    const neededPoints = requiredTotalPoints - currentPoints
    const requiredAvgSGPA = neededPoints / remainingCredits

    const achievable = requiredAvgSGPA <= 10 && requiredAvgSGPA > 0

    // Scenario B: equal effort — same as above
    // Scenario C: stronger later — first half at current pace, second half compensates
    const halfSems = Math.ceil(sems / 2)
    const firstHalfCredits = halfSems * perSem
    const secondHalfCredits = remainingCredits - firstHalfCredits
    const firstHalfSGPA = cur // assume maintaining current level for first half
    const pointsAfterFirstHalf = currentPoints + firstHalfSGPA * firstHalfCredits
    const neededSecondHalfPoints = requiredTotalPoints - pointsAfterFirstHalf
    const secondHalfSGPA = secondHalfCredits > 0 ? neededSecondHalfPoints / secondHalfCredits : null

    setResult({
      requiredAvgSGPA: requiredAvgSGPA.toFixed(2),
      achievable,
      totalCredits,
      remainingCredits,
      firstHalfSGPA: firstHalfSGPA.toFixed(2),
      secondHalfSGPA: secondHalfSGPA !== null ? secondHalfSGPA.toFixed(2) : null,
      secondHalfAchievable: secondHalfSGPA !== null && secondHalfSGPA <= 10 && secondHalfSGPA > 0
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
        <Field label="Completed Credits" value={completedCredits} onChange={setCompletedCredits} placeholder="90" />
        <Field label="Remaining Semesters" value={remainingSemesters} onChange={setRemainingSemesters} placeholder="3" />
        <Field label="Credits / Semester" value={creditsPerSem} onChange={setCreditsPerSem} placeholder="20" />
        <Field label="Target CGPA" value={targetCGPA} onChange={setTargetCGPA} placeholder="8.00" />
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
              <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Equal Effort Scenario</p>
              <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                {result.requiredAvgSGPA} <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 400 }}>required SGPA / semester</span>
              </p>
              <p style={{ fontSize: '12.5px', color: result.achievable ? '#6EE7B7' : '#FCA5A5' }}>
                {result.achievable
                  ? 'This target is realistically achievable.'
                  : 'This target requires SGPA above 10 or below 0 — not achievable with these numbers. Consider more semesters or a lower target.'}
              </p>
            </div>

            {result.secondHalfSGPA !== null && (
              <div style={{
                background: 'var(--surface-2)', borderRadius: '12px', padding: '18px',
                borderLeft: `3px solid ${result.secondHalfAchievable ? '#93C5FD' : '#FCA5A5'}`
              }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Stronger-Later Scenario</p>
                <p style={{ fontSize: '12.5px', lineHeight: '1.6' }}>
                  Maintain ~{result.firstHalfSGPA} SGPA in the first half of remaining semesters, then you'll need
                  ~<strong>{result.secondHalfSGPA}</strong> SGPA in the second half to hit your target.
                </p>
              </div>
            )}

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