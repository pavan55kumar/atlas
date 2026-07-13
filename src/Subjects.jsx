import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, BookOpen, Award, Layers, Trash2, CalendarDays, Plus, 
  ChevronDown, Flame, CheckCircle, TrendingUp, Sparkles, School, Library 
} from 'lucide-react'
import { supabase } from './lib/supabase'

// Premium Theme Adaptive Glassmorphic Stylesheet (Optimized for ultra-compact mobile UX)
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Handcrafted Dark Theme Colors (Reference Image 1: Deep Indigo/Crimson Fusion) */
    --canvas-bg: #090810;
    --glass-bg: rgba(18, 16, 30, 0.65);
    --glass-border: rgba(255, 255, 255, 0.05);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%);
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.6);
    --input-border: rgba(255, 255, 255, 0.06);
    --input-focus-border: #8b5cf6;
    --input-focus-glow: rgba(139, 92, 246, 0.25);
    
    /* Gradients matching your dark mockup */
    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.4);
    --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    /* Ambient sphere tints */
    --aurora-primary: rgba(139, 92, 246, 0.12);
    --aurora-secondary: rgba(236, 72, 153, 0.08);
    --aurora-tertiary: rgba(59, 130, 246, 0.08);
  }

  /* Handcrafted Light Theme Colors (Reference Image 2: Soft Pastel Mesh Gradient UI) */
  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f8fafc;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-glow: linear-gradient(135deg, rgba(92, 71, 245, 0.15) 0%, rgba(224, 83, 93, 0.15) 100%);
    --text-primary: #1e1b4b;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.75);
    --input-border: rgba(15, 23, 42, 0.08);
    --input-focus-border: #6366f1;
    --input-focus-glow: rgba(99, 102, 241, 0.15);
    
    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-glow: rgba(99, 102, 241, 0.2);
    --card-shadow: 0 15px 35px rgba(31, 38, 135, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
    
    /* Light Theme soft pastel gradients */
    --aurora-primary: #ffe3d8; /* Peach sphere */
    --aurora-secondary: #dce5ff; /* Soft periwinkle sphere */
    --aurora-tertiary: #eedcff; /* Pale lavender sphere */
  }

  .subjects-wrapper {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: 20px 0;
  }

  /* --- Glowing Backdrop Aurora Spheres --- */
  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(90px);
    pointer-events: none;
    z-index: 0;
    transition: background 0.5s ease;
  }

  .sphere-primary {
    top: 5%;
    left: -10%;
    width: 450px;
    height: 450px;
    background: var(--aurora-primary);
  }

  .sphere-secondary {
    bottom: 10%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: var(--aurora-secondary);
  }

  .sphere-tertiary {
    top: 40%;
    left: 40%;
    width: 350px;
    height: 350px;
    background: var(--aurora-tertiary);
  }

  /* --- Hero Header --- */
  .subjects-hero-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 32px 40px;
    margin-bottom: 32px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
  }

  .hero-info-area h1 {
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 6px 0;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .hero-info-area p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
  }

  .hero-meta-badges {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .semester-pill {
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.15);
    color: #8b5cf6;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
  }

  .sgpa-badge-glowing {
    background: linear-gradient(135deg, #ffeaa7 0%, #e1b12c 100%);
    color: #0c0b11;
    font-size: 12px;
    font-weight: 800;
    padding: 6px 16px;
    border-radius: 100px;
    box-shadow: 0 4px 12px rgba(225, 177, 44, 0.3);
  }

  /* --- KPI Summary Grid --- */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
    z-index: 10;
    position: relative;
  }

  .kpi-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 20px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }

  .kpi-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .kpi-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .kpi-icon-wrapper {
    color: var(--text-secondary);
    opacity: 0.8;
  }

  .kpi-main-metric {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 6px;
  }

  .kpi-desc-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .kpi-desc {
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 500;
    max-width: 60%;
  }

  /* --- Subject Creation Section --- */
  .subject-form-panel {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    margin-bottom: 32px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
  }

  .subject-form {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  .subject-input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 14px;
    padding: 14px 18px;
    color: var(--input-text);
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .subject-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .subject-input:focus {
    outline: none;
    border-color: var(--input-focus-border);
    background: var(--input-bg);
    box-shadow: 0 0 0 3px var(--input-focus-glow);
  }

  .subject-input.name {
    flex: 2;
    min-width: 200px;
  }

  .subject-input.credits {
    width: 100px;
    min-width: 80px;
  }

  .subject-input.faculty {
    flex: 1.2;
    min-width: 150px;
  }

  .btn-subject-add {
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 14px;
    padding: 14px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 16px var(--btn-primary-glow);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .btn-subject-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px var(--btn-primary-glow);
  }

  /* --- Subject Display Grid --- */
  .subjects-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    z-index: 10;
    position: relative;
  }

  .premium-subject-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 220px;
    position: relative;
    overflow: visible; /* Prevents custom dropdown menu list clipping */
    transition: border-color 0.3s ease;
  }

  .premium-subject-card:hover {
    border-image: var(--glass-border-glow) 1;
    border-radius: 24px; /* Fixes standard browser border-image radius clipping */
  }

  .card-top-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    z-index: 2;
    position: relative;
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
  }

  .card-text-body {
    margin: 16px 0;
    z-index: 2;
    position: relative;
  }

  .card-subject-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 6px 0;
    line-height: 1.3;
  }

  .card-subject-meta {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .card-credits-indicator {
    background: var(--input-bg);
    padding: 2px 8px;
    border-radius: 6px;
    font-weight: 600;
  }

  .card-divider-line {
    height: 1px;
    background: var(--glass-border);
    margin-bottom: 16px;
    z-index: 2;
    position: relative;
  }

  .card-grades-tray {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    z-index: 20;
    position: relative;
  }

  /* --- Gorgeous Custom Dropdown (Select-list replacement) --- */
  .custom-dropdown-container {
    position: relative;
    width: 120px;
    z-index: 30;
  }

  .dropdown-trigger-btn {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--input-text);
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

  .dropdown-trigger-btn:focus {
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 3px var(--input-focus-glow);
  }

  .dropdown-chevron {
    color: var(--text-secondary);
    transition: transform 0.25s ease;
  }

  .dropdown-chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-options-list {
    position: absolute;
    bottom: calc(100% + 8px); /* Pop upward to prevent container edge clipping */
    left: 0;
    width: 100%;
    background: var(--glass-bg);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 6px;
    margin: 0;
    list-style: none;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    z-index: 100;
  }

  .dropdown-option-item {
    padding: 8px 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .dropdown-option-item:hover {
    background: var(--input-bg);
    color: var(--text-primary);
  }

  .dropdown-option-item.selected {
    background: var(--btn-primary-bg);
    color: #ffffff;
  }

  .dropdown-click-outside-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    background: transparent;
  }

  .btn-destroy-subject {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-destroy-subject:hover {
    background: rgba(239, 68, 68, 0.08);
    color: var(--accent-coral);
  }

  /* --- Empty State --- */
  .dashboard-empty-state {
    text-align: center;
    padding: 60px 20px;
    border-radius: 28px;
    border: 1.5px dashed var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
  }

  .empty-banner-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 16px 0 6px 0;
  }

  .empty-banner-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 340px;
    margin: 0 auto;
    line-height: 1.5;
  }

  /* =========================================================================
     MOBILE SECURE RENDERING - ZERO LAG COMPACT NATIVE ACCORDION
     ========================================================================= */
  @media (max-width: 768px) {
    /* Compact 60% smaller hero banner to prioritize main content list */
    .subjects-hero-header {
      padding: 16px 20px;
      margin-bottom: 16px;
      border-radius: 16px;
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .subjects-hero-header h1 {
      font-size: 20px !important;
    }

    .subjects-hero-header p {
      display: none; /* Collapses decorative long text */
    }

    /* Snapping horizontal swipeable carousel for statistics */
    .stats-carousel-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 10px;
      padding-bottom: 4px;
      margin-bottom: 16px;
      -webkit-overflow-scrolling: touch;
    }
    
    .stats-carousel-grid::-webkit-scrollbar {
      display: none; /* Hide scrollbar tracking */
    }

    .kpi-card-glass {
      flex: 0 0 70%; /* Reveals subsequent metrics slightly on right edge to suggest swiping */
      scroll-snap-align: start;
      min-height: 94px;
      padding: 14px;
      border-radius: 14px;
    }

    .kpi-main-metric {
      font-size: 20px !important;
      margin-bottom: 2px;
    }

    .kpi-desc {
      font-size: 10px !important;
    }

    .golden-trophy-badge {
      display: none !important; /* Hides decorative heavy icon inside carousel block */
    }

    /* Hide Desktop Grid on Mobile Viewports */
    .subjects-dashboard-grid {
      display: none;
    }

    /* Mobile Accordion Container styling */
    .mobile-accordion-list-container {
      display: flex;
      flex-direction: column;
      gap: 8px; /* Compact gap */
      z-index: 10;
      position: relative;
    }

    .mobile-subject-accordion-item {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      box-shadow: var(--card-shadow);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow: hidden;
      box-sizing: border-box;
    }

    .mobile-subject-accordion-item.is-active {
      border-left: 3px solid #7c3aed;
    }

    .mobile-subject-accordion-item.is-graded {
      border-left: 3px solid #10b981;
    }

    /* Reduced height mobile closed state (~72px height) */
    .mobile-accordion-closed-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      min-height: 72px;
      cursor: pointer;
      user-select: none;
      box-sizing: border-box;
    }

    .mobile-row-left {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
    }

    .mobile-accordion-icon {
      width: 36px;
      height: 36px;
      background: var(--input-bg);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b5cf6;
      flex-shrink: 0;
    }

    .mobile-subject-info-block {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .mobile-subject-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mobile-subject-meta-inline {
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 500;
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

    .mobile-chevron-chevron {
      color: var(--text-tertiary);
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .mobile-chevron-chevron.is-open {
      transform: rotate(180deg);
    }

    /* Mobile Accordion Expanded Drawer body */
    .mobile-accordion-drawer-body {
      padding: 0 16px 16px 16px;
      border-top: 1px solid var(--glass-border);
    }

    .mobile-drawer-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 14px;
    }

    /* Floating Expandable Subject Form Panel */
    .subject-form-panel {
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 16px;
    }

    .subject-form {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    
    .subject-input {
      width: 100% !important;
    }

    .btn-subject-add {
      width: 100% !important;
      justify-content: center;
    }

    .mobile-add-subject-form-trigger {
      background: var(--btn-primary-bg);
      border-radius: 14px;
      padding: 12px;
      text-align: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px var(--btn-primary-glow);
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .subjects-dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .stats-carousel-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .subject-form {
      flex-wrap: wrap;
    }
  }
`;

function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)

  // Layout states for reactive and mobile features
  const [isMobile, setIsMobile] = useState(false)
  const [expandedSubjectId, setExpandedSubjectId] = useState(null)
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false)

  useEffect(() => {
    fetchSubjects()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    if (!error) { 
      setName('')
      setCredits('')
      setFaculty('')
      setIsAddFormExpanded(false) // Automatically collapses mobile drawer upon addition
      fetchSubjects() 
    }
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

  const handleToggleExpand = (id) => {
    setExpandedSubjectId(prevId => prevId === id ? null : id)
  }

  // Precomputed statistics
  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0)
  const gradedSubjects = subjects.filter(s => s.grade_point !== null && s.grade_point !== undefined)
  const gradedCredits = gradedSubjects.reduce((a, s) => a + (s.credits || 0), 0)
  const sgpa = gradedCredits > 0
    ? (gradedSubjects.reduce((a, s) => a + s.grade_point * s.credits, 0) / gradedCredits).toFixed(2)
    : null

  // Progress percentage
  const totalSubjectsCount = subjects.length
  const completedPercentage = totalSubjectsCount > 0 
    ? Math.round((gradedSubjects.length / totalSubjectsCount) * 100) 
    : 0

  return (
    <div className="subjects-wrapper">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="aurora-blur-sphere sphere-tertiary" />

      {/* --- Page Hero Header --- */}
      <motion.div 
        className="subjects-hero-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <div className="hero-info-area">
          <h1>Academic Workspace</h1>
          <p>Track academic status, GPA metrics, and course credit distribution.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">Current Semester</span>
          {sgpa && <span className="sgpa-badge-glowing">{sgpa} SGPA</span>}
        </div>
      </motion.div>

      {/* --- Top Academic Summary Grid --- */}
      <motion.div 
        className="stats-carousel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
      >
        {/* KPI: Total Modules */}
        <SummaryCard 
          label="Subjects" 
          value={totalSubjectsCount} 
          icon={<BookOpen size={16} />}
          desc={`${gradedSubjects.length} subjects graded`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
        />
        
        {/* KPI: Total Credits */}
        <SummaryCard 
          label="Total Credits" 
          value={totalCredits} 
          icon={<Layers size={16} />}
          desc={`${gradedCredits} graded credits`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
        />

        {/* KPI: SGPA Card with Gold Emblem */}
        <motion.div 
          className="kpi-card-glass"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Cumulative SGPA</span>
            <span className="kpi-icon-wrapper" style={{ color: '#e1b12c' }}>
              <Award size={16} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: '#e1b12c' }}>
            {sgpa ?? '—'}
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc">Based on evaluated modules.</span>
            <div className="golden-trophy-badge" style={{ width: '28px', height: '28px', top: 'unset', right: '12px', bottom: '12px' }}>
              <GraduationCap size={14} color="#0c0b11" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        {/* KPI: Gradation Completion */}
        <SummaryCard 
          label="Graded Ratio" 
          value={`${gradedSubjects.length}/${totalSubjectsCount}`} 
          icon={<TrendingUp size={16} />}
          desc={`${completedPercentage}% of workload graded`}
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
        />
      </motion.div>

      {/* --- Subject Creation Section --- */}
      <AnimatePresence mode="wait">
        {!isMobile ? (
          /* Desktop Add Subject Form Panel */
          <motion.div 
            className="subject-form-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <form onSubmit={addSubject} className="subject-form">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Subject name..."
                className="subject-input name"
              />
              <input
                type="number"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="Credits"
                className="subject-input credits"
              />
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Faculty (optional)"
                className="subject-input faculty"
              />
              <motion.button 
                type="submit" 
                className="btn-subject-add"
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                <span>Add Subject</span>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          /* Mobile Add Subject Form Trigger Card */
          <div style={{ marginBottom: '16px', zIndex: 10, position: 'relative' }}>
            {!isAddFormExpanded ? (
              <motion.div 
                className="mobile-add-subject-form-trigger"
                onClick={() => setIsAddFormExpanded(true)}
                whileTap={{ scale: 0.97 }}
                layoutId="addSubjectForm"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Subject</span>
              </motion.div>
            ) : (
              <motion.div 
                className="subject-form-panel"
                layoutId="addSubjectForm"
              >
                <form onSubmit={addSubject} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subject name..."
                    className="subject-input"
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="number"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                      placeholder="Credits"
                      className="subject-input"
                      style={{ flex: '1' }}
                    />
                    <input
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="Faculty (optional)"
                      className="subject-input"
                      style={{ flex: '2' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setIsAddFormExpanded(false)}
                      className="subject-input" 
                      style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'none' }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-subject-add" style={{ flex: 2, justifyContent: 'center' }}>
                      Add Subject
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* --- Main Subjects Display Module --- */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        
        <div className="dashboard-empty-state">
          <GraduationCap size={48} color="var(--accent-purple)" opacity="0.8" style={{ margin: '0 auto' }} />
          <h4 className="empty-banner-title">No subjects added yet</h4>
          <p className="empty-banner-subtitle">
            Create subjects and allocate credit values above to activate your dashboard.
          </p>
        </div>

      ) : !isMobile ? (
        /* Desktop/Tablet: 3-column structured grid */
        <motion.div 
          className="subjects-dashboard-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
        >
          {subjects.map((s) => {
            const isGraded = s.grade_point !== null && s.grade_point !== undefined;
            return (
              <motion.div 
                key={s.id} 
                className="premium-subject-card"
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 80 } }
                }}
                whileHover={!isMobile ? { y: -4, transition: { duration: 0.2 } } : {}}
              >
                <div className="premium-card-radial-glow" />
                
                <div className="card-top-header">
                  <div className="academic-brand-icon">
                    <School size={18} />
                  </div>
                  <span className={isGraded ? "academic-completetion-chip" : "academic-pending-chip"}>
                    {isGraded ? "Graded" : "Active"}
                  </span>
                </div>

                <div className="card-text-body">
                  <h4 className="card-subject-name">{s.name}</h4>
                  <div className="card-subject-meta">
                    <span className="card-credits-indicator">{s.credits} Credits</span>
                    {s.faculty && (
                      <>
                        <span>·</span>
                        <span>{s.faculty}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="card-divider-line" />

                {/* Grade Evaluation Custom Dropdown Selector */}
                <div className="card-grades-tray">
                  <CustomGradeDropdown 
                    value={s.grade_point} 
                    onChange={(val) => updateGrade(s, val)} 
                  />
                  
                  <button onClick={() => deleteSubject(s.id)} className="btn-destroy-subject" title="Delete Course">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Mobile: Handcrafted Expandable Native iOS Accordion Stream (ZERO LAG) */
        <div className="mobile-accordion-list-container">
          {subjects.map((s) => {
            const isExpanded = expandedSubjectId === s.id;
            const isGraded = s.grade_point !== null && s.grade_point !== undefined;
            return (
              <div 
                key={s.id}
                className={`mobile-subject-accordion-item ${isExpanded ? 'is-active' : ''} ${isGraded ? 'is-graded' : ''}`}
              >
                {/* Closed compact row header (~72px) */}
                <div 
                  className="mobile-accordion-closed-row"
                  onClick={() => handleToggleExpand(s.id)}
                >
                  <div className="mobile-row-left">
                    <div className="mobile-accordion-icon">
                      <Library size={16} />
                    </div>
                    <div className="mobile-subject-info-block">
                      <h4 className="mobile-subject-name">{s.name}</h4>
                      <div className="mobile-subject-meta-inline">
                        {s.credits} Credits {s.faculty ? `· ${s.faculty}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="mobile-row-right">
                    <span className={isGraded ? "academic-completetion-chip" : "academic-pending-chip"}>
                      {isGraded ? `GP: ${s.grade_point}` : 'Active'}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`mobile-chevron-chevron ${isExpanded ? 'is-open' : ''}`}
                    />
                  </div>
                </div>

                {/* Smooth 250ms Height Expansion Drawer */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} // Spring-less hardware accelerated easing
                    >
                      <div className="mobile-accordion-drawer-body">
                        <div className="mobile-drawer-controls">
                          <CustomGradeDropdown 
                            value={s.grade_point} 
                            onChange={(val) => updateGrade(s, val)} 
                          />
                          <button onClick={() => deleteSubject(s.id)} className="btn-destroy-subject" title="Delete Course">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

/* Custom animated glass dropdown selection module to replace OS-native select overlays */
function CustomGradeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const grades = [
    { label: 'Grade', val: '' },
    { label: '10.0 (O)', val: '10' },
    { label: '9.0 (A+)', val: '9' },
    { label: '8.0 (A)', val: '8' },
    { label: '7.0 (B+)', val: '7' },
    { label: '6.0 (B)', val: '6' },
    { label: '5.0 (C)', val: '5' },
    { label: '0.0 (F)', val: '0' }
  ];

  const currentLabel = grades.find(g => g.val === (value?.toString() || ''))?.label || 'Grade';

  return (
    <div className="custom-dropdown-container">
      <button 
        type="button" 
        className="dropdown-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {grades.map((g) => (
                <li 
                  key={g.val} 
                  className={`dropdown-option-item ${value?.toString() === g.val ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(g.val);
                    setIsOpen(false);
                  }}
                >
                  {g.label}
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ label, value, icon, desc, sparklinePath }) {
  return (
    <motion.div 
      className="kpi-card-glass"
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper">{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        
        {/* Soft glowing vector micro-sparkline */}
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ opacity: 0.7 }}>
          <path d={sparklinePath} stroke="var(--sparkline-color)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
}

export default Subjects;