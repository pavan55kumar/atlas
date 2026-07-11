import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { inputStyle, primaryButton } from './styles'

function GradePredictor() {
  const [cie1, setCie1] = useState('')
  const [cie2, setCie2] = useState('')
  const [assignment, setAssignment] = useState('')
  const [lab, setLab] = useState('')
  const [semExam, setSemExam] = useState('')
  const [result, setResult] = useState(null)

  // Common weighting pattern — adjustable if your university differs
  const WEIGHTS = { cie1: 0.15, cie2: 0.15, assignment: 0.10, lab: 0.10, semExam: 0.50 }

  function calculate(e) {
    e.preventDefault()
    const vals = {
      cie1: parseFloat(cie1) || 0,
      cie2: parseFloat(cie2) || 0,
      assignment: parseFloat(assignment) || 0,
      lab: parseFloat(lab) || 0,
      semExam: parseFloat(semExam) || 0
    }

    const internal = (vals.cie1 * WEIGHTS.cie1 + vals.cie2 * WEIGHTS.cie2 + vals.assignment * WEIGHTS.assignment + vals.lab * WEIGHTS.lab) / (WEIGHTS.cie1 + WEIGHTS.cie2 + WEIGHTS.assignment + WEIGHTS.lab) * 100
    const total = vals.cie1 * WEIGHTS.cie1 + vals.cie2 * WEIGHTS.cie2 + vals.assignment * WEIGHTS.assignment + vals.lab * WEIGHTS.lab + vals.semExam * WEIGHTS.semExam

    let grade, gradePoint
    if (total >= 90) { grade = 'O'; gradePoint = 10 }
    else if (total >= 80) { grade = 'A+'; gradePoint = 9 }
    else if (total >= 70) { grade = 'A'; gradePoint = 8 }
    else if (total >= 60) { grade = 'B+'; gradePoint = 7 }
    else if (total >= 50) { grade = 'B'; gradePoint = 6 }
    else if (total >= 40) { grade = 'C'; gradePoint = 5 }
    else { grade = 'F'; gradePoint = 0 }

    setResult({ internal: internal.toFixed(1), total: total.toFixed(1), grade, gradePoint })
  }

  return (
    <div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Uses a common weighting: CIE1 15% · CIE2 15% · Assignment 10% · Lab 10% · Semester Exam 50%.
        Adjust your inputs based on marks out of 100 for each component.
      </p>

      <form onSubmit={calculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <Field label="CIE 1 (/100)" value={cie1} onChange={setCie1} />
        <Field label="CIE 2 (/100)" value={cie2} onChange={setCie2} />
        <Field label="Assignment (/100)" value={assignment} onChange={setAssignment} />
        <Field label="Lab (/100)" value={lab} onChange={setLab} />
        <Field label="Sem Exam (/100, est.)" value={semExam} onChange={setSemExam} />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" style={{ ...primaryButton, width: '100%', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <Sparkles size={14} /> Predict
          </button>
        </div>
      </form>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <ResultCard label="Internal Marks" value={`${result.internal}%`} />
          <ResultCard label="Predicted Total" value={`${result.total}%`} />
          <ResultCard label="Expected Grade" value={result.grade} accent />
          <ResultCard label="Grade Point" value={result.gradePoint} />
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>{label}</label>
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputStyle, width: '100%' }}
      />
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

export default GradePredictor