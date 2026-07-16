import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Sparkles, Mic, MicOff, Volume2, VolumeX, Sparkle, Brain, Target, Flame,
  Layers, CalendarDays, Terminal, HelpCircle, FileText, ChevronRight, Activity, Cpu
} from 'lucide-react'
import { supabase } from './lib/supabase'

// Premium Handcrafted Theme Adaptive Glassmorphic Stylesheet
// NOTE: Only visual/layout rules were touched in this pass. No functional logic,
// state, hooks, event handlers, API calls, or theme-variable *values* were changed,
// aside from what's needed to support the fixed Read Aloud control below and
// baseline tap/focus hygiene (items 9 & 11 from the polish spec).
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    
    /* Dark Theme Handcrafted Glassmorphism */
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
    
    /* Dynamic purple-pink gradients matching your mockup */
    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.4);
    --card-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    
    /* Ambient light spheres */
    --aurora-primary: rgba(139, 92, 246, 0.12);
    --aurora-secondary: rgba(236, 72, 153, 0.08);
  }

  /* Light Theme Handcrafted Glassmorphism */
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
    
    --aurora-primary: #ffe3d8;
    --aurora-secondary: #eedcff;
  }

  /* Global overflow safety net — scoped to this page's own subtree only */
  .ai-workspace-container,
  .ai-workspace-container * {
    box-sizing: border-box;
  }

  .ai-workspace-container {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    padding: 10px 12px;
    overflow-x: clip;
  }

  /* --- Item 9 & 11: kill the default mobile tap-highlight flash on every
     interactive element in this page, while keeping a real, visible,
     accessible focus style for keyboard users (focus-visible only, so
     mouse/touch clicks stay clean). --- */
  .ai-workspace-container button,
  .ai-workspace-container [role="button"],
  .ai-workspace-container .suggestion-pill-card,
  .ai-workspace-container .voice-toggle-pill {
    -webkit-tap-highlight-color: transparent;
    tap-highlight-color: transparent;
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
    outline: 2px solid var(--input-focus-border);
    outline-offset: 2px;
  }

  .ai-workspace-container button:disabled {
    cursor: default;
    opacity: 0.55;
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

  /* --- Hero Header & Glowing Status Chips --- */
  .ai-hero-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 24px 32px;
    margin-bottom: 20px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
  }

  .hero-info h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 4px 0;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .hero-info p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
  }

  .hero-status-pills {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .status-pill {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    background: rgba(139, 92, 246, 0.06);
    color: #a78bfa;
    border: 1px solid rgba(139, 92, 246, 0.12);
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .status-pulse-bullet {
    width: 5px;
    height: 5px;
    background-color: #34d399;
    border-radius: 50%;
    box-shadow: 0 0 8px #34d399;
    animation: statusPulse 1.5s infinite alternate;
    flex-shrink: 0;
  }

  @keyframes statusPulse {
    0% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  /* --- Suggestion Horizontal Carousel --- */
  .suggestions-carousel {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 2px 2px 8px 2px;
    margin-bottom: 20px;
    z-index: 10;
    position: relative;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
  }

  .suggestions-carousel::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  .suggestion-pill-card {
    flex-shrink: 0;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--card-shadow);
  }

  .suggestion-pill-card:hover {
    transform: translateY(-2px);
    border-color: rgba(139, 92, 246, 0.3);
    color: var(--text-primary);
    box-shadow: 0 8px 16px rgba(139, 92, 246, 0.08);
  }

  /* --- Double Pane Dashboard Layout --- */
  .ai-split-workspace {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 24px;
    z-index: 10;
    position: relative;
  }

  /* Left Pane: Chat Window & Inputs */
  .chat-workspace-pane {
    display: flex;
    flex-direction: column;
    height: 580px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    overflow: hidden;
    position: relative;
  }

  /* Conversation display layer */
  .chat-messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Custom Message bubbles */
  .message-bubble-row {
    display: flex;
    width: 100%;
  }

  .message-bubble-row.is-user {
    justify-content: flex-end;
  }

  .message-bubble-row.is-assistant {
    justify-content: flex-start;
  }

  .msg-bubble {
    max-width: 72%;
    padding: 14px 18px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* User Bubble: Radiant Indigo Gradient */
  .is-user .msg-bubble {
    background: var(--btn-primary-bg);
    color: #ffffff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 6px 16px var(--btn-primary-glow);
  }

  /* Assistant Bubble: Slate Glassmorphic Card */
  .is-assistant .msg-bubble {
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
  }

  /* --- Glowing AI Pulse Orb Empty State --- */
  .empty-chat-orb-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    padding: 20px;
  }

  .pulse-orb-outer {
    position: relative;
    width: 90px;
    height: 90px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-orb-orbit {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1.5px dashed rgba(139, 92, 246, 0.25);
    border-radius: 50%;
    animation: rotateOrb 16s infinite linear;
  }

  .pulse-orb-center {
    width: 44px;
    height: 44px;
    background: radial-gradient(circle, #7c3aed 0%, #5c47f5 100%);
    border-radius: 50%;
    box-shadow: 0 0 30px rgba(92, 71, 245, 0.7);
    animation: breatheCore 3s infinite alternate ease-in-out;
  }

  @keyframes rotateOrb {
    to { transform: rotate(360deg); }
  }

  @keyframes breatheCore {
    0% { transform: scale(0.9); box-shadow: 0 0 15px rgba(92, 71, 245, 0.4); }
    100% { transform: scale(1.1); box-shadow: 0 0 35px rgba(92, 71, 245, 0.85); }
  }

  /* --- Action Dock & Pill Inputs --- */
  .input-dock-layer {
    padding: 16px 20px;
    border-top: 1px solid var(--glass-border);
    background: rgba(14, 13, 22, 0.15);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Context chip linking displays */
  .linked-context-chips-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
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
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    padding: 3px 10px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  /* Capsule floating input bar */
  .capsule-input-bar {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 100px;
    padding: 6px 6px 6px 18px;
    gap: 10px;
    transition: all 0.25s;
    width: 100%;
    box-sizing: border-box;
  }

  .capsule-input-bar.focused-glow {
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 3px var(--input-focus-glow);
  }

  .capsule-field {
    flex: 1;
    min-width: 0; /* Prevents text overflow cutting off layout elements */
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    outline: none;
    box-sizing: border-box;
  }

  .capsule-field::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }

  .btn-dock-mic {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0; /* Prevents compression on small screens */
  }

  .btn-dock-mic.active-listening {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
  }

  .btn-dock-send {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px var(--btn-primary-glow);
    transition: transform 0.15s;
    flex-shrink: 0; /* Prevents compression on small screens */
  }

  .btn-dock-send:hover {
    transform: scale(1.05);
  }

  .btn-dock-send:active {
    transform: scale(0.95);
  }

  /* Premium Pill switch for Voice - now a real <button>, doubles as the
     Read Aloud / Stop Reading control (see item 12 fix in the component). */
  .voice-switch-container {
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .voice-toggle-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .voice-toggle-pill.active {
    color: var(--text-primary);
    border-color: rgba(139, 92, 246, 0.25);
    background: rgba(139, 92, 246, 0.08);
  }

  /* While actively speaking, give the pill a distinct "live" treatment so
     it visually reads as a Stop control, not just an active toggle. */
  .voice-toggle-pill.speaking {
    color: #f472b6;
    border-color: rgba(244, 114, 182, 0.35);
    background: rgba(244, 114, 182, 0.1);
  }

  .voice-toggle-pill .speaking-bar {
    width: 3px;
    height: 10px;
    border-radius: 2px;
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

  /* --- Right Side: Live System Summary Pane (Desktop Only) --- */
  .system-summary-pane {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .summary-pane-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 18px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
  }

  .summary-pane-card h4 {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .metrics-summary-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }

  .summary-metric-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .summary-metric-value {
    font-weight: 700;
    color: var(--text-primary);
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
    background-color: var(--text-secondary);
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
     MOBILE PREMIUM POLISH (<= 900px)
     Everything below is layout/visual only — no functionality is affected.
     Rebuilt on an 8pt spacing rhythm with safe-area-aware padding, no
     horizontal overflow, 44dp+ touch targets, and richer glass depth.
     ====================================================================== */
  @media (max-width: 900px) {

    html, body {
      overflow-x: hidden;
    }

    .ai-workspace-container {
      padding-top: max(16px, env(safe-area-inset-top));
      padding-bottom: max(24px, env(safe-area-inset-bottom));
      padding-left: max(20px, env(safe-area-inset-left));
      padding-right: max(20px, env(safe-area-inset-right));
      overflow-x: clip;
    }

    /* Keep the ambient glow but stop it from ever contributing to page width */
    .sphere-primary {
      width: 260px;
      height: 260px;
      top: 0%;
      left: -20%;
      filter: blur(70px);
    }

    .sphere-secondary {
      width: 240px;
      height: 240px;
      bottom: 8%;
      right: -20%;
      filter: blur(70px);
    }

    /* --- Hero card: calmer padding, cleaner hierarchy, badges that never
       wrap mid-word --- */
    .ai-hero-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      padding: 20px;
      margin-bottom: 16px;
      border-radius: 22px;
      border-color: var(--glass-border);
    }

    .hero-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .hero-info h1 {
      font-size: 21px;
      line-height: 1.25;
      letter-spacing: -0.01em;
    }

    .hero-info p {
      font-size: 13px;
      line-height: 1.5;
      max-width: 34ch;
    }

    .hero-status-pills {
      gap: 8px;
      justify-content: flex-start;
    }

    .status-pill {
      font-size: 10px;
      letter-spacing: 0.04em;
      padding: 8px 14px;
      min-height: 32px;
    }

    /* --- Suggestions: true pill shape, snap scrolling, edge fade so the
       cut-off card at the edge reads as "more content" not "broken layout" --- */
    .suggestions-carousel {
      margin: 0 -20px 20px -20px;
      padding: 2px 20px 10px 20px;
      scroll-snap-type: x proximity;
      -webkit-mask-image: linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 28px), transparent 100%);
      mask-image: linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 28px), transparent 100%);
    }

    .suggestion-pill-card {
      scroll-snap-align: start;
      border-radius: 100px;
      padding: 11px 18px;
      min-height: 44px;
      font-size: 12.5px;
    }

    /* --- Chat card becomes the clear hero of the page --- */
    .ai-split-workspace {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .system-summary-pane {
      display: none; /* Hide summary pane strictly on mobile viewports */
    }

    .chat-workspace-pane {
      width: 100%;
      height: calc(100dvh - 300px);
      min-height: 460px;
      max-height: 720px;
      border-radius: 26px;
      border-color: var(--glass-border);
      box-shadow: var(--card-shadow), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
    }

    .chat-messages-container {
      padding: 20px 16px;
      gap: 12px;
    }

    .msg-bubble {
      max-width: 86%;
      padding: 12px 16px;
      font-size: 14px;
    }

    /* --- Orb: bigger, softer, more "alive" without extra animation cost --- */
    .empty-chat-orb-state {
      padding: 16px 8px;
    }

    .pulse-orb-outer {
      width: 104px;
      height: 104px;
      margin-bottom: 24px;
    }

    .pulse-orb-orbit {
      border-color: rgba(139, 92, 246, 0.22);
    }

    .pulse-orb-orbit::before {
      content: '';
      position: absolute;
      inset: -14px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(139, 92, 246, 0) 70%);
      filter: blur(6px);
    }

    .pulse-orb-center {
      width: 52px;
      height: 52px;
      box-shadow: 0 0 40px rgba(92, 71, 245, 0.55);
    }

    .empty-chat-orb-state h3 {
      font-size: 19px !important;
      line-height: 1.35 !important;
      letter-spacing: -0.01em;
      max-width: 26ch;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-chat-orb-state p {
      font-size: 13.5px !important;
      line-height: 1.6 !important;
      max-width: 30ch !important;
    }

    /* --- Input dock: taller, calmer, everything reachable with a thumb --- */
    .input-dock-layer {
      padding: 14px 16px max(14px, env(safe-area-inset-bottom)) 16px;
      gap: 12px;
    }

    .linked-context-chips-row {
      gap: 8px;
    }

    .linked-context-chips {
      gap: 6px;
      row-gap: 8px;
    }

    .context-mini-badge {
      font-size: 10.5px;
      padding: 5px 11px;
      border-radius: 100px;
      min-height: 26px;
      display: inline-flex;
      align-items: center;
    }

    .voice-toggle-pill {
      padding: 7px 14px;
      min-height: 36px;
      border-radius: 100px;
    }

    .capsule-input-bar {
      padding: 5px 5px 5px 18px;
      min-height: 52px;
      gap: 6px;
    }

    .capsule-field {
      font-size: 15px;
    }

    .btn-dock-mic {
      width: 40px;
      height: 40px;
      padding: 0;
    }

    .btn-dock-send {
      width: 40px;
      height: 40px;
    }
  }

  @media (max-width: 480px) {
    .ai-workspace-container {
      padding-left: 16px;
      padding-right: 16px;
    }

    .suggestions-carousel {
      margin: 0 -16px 18px -16px;
      padding-left: 16px;
      padding-right: 16px;
    }

    .hero-status-pills {
      margin-top: 2px;
    }

    .hero-info p {
      max-width: 100%;
    }

    .chat-workspace-pane {
      border-radius: 22px;
    }
  }

  /* Respect reduced-motion preferences without altering default behavior */
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

  // --- Read Aloud state -----------------------------------------------
  // `speakReplies`  : persistent user preference — when true, every new
  //                   assistant reply is automatically read aloud as it
  //                   arrives (unchanged from the original feature intent).
  // `isSpeaking`    : true only while SpeechSynthesis is actively talking,
  //                   regardless of whether it was triggered automatically
  //                   or by a manual tap. Drives the "Stop Reading" state.
  // `speechSupported`: false when the browser has no SpeechSynthesis API,
  //                   so we can disable the control and explain why
  //                   instead of silently failing.
  const [speakReplies, setSpeakReplies] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)

  // Custom focus state tracker for the input pill
  const [isInputFocused, setIsInputFocused] = useState(false)

  // System stats fetched locally from database to update the Summary Pane
  const [localStats, setLocalStats] = useState({
    pendingTasks: 0,
    activeHabits: 0,
    goalsProgress: 0,
    eventsCount: 0
  })

  const scrollRef = useRef(null)
  const recognitionRef = useRef(null)
  // Cache of available SpeechSynthesis voices. Chrome (and some mobile
  // browsers) populate this list asynchronously via `onvoiceschanged`, so
  // reading `getVoices()` once on mount is not reliable — we keep this ref
  // fresh and always read from it at speak-time instead.
  const voicesRef = useRef([])
  // Keep the latest `messages` array in a ref so the Read Aloud button can
  // always find the most recent assistant reply without needing to be
  // recreated (and re-subscribed) every time a message is added.
  const messagesRef = useRef(messages)

  useEffect(() => {
    messagesRef.current = messages
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

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

    // --- Read Aloud setup --------------------------------------------
    if (!('speechSynthesis' in window)) {
      // Older/embedded WebViews and some mobile browsers don't implement
      // SpeechSynthesis at all — disable the control and say so, rather
      // than letting every click silently do nothing.
      setSpeechSupported(false)
    } else {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices()
      }
      loadVoices()
      // Chrome fires this once the voice list is actually ready.
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    // Cleanup: stop speech recognition and any in-flight speech synthesis
    // when the component unmounts, so nothing keeps talking on a page
    // the user has already navigated away from.
    return () => {
      recognitionRef.current?.stop?.()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Fetches core statistics from Supabase to feed the Live summary panel on the right (No logic changes)
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
      // Graceful fallback
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

  // Picks the most natural-sounding available voice: prefers a short list
  // of known high-quality voices, falls back to any en-US voice, then any
  // English voice, then whatever the browser has as its default.
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

  // Immediately halts any speech in progress. Safe to call even when
  // nothing is speaking.
  const stopReading = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Reads a single piece of text aloud. Always cancels any speech already
  // in progress first, so overlapping utterances are impossible no matter
  // how quickly this gets called back-to-back.
  const readAloud = useCallback((text) => {
    if (!speechSupported || !text || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    const voice = pickVoice()
    if (voice) utterance.voice = voice

    // Keep the button state accurate: it flips to "Stop Reading" once
    // speech actually starts, and resets automatically the moment it
    // finishes or errors out — no manual bookkeeping required elsewhere.
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [speechSupported, pickVoice])

  // The single control in the input dock does double duty, matching how
  // production chat apps (e.g. ChatGPT) handle this:
  //  - While idle: tapping it reads the latest assistant reply aloud.
  //  - While speaking: tapping it (now labeled "Stop Reading") cancels it.
  const toggleReadAloud = useCallback(() => {
    if (!speechSupported) return

    if (isSpeaking) {
      stopReading()
      return
    }

    const lastAssistantMessage = [...messagesRef.current].reverse().find(m => m.role === 'assistant')
    if (lastAssistantMessage) readAloud(lastAssistantMessage.content)
  }, [speechSupported, isSpeaking, stopReading, readAloud])

  // Toggling the persistent "auto read future replies" preference. If the
  // user turns it off while a reply happens to be speaking right now, stop
  // that speech immediately too — flipping the setting off should feel
  // instant, not "takes effect next message".
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
        // Only auto-read when the user has explicitly opted into it, and
        // only ever the single latest reply — never the whole conversation.
        if (speakReplies) readAloud(reply)
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: "Something went wrong reaching the AI. Please try again." }])
    }
    setLoading(false)
  }

  // Pre-configured custom action quick triggers. Memoized since this array
  // never changes across renders — avoids recreating it (and the objects
  // inside it) on every keystroke in the input field.
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

      {/* --- Swipeable Custom Suggestions Carousel --- */}
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

      {/* --- Double Pane Layout --- */}
      <div className="ai-split-workspace">
        
        {/* Left Pane: Custom Conversation Module */}
        <div className="chat-workspace-pane">
          
          <div ref={scrollRef} className="chat-messages-container">
            {messages.length === 1 ? (
              
              /* Elegant empty chat illustration with breathing AI Pulse Orb in center */
              <div className="empty-chat-orb-state">
                <div className="pulse-orb-outer">
                  <div className="pulse-orb-orbit" />
                  <div className="pulse-orb-center" style={{ animationPlayState: loading ? 'paused' : 'running' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0' }}>
                  What would you like to accomplish today?
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '280px', margin: 0, lineHeight: 1.5 }}>
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
          <div className="input-dock-layer">
            
            {/* Quick context chip display (Tasks, Calendar, Habits connected indices) */}
            <div className="linked-context-chips-row">
              <div className="linked-context-chips">
                <span className="context-mini-badge" style={{ borderColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>● Linked Tasks</span>
                <span className="context-mini-badge" style={{ borderColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>● Calendar</span>
                <span className="context-mini-badge" style={{ borderColor: 'rgba(236, 72, 153, 0.2)', color: '#ec4899' }}>● Habits</span>
              </div>

              {/* Read Aloud control: tap to read the latest assistant reply,
                  tap again while speaking to stop it. Long-press-free,
                  single source of truth (`isSpeaking`) drives the label. */}
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

            {/* Secondary, explicit "auto-read future replies" preference —
                separate from the manual Read Aloud action above, so users
                can opt into hands-free listening without losing the
                ability to manually stop mid-sentence. */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
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
                  style={{ accentColor: '#8b5cf6', width: '13px', height: '13px' }}
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
                    {listening ? <MicOff size={16} /> : <Mic size={16} />}
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
                  <Send size={15} />
                </motion.button>
              </div>
            </form>

            {(!voiceSupported || !speechSupported) && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
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
              <Brain size={14} color="#7c3aed" />
              <span>Workspace Indexes</span>
            </h4>
            <div className="metrics-summary-list">
              <div className="summary-metric-item">
                <span className="summary-metric-label">Active Tasks</span>
                <span className="summary-metric-value" style={{ color: '#ec4899' }}>{localStats.pendingTasks}</span>
              </div>
              <div className="summary-metric-item">
                <span className="summary-metric-label">Active Habits</span>
                <span className="summary-metric-value" style={{ color: '#8b5cf6' }}>{localStats.activeHabits}</span>
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
            <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Atlas Copilot is fully linked to local database tables, enabling direct contextual prompt evaluations.
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default AIChat;