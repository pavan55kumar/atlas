import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Sparkle, Brain, Target, Flame,
  Layers, CalendarDays, Terminal, HelpCircle, FileText, ChevronRight, Activity, Cpu
} from 'lucide-react'
import { supabase } from './lib/supabase'

// ============================================================================
// STYLES — Premium AI Workspace Theme-Adaptive Stylesheet
// ============================================================================
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Subtle ambient overlays */
    --aurora-primary: rgba(124, 92, 255, 0.10);
    --aurora-secondary: rgba(255, 170, 120, 0.05);
  }

  .ai-workspace-container,
  .ai-workspace-container * {
    box-sizing: border-box;
  }

  .ai-workspace-container {
    font-family: var(--atlas-font);
    color: var(--text);
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    padding: 10px 12px;
    overflow-x: clip;
  }

  .ai-workspace-container button,
  .ai-workspace-container [role="button"],
  .ai-workspace-container .suggestion-pill-card,
  .ai-workspace-container .voice-toggle-pill {
    -webkit-tap-highlight-color: transparent;
    outline: none;
    user-select: none;
    -webkit-user-select: none;
    font-family: inherit;
    appearance: none;
    -webkit-appearance: none;
  }

  .ai-workspace-container button:focus-visible,
  .ai-workspace-container [role="button"]:focus-visible,
  .ai-workspace-container .suggestion-pill-card:focus-visible,
  .ai-workspace-container .voice-toggle-pill:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .ai-workspace-container button:disabled {
    cursor: default;
    opacity: 0.55;
  }

  /* --- Glowing Backdrop Aurora Orbs --- */
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

  /* --- Compact Premium Header (Level 2) --- */
  .ai-hero-header {
    background: linear-gradient(165deg, color-mix(in srgb, var(--surface-2) 92%, #0a0a10 8%) 0%, color-mix(in srgb, var(--surface-2) 80%, #050507 20%) 100%);
    border: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 12%);
    border-radius: 16px;
    padding: 20px 28px;
    margin-bottom: 20px;
    box-shadow: 0 22px 44px -20px rgba(38,14,74,0.55), 0 1px 0 rgba(255,255,255,0.05) inset;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    overflow: hidden;
  }

  .ai-hero-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -10%;
    width: 60%;
    height: 200%;
    background: radial-gradient(circle, rgba(124, 92, 255, 0.12) 0%, transparent 60%);
    pointer-events: none;
  }

  .ai-hero-header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 6%;
    right: 6%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    pointer-events: none;
  }

  .hero-info {
    position: relative;
    z-index: 2;
  }

  .hero-info h1 {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
    color: var(--text);
  }

  .hero-info p {
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
    font-weight: 500;
  }

  .hero-status-pills {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    position: relative;
    z-index: 2;
  }

  .status-pill {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.2);
    color: var(--text-muted);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    backdrop-filter: blur(4px);
  }

  .status-pulse-bullet {
    width: 5px;
    height: 5px;
    background-color: var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 8px var(--accent);
    animation: statusPulse 1.5s infinite alternate;
    flex-shrink: 0;
  }

  @keyframes statusPulse {
    0% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  /* --- Horizontally Scrollable Suggestion Carousel (Level 3) --- */
  .suggestions-carousel {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 4px 0;
    margin-bottom: 20px;
    scrollbar-width: none;
    -ms-overflow-style: none;
    z-index: 10;
    position: relative;
  }

  .suggestions-carousel::-webkit-scrollbar {
    display: none;
  }

  .suggestion-pill-card {
    background: color-mix(in srgb, var(--surface-2) 90%, #7C5CFF 4%);
    border: 1px solid color-mix(in srgb, var(--border) 70%, #7C5CFF 8%);
    border-radius: 100px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .suggestion-pill-card:hover {
    background: var(--surface);
    border-color: color-mix(in srgb, var(--border) 50%, #7C5CFF 20%);
    color: var(--text);
    box-shadow: 0 4px 12px rgba(124, 92, 255, 0.08);
  }

  /* --- Workspace Splits --- */
  .ai-split-workspace {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 20px;
    z-index: 10;
    position: relative;
  }

  /* Left Pane: Chat Window & Inputs (Level 1) */
  .chat-workspace-pane {
    display: flex;
    flex-direction: column;
    height: 560px;
    background: linear-gradient(165deg, color-mix(in srgb, var(--surface-2) 95%, #0a0a10 5%) 0%, color-mix(in srgb, var(--surface-2) 88%, #050507 12%) 100%);
    border: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 10%);
    border-radius: 20px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset;
    overflow: hidden;
    position: relative;
  }

  /* Subtle purple ambient lighting inside the container */
  .chat-workspace-pane::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(124, 92, 255, 0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* Message Display area (Level 2) */
  .chat-messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    -webkit-overflow-scrolling: touch;
    background: rgba(8, 8, 12, 0.3); /* Deeper dark surface */
    box-shadow: inset 0 1px 10px rgba(0,0,0,0.2);
    position: relative;
    z-index: 1;
  }

  .message-bubble-row {
    display: flex;
    width: 100%;
    position: relative;
    z-index: 2;
  }

  .message-bubble-row.is-user {
    justify-content: flex-end;
  }

  .message-bubble-row.is-assistant {
    justify-content: flex-start;
  }

  .msg-bubble {
    max-width: 76%;
    padding: 12px 16px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .is-user .msg-bubble {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    color: #ffffff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 12px rgba(124, 92, 255, 0.25);
  }

  .is-assistant .msg-bubble {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* --- Elegant Breathing AI Pulse Orb Empty State --- */
  .empty-chat-orb-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    padding: 20px;
    position: relative;
    z-index: 2;
  }

  .pulse-orb-outer {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-orb-orbit {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1.5px solid rgba(124, 92, 255, 0.2);
    border-radius: 50%;
    animation: rotateOrb 16s infinite linear;
  }

  .pulse-orb-orbit::after {
    content: '';
    position: absolute;
    inset: -8px;
    border: 1px dashed rgba(124, 92, 255, 0.1);
    border-radius: 50%;
    animation: rotateOrb 24s infinite linear reverse;
  }

  .pulse-orb-center {
    width: 44px;
    height: 44px;
    background: radial-gradient(circle at 30% 30%, #a78bfa 0%, #7C5CFF 40%, #4c1d95 100%);
    border-radius: 50%;
    box-shadow: 
      0 0 20px rgba(124, 92, 255, 0.6), 
      0 0 40px rgba(124, 92, 255, 0.3),
      inset 0 -4px 8px rgba(0,0,0,0.2),
      inset 0 4px 8px rgba(255,255,255,0.15);
    animation: breatheCore 3s infinite alternate ease-in-out;
    z-index: 2;
  }

  @keyframes rotateOrb {
    to { transform: rotate(360deg); }
  }

  @keyframes breatheCore {
    0% { transform: scale(0.9); box-shadow: 0 0 15px rgba(124, 92, 255, 0.4), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.1); }
    100% { transform: scale(1.1); box-shadow: 0 0 30px rgba(124, 92, 255, 0.7), inset 0 -4px 8px rgba(0,0,0,0.2), inset 0 4px 8px rgba(255,255,255,0.2); }
  }

  /* --- Input Area Dock (Level 3) --- */
  .input-dock-layer {
    padding: 14px 18px;
    border-top: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 10%);
    background: color-mix(in srgb, var(--surface) 90%, #7C5CFF 2%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    position: relative;
    z-index: 3;
  }

  .linked-context-chips-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }

  .linked-context-chips {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .context-mini-badge {
    font-size: 10px;
    font-weight: 600;
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 8px;
    flex-shrink: 0;
    backdrop-filter: blur(4px);
    display: inline-flex;
    align-items: center;
  }

  /* Floating pill-shape input capsule (Level 4) */
  .capsule-input-bar {
    position: relative;
    display: flex;
    align-items: center;
    background: color-mix(in srgb, var(--surface-2) 90%, #7C5CFF 5%);
    border: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 10%);
    border-radius: 999px;
    padding: 5px 6px 5px 16px;
    gap: 6px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    width: 100%;
    box-sizing: border-box;
    outline: none;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  }

  .capsule-input-bar.focused-glow {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.15), inset 0 1px 2px rgba(0,0,0,0.1);
  }

  .capsule-field {
    flex: 1;
    min-width: 0;
    background: none;
    border: none;
    color: var(--text);
    font-size: 15px;
    font-weight: 500;
    outline: none !important;
    box-shadow: none !important;
    padding: 8px 4px;
    line-height: 1.4;
  }

  .capsule-field::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .btn-dock-mic {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
  }

  .btn-dock-mic.active-listening {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.25);
  }

  .btn-dock-send {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(124, 92, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.2);
    transition: transform 0.1s ease;
    flex-shrink: 0;
  }

  .btn-dock-send:hover {
    transform: scale(1.03);
  }

  .btn-dock-send:active {
    transform: scale(0.97);
  }

  /* Compact switch for Voice replies */
  .voice-switch-container {
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .voice-toggle-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    cursor: pointer;
    transition: border-color 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
    backdrop-filter: blur(4px);
  }

  .voice-toggle-pill.active {
    color: var(--text);
    border-color: var(--accent);
    background: rgba(124, 92, 255, 0.1);
  }

  .voice-toggle-pill.speaking {
    color: #f472b6;
    border-color: rgba(244, 114, 182, 0.3);
    background: rgba(244, 114, 182, 0.1);
  }

  .voice-toggle-pill .speaking-bar {
    width: 2.5px;
    height: 8px;
    border-radius: 1px;
    background: currentColor;
    display: inline-block;
    animation: speakingBounce 0.9s infinite ease-in-out;
  }

  .voice-toggle-pill .speaking-bar:nth-child(2) { animation-delay: 0.15s; }
  .voice-toggle-pill .speaking-bar:nth-child(3) { animation-delay: 0.3s; }

  @keyframes speakingBounce {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
  }

  /* --- Right Side: System Summary Pane (Desktop Only) --- */
  .system-summary-pane {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .summary-pane-card {
    background: linear-gradient(165deg, color-mix(in srgb, var(--surface-2) 92%, #0a0a10 8%) 0%, color-mix(in srgb, var(--surface-2) 80%, #050507 20%) 100%);
    border: 1px solid color-mix(in srgb, var(--border) 60%, #7C5CFF 10%);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  }

  .summary-pane-card h4 {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .metrics-summary-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .summary-metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12.5px;
  }

  .summary-metric-label {
    color: var(--text-muted);
    font-weight: 500;
  }

  .summary-metric-value {
    font-weight: 700;
    color: var(--text);
  }

  /* Typing loader animation */
  .typing-loader {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 6px;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    background-color: var(--text-muted);
    border-radius: 50%;
    animation: typingBounce 1.4s infinite ease-in-out both;
  }

  .typing-dot:nth-child(1) { animation-delay: -0.32s; }
  .typing-dot:nth-child(2) { animation-delay: -0.16s; }

  @keyframes typingBounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  /* ======================================================================
     MOBILE PORTRAIT RESPONSIVENESS
     ====================================================================== */
  @media (max-width: 900px) {
    .ai-workspace-container {
      padding-top: max(8px, env(safe-area-inset-top));
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      padding-left: max(10px, env(safe-area-inset-left));
      padding-right: max(10px, env(safe-area-inset-right));
      overflow-x: clip;
    }

    .sphere-primary {
      width: 250px;
      height: 250px;
      top: 0%;
      left: -15%;
      filter: blur(70px);
    }

    .sphere-secondary {
      width: 220px;
      height: 220px;
      bottom: 8%;
      right: -15%;
      filter: blur(70px);
    }

    .ai-hero-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 20px;
      margin-bottom: 12px;
      border-radius: 14px;
    }

    .hero-info h1 {
      font-size: 20px;
    }

    .hero-info p {
      font-size: 12px;
    }

    .suggestions-carousel {
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
    }

    .suggestion-pill-card {
      padding: 6px 12px;
      font-size: 11px;
    }

    .ai-split-workspace {
      grid-template-columns: 1fr;
    }

    .system-summary-pane {
      display: none; /* Hide metrics sidebar strictly on mobile layouts */
    }

    .chat-workspace-pane {
      width: 100%;
      height: calc(100dvh - 190px);
      min-height: 280px;
      max-height: 680px;
      border-radius: 18px;
    }

    .chat-messages-container {
      padding: 14px 10px;
      gap: 10px;
    }

    .msg-bubble {
      max-width: 86%;
      padding: 10px 14px;
      font-size: 13.5px;
    }

    .empty-chat-orb-state h3 {
      font-size: 16px !important;
    }

    .empty-chat-orb-state p {
      font-size: 11.5px !important;
    }

    .input-dock-layer {
      padding: 10px 10px max(10px, env(safe-area-inset-bottom)) 10px;
      gap: 8px;
    }

    .linked-context-chips-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .capsule-input-bar {
      padding: 4px 4px 4px 14px;
      min-height: 48px;
    }

    .capsule-field {
      font-size: 16px; /* Prevents auto zoom-focus on iOS devices */
    }

    .btn-dock-mic, .btn-dock-send {
      width: 36px;
      height: 36px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse-orb-orbit,
    .pulse-orb-center,
    .status-pulse-bullet,
    .voice-toggle-pill .speaking-bar {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
    }
  }
`;

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
  const voicesRef = useRef([])
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

    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false)
    } else {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices()
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      recognitionRef.current?.stop?.()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
        window.speechSynthesis.cancel()
      }
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

  const pickVoice = useCallback(() => {
    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices()
    if (!voices.length) return null

    const preferredNames = [
      'Google US English', 'Google UK English Female', 'Samantha',
      'Microsoft Aria Online (Natural)', 'Microsoft Zira', 'Microsoft David'
    ]

    return (
      voices.find(v => preferredNames.some(name => v.name.includes(name))) ||
      voices.find(v => v.lang === 'en-US') ||
      voices.find(v => v.lang?.startsWith('en')) ||
      voices[0]
    )
  }, [])

  const stopReading = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const readAloud = useCallback((text) => {
    if (!speechSupported || !text || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    const voice = pickVoice()
    if (voice) utterance.voice = voice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [speechSupported, pickVoice])

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
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
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
                      ? 'Read aloud is not supported in this browser'
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