import { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, School } from 'lucide-react'
import { supabase } from './lib/supabase'
import './Subjects.css'

const EASE = [0.22, 1, 0.36, 1]

function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false)
  const [formError, setFormError] = useState('')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // PERF: only fetch the columns this page actually uses. Same table,
  // same database — just a smaller payload over the wire.
  const fetchSubjects = useCallback(async () => {
    setError('')
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, credits, faculty, created_at')
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

  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0)
  const totalSubjectsCount = subjects.length

  return (
    <div className="atlas-subjects-container">
      <div className="academic-header">
        <h2 className="academic-title">Academic Overview</h2>
        <div className="header-badges">
          <span className="semester-badge">Current Semester</span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-label">Subjects</span>
          <span className="summary-value">{totalSubjectsCount}</span>
          <span className="summary-sub">Total enrolled</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Credits</span>
          <span className="summary-value">{totalCredits}</span>
          <span className="summary-sub">Total credits</span>
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
          <p className="empty-text">Add your semester subjects to track credits and course load.</p>
          <button className="btn-submit" onClick={() => setIsAddFormExpanded(true)}>
            + Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
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

// Single card used at every screen size — the layout itself (2 columns on
// desktop, 1 column on mobile) is handled purely by CSS Grid media queries
// in Subjects.css, so there's no separate desktop/mobile component tree
// and no JS resize listener needed to pick between them.
const SubjectCard = memo(function SubjectCard({ subject, onDelete }) {
  return (
    <motion.div
      className="subject-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
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
      </div>

      <div className="card-bottom">
        <button onClick={() => onDelete(subject)} className="btn-delete" aria-label={`Delete ${subject.name}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  )
})

export default Subjects