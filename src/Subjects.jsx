import { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, BookOpen, Layers, Trash2, Plus,
  ChevronDown, Flame, TrendingUp, Sparkles, School, Library, X, AlertCircle
} from 'lucide-react'
import { supabase } from './lib/supabase'

const EASE = [0.22, 1, 0.36, 1]

// ============================================================================
// STYLES — Resolves variables and implements professional high-density styles
// ============================================================================
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-coral: #ef4444;
    --accent-purple: var(--accent, #8b5cf6);
    --input-text: var(--text, #ffffff);
  }

  .subjects-wrapper {
    font-family: var(--atlas-font);
    color: var(--text-primary, var(--text, #f5f5f7));
    max-width: 1000px;
    margin: 0 auto;
    position: relative;
    padding: 16px 0;
  }

  .subjects-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
  }

  .subjects-title-area h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
    color: var(--text-primary, var(--text, #f5f5f7));
    line-height: 1.2;
  }

  .subjects-title-area p {
    font-size: 13.5px;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    margin: 0;
    font-weight: 500;
  }

  .subjects-header-badges {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .subjects-badge-neutral {
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 8px;
  }

  .subjects-badge-accent {
    background: var(--accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    color: var(--accent, #8b5cf6);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 8px;
  }

  /* Compact Summary grid */
  .subjects-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  @media (max-width: 768px) {
    .subjects-header-row {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      margin-bottom: 16px;
    }
    .subjects-title-area p {
      font-size: 13px;
    }
    .subjects-summary-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .subjects-header-badges {
      align-self: flex-start;
    }
  }

  .subject-kpi-card {
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: border-color 0.15s ease;
  }

  .subject-kpi-card:hover {
    border-color: var(--border-hover, rgba(255, 255, 255, 0.12));
  }

  .kpi-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .kpi-main-val {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary, var(--text, #f5f5f7));
    line-height: 1.1;
    margin-bottom: 4px;
  }

  .kpi-sub-val {
    font-size: 11px;
    color: var(--text-tertiary, var(--text-muted, #71717a));
    font-weight: 500;
  }

  /* Form and headers */
  .subject-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-bottom: 12px;
  }

  .subject-section-heading {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, var(--text, #f5f5f7));
    margin: 0;
  }

  .btn-add-subject-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.12));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    color: var(--accent, #8b5cf6);
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .btn-add-subject-trigger:hover {
    background-color: rgba(139, 92, 246, 0.20);
    border-color: rgba(139, 92, 246, 0.35);
  }

  .btn-add-subject-trigger.active {
    background-color: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.25);
    color: #ef4444;
  }

  .add-subject-form-panel {
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .add-subject-form-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary, var(--text, #f5f5f7));
    margin: 0 0 16px 0;
  }

  .add-subject-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 640px) {
    .add-subject-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .form-input-field {
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text, #f5f5f7);
    font-size: 13.5px;
    font-weight: 500;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .form-input-field:focus {
    outline: none;
    border-color: var(--accent, #8b5cf6);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .form-input-field::placeholder {
    color: var(--text-tertiary, var(--text-muted, #71717a));
  }

  .form-actions-row {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-form-cancel {
    background: transparent;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    padding: 10px 16px;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .btn-form-cancel:hover {
    background-color: var(--surface, #131316);
  }

  .btn-form-submit {
    background: var(--accent, #8b5cf6);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .btn-form-submit:hover {
    background-color: var(--accent-hover, #7c3aed);
  }

  /* Subject grid items */
  .subjects-desktop-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .subject-row-card {
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
    min-height: 74px;
  }

  .subject-row-card:hover {
    border-color: var(--accent, #8b5cf6);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .subject-row-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .subject-row-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.05));
    color: var(--accent, #8b5cf6);
    flex-shrink: 0;
  }

  .subject-row-titles {
    min-width: 0;
  }

  .subject-row-name {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: var(--text-primary, var(--text, #f5f5f7));
  }

  .subject-row-meta {
    font-size: 12.5px;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .subject-row-credits {
    background: var(--surface, #131316);
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 11px;
    color: var(--accent, #8b5cf6);
  }

  .subject-row-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .subject-row-status-pill {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;
  }

  .subject-row-status-pill.graded {
    background-color: rgba(16, 185, 129, 0.08);
    color: var(--accent-emerald, #10b981);
    border: 1px solid rgba(16, 185, 129, 0.15);
  }

  .subject-row-status-pill.active {
    background-color: rgba(245, 158, 11, 0.08);
    color: var(--accent-amber, #f59e0b);
    border: 1px solid rgba(245, 158, 11, 0.15);
  }

  .subject-confirm-delete-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    animation: fadeIn 0.15s ease-out;
  }

  .subject-confirm-delete-message {
    font-size: 13.5px;
    color: var(--text-primary, var(--text, #f5f5f7));
    font-weight: 600;
  }

  .subject-confirm-delete-actions {
    display: flex;
    gap: 8px;
  }

  .btn-confirm-delete-no {
    background: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    color: var(--text-secondary, var(--text-muted, #a1a1aa));
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-confirm-delete-yes {
    background-color: var(--accent-coral, #ef4444);
    border: none;
    border-radius: 8px;
    color: #ffffff;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  /* Skeleton loaders */
  .subject-skeleton-card {
    height: 74px;
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 0.3; }
  }

  /* Validation banner */
  .form-error-banner {
    background-color: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 10px;
    padding: 10px 14px;
    color: #ef4444;
    font-size: 12.5px;
    font-weight: 500;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .academic-brand-icon {
    width: 44px;
    height: 44px;
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8b5cf6;
  }

  .academic-completetion-chip {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(16, 185, 129, 0.1);
    color: var(--accent-emerald);
    border: 1px solid rgba(16, 185, 129, 0.15);
    white-space: nowrap;
  }

  .academic-pending-chip {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(245, 158, 11, 0.1);
    color: var(--accent-amber);
    border: 1px solid rgba(245, 158, 11, 0.15);
    white-space: nowrap;
  }

  .custom-dropdown-container { position: relative; width: 120px; z-index: 30; }

  .dropdown-trigger-btn {
    width: 100%;
    background: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--text, #f5f5f7);
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
    outline: none;
  }

  .dropdown-trigger-btn:focus { border-color: var(--accent, #8b5cf6); }
  .dropdown-chevron { color: var(--text-muted, #71717a); transition: transform 0.25s ease; }
  .dropdown-chevron.open { transform: rotate(180deg); }

  .dropdown-options-list {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    width: 100%;
    background: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    padding: 6px;
    margin: 0;
    list-style: none;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    z-index: 100;
    will-change: opacity, transform;
  }

  .dropdown-option-item { padding: 8px 10px; font-size: 12px; font-weight: 600; color: var(--text-secondary); border-radius: 8px; cursor: pointer; transition: all 0.15s ease; }
  .dropdown-option-item:hover { background: var(--surface, #131316); color: var(--text-primary); }
  .dropdown-option-item.selected { background: var(--accent, #8b5cf6); color: #ffffff; }

  .dropdown-click-outside-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 90; background: transparent; }

  .btn-destroy-subject {
    background: none;
    border: none;
    color: var(--text-muted, #71717a);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-destroy-subject:hover { background: rgba(239, 68, 68, 0.08); color: var(--accent-coral); }

  .dashboard-empty-state {
    text-align: center;
    padding: 60px 20px;
    border-radius: 24px;
    border: 1.5px dashed var(--border, rgba(255, 255, 255, 0.08));
    background: var(--surface-2, #161618);
    position: relative;
  }

  .empty-banner-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 16px 0 6px 0; }
  .empty-banner-subtitle { font-size: 13.5px; color: var(--text-secondary); max-width: 340px; margin: 0 auto 16px; line-height: 1.5; }

  @media (max-width: 768px) {
    .mobile-accordion-list-container { display: flex; flex-direction: column; gap: 10px; z-index: 10; position: relative; }

    .mobile-subject-accordion-item {
      background: var(--surface-2, #161618);
      border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
      border-radius: 18px;
      overflow: hidden;
      box-sizing: border-box;
      transition: box-shadow 0.3s ease;
    }

    .mobile-subject-accordion-item.is-active { border-left: 3px solid var(--accent, #8b5cf6); }
    .mobile-subject-accordion-item.is-graded { border-left: 3px solid var(--accent-emerald, #10b981); }

    .mobile-accordion-closed-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; min-height: 72px; cursor: pointer; user-select: none; box-sizing: border-box; }
    .mobile-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

    .mobile-accordion-icon {
      width: 36px; height: 36px; background: var(--surface, #131316); border: 1px solid var(--border, rgba(255, 255, 255, 0.05));
      border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent, #8b5cf6); flex-shrink: 0;
    }

    .mobile-subject-info-block { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
    .mobile-subject-name { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mobile-subject-meta-inline { font-size: 11px; color: var(--text-secondary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mobile-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .mobile-chevron-chevron { color: var(--text-muted, #71717a); transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
    .mobile-chevron-chevron.is-open { transform: rotate(180deg); }

    .mobile-accordion-drawer-body { padding: 0 16px 16px 16px; border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08)); will-change: opacity, transform; }
    .mobile-drawer-controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Helper mapping for grade representations
const getGradeLabel = (gp) => {
  if (gp === null || gp === undefined) return 'Active';
  const num = parseFloat(gp);
  if (num === 10) return 'O · 10';
  if (num === 9) return 'A+ · 9';
  if (num === 8) return 'A · 8';
  if (num === 7) return 'B+ · 7';
  if (num === 6) return 'B · 6';
  if (num === 5) return 'C · 5';
  if (num === 0) return 'F · 0';
  return `GP: ${gp}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedSubjectId, setExpandedSubjectId] = useState(null)
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')

  const fetchSubjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setSubjects(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSubjects()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [fetchSubjects])

  async function addSubject(e) {
    e.preventDefault()
    if (!name.trim()) {
      setValidationError('Please enter a subject name.')
      return
    }
    const parsedCredits = parseInt(credits)
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      setValidationError('Please enter a valid positive credit value.')
      return
    }
    setValidationError('')

    const { error } = await supabase
      .from('subjects')
      .insert([{ name, credits: parsedCredits, faculty, user_id: userId }])
    if (!error) {
      setName('')
      setCredits('')
      setFaculty('')
      setIsAddFormExpanded(false)
      fetchSubjects()
    } else {
      setValidationError("Couldn't add subject. Please try again.")
    }
  }

  const updateGrade = useCallback(async (subject, value) => {
    const gp = value === '' ? null : parseFloat(value)
    const { error } = await supabase.from('subjects').update({ grade_point: gp }).eq('id', subject.id)
    if (!error) {
      fetchSubjects()
    }
  }, [fetchSubjects])

  const deleteSubject = useCallback(async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id)
    if (!error) {
      fetchSubjects()
    }
  }, [fetchSubjects])

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
    <div className="subjects-wrapper">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      {/* ============================================================ PAGE HEADER */}
      <header className="subjects-header-row">
        <div className="subjects-title-area">
          <h1>Subjects</h1>
          <p>Manage your courses, credits, faculty, and semester grades.</p>
        </div>
        <div className="subjects-header-badges">
          <span className="subjects-badge-neutral">Current Semester</span>
          {sgpa && <span className="subjects-badge-accent">SGPA {sgpa}</span>}
        </div>
      </header>

      {/* ============================================================ ACADEMIC SUMMARY */}
      <section className="subjects-summary-grid" aria-label="Academic semester summary">
        <SummaryCard
          label="Subjects"
          value={totalSubjectsCount}
          desc={`${gradedSubjects.length} graded`}
        />
        <SummaryCard
          label="Total Credits"
          value={totalCredits}
          desc={`${gradedCredits} graded`}
        />
        <SummaryCard
          label="SGPA Progress"
          value={sgpa ?? '—'}
          desc="Current Average"
        />
        <SummaryCard
          label="Workload Ratio"
          value={`${gradedSubjects.length}/${totalSubjectsCount}`}
          desc={`${completedPercentage}% complete`}
        />
      </section>

      {/* ============================================================ ACTION BAR */}
      <div className="subject-action-bar">
        <div>
          <h2 className="subject-section-heading">Your Subjects</h2>
          <span className="subject-section-subtitle">
            {totalSubjectsCount} courses · {totalCredits} total credits
          </span>
        </div>
        <button
          className={`btn-add-subject-trigger ${isAddFormExpanded ? 'active' : ''}`}
          onClick={() => {
            setIsAddFormExpanded(!isAddFormExpanded);
            setValidationError('');
          }}
          aria-expanded={isAddFormExpanded}
        >
          {isAddFormExpanded ? <X size={14} /> : <Plus size={14} />}
          <span>{isAddFormExpanded ? 'Cancel' : 'Add Subject'}</span>
        </button>
      </div>

      {/* ============================================================ ADD SUBJECT PANEL */}
      <AnimatePresence initial={false}>
        {isAddFormExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="add-subject-form-panel"
            style={{ overflow: 'hidden' }}
          >
            <h3 className="add-subject-form-title">Add Course Details</h3>
            {validationError && (
              <div className="form-error-banner" role="alert">
                <AlertCircle size={15} />
                <span>{validationError}</span>
              </div>
            )}
            <form onSubmit={addSubject}>
              <div className="add-subject-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="subject-name">Subject Name *</label>
                  <input
                    id="subject-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="form-input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="subject-credits">Credits *</label>
                  <input
                    id="subject-credits"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    placeholder="e.g. 4"
                    className="form-input-field"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="subject-faculty">Faculty (Optional)</label>
                  <input
                    id="subject-faculty"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="e.g. Dr. Smith"
                    className="form-input-field"
                  />
                </div>
              </div>
              <div className="form-actions-row">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddFormExpanded(false);
                    setValidationError('');
                  }}
                  className="btn-form-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-form-submit">
                  Add Subject
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ SUBJECT LISTINGS */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="subject-skeleton-card" />
          <div className="subject-skeleton-card" style={{ animationDelay: '0.15s' }} />
          <div className="subject-skeleton-card" style={{ animationDelay: '0.3s' }} />
        </div>
      ) : subjects.length === 0 ? (
        <div className="dashboard-empty-state">
          <GraduationCap size={44} color="var(--accent, #8b5cf6)" style={{ margin: '0 auto 16px' }} />
          <h3 className="empty-banner-title">No subjects added yet</h3>
          <p className="empty-banner-subtitle">
            Create subjects and allocate credit values above to activate your academic workspace.
          </p>
          <button
            onClick={() => setIsAddFormExpanded(true)}
            className="btn-add-subject-trigger"
          >
            <Plus size={14} />
            <span>Add Your First Subject</span>
          </button>
        </div>
      ) : !isMobile ? (
        <div className="subjects-desktop-list">
          {subjects.map((s) => (
            <DesktopSubjectCard
              key={s.id}
              subject={s}
              onUpdateGrade={updateGrade}
              onDelete={deleteSubject}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
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
              onDelete={deleteSubject}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPACT KPI CARD
// ============================================================================
const SummaryCard = memo(function SummaryCard({ label, value, desc }) {
  return (
    <div className="subject-kpi-card">
      <div className="kpi-title-row">
        <span>{label}</span>
      </div>
      <div className="kpi-main-val">{value}</div>
      <div className="kpi-sub-val">{desc}</div>
    </div>
  )
})

// ============================================================================
// CUSTOM ACCESSIBLE GRADE SELECTOR
// ============================================================================
const CustomGradeDropdown = memo(function CustomGradeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const grades = [
    { label: 'Grade', val: '' },
    { label: '10.0 (O)', val: '10' },
    { label: '9.0 (A+)', val: '9' },
    { label: '8.0 (A)', val: '8' },
    { label: '7.0 (B+)', val: '7' },
    { label: '6.0 (B)', val: '6' },
    { label: '5.0 (C)', val: '5' },
    { label: '0.0 (F)', val: '0' }
  ]

  const currentLabel = grades.find(g => g.val === (value?.toString() || ''))?.label || 'Select Grade'

  return (
    <div className="custom-dropdown-container">
      <button
        type="button"
        className="dropdown-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{currentLabel}</span>
        <ChevronDown size={14} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="dropdown-click-outside-overlay" onClick={() => setIsOpen(false)} />
            <motion.ul
              className="dropdown-options-list"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: EASE }}
              role="listbox"
            >
              {grades.map((g) => (
                <li
                  key={g.val}
                  className={`dropdown-option-item ${value?.toString() === g.val ? 'selected' : ''}`}
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

// ============================================================================
// DESKTOP COURSE LAYOUT Row/Card
// ============================================================================
const DesktopSubjectCard = memo(function DesktopSubjectCard({
  subject,
  onUpdateGrade,
  onDelete,
  confirmDeleteId,
  setConfirmDeleteId
}) {
  const isGraded = subject.grade_point !== null && subject.grade_point !== undefined
  const isConfirming = confirmDeleteId === subject.id

  return (
    <div className="subject-row-card">
      <AnimatePresence mode="wait">
        {!isConfirming ? (
          <motion.div
            key="content"
            className="subject-row-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <div className="subject-row-icon-wrap" aria-hidden="true">
              <School size={16} />
            </div>
            <div className="subject-row-titles">
              <h4 className="subject-row-name">{subject.name}</h4>
              <div className="subject-row-meta">
                <span className="subject-row-credits">{subject.credits} Credits</span>
                {subject.faculty && (
                  <>
                    <span>·</span>
                    <span>{subject.faculty}</span>
                  </>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div className="subject-row-actions">
              <span className={`subject-row-status-pill ${isGraded ? 'graded' : 'active'}`}>
                {isGraded ? 'Graded' : 'Active'}
              </span>
              <CustomGradeDropdown
                value={subject.grade_point}
                onChange={(val) => onUpdateGrade(subject, val)}
              />
              <button
                onClick={() => setConfirmDeleteId(subject.id)}
                className="btn-destroy-subject"
                title="Delete Subject"
                aria-label={`Delete ${subject.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            className="subject-confirm-delete-box"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <span className="subject-confirm-delete-message">
              Delete "{subject.name}"? This action cannot be undone.
            </span>
            <div className="subject-confirm-delete-actions">
              <button
                className="btn-confirm-delete-no"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete-yes"
                onClick={() => {
                  onDelete(subject.id)
                  setConfirmDeleteId(null)
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ============================================================================
// MOBILE COURSE LAYOUT Row/Accordion
// ============================================================================
const MobileSubjectAccordionItem = memo(function MobileSubjectAccordionItem({
  subject,
  isExpanded,
  onToggle,
  onUpdateGrade,
  onDelete,
  confirmDeleteId,
  setConfirmDeleteId
}) {
  const isGraded = subject.grade_point !== null && subject.grade_point !== undefined
  const isConfirming = confirmDeleteId === subject.id
  const currentGradeLabel = getGradeLabel(subject.grade_point)

  return (
    <div className={`mobile-subject-accordion-item ${isExpanded ? 'is-active' : ''} ${isGraded ? 'is-graded' : ''}`}>
      <AnimatePresence mode="wait">
        {!isConfirming ? (
          <motion.div
            key="normal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <button
              className="mobile-accordion-closed-row"
              onClick={() => onToggle(subject.id)}
              aria-expanded={isExpanded}
              aria-controls={`mobile-details-${subject.id}`}
              style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
            >
              <div className="mobile-row-left">
                <div className="mobile-accordion-icon" aria-hidden="true">
                  <Library size={16} />
                </div>
                <div className="mobile-subject-info-block">
                  <h4 className="mobile-subject-name">{subject.name}</h4>
                  <div className="mobile-subject-meta-inline">
                    {subject.credits} Credits {subject.faculty ? `· ${subject.faculty}` : ''}
                  </div>
                </div>
              </div>

              <div className="mobile-row-right">
                <span className={isGraded ? 'academic-completetion-chip' : 'academic-pending-chip'}>
                  {isGraded ? `${currentGradeLabel}` : 'Active'}
                </span>
                <ChevronDown
                  size={15}
                  className={`mobile-chevron-chevron ${isExpanded ? 'is-open' : ''}`}
                />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  id={`mobile-details-${subject.id}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="mobile-accordion-drawer-body"
                >
                  <div className="mobile-drawer-controls">
                    <CustomGradeDropdown
                      value={subject.grade_point}
                      onChange={(val) => onUpdateGrade(subject, val)}
                    />
                    <button
                      onClick={() => setConfirmDeleteId(subject.id)}
                      className="btn-destroy-subject"
                      title="Delete Course"
                      aria-label={`Delete ${subject.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            className="mobile-accordion-closed-row"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <span className="subject-confirm-delete-message" style={{ fontSize: '13px' }}>
                Delete "{subject.name}"? This action cannot be undone.
              </span>
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                <button
                  className="btn-confirm-delete-no"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-delete-yes"
                  onClick={() => {
                    onDelete(subject.id)
                    setConfirmDeleteId(null)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default Subjects