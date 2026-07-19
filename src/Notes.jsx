import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Sparkles, ArrowRightCircle, Paperclip, X, Plus, Search,
  Trash2, SlidersHorizontal, File as FileIcon, ChevronDown
} from 'lucide-react'
import { supabase } from './lib/supabase'

const EASE = [0.22, 1, 0.36, 1]

const styleSheet = `
  .atlas-notes-container {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 0 80px 0;
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }

  /* ========== HEADER ========== */
  .notes-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
  }
  .notes-title-block {
    flex: 1;
    min-width: 0;
  }
  .notes-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .notes-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
  }
  .new-note-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--accent);
    color: white;
    border: 1px solid var(--accent);
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s ease;
    font-family: inherit;
    height: 40px;
    flex-shrink: 0;
  }
  .new-note-btn:hover {
    opacity: 0.9;
  }

  /* ========== SEARCH & FILTERS ========== */
  .notes-controls {
    margin-bottom: 24px;
  }
  .search-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  .search-wrapper {
    flex: 1;
    position: relative;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px 10px 40px;
    color: var(--text);
    font-size: 14px;
    box-sizing: border-box;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s ease;
    height: 40px;
  }
  .search-input:focus {
    border-color: var(--accent);
  }
  .sort-dropdown-wrapper {
    position: relative;
  }
  .sort-btn {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 0 14px;
    border-radius: 10px;
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
    height: 40px;
    white-space: nowrap;
  }
  .sort-btn:hover {
    border-color: var(--accent);
  }
  .sort-list {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 4px;
    z-index: 50;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    list-style: none;
    margin: 0;
    min-width: 140px;
  }
  .sort-item {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-muted);
    transition: background 0.15s ease, color 0.15s ease;
  }
  .sort-item:hover {
    background: var(--surface);
    color: var(--text);
  }
  .sort-item.active {
    color: var(--accent);
    font-weight: 500;
  }

  .tag-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .tag-row::-webkit-scrollbar { display: none; }
  .tag-chip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    font-family: inherit;
  }
  .tag-chip:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .tag-chip.active {
    background: color-mix(in srgb, var(--accent) 12%, var(--surface-2));
    color: var(--accent);
    border-color: color-mix(in srgb, var(--accent) 25%, var(--border));
  }

  /* ========== COMPOSER ========== */
  .composer-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .composer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
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
  .form-textarea {
    min-height: 120px;
    resize: vertical;
  }
  .file-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    color: var(--text);
    margin-top: 8px;
  }
  .file-chip button {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    display: flex;
  }
  .file-chip button:hover {
    color: #ef4444;
  }
  .attach-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  .attach-btn:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .composer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
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
  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ========== NOTES LIST ========== */
  .notes-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .list-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
  }
  .list-meta {
    font-size: 13px;
    color: var(--text-muted);
  }
  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .note-card {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color 0.2s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .note-card:hover {
      border-color: var(--accent);
    }
  }
  .note-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }
  .note-card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text);
    margin: 0;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .note-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    white-space: nowrap;
  }
  .note-card-body {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 39px;
  }
  .note-attachment-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-muted);
    background: var(--surface);
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }
  .note-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .note-expanded-content {
    padding-top: 16px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .note-full-text {
    font-size: 14px;
    color: var(--text-muted);
    line-height: 1.6;
    white-space: pre-wrap;
  }
  .note-summary-box {
    background: color-mix(in srgb, var(--accent) 5%, var(--surface));
    border: 1px solid color-mix(in srgb, var(--accent) 15%, var(--border));
    border-radius: 10px;
    padding: 12px;
  }
  .note-summary-label {
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .note-summary-text {
    font-size: 13px;
    color: var(--text);
    line-height: 1.5;
  }
  .note-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  .action-btn:hover {
    color: var(--text);
    border-color: var(--text-muted);
  }
  .action-btn.danger:hover {
    color: #ef4444;
    border-color: #ef4444;
  }
  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    height: 140px;
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

  /* ========== FAB ========== */
  .fab {
    position: fixed;
    bottom: calc(24px + env(safe-area-inset-bottom));
    right: 24px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    border: none;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(124, 92, 255, 0.4);
    cursor: pointer;
    z-index: 20;
    transition: transform 0.2s ease;
  }
  .fab:active {
    transform: scale(0.95);
  }

  /* ========== TOAST ========== */
  .toast {
    position: fixed;
    bottom: calc(24px + env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 12px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    z-index: 1000;
  }
  .toast-icon {
    color: #10b981;
  }

  /* ========== RESPONSIVE ========== */
  @media (max-width: 768px) {
    .notes-grid {
      grid-template-columns: 1fr;
    }
    .composer-grid {
      grid-template-columns: 1fr;
    }
    .notes-header {
      align-items: center;
    }
    .notes-title {
      font-size: 20px;
    }
    .new-note-btn {
      display: none;
    }
    .fab {
      display: flex;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

function Notes({ userId }) {
  const [notes, setNotes] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [summarizing, setSummarizing] = useState(null)
  const [summaries, setSummaries] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [converting, setConverting] = useState(null)

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setNotes(data)
    setLoading(false)
  }, [])

  async function addNote(e) {
    e.preventDefault()
    if (!title.trim()) return

    let attachment_url = null
    let attachment_name = null

    if (file) {
      setUploading(true)
      const filePath = userId + '/' + Date.now() + '_' + file.name
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file)

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(filePath)
        attachment_url = urlData.publicUrl
        attachment_name = file.name
      }
      setUploading(false)
    }

    const { error } = await supabase
      .from('notes')
      .insert([{ title: title, content: content, tag: tag, user_id: userId, attachment_url: attachment_url, attachment_name: attachment_name }])

    if (!error) {
      setTitle('')
      setContent('')
      setTag('')
      setFile(null)
      setIsComposerOpen(false)
      fetchNotes()
    }
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    fetchNotes()
    setDeleteTarget(null)
  }

  async function convertToTask(note) {
    setConverting(note.id)
    try {
      await supabase.from('tasks').insert([{ title: note.title, user_id: userId, priority: 'medium', progress: 0 }])
      setToast({ message: 'Task created', detail: `"${note.title}" was added to your tasks.` })
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ message: 'Failed to create task', detail: 'Please try again.', error: true })
      setTimeout(() => setToast(null), 3000)
    }
    setConverting(null)
  }

  async function summarizeNote(note) {
    if (!note.content || !note.content.trim()) return
    setSummarizing(note.id)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + import.meta.env.VITE_GROQ_API_KEY
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: 'Summarize the given note in exactly one short sentence. No preamble, just the summary.' },
            { role: 'user', content: note.content }
          ],
          max_tokens: 60
        })
      })
      const data = await res.json()
      const summary = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'Could not summarize.'
      setSummaries(function (prev) {
        const next = Object.assign({}, prev)
        next[note.id] = summary
        return next
      })
    } catch (err) {
      setSummaries(function (prev) {
        const next = Object.assign({}, prev)
        next[note.id] = 'Summary unavailable right now.'
        return next
      })
    }
    setSummarizing(null)
  }

  // Derived state for tags, search, and sorting
  const allTags = useMemo(() => {
    const tags = new Set(notes.map(n => n.tag).filter(Boolean))
    return ['All', ...Array.from(tags)]
  }, [notes])

  const filteredNotes = useMemo(() => {
    let result = notes

    if (activeTag !== 'All') {
      result = result.filter(n => n.tag === activeTag)
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(n =>
        n.title?.toLowerCase().includes(lowerQuery) ||
        n.content?.toLowerCase().includes(lowerQuery) ||
        n.tag?.toLowerCase().includes(lowerQuery)
      )
    }

    switch (sortBy) {
      case 'oldest':
        return [...result].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      case 'az':
        return [...result].sort((a, b) => a.title.localeCompare(b.title))
      case 'za':
        return [...result].sort((a, b) => b.title.localeCompare(a.title))
      case 'newest':
      default:
        return [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
  }, [notes, activeTag, searchQuery, sortBy])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHrs = diffMs / (1000 * 60 * 60)
    const diffDays = diffHrs / 24

    if (diffHrs < 1) return 'Just now'
    if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="atlas-notes-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />

      <div className="notes-header">
        <div className="notes-title-block">
          <h1 className="notes-title">Notes</h1>
          <p className="notes-subtitle">Capture ideas, organize thoughts, and turn them into action.</p>
        </div>
        <button className="new-note-btn" onClick={() => setIsComposerOpen(!isComposerOpen)}>
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      <div className="notes-controls">
        <div className="search-row">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-dropdown-wrapper">
            <button className="sort-btn" onClick={() => setShowSortMenu(!showSortMenu)}>
              <SlidersHorizontal size={14} />
              <span>{sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'az' ? 'A-Z' : 'Z-A'}</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.ul
                  className="sort-list"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {[
                    { id: 'newest', label: 'Newest' },
                    { id: 'oldest', label: 'Oldest' },
                    { id: 'az', label: 'Title A-Z' },
                    { id: 'za', label: 'Title Z-A' }
                  ].map(option => (
                    <li
                      key={option.id}
                      className={`sort-item ${sortBy === option.id ? 'active' : ''}`}
                      onClick={() => {
                        setSortBy(option.id)
                        setShowSortMenu(false)
                      }}
                    >
                      {option.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="tag-row">
          {allTags.map(tagName => (
            <button
              key={tagName}
              className={`tag-chip ${activeTag === tagName ? 'active' : ''}`}
              onClick={() => setActiveTag(tagName)}
            >
              {tagName}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            className="composer-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <form onSubmit={addNote}>
              <div className="composer-grid">
                <div className="form-group">
                  <label htmlFor="note-title" className="form-label">Title *</label>
                  <input
                    id="note-title"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled thought..."
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="note-tag" className="form-label">Tag</label>
                  <input
                    id="note-tag"
                    className="form-input"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ideas"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label htmlFor="note-content" className="form-label">Note</label>
                <textarea
                  id="note-content"
                  className="form-input form-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attachment</label>
                <label className="attach-btn">
                  <Paperclip size={14} />
                  {file ? 'Change file' : 'Attach file'}
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </label>
                {file && (
                  <div className="file-chip">
                    <FileIcon size={14} />
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <button type="button" onClick={() => setFile(null)} aria-label="Remove file">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="composer-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsComposerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={uploading || !title.trim()}>
                  {uploading ? 'Uploading...' : 'Add Note'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="notes-list-header">
        <div>
          <h2 className="list-title">Your Notes</h2>
          <p className="list-meta">{notes.length} notes</p>
        </div>
      </div>

      {loading ? (
        <div className="notes-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '40%' }}></div>
              <div className="skeleton-line" style={{ width: '80%' }}></div>
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="empty-state">
          {notes.length === 0 ? (
            <>
              <span className="empty-icon">
                <FileText size={40} />
              </span>
              <h3 className="empty-title">Your ideas start here</h3>
              <p className="empty-text">Capture thoughts, class notes, project ideas, or anything you don't want to forget.</p>
              <button className="btn-submit" onClick={() => setIsComposerOpen(true)}>
                + Create Your First Note
              </button>
            </>
          ) : (
            <>
              <span className="empty-icon">
                <Search size={40} />
              </span>
              <h3 className="empty-title">No notes found</h3>
              <p className="empty-text">Try changing your search or filters.</p>
              <button className="btn-cancel" onClick={() => { setSearchQuery(''); setActiveTag('All'); }}>
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map(note => {
            const isOpen = openId === note.id
            return (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <h3 className="note-card-title">{note.title}</h3>
                  {note.tag && <span className="note-tag">{note.tag}</span>}
                </div>

                <div className="note-card-body">
                  {note.content || 'No additional content'}
                </div>

                {note.attachment_url && !isOpen && (
                  <div className="note-attachment-preview">
                    <Paperclip size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.attachment_name || 'Attachment'}
                    </span>
                  </div>
                )}

                <div className="note-card-footer">
                  <span>{formatDate(note.created_at)}</span>
                  <button
                    onClick={() => setOpenId(isOpen ? null : note.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label={isOpen ? "Collapse note" : "Expand note"}
                  >
                    <ChevronDown
                      size={16}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                      }}
                    />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="note-expanded-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <p className="note-full-text">{note.content}</p>

                      {note.attachment_url && (
                        <a
                          href={note.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="note-attachment-preview"
                          style={{ textDecoration: 'none', color: 'var(--accent)' }}
                        >
                          <Paperclip size={14} />
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {note.attachment_name || 'View attachment'}
                          </span>
                        </a>
                      )}

                      {summaries[note.id] && (
                        <div className="note-summary-box">
                          <div className="note-summary-label">
                            <Sparkles size={12} />
                            AI Summary
                          </div>
                          <p className="note-summary-text">{summaries[note.id]}</p>
                        </div>
                      )}

                      <div className="note-actions">
                        {note.content && (
                          <button
                            className="action-btn"
                            onClick={() => summarizeNote(note)}
                            disabled={summarizing === note.id}
                          >
                            <Sparkles size={14} />
                            {summarizing === note.id ? 'Summarizing...' : 'Summarize'}
                          </button>
                        )}
                        <button
                          className="action-btn"
                          onClick={() => convertToTask(note)}
                          disabled={converting === note.id}
                        >
                          <ArrowRightCircle size={14} />
                          {converting === note.id ? 'Converting...' : 'Convert to Task'}
                        </button>
                        <button
                          className="action-btn danger"
                          onClick={() => setDeleteTarget(note)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        className="fab"
        onClick={() => setIsComposerOpen(true)}
        aria-label="Create new note"
      >
        <Plus size={24} />
      </button>

      {/* Delete Modal */}
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
              <h3 className="modal-title">Delete Note?</h3>
              <p className="modal-text">"{deleteTarget.title}" will be permanently deleted.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={() => deleteNote(deleteTarget.id)}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {toast.error ? (
              <X size={16} className="toast-icon" style={{ color: '#ef4444' }} />
            ) : (
              <Sparkles size={16} className="toast-icon" />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{toast.message}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{toast.detail}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Notes