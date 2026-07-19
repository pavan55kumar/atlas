import { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, ChevronDown, School } from 'lucide-react'
import { supabase } from './lib/supabase'

const EASE = [0.22, 1, 0.36, 1]

const styleSheet = `
  .atlas-subjects-container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 0 calc(24px + env(safe-area-inset-bottom)) 0;
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }

  /* ========== HEADER ========== */
  .academic-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    gap: 12px;
  }
  .academic-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.01em;
  }
  .header-badges {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }
  .semester-badge {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    height: 32px;
    box-sizing: border-box;
  }
  .sgpa-badge {
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
    border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
    padding: 6px 14px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    height: 32px;
    box-sizing: border-box;
  }

  /* ========== SUMMARY ========== */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .summary-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .summary-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .summary-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
  .summary-sub {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* ========== SECTION & FORM ========== */
  .subjects-section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 16px;
    gap: 12px;
  }
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 4px 0;
  }
  .section-sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }
  .add-subject-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
    border: 1px solid color-mix(in srgb, var(--accent) 25%, var(--border));
    color: var(--accent);
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
    height: 36px;
    flex-shrink: 0;
  }
  .add-subject-btn:hover {
    background: color-mix(in srgb, var(--accent) 18%, var(--surface-2));
  }
  .btn-text-mobile { display: none; }

  .add-form-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .form-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
  }
  .form-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text);
    font-size: 14px;
    box-sizing: border-box;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s ease;
  }
  .form-input:focus {
    border-color: var(--accent);
  }
  .form-error {
    color: #ef4444;
    font-size: 13px;
    margin-bottom: 12px;
  }
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .btn-cancel {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: all 0.2s;
  }
  .btn-cancel:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .btn-submit {
    background: var(--accent);
    border: 1px solid var(--accent);
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: opacity 0.2s;
  }
  .btn-submit:hover {
    opacity: 0.9;
  }

  /* ========== DESKTOP SUBJECTS ========== */
  .subjects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .subject-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color 0.2s ease;
  }
  .subject-card:hover {
    border-color: var(--accent);
  }
  .card-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .subject-icon {
    width: 32px; 
    height: 32px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    display: flex; 
    align-items: center; 
    justify-content: center;
    color: var(--accent);
    border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
    flex-shrink: 0;
  }
  .subject-info {
    flex: 1;
    min-width: 0;
  }
  .subject-info h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .subject-info p {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }
  .status-active {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.15);
  }
  .status-graded {
    color: #10b981;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.15);
  }
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .btn-delete {
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  /* ========== DROPDOWN ========== */
  .dropdown-wrapper {
    position: relative;
    width: 150px;
  }
  .dropdown-btn {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .dropdown-btn:focus {
    border-color: var(--accent);
  }
  .dropdown-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: transparent;
  }
  .dropdown-list {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 4px;
    z-index: 50;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    list-style: none;
    margin: 0;
    box-sizing: border-box;
  }
  .dropdown-item {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-muted);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .dropdown-item:hover {
    background: var(--surface-2);
    color: var(--text);
  }
  .dropdown-item.active {
    background: var(--accent);
    color: white;
  }
  .chevron-icon {
    transition: transform 0.2s ease;
  }
  .chevron-icon.open {
    transform: rotate(180deg);
  }

  /* ========== MOBILE ACCORDION ========== */
  .mobile-accordion-item {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    margin-bottom: 10px;
  }
  .accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    background: transparent;
    border: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    color: var(--text);
    min-height: 44px;
  }
  .mobile-row-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .mobile-subject-info {
    min-width: 0;
  }
  .mobile-subject-info h4 {
    margin: 0 0 4px 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mobile-subject-info p {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mobile-row-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .accordion-drawer {
    padding: 0 16px 16px 16px;
  }
  .accordion-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    gap: 12px;
  }

  /* ========== EMPTY & LOADING ========== */
  .empty-state {
    text-align: center;
    padding: 48px 20px;
    border: 1px dashed var(--border);
    border-radius: 16px;
  }
  .empty-icon {
    color: var(--text-muted);
    margin-bottom: 16px;
    display: inline-block;
  }
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px 0;
  }
  .empty-text {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
  .skeleton-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    height: 110px;
  }
  .skeleton-line {
    height: 12px;
    background: var(--surface);
    border-radius: 6px;
    margin-bottom: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 0.8; }
    100% { opacity: 0.5; }
  }

  /* ========== MODAL ========== */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .modal-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    max-width: 380px;
    width: 100%;
    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  }
  .modal-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px 0;
  }
  .modal-text {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0 0 20px 0;
    line-height: 1.5;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .btn-danger {
    background: #ef4444;
    color: white;
    border: 1px solid #ef4444;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .btn-danger:hover {
    background: #dc2626;
  }

  /* ========== RESPONSIVE ========== */
  @media (max-width: 768px) {
    .academic-header {
      margin-bottom: 20px;
    }
    .academic-title {
      font-size: 16px;
    }
    .header-badges {
      gap: 8px;
    }
    .semester-badge, .sgpa-badge {
      height: 30px;
      padding: 4px 10px;
      font-size: 11px;
    }
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      padding: 14px;
    }
    .summary-value {
      font-size: 20px;
    }
    .subjects-section-header {
      align-items: flex-end;
      margin-bottom: 12px;
    }
    .form-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .subjects-grid {
      display: none;
    }
  }

  @media (max-width: 480px) {
    .btn-text-desktop { display: none; }
    .btn-text-mobile { display: inline; }
    .add-subject-btn {
      padding: 8px 12px;
    }
  }

  @media (min-width: 769px) {
    .mobile-accordion-list-container {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const GRADE_MAP = {
  '10': 'O',
  '9': 'A+',
  '8': 'A',
  '7': 'B+',
  '6': 'B',
  '5': 'C',
  '0': 'F'
}

function getGradeLetter(val) {
  if (val === null || val === undefined) return ''
  return GRADE_MAP[val.toString()] || ''
}

function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedSubjectId, setExpandedSubjectId] = useState(null)
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false)
  const [formError, setFormError] = useState('')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchSubjects = useCallback(async () => {
    setError('')
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      setError('Couldn\'t load subjects. Please try again.')
    } else {
      setSubjects(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubjects()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [fetchSubjects])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && deleteTarget) {
        setDeleteTarget(null)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [deleteTarget])

  async function addSubject(e) {
    e.preventDefault()
    setFormError('')

    if (!name.trim() || !credits) {
      setFormError('Subject name and credits are required.')
      return
    }

    const parsedCredits = parseInt(credits, 10)
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      setFormError('Please enter valid credits (greater than 0).')
      return
    }

    const { error } = await supabase
      .from('subjects')
      .insert([{ name, credits: parsedCredits, faculty, user_id: userId }])

    if (error) {
      setFormError('Couldn\'t add subject. Please try again.')
    } else {
      setName('')
      setCredits('')
      setFaculty('')
      setIsAddFormExpanded(false)
      fetchSubjects()
    }
  }

  const updateGrade = useCallback(async (subject, value) => {
    const gp = value === '' ? null : parseFloat(value)
    const { error } = await supabase.from('subjects').update({ grade_point: gp }).eq('id', subject.id)
    if (!error) {
      fetchSubjects()
    } else {
      setError('Failed to update grade.')
    }
  }, [fetchSubjects])

  const requestDelete = useCallback((subject) => {
    setDeleteTarget(subject)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from('subjects').delete().eq('id', deleteTarget.id)
    if (!error) {
      fetchSubjects()
    } else {
      setError('Failed to delete subject.')
    }
    setDeleteTarget(null)
  }, [deleteTarget, fetchSubjects])

  const handleToggleExpand = useCallback((id) => {
    setExpandedSubjectId(prevId => prevId === id ? null : id)
  }, [])

  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0)
  const gradedSubjects = subjects.filter(s => s.grade_point !== null && s.grade_point !== undefined)
  const gradedCredits = gradedSubjects.reduce((a, s) => a + (s.credits || 0), 0)
  const sgpa = gradedCredits > 0
    ? (gradedSubjects.reduce((a, s) => a + s.grade_point * s.credits, 0) / gradedCredits).toFixed(2)
    : null

  const totalSubjectsCount = subjects.length
  const completedPercentage = totalSubjectsCount > 0
    ? Math.round((gradedSubjects.length / totalSubjectsCount) * 100)
    : 0

  return (
    <div className="atlas-subjects-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      <div className="academic-header">
        <h2 className="academic-title">Academic Overview</h2>
        <div className="header-badges">
          <span className="semester-badge">Current Semester</span>
          {sgpa && <span className="sgpa-badge">SGPA {sgpa}</span>}
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Subjects</span>
          <span className="summary-value">{totalSubjectsCount}</span>
          <span className="summary-sub">{gradedSubjects.length} graded</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Credits</span>
          <span className="summary-value">{totalCredits}</span>
          <span className="summary-sub">{gradedCredits} graded</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">SGPA</span>
          <span className="summary-value">{sgpa ?? '—'}</span>
          <span className="summary-sub">{sgpa ? 'Based on graded courses' : 'No grades yet'}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Graded</span>
          <span className="summary-value">{gradedSubjects.length} / {totalSubjectsCount}</span>
          <span className="summary-sub">{completedPercentage}% complete</span>
        </div>
      </div>

      <div className="subjects-section-header">
        <div>
          <h3 className="section-title">Your Subjects</h3>
          <p className="section-sub">{totalSubjectsCount} courses · {totalCredits} total credits</p>
        </div>
        <button className="add-subject-btn" onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}>
          <Plus size={16} />
          <span className="btn-text-desktop">{isAddFormExpanded ? 'Cancel' : 'Add Subject'}</span>
          <span className="btn-text-mobile">{isAddFormExpanded ? 'Cancel' : 'Add'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddFormExpanded && (
          <motion.div
            className="add-form-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={addSubject}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="subject-name" className="form-label">Subject Name *</label>
                  <input
                    id="subject-name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Data Structures"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="credits" className="form-label">Credits *</label>
                  <input
                    id="credits"
                    type="number"
                    className="form-input"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="e.g. 4"
                    min="1"
                    step="1"
                    inputMode="numeric"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="faculty" className="form-label">Faculty (Optional)</label>
                  <input
                    id="faculty"
                    className="form-input"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="e.g. Dr. Smith"
                  />
                </div>
              </div>
              {formError && <div className="form-error">{formError}</div>}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsAddFormExpanded(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Subject
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div className="form-error" style={{ marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div className="subjects-grid">
          <div className="skeleton-card"><div className="skeleton-line" style={{ width: '60%' }}></div><div className="skeleton-line" style={{ width: '40%' }}></div></div>
          <div className="skeleton-card"><div className="skeleton-line" style={{ width: '60%' }}></div><div className="skeleton-line" style={{ width: '40%' }}></div></div>
          <div className="skeleton-card"><div className="skeleton-line" style={{ width: '60%' }}></div><div className="skeleton-line" style={{ width: '40%' }}></div></div>
          <div className="skeleton-card"><div className="skeleton-line" style={{ width: '60%' }}></div><div className="skeleton-line" style={{ width: '40%' }}></div></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">
            <School size={40} />
          </span>
          <h3 className="empty-title">No subjects yet</h3>
          <p className="empty-text">Add your semester subjects to track credits, grades and SGPA.</p>
          <button className="btn-submit" onClick={() => setIsAddFormExpanded(true)}>
            + Add Your First Subject
          </button>
        </div>
      ) : !isMobile ? (
        <div className="subjects-grid">
          {subjects.map((s) => (
            <DesktopSubjectCard 
              key={s.id} 
              subject={s} 
              onUpdateGrade={updateGrade} 
              onDelete={requestDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="mobile-accordion-list-container">
          {subjects.map((s) => (
            <MobileSubjectAccordionItem
              key={s.id}
              subject={s}
              isExpanded={expandedSubjectId === s.id}
              onToggle={handleToggleExpand}
              onUpdateGrade={updateGrade}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">Delete Subject?</h3>
              <p className="modal-text">"{deleteTarget.name}" will be permanently removed from your subjects.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CustomGradeDropdown = memo(function CustomGradeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const grades = [
    { label: 'Select Grade', val: '' },
    { label: '10.0 (O)', val: '10' },
    { label: '9.0 (A+)', val: '9' },
    { label: '8.0 (A)', val: '8' },
    { label: '7.0 (B+)', val: '7' },
    { label: '6.0 (B)', val: '6' },
    { label: '5.0 (C)', val: '5' },
    { label: '0.0 (F)', val: '0' }
  ]

  const currentGrade = grades.find(g => g.val === (value?.toString() || ''))
  const currentLabel = currentGrade && currentGrade.val !== '' ? `Grade: ${currentGrade.label}` : 'Select Grade'

  return (
    <div className="dropdown-wrapper">
      <button
        type="button"
        className="dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="dropdown-overlay" onClick={() => setIsOpen(false)} />
            <motion.ul
              className="dropdown-list"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: EASE }}
              role="listbox"
            >
              {grades.map((g) => (
                <li
                  key={g.val}
                  className={`dropdown-item ${value?.toString() === g.val ? 'active' : ''}`}
                  onClick={() => {
                    onChange(g.val)
                    setIsOpen(false)
                  }}
                  role="option"
                  aria-selected={value?.toString() === g.val}
                >
                  {g.label}
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

const DesktopSubjectCard = memo(function DesktopSubjectCard({ subject, onUpdateGrade, onDelete }) {
  const isGraded = subject.grade_point !== null && subject.grade_point !== undefined
  return (
    <motion.div
      className="subject-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="card-top">
        <div className="subject-icon">
          <School size={16} />
        </div>
        <div className="subject-info">
          <h4>{subject.name}</h4>
          <p>{subject.credits} Credits {subject.faculty ? `· ${subject.faculty}` : ''}</p>
        </div>
        <span className={`status-badge ${isGraded ? 'status-graded' : 'status-active'}`}>
          {isGraded ? `${getGradeLetter(subject.grade_point)} · ${subject.grade_point}` : 'Not graded'}
        </span>
      </div>

      <div className="card-bottom">
        <CustomGradeDropdown
          value={subject.grade_point}
          onChange={(val) => onUpdateGrade(subject, val)}
        />
        <button onClick={() => onDelete(subject)} className="btn-delete" aria-label={`Delete ${subject.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
})

