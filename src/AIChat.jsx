import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Capacitor } from '@capacitor/core'
import {
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Sparkle, Brain, Target, Flame,
  Layers, CalendarDays, Terminal, HelpCircle, FileText, ChevronRight, Activity, Cpu
} from 'lucide-react'
import { supabase } from './lib/supabase'
// NEW: cross-platform read-aloud wrapper (see tts.js for why this is needed)
import { speakText, stopSpeaking } from './tts'
// CHANGED: styles moved out of an inline <style> string into their own file
import './AIChat.css'

function AIChat({ userId }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Atlas assistant. Ask me about your tasks, habits, goals, or schedule." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)

  const [speakReplies, setSpeakReplies] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  const [isInputFocused, setIsInputFocused] = useState(false)

  const [localStats, setLocalStats] = useState({
    pendingTasks: 0,
    activeHabits: 0,
    goalsProgress: 0,
    eventsCount: 0
  })

  const scrollRef = useRef(null)
  const recognitionRef = useRef(null)
  const messagesRef = useRef(messages)
  const inputDockRef = useRef(null)

  useEffect(() => {
    messagesRef.current = messages
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Mobile layout adjustment
  useEffect(() => {
    const handleResize = () => {
      if (isInputFocused && inputDockRef.current) {
        inputDockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport.removeEventListener('resize', handleResize)
    }
  }, [isInputFocused])

  useEffect(() => {
    fetchSystemStats()
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceSupported(false)
    } else {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      recognition.onend = () => setListening(false)
      recognition.onerror = () => setListening(false)

      recognitionRef.current = recognition
    }

    // CHANGED: speech support is now true if EITHER the browser has
    // window.speechSynthesis OR we're running inside Capacitor (native TTS
    // is handled separately by tts.js and doesn't depend on this browser API
    // at all). Previously this only checked 'speechSynthesis' in window,
    // which is exactly why the toggle silently failed on Android.
    setSpeechSupported(('speechSynthesis' in window) || Capacitor.isNativePlatform())

    return () => {
      recognitionRef.current?.stop?.()
      // CHANGED: cleanup now goes through the cross-platform wrapper instead
      // of calling window.speechSynthesis.cancel() directly.
      stopSpeaking()
    }
  }, [])

  async function fetchSystemStats() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const [tasksRes, habitsRes, goalsRes, eventsRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact' }).eq('progress', 0),
        supabase.from('habits').select('id', { count: 'exact' }),
        supabase.from('goals').select('progress'),
        supabase.from('calendar_events').select('id', { count: 'exact' }).gte('event_date', today)
      ])

      const avgGoalProgress = goalsRes.data?.length 
        ? Math.round(goalsRes.data.reduce((acc, g) => acc + (g.progress || 0), 0) / goalsRes.data.length) 
        : 0

      setLocalStats({
        pendingTasks: tasksRes.count || 0,
        activeHabits: habitsRes.count || 0,
        goalsProgress: avgGoalProgress,
        eventsCount: eventsRes.count || 0
      })
    } catch (e) {
      // Fallback
    }
  }

  function toggleListening() {
    if (!voiceSupported || !recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.start()
      setListening(true)
    }
  }

  // CHANGED: stopReading now delegates to the cross-platform tts.js wrapper
  // instead of calling window.speechSynthesis.cancel() directly.
  const stopReading = useCallback(() => {
    stopSpeaking()
    setIsSpeaking(false)
  }, [])

  // CHANGED: readAloud (renamed usage to speakText internally) now goes
  // through tts.js, which picks the native OS TTS engine on Capacitor and
  // the browser API on web — same feature, now actually works on Android.
  const readAloud = useCallback((text) => {
    if (!speechSupported || !text) return
    speakText(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    })
  }, [speechSupported])

  const toggleReadAloud = useCallback(() => {
    if (!speechSupported) return

    if (isSpeaking) {
      stopReading()
      return
    }

    const lastAssistantMessage = [...messagesRef.current].reverse().find(m => m.role === 'assistant')
    if (lastAssistantMessage) readAloud(lastAssistantMessage.content)
  }, [speechSupported, isSpeaking, stopReading, readAloud])

  const handleAutoReadToggle = useCallback(() => {
    setSpeakReplies((prev) => {
      const next = !prev
      if (!next && isSpeaking) stopReading()
      return next
    })
  }, [isSpeaking, stopReading])

  async function fetchContext() {
    const today = new Date().toISOString().split('T')[0]
    const [{ data: tasks }, { data: habits }, { data: goals }, { data: notes }, { data: events }] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('habits').select('*'),
      supabase.from('goals').select('*'),
      supabase.from('notes').select('title, tag'),
      supabase.from('calendar_events').select('*').gte('event_date', today)
    ])

    return `
Tasks: ${tasks?.map(t => `${t.title} (${t.progress === 100 ? 'done' : 'pending'})`).join(', ') || 'none'}
Habits: ${habits?.map(h => `${h.name} (streak ${h.streak})`).join(', ') || 'none'}
Goals: ${goals?.map(g => `${g.title} — ${g.target || ''} (${g.progress}%)`).join(', ') || 'none'}
Notes: ${notes?.map(n => `${n.title}${n.tag ? ` [${n.tag}]` : ''}`).join(', ') || 'none'}
Upcoming events: ${events?.map(e => `${e.title} on ${e.event_date}${e.event_time ? ' at ' + e.event_time.slice(0,5) : ''}`).join(', ') || 'none'}
    `.trim()
  }

  async function sendMessage(e) {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const context = await fetchContext()

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: `You are Atlas, a helpful personal productivity assistant. You have access to the user's real data below. Answer naturally and conversationally, referencing specific items when relevant. Keep responses concise (2-4 sentences unless asked for detail) since replies may be read aloud. You cannot take actions (create/edit/delete) yet — if asked to do so, say you can't yet but can help them think it through.\n\nUser's current data:\n${context}`
            },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 300
        })
      })

      const data = await res.json()
      if (data.error) {
        const errMsg = "I'm having trouble responding right now. Please try again shortly."
        setMessages([...newMessages, { role: 'assistant', content: errMsg }])
      } else {
        const reply = data.choices?.[0]?.message?.content || "I didn't quite catch that — could you rephrase?"
        setMessages([...newMessages, { role: 'assistant', content: reply }])
        if (speakReplies) readAloud(reply)
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Something went wrong reaching the AI. Please try again." }])
    }
    setLoading(false)
  }

  const actionSuggestions = useMemo(() => [
    { label: "📅 Plan my day", query: "Can you help me plan my tasks and events for today?" },
    { label: "🎯 What should I work on?", query: "Review my pending tasks and tell me what my high priority task should be." },
    { label: "📚 Study checklist", query: "Analyze my studies and create a quick active checklist for me." },
    { label: "📝 Summarize targets", query: "Give me a summary of my active targets and goals." },
    { label: "📈 Productivity check", query: "How is my task completion and habit streak performing?" }
  ], [])

  return (
    <div className="ai-workspace-container">
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />

      {/* --- Page Hero Header --- */}
      <motion.div 
        className="ai-hero-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      >
        <div className="hero-info">
          <h1>AI Assistant</h1>
          <p>Your intelligent, responsive productivity co-pilot.</p>
        </div>
        <div className="hero-status-pills">
          <span className="status-pill">
            <div className="status-pulse-bullet" />
            Atlas Core Ready
          </span>
          <span className="status-pill">
            <Cpu size={12} />
            Copilot active
          </span>
        </div>
      </motion.div>

      {/* --- Scrollable Suggestion Carousel --- */}
      <div className="suggestions-carousel">
        {actionSuggestions.map((suggestion, idx) => (
          <motion.button
            key={idx}
            type="button"
            className="suggestion-pill-card"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setInput(suggestion.query)}
            aria-label={`Use suggestion: ${suggestion.label}`}
          >
            <span>{suggestion.label}</span>
          </motion.button>
        ))}
      </div>

      {/* --- Split Workspace Pane Layout --- */}
      <div className="ai-split-workspace">
        
        {/* Left Pane: Custom Conversation Module */}
        <div className="chat-workspace-pane">
          
          <div ref={scrollRef} className="chat-messages-container">
            {messages.length === 1 ? (
              
              /* Elegant empty chat layout with breathing AI Pulse Orb in center */
              <div className="empty-chat-orb-state">
                <div className="pulse-orb-outer">
                  <div className="pulse-orb-orbit" />
                  <div className="pulse-orb-center" style={{ animationPlayState: loading ? 'paused' : 'running' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  What would you like to accomplish today?
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '280px', margin: 0, lineHeight: 1.5 }}>
                  Ask me to evaluate your schedule, map study sessions, or check habit streaks.
                </p>
              </div>

            ) : (
              messages.map((m, i) => (
                <div key={i} className={`message-bubble-row ${m.role === 'user' ? 'is-user' : 'is-assistant'}`}>
                  <div className="msg-bubble">
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="message-bubble-row is-assistant">
                <div className="msg-bubble">
                  <div className="typing-loader">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Dock & Floating capsule inputs */}
          <div className="input-dock-layer" ref={inputDockRef}>
            
            {/* Quick context chip display */}
            <div className="linked-context-chips-row">
              <div className="linked-context-chips">
                <span className="context-mini-badge" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>● Linked Tasks</span>
                <span className="context-mini-badge" style={{ background: 'rgba(124, 92, 255, 0.08)', borderColor: 'rgba(124, 92, 255, 0.2)', color: 'var(--accent)' }}>● Calendar</span>
                <span className="context-mini-badge" style={{ background: 'rgba(236, 72, 153, 0.08)', borderColor: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>● Habits</span>
              </div>

              {/* Read Aloud controls */}
              <div className="voice-switch-container">
                <motion.button
                  type="button"
                  whileTap={speechSupported ? { scale: 0.96 } : undefined}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className={`voice-toggle-pill ${speakReplies ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
                  onClick={toggleReadAloud}
                  disabled={!speechSupported}
                  aria-pressed={isSpeaking}
                  aria-label={isSpeaking ? 'Stop reading assistant reply aloud' : 'Read latest assistant reply aloud'}
                  title={
                    !speechSupported
                      ? 'Read aloud is not supported here'
                      : isSpeaking
                        ? 'Stop reading'
                        : 'Read latest reply aloud'
                  }
                >
                  {isSpeaking ? (
                    <>
                      <span aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
                        <span className="speaking-bar" />
                        <span className="speaking-bar" />
                        <span className="speaking-bar" />
                      </span>
                      <span>Stop Reading</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={12} aria-hidden="true" />
                      <span>Read aloud</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Auto-read future replies preference */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  cursor: speechSupported ? 'pointer' : 'default',
                  opacity: speechSupported ? 1 : 0.5,
                  userSelect: 'none'
                }}
              >
                <input
                  type="checkbox"
                  checked={speakReplies}
                  onChange={handleAutoReadToggle}
                  disabled={!speechSupported}
                  aria-label="Automatically read new assistant replies aloud"
                  style={{ accentColor: 'var(--accent)', width: '13px', height: '13px' }}
                />
                Auto-read new replies
              </label>
            </div>

            <form onSubmit={sendMessage}>
              <div className={`capsule-input-bar ${isInputFocused ? 'focused-glow' : ''}`}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder={listening ? 'Listening to voice...' : 'Ask about your tasks, habits, goals...'}
                  className="capsule-field"
                  disabled={loading}
                  aria-label="Message Atlas assistant"
                />

                {voiceSupported && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    onClick={toggleListening}
                    className={`btn-dock-mic ${listening ? 'active-listening' : ''}`}
                    title={listening ? 'Stop speech recognition' : 'Start speech recognition'}
                    aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                    aria-pressed={listening}
                  >
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </motion.button>
                )}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="btn-dock-send"
                  disabled={loading}
                  title="Send query"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </form>

            {(!voiceSupported || !speechSupported) && (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                {!voiceSupported && !speechSupported
                  ? 'Voice input and read aloud are supported natively in Chrome, Edge, and Safari.'
                  : !voiceSupported
                    ? 'Voice input is supported natively in Chrome, Edge, and Safari.'
                    : 'Read aloud is supported natively in Chrome, Edge, and Safari.'}
              </p>
            )}
          </div>

        </div>

        {/* Right Pane: Live System summary stats panel (Desktop Only) */}
        <div className="system-summary-pane">
          
          <div className="summary-pane-card">
            <h4>
              <Brain size={14} color="var(--accent)" />
              <span>Workspace Indexes</span>
            </h4>
            <div className="metrics-summary-list">
              <div className="summary-metric-item">
                <span className="summary-metric-label">Active Tasks</span>
                <span className="summary-metric-value" style={{ color: '#ec4899' }}>{localStats.pendingTasks}</span>
              </div>
              <div className="summary-metric-item">
                <span className="summary-metric-label">Active Habits</span>
                <span className="summary-metric-value" style={{ color: 'var(--accent)' }}>{localStats.activeHabits}</span>
              </div>
              <div className="summary-metric-item">
                <span className="summary-metric-label">Goal Completion</span>
                <span className="summary-metric-value" style={{ color: '#10b981' }}>{localStats.goalsProgress}%</span>
              </div>
              <div className="summary-metric-item">
                <span className="summary-metric-label">Calendar Events</span>
                <span className="summary-metric-value">{localStats.eventsCount}</span>
              </div>
            </div>
          </div>

          <div className="summary-pane-card">
            <h4>
              <Sparkle size={14} color="#e1b12c" />
              <span>AI Core Status</span>
            </h4>
            <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Atlas Copilot is fully linked to local database tables, enabling direct contextual prompt evaluations.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AIChat