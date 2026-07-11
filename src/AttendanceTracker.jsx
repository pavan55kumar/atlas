import { useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton } from './styles'

const STATUS_OPTIONS = [
  { key: 'present', label: 'Present', color: '#6EE7B7' },
  { key: 'absent', label: 'Absent', color: '#FCA5A5' },
  { key: 'cancelled', label: 'Cancelled', color: '#93C5FD' },
  { key: 'medical', label: 'Medical Leave', color: '#FDBA74' },
  { key: 'late', label: 'Late', color: '#FDE68A' }
]

function AttendanceTracker({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [minRequired, setMinRequired] = useState(75)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [{ data: subs }, { data: attendanceLogs }] = await Promise.all([
      supabase.from('subjects').select('*').order('created_at', { ascending: false }),
      supabase.from('attendance').select('*')
    ])
    setSubjects(subs || [])
    setLogs(attendanceLogs || [])
    if (subs && subs.length > 0 && !selectedSubject) setSelectedSubject(subs[0].id)
    setLoading(false)
  }

  async function logToday(subjectId, status) {
    const today = new Date().toISOString().split('T')[0]
    const existing = logs.find(l => l.subject_id === subjectId && l.date === today)

    if (existing) {
      await supabase.from('attendance').update({ status }).eq('id', existing.id)
    } else {
      await supabase.from('attendance').insert([{ subject_id: subjectId, user_id: userId, date: today, status }])
    }
    fetchAll()
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
  if (subjects.length === 0) {
    return <div className="empty-state"><CalendarCheck size={28} /><span>Add subjects first to start tracking attendance</span></div>
  }

  const today = new Date().toISOString().split('T')[0]
  const todayLogForSelected = logs.find(l => l.subject_id === selectedSubject && l.date === today)
  const currentSubject = subjects.find(s => s.id === selectedSubject)

  // Attendance math: only present/absent/late count toward total; cancelled/medical excluded
  const subjectLogs = logs.filter(l => l.subject_id === selectedSubject)
  const countable = subjectLogs.filter(l => ['present', 'absent', 'late'].includes(l.status))
  const attended = countable.filter(l => l.status === 'present' || l.status === 'late').length
  const total = countable.length
  const currentPct = total > 0 ? (attended / total) * 100 : 100

  // Required classes to reach minRequired%, and max bunks allowed
  let requiredClasses = 0
  let maxBunks = 0
  if (total > 0) {
    if (currentPct >= minRequired) {
      // how many more can be missed and still stay >= minRequired
      // (attended) / (total + x) >= minRequired/100  => x <= attended*100/minRequired - total
      maxBunks = Math.floor((attended * 100) / minRequired - total)
      maxBunks = Math.max(0, maxBunks)
    } else {
      // how many more must be attended consecutively to reach minRequired
      // (attended + y) / (total + y) >= minRequired/100
      // solve: y >= (minRequired*total - 100*attended) / (100 - minRequired)
      const y = (minRequired * total - 100 * attended) / (100 - minRequired)
      requiredClasses = Math.ceil(y)
    }
  }

  // Bunk predictor: what happens if I skip the next class
  const nextTotal = total + 1
  const nextPctIfSkip = total > 0 ? (attended / nextTotal) * 100 : 0
  const canSkip = nextPctIfSkip >= minRequired
  const riskLevel = currentPct - minRequired > 10 ? 'Low' : currentPct - minRequired > 0 ? 'Medium' : 'High'

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            style={selectedSubject === s.id ? primaryButton : ghostButton}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Log today's status */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>MARK TODAY</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => logToday(selectedSubject, opt.key)}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                background: todayLogForSelected?.status === opt.key ? opt.color : 'var(--surface-2)',
                color: todayLogForSelected?.status === opt.key ? '#0A0A0F' : 'var(--text)',
                fontSize: '12px', fontWeight: 500
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance % + progress bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{currentSubject?.name} Attendance</span>
          <span style={{ fontSize: '13px', color: currentPct >= minRequired ? '#6EE7B7' : '#FCA5A5', fontWeight: 700 }}>
            {currentPct.toFixed(1)}%
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--bg)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(currentPct, 100)}%`, height: '100%',
            background: currentPct >= minRequired ? '#6EE7B7' : '#FCA5A5'
          }} />
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {attended} attended / {total} classes counted
        </p>
      </div>

      {/* Smart calculator */}
      <div style={{ background: 'var(--surface-2)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600 }}>Minimum required</p>
          <input
            type="number"
            value={minRequired}
            onChange={(e) => setMinRequired(Number(e.target.value))}
            style={{ ...inputStyle, width: '70px' }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>%</span>
        </div>
        <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
          {total === 0 ? (
            'Log some classes to see your calculator results.'
          ) : currentPct >= minRequired ? (
            maxBunks > 0
              ? `You can miss ${maxBunks} more class${maxBunks !== 1 ? 'es' : ''} and stay above ${minRequired}%.`
              : `You're right at the edge — missing any class will drop you below ${minRequired}%.`
          ) : (
            `You must attend the next ${requiredClasses} class${requiredClasses !== 1 ? 'es' : ''} in a row to reach ${minRequired}%.`
          )}
        </p>
      </div>

      {/* Bunk predictor */}
      {total > 0 && (
        <div style={{
          background: 'var(--surface-2)', borderRadius: '12px', padding: '16px',
          borderLeft: `3px solid ${canSkip ? '#6EE7B7' : '#FCA5A5'}`
        }}>
          <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Can I skip the next class?</p>
          <p style={{ fontSize: '18px', fontWeight: 700, color: canSkip ? '#6EE7B7' : '#FCA5A5', marginBottom: '6px' }}>
            {canSkip ? 'Yes' : 'No'}
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Attendance after skipping: {nextPctIfSkip.toFixed(1)}% · Risk level: {riskLevel}
          </p>
        </div>
      )}
    </div>
  )
}

export default AttendanceTracker