const MobileSubjectAccordionItem = memo(function MobileSubjectAccordionItem({ subject, isExpanded, onToggle, onUpdateGrade, onDelete }) {
  const isGraded = subject.grade_point !== null && subject.grade_point !== undefined

  return (
    <motion.div
      className="mobile-accordion-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <button
        className="accordion-header"
        onClick={() => onToggle(subject.id)}
        aria-expanded={isExpanded}
        aria-controls={`drawer-${subject.id}`}
      >
        <div className="mobile-row-left">
          <div className="subject-icon">
            <School size={16} />
          </div>
          <div className="mobile-subject-info">
            <h4>{subject.name}</h4>
            <p>{subject.credits} Credits {subject.faculty ? `· ${subject.faculty}` : ''}</p>
          </div>
        </div>

        <div className="mobile-row-right">
          {isGraded ? (
            <span className={`status-badge status-graded`}>{getGradeLetter(subject.grade_point)} · {subject.grade_point}</span>
          ) : (
            <span className="status-badge status-active">Not graded</span>
          )}
          <ChevronDown
            size={16}
            className={`chevron-icon ${isExpanded ? 'open' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="drawer"
            id={`drawer-${subject.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="accordion-drawer"
          >
            <div className="accordion-controls">
              <CustomGradeDropdown
                value={subject.grade_point}
                onChange={(val) => onUpdateGrade(subject, val)}
              />
              <button onClick={() => onDelete(subject)} className="btn-delete" aria-label={`Delete ${subject.name}`}>
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

export default Subjects