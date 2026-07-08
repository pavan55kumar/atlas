import { useEffect, useState } from 'react'
import { FileText, Sparkles, ArrowRightCircle, Paperclip, X } from 'lucide-react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton, ghostButton, deleteX } from './styles'

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

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setNotes(data)
    setLoading(false)
  }

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
      fetchNotes()
    }
  }

  async function deleteNote(id) {
    await supabase.from('notes').delete().eq('id', id)
    fetchNotes()
  }

  async function convertToTask(note) {
    await supabase.from('tasks').insert([{ title: note.title, user_id: userId, priority: 'medium', progress: 0 }])
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

  return (
    <div>
      <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={title}
            onChange={function (e) { setTitle(e.target.value) }}
            placeholder="Note title..."
            style={Object.assign({}, inputStyle, { flex: 2 })}
          />
          <input
            value={tag}
            onChange={function (e) { setTag(e.target.value) }}
            placeholder="Tag (optional)"
            style={Object.assign({}, inputStyle, { flex: 1 })}
          />
        </div>
        <textarea
          value={content}
          onChange={function (e) { setContent(e.target.value) }}
          placeholder="Write something..."
          rows={3}
          style={Object.assign({}, inputStyle, { resize: 'vertical', fontFamily: 'Inter, sans-serif' })}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={Object.assign({}, ghostButton, { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' })}>
            <Paperclip size={13} />
            {file ? 'Change file' : 'Attach file'}
            <input
              type="file"
              onChange={function (e) { setFile(e.target.files[0]) }}
              style={{ display: 'none' }}
            />
          </label>
          {file ? (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {file.name}
              <X size={13} style={{ cursor: 'pointer' }} onClick={function () { setFile(null) }} />
            </span>
          ) : null}
        </div>

        <button type="submit" disabled={uploading} style={Object.assign({}, primaryButton, { alignSelf: 'flex-start' })}>
          {uploading ? 'Uploading...' : 'Add Note'}
        </button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</p>
      ) : notes.length === 0 ? (
        <div className="empty-state"><FileText size={28} /><span>No notes yet — capture your first thought above</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notes.map(function (note) {
            const isOpen = openId === note.id
            return (
              <div key={note.id} style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '12px' }}>
                <div
                  onClick={function () { setOpenId(isOpen ? null : note.id) }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{note.title}</span>
                    {note.tag ? (
                      <span style={{
                        fontSize: '11px', color: 'var(--text-muted)',
                        background: 'var(--surface)', padding: '2px 8px', borderRadius: '6px'
                      }}>
                        {note.tag}
                      </span>
                    ) : null}
                    {note.attachment_url ? <Paperclip size={12} color="var(--text-muted)" /> : null}
                  </div>
                  <span onClick={function (e) { e.stopPropagation(); deleteNote(note.id) }} style={deleteX}>✕</span>
                </div>

                {isOpen ? (
                  <div style={{ marginTop: '10px' }}>
                    {note.content ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
                        {note.content}
                      </p>
                    ) : null}

                    {note.attachment_url ? (
                      <a
                        href={note.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12.5px', color: 'var(--accent)', marginBottom: '10px',
                          textDecoration: 'none'
                        }}
                      >
                        <Paperclip size={13} />
                        {note.attachment_name || 'View attachment'}
                      </a>
                    ) : null}

                    {summaries[note.id] ? (
                      <div style={{
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: '8px', padding: '10px 12px', marginBottom: '10px'
                      }}>
                        <p style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>
                          SUMMARY
                        </p>
                        <p style={{ fontSize: '12.5px' }}>{summaries[note.id]}</p>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {note.content ? (
                        <button
                          onClick={function () { summarizeNote(note) }}
                          disabled={summarizing === note.id}
                          style={Object.assign({}, ghostButton, { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '7px 12px' })}
                        >
                          <Sparkles size={13} />
                          {summarizing === note.id ? 'Summarizing...' : 'Summarize'}
                        </button>
                      ) : null}
                      <button
                        onClick={function () { convertToTask(note) }}
                        style={Object.assign({}, ghostButton, { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', padding: '7px 12px' })}
                      >
                        <ArrowRightCircle size={13} />
                        Convert to Task
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Notes