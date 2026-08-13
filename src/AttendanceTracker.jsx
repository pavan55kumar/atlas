import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { CalendarCheck, ChevronDown, ChevronLeft, ChevronRight, Plus, Search, X, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle } from './styles'

const STATUS_OPTIONS = [
  { key: 'present', label: 'Present', color: '#6EE7B7', short: 'Present' },
  { key: 'absent', label: 'Absent', color: '#FCA5A5', short: 'Absent' },
  { key: 'late', label: 'Late', color: '#FDE68A', short: 'Late' },
  { key: 'medical', label: 'Medical', color: '#FDBA74', short: 'Medical' },
  { key: 'cancelled', label: 'Cancelled', color: '#93C5FD', short: 'Cancelled' }
]

const toLocalDateStr = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const todayStr = () => toLocalDateStr(new Date())

const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const AttendanceTracker = React.memo(function AttendanceTracker({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  
  const [minRequired, setMinRequired] = useState(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('attendanceMinRequired') : null;
    return saved ? Number(saved) : 75;
  });
  const [minInputValue, setMinInputValue] = useState(String(minRequired));

  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  
  const [showSubjectSheet, setShowSubjectSheet] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null) // session.id pending confirmation

  const touchStartX = useRef(0);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [{ data: subs, error: subError }, { data: attendanceLogs, error: logError }] = await Promise.all([
        supabase.from('subjects').select('*').order('created_at', { ascending: false }),
        supabase.from('attendance').select('*')
      ])

      if (subError || logError) throw subError || logError

      setSubjects(subs || [])
      setLogs(attendanceLogs || [])
      
      if (subs && subs.length > 0) {
        setSelectedSubject(prev => prev || subs[0].id)
      }
    } catch {
      showToast('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddClass = useCallback(async () => {
    if (!selectedSubject) return
    triggerHaptic();
    
    const tempId = `temp-${Date.now()}`
    const newLog = {
      id: tempId,
      subject_id: selectedSubject,
      user_id: userId,
      date: selectedDate,
      status: 'present'
    }

    setLogs(prev => [...prev, newLog])

    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ subject_id: selectedSubject, user_id: userId, date: selectedDate, status: 'present' }])
        .select()
        .single()

      if (error) throw error
      
      setLogs(prev => prev.map(l => l.id === tempId ? data : l))
    } catch {
      setLogs(prev => prev.filter(l => l.id !== tempId))
      showToast('Failed to add class. Database might restrict multiple sessions per day.')
    }
  }, [selectedSubject, userId, selectedDate, showToast, triggerHaptic])

  // NEW: Promotes the default draft class to a persisted record with chosen status
  const handleDraftSelect = useCallback(async (status) => {
    if (!selectedSubject) return
    triggerHaptic();

    const tempId = `temp-${Date.now()}`
    const newLog = {
      id: tempId,
      subject_id: selectedSubject,
      user_id: userId,
      date: selectedDate,
      status
    }
    setLogs(prev => [...prev, newLog])

    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ subject_id: selectedSubject, user_id: userId, date: selectedDate, status }])
        .select()
        .single()
      if (error) throw error
      setLogs(prev => prev.map(l => l.id === tempId ? data : l))
    } catch {
      setLogs(prev => prev.filter(l => l.id !== tempId))
      showToast('Failed to save class')
    }
  }, [selectedSubject, userId, selectedDate, showToast, triggerHaptic])

  const handleUpdateStatus = useCallback(async (logId, status) => {
    triggerHaptic();
    const prevLogs = logs
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, status } : l))

    try {
      const { error } = await supabase.from('attendance').update({ status }).eq('id', logId)
      if (error) throw error
    } catch {
      setLogs(prevLogs)
      showToast('Failed to update attendance status')
    }
  }, [logs, showToast, triggerHaptic])

  // NEW: Deletes a single class record with confirmation
  const handleDeleteClass = useCallback(async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget
    triggerHaptic();
    const prevLogs = logs
    setLogs(prev => prev.filter(l => l.id !== targetId))
    setDeleteTarget(null)

    // Skip Supabase call for temp records (not yet persisted)
    if (String(targetId).startsWith('temp-')) return

    try {
      const { error } = await supabase.from('attendance').delete().eq('id', targetId)
      if (error) throw error
      showToast('Class removed', 'success')
    } catch {
      setLogs(prevLogs)
      showToast('Failed to delete class')
    }
  }, [deleteTarget, logs, showToast, triggerHaptic])

  // --- DERIVED DATA & CALCULATIONS (Preserved exact logic) ---
  const subjectLogs = useMemo(() => logs.filter(l => l.subject_id === selectedSubject), [logs, selectedSubject])
  
  const calculations = useMemo(() => {
    const countable = subjectLogs.filter(l => ['present', 'absent', 'late'].includes(l.status))
    const attended = countable.filter(l => l.status === 'present' || l.status === 'late').length
    const total = countable.length
    const currentPct = total > 0 ? (attended / total) * 100 : 100

    let requiredClasses = 0
    let maxBunks = 0
    
    if (total > 0) {
      if (currentPct >= minRequired) {
        maxBunks = Math.floor((attended * 100) / minRequired - total)
        maxBunks = Math.max(0, maxBunks)
      } else {
        const y = (minRequired * total - 100 * attended) / (100 - minRequired)
        requiredClasses = Math.ceil(y)
      }
    }

    const nextTotal = total + 1
    const nextPctIfSkip = total > 0 ? (attended / nextTotal) * 100 : 0
    const canSkip = nextPctIfSkip >= minRequired
    const riskLevel = currentPct - minRequired > 10 ? 'Safe' : currentPct - minRequired > 0 ? 'At Risk' : 'Below Required'
    
    return { attended, total, currentPct, requiredClasses, maxBunks, nextPctIfSkip, canSkip, riskLevel }
  }, [subjectLogs, minRequired])

  const todaysSessions = useMemo(() => {
    return subjectLogs.filter(l => l.date === selectedDate)
  }, [subjectLogs, selectedDate])

  // NEW: When no classes logged for selected date, we render a "default" draft Class 1
  const showDefaultDraft = todaysSessions.length === 0

  const subjectGraphData = useMemo(() => {
    return subjects.map(sub => {
      const subLogs = logs.filter(l => l.subject_id === sub.id)
      const countable = subLogs.filter(l => ['present', 'absent', 'late'].includes(l.status))
      const attended = countable.filter(l => l.status === 'present' || l.status === 'late').length
      const total = countable.length
      const pct = total > 0 ? (attended / total) * 100 : 0
      return { id: sub.id, name: sub.name, pct }
    })
  }, [subjects, logs])

  const recentHistory = useMemo(() => {
    return [...subjectLogs]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
  }, [subjectLogs])

  const changeDate = useCallback((days) => {
    triggerHaptic();
    setSelectedDate(prev => {
      const d = parseLocalDate(prev)
      d.setDate(d.getDate() + days)
      const newDate = toLocalDateStr(d)
      if (newDate > todayStr()) return prev;
      return newDate;
    })
  }, [triggerHaptic]);

  const handleMinChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    setMinInputValue(val);
  };

  const handleMinBlur = () => {
    let num = parseInt(minInputValue, 10);
    if (isNaN(num) || minInputValue === '') {
      num = minRequired; 
    } else {
      if (num < 1) num = 1;
      if (num > 100) num = 100;
    }
    setMinRequired(num);
    setMinInputValue(String(num));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('attendanceMinRequired', String(num));
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) changeDate(-1);
      else changeDate(1);
    }
  };

  const isToday = selectedDate === todayStr()
  const yesterdayStr = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return toLocalDateStr(d)
  }, [])
  const isYesterday = selectedDate === yesterdayStr
  const maxDate = todayStr()
  const currentSubject = subjects.find(s => s.id === selectedSubject)
  const filteredSubjects = subjects.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px' }}>Loading attendance...</p>
  
  if (subjects.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <CalendarCheck size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <span style={{ display: 'block', fontSize: '14px' }}>Add subjects first to start tracking attendance</span>
      </div>
    )
  }

  // Compact reusable status badge for the (optional) display side — minimal visual weight
  const renderStatusBadge = (status) => {
    const opt = STATUS_OPTIONS.find(o => o.key === status)
    if (!opt) return null
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 8px', borderRadius: '12px',
        background: `${opt.color}22`,
        color: opt.color, fontSize: '11px', fontWeight: '600'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: opt.color }} />
        {opt.short}
      </span>
    )
  }

  // Compact class card renderer (shared between logged sessions)
  const renderClassCard = (session, idx, isDraft = false) => {
    const isTemp = String(session.id).startsWith('temp-')
    return (
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>Class {idx + 1}</span>
            {isTemp && <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Saving…</span>}
            {isDraft && <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Tap a status</span>}
            {!isDraft && !isTemp && renderStatusBadge(session.status)}
          </div>
          {!isDraft && (
            <button
              onClick={() => { triggerHaptic(); setDeleteTarget(session.id); }}
              aria-label="Delete class"
              style={{
                background: 'transparent', border: 'none', padding: '6px',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px', minHeight: '28px', minWidth: '28px'
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '6px' }}>
          {STATUS_OPTIONS.map(opt => {
            const isActive = session.status === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => isDraft ? handleDraftSelect(opt.key) : handleUpdateStatus(session.id, opt.key)}
                className="att-status-btn"
                style={{
                  padding: '7px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                  minHeight: '36px',
                  border: `1px solid ${isActive ? opt.color : 'var(--border)'}`,
                  background: isActive ? opt.color : 'var(--surface-2)',
                  color: isActive ? '#0A0A0F' : 'var(--text)',
                  textAlign: 'center'
                }}
              >
                {opt.short}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '40px', position: 'relative' }}>
      <style>{`
        .att-scroll-y { overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .att-status-btn { transition: transform 0.1s ease, background 0.2s, border-color 0.2s; min-height: 36px; display: flex; align-items: center; justify-content: center; }
        .att-status-btn:active { transform: scale(0.95); }
        .att-trash-btn { transition: background 0.15s, color 0.15s; }
        .att-trash-btn:active { background: rgba(252, 165, 165, 0.15); color: #FCA5A5; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#FCA5A5' : '#6EE7B7', color: '#0A0A0F',
          padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1300, display: 'flex', alignItems: 'center', gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.15s ease'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '320px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)', animation: 'scaleIn 0.2s ease',
              textAlign: 'center'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(252, 165, 165, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Trash2 size={18} color="#FCA5A5" />
            </div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Delete this class?</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
              This will permanently remove the record for this date.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClass}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: '#FCA5A5', border: '1px solid #FCA5A5',
                  color: '#0A0A0F', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>Attendance</p>
        <button 
          onClick={() => setShowSubjectSheet(true)}
          style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: '12px', color: 'var(--text)', fontSize: '16px', fontWeight: '600'
          }}
        >
          <span>{currentSubject?.name || 'Select Subject'}</span>
          <ChevronDown size={20} color="var(--text-muted)" />
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '28px', fontWeight: '700', color: calculations.currentPct >= minRequired ? '#6EE7B7' : '#FCA5A5' }}>
              {calculations.currentPct.toFixed(1)}%
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {calculations.attended} attended / {calculations.total} classes · {minRequired}% req
            </p>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
            background: calculations.riskLevel === 'Safe' ? 'rgba(110, 231, 183, 0.15)' : calculations.riskLevel === 'At Risk' ? 'rgba(253, 224, 71, 0.15)' : 'rgba(252, 165, 165, 0.15)',
            color: calculations.riskLevel === 'Safe' ? '#6EE7B7' : calculations.riskLevel === 'At Risk' ? '#FDE68A' : '#FCA5A5'
          }}>
            {calculations.riskLevel}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(calculations.currentPct, 100)}%`, height: '100%',
            background: calculations.currentPct >= minRequired ? '#6EE7B7' : '#FCA5A5',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <div 
        style={{ marginBottom: '20px', touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button onClick={() => changeDate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: '8px', cursor: 'pointer' }}>
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setShowCalendar(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', fontSize: '15px', fontWeight: '600', color: 'var(--text)', padding: '8px 12px', borderRadius: '8px' }}
          >
            {parseLocalDate(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </button>
          <button onClick={() => changeDate(1)} disabled={isToday} style={{ background: 'none', border: 'none', color: isToday ? 'var(--border)' : 'var(--text-muted)', padding: '8px', cursor: isToday ? 'default' : 'pointer' }}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={() => { triggerHaptic(); setSelectedDate(yesterdayStr); }} style={isYesterday ? pillBtnActive : pillBtn}>Yesterday</button>
          <button onClick={() => { triggerHaptic(); setSelectedDate(todayStr()); }} style={isToday ? pillBtnActive : pillBtn}>Today</button>
          <button onClick={() => setShowCalendar(true)} style={pillBtn}>Pick Date</button>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isToday ? "Today's Classes" : "Classes on this date"}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Default Class 1 entry — shown immediately when no classes logged for this date */}
          {showDefaultDraft && renderClassCard({ id: 'draft', status: '' }, 0, true)}
          
          {todaysSessions.map((session, idx) => renderClassCard(session, idx, false))}
        </div>

        {/* "Add another class" — only needed once first class exists */}
        {!showDefaultDraft && (
          <button 
            onClick={handleAddClass}
            style={{
              marginTop: '12px', width: '100%', padding: '12px', borderRadius: '12px',
              border: '1px dashed var(--accent)', background: 'transparent', color: 'var(--accent)',
              fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
          >
            <Plus size={16} />
            Add another class
          </button>
        )}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Subject Attendance</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 8px 8px' }}>
          {subjectGraphData.length > 0 ? (
            <SubjectAttendanceGraph data={subjectGraphData} minRequired={minRequired} />
          ) : (
            <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>No data to graph yet</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Attendance Insights</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Minimum required</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={minInputValue}
              onChange={handleMinChange}
              onBlur={handleMinBlur}
              style={{ ...inputStyle, width: '60px', padding: '4px 8px', textAlign: 'center' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>%</span>
          </div>
          
          <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text)', marginBottom: '12px' }}>
            {calculations.total === 0 ? (
              'Log some classes to see your calculator results.'
            ) : calculations.currentPct >= minRequired ? (
              calculations.maxBunks > 0
                ? `You can miss ${calculations.maxBunks} more class${calculations.maxBunks !== 1 ? 'es' : ''} and stay above ${minRequired}%.`
                : `You're right at the edge — missing any class will drop you below ${minRequired}%.`
            ) : (
              `You must attend the next ${calculations.requiredClasses} class${calculations.requiredClasses !== 1 ? 'es' : ''} in a row to reach ${minRequired}%.`
            )}
          </p>

          {calculations.total > 0 && (
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Can I skip the next class?</p>
              <p style={{ fontSize: '18px', fontWeight: '700', color: calculations.canSkip ? '#6EE7B7' : '#FCA5A5', marginBottom: '4px' }}>
                {calculations.canSkip ? 'Yes' : 'No'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Attendance after skipping: {calculations.nextPctIfSkip.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {recentHistory.length > 0 && (
        <div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Recent Logs</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recentHistory.map(l => {
              const opt = STATUS_OPTIONS.find(o => o.key === l.status)
              const d = parseLocalDate(l.date)
              const sameDateSessions = subjectLogs.filter(x => x.date === l.date).length
              return (
                <button
                  key={l.id}
                  onClick={() => { triggerHaptic(); setSelectedDate(l.date); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${l.date === selectedDate ? opt?.color : 'var(--border)'}`,
                    background: 'var(--surface)', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>
                      {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {sameDateSessions > 1 && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                        Class {subjectLogs.filter(x => x.date === l.date).findIndex(x => x.id === l.id) + 1}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: opt?.color || 'var(--text-muted)' }}>
                    {opt?.short || l.status}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showCalendar && (
        <FloatingCalendar 
          selectedDate={selectedDate} 
          maxDate={maxDate} 
          onSelect={(d) => {
            setSelectedDate(d);
            setShowCalendar(false);
            triggerHaptic();
          }} 
          onClose={() => setShowCalendar(false)} 
        />
      )}

      {showSubjectSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'fadeIn 0.2s ease' }} onClick={() => setShowSubjectSheet(false)}>
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--surface)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', paddingBottom: '20px', animation: 'slideUp 0.3s ease' }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text)' }}>Select Subject</p>
              <button onClick={() => setShowSubjectSheet(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-2)', borderRadius: '10px', padding: '8px 12px' }}>
                <Search size={16} color="var(--text-muted)" />
                <input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', width: '100%', fontSize: '14px' }}
                />
              </div>
            </div>
            <div className="att-scroll-y" style={{ overflowY: 'auto', padding: '0 16px' }}>
              {filteredSubjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSubject(s.id); setShowSubjectSheet(false); setSearchQuery(''); triggerHaptic(); }}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '10px', marginBottom: '6px', textAlign: 'left',
                    background: selectedSubject === s.id ? 'var(--surface-2)' : 'transparent',
                    border: `1px solid ${selectedSubject === s.id ? 'var(--accent)' : 'transparent'}`,
                    color: 'var(--text)', fontWeight: '500', fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  {s.name}
                </button>
              ))}
              {filteredSubjects.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '20px' }}>No subjects found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

// --- FLOATING CALENDAR MODAL ---
const FloatingCalendar = React.memo(function FloatingCalendar({ selectedDate, maxDate, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(() => parseLocalDate(selectedDate));
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dStr = toLocalDateStr(d);
    days.push({
      date: dStr,
      day: i,
      isFuture: dStr > maxDate,
      isSelected: dStr === selectedDate
    });
  }

  const changeMonth = (offset) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      zIndex: 1150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px',
        width: '100%', maxWidth: '360px', padding: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        animation: 'scaleIn 0.2s ease'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '8px', padding: '8px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text)' }}>
            {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => changeMonth(1)} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: '8px', padding: '8px', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, i) => (
            day ? (
              <button
                key={i}
                disabled={day.isFuture}
                onClick={() => onSelect(day.date)}
                style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', fontSize: '13px', fontWeight: '600',
                  border: 'none',
                  background: day.isSelected ? 'var(--accent)' : 'transparent',
                  color: day.isSelected ? '#0A0A0F' : day.isFuture ? 'var(--border)' : 'var(--text)',
                  cursor: day.isFuture ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {day.day}
              </button>
            ) : (
              <div key={i} />
            )
          ))}
        </div>
      </div>
    </div>
  );
});

// --- SUBJECT-WISE BAR CHART COMPONENT (ALIGNMENT BUG FIXED) ---
const SubjectAttendanceGraph = React.memo(function SubjectAttendanceGraph({ data, minRequired }) {
  // Clamp threshold to chart scale [0, 100]
  const safeThreshold = Math.max(0, Math.min(100, minRequired));

  return (
    <div style={{ overflowX: 'auto', paddingBottom: '8px', position: 'relative', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', height: '140px', position: 'relative', padding: '0 10px 24px', minWidth: 'min-content' }}>
        {/* Grid + Threshold — aligned to the BAR AREA only (excludes label strip) */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: '24px', /* matches padding-bottom of bar container */
          pointerEvents: 'none'
        }}>
          {[100, 75, 50, 25, 0].map(y => (
            <div key={y} style={{ 
              position: 'absolute', 
              bottom: `${y}%`, 
              left: 0, right: 0, 
              borderBottom: y === 0 ? '1px solid var(--border)' : '1px dashed var(--border)',
            }}>
              <span style={{ position: 'absolute', left: 0, bottom: '-5px', fontSize: '9px', color: 'var(--text-muted)' }}>{y}</span>
            </div>
          ))}
          {/* Threshold line — clamped and aligned to bar area */}
          <div style={{ 
            position: 'absolute', 
            bottom: `${safeThreshold}%`, 
            left: 0, right: 0, 
            borderBottom: '2px solid var(--accent)',
            opacity: 0.8
          }}>
            <span style={{ position: 'absolute', right: 0, bottom: '-12px', fontSize: '9px', color: 'var(--accent)', fontWeight: '700' }}>{safeThreshold}% req</span>
          </div>
        </div>

        {/*
          Bars — FIX: wrapper height was previously `calc(100% - 24px)`, which double-subtracted
          the 24px label strip (it's already excluded from this flex container's content box via
          padding-bottom, and the grid/threshold overlay above is sized to that same content box).
          That extra subtraction made a 100% bar stop ~24px short of the top, so it rendered below
          the 85% threshold line. Using the full `100%` here makes the bar's scale match the grid's
          scale exactly, 1:1.
        */}
        {data.map(sub => (
          <div key={sub.id} style={{ 
            height: '100%', 
            width: '40px', 
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-end',
            position: 'relative', 
            zIndex: 1
          }}>
            <div style={{ 
              width: '100%', 
              height: `${Math.max(0, Math.min(100, sub.pct))}%`, 
              background: sub.pct >= minRequired ? '#6EE7B7' : '#FCA5A5',
              borderRadius: '4px 4px 0 0',
              minHeight: '2px',
              position: 'relative',
              transition: 'height 0.3s ease, background 0.3s ease'
            }}>
              <span style={{ 
                position: 'absolute', 
                top: '-16px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                fontSize: '10px', 
                color: 'var(--text)', 
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}>
                {sub.pct.toFixed(0)}%
              </span>
            </div>
            <div style={{ 
              position: 'absolute', 
              bottom: '-24px', 
              left: '0', 
              width: '100%', 
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '10px',
              color: 'var(--text-muted)'
            }}>
              {sub.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const pillBtn = {
  padding: '8px 14px', borderRadius: '20px', border: '1px solid var(--border)', 
  background: 'var(--surface-2)', color: 'var(--text)', fontSize: '12px', fontWeight: '500',
  cursor: 'pointer', transition: 'background 0.2s'
}
const pillBtnActive = {
  ...pillBtn,
  background: 'var(--accent)', color: '#0A0A0F', border: '1px solid var(--accent)'
}

export default AttendanceTracker