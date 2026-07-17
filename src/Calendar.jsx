import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock3, Sparkles, Brain, CircleCheck,
  CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2
} from 'lucide-react'
import { supabase } from './lib/supabase'

const ease = [0.22, 1, 0.36, 1]

// Premium Theme Adaptive Glassmorphic Stylesheet (Unified with Overview) - Refined
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

    --canvas-bg: #08070c;
    --canvas-bg-2: #0c0b14;
    
    /* Unified Glass System */
    --glass-bg: rgba(22, 21, 32, 0.55);
    --glass-bg-elevated: rgba(28, 26, 40, 0.75);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-border-strong: rgba(255, 255, 255, 0.1);
    
    --text-primary: #ffffff;
    --text-secondary: #a1a1aa;
    --text-tertiary: #71717a;
    
    --input-bg: rgba(255, 255, 255, 0.03);
    --input-bg-hover: rgba(255, 255, 255, 0.06);
    --input-focus-border: #8b5cf6;
    --input-focus-glow: rgba(139, 92, 246, 0.2);

    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    --btn-primary-glow: rgba(139, 92, 246, 0.35);
    
    /* Unified Soft Shadow System */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.08);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.15);

    --aurora-primary: rgba(139, 92, 246, 0.12);
    --aurora-secondary: rgba(236, 72, 153, 0.08);
    --aurora-tertiary: rgba(59, 130, 246, 0.06);

    --accent-purple: #a78bfa;
    --accent-pink: #ec4899;
    --accent-gold: #f59e0b;
    --accent-green: #10b981;
    --accent-amber: #fbbf24;
    --accent-blue: #60a5fa;
    --accent-red: #ef4444;
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f8f9fc;
    --canvas-bg-2: #eef0f7;
    --glass-bg: rgba(255, 255, 255, 0.65);
    --glass-bg-elevated: rgba(255, 255, 255, 0.85);
    --glass-border: rgba(15, 23, 42, 0.04);
    --glass-border-strong: rgba(15, 23, 42, 0.08);
    
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-tertiary: #71717a;
    
    --input-bg: rgba(255, 255, 255, 0.5);
    --input-bg-hover: rgba(255, 255, 255, 0.8);
    --input-focus-border: #6366f1;
    --input-focus-glow: rgba(99, 102, 241, 0.12);

    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-glow: rgba(99, 102, 241, 0.2);
    
    --shadow-sm: 0 1px 2px rgba(31, 38, 135, 0.04), 0 2px 8px rgba(31, 38, 135, 0.03);
    --shadow-md: 0 4px 12px rgba(31, 38, 135, 0.05), 0 12px 32px rgba(31, 38, 135, 0.04);
    --shadow-lg: 0 8px 24px rgba(31, 38, 135, 0.06), 0 24px 48px rgba(31, 38, 135, 0.05);

    --aurora-primary: rgba(255, 220, 200, 0.35);
    --aurora-secondary: rgba(210, 220, 255, 0.35);
    --aurora-tertiary: rgba(230, 210, 255, 0.3);

    --accent-purple: #6366f1;
    --accent-pink: #ec4899;
    --accent-gold: #d97706;
    --accent-green: #059669;
    --accent-amber: #d97706;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }

  .calendar-dashboard button:focus-visible,
  .calendar-dashboard [role="button"]:focus-visible,
  .calendar-dashboard input:focus-visible {
    outline: 2px solid var(--input-focus-border);
    outline-offset: 2px;
  }

  .calendar-dashboard {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    position: relative;
    padding-block: clamp(20px, 4vw, 28px);
    padding-inline: clamp(12px, 3vw, 24px);
    box-sizing: border-box;
    touch-action: pan-y;
    overflow-x: clip;
    user-select: none;
    -webkit-user-select: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .calendar-dashboard,
  .calendar-dashboard * {
    box-sizing: border-box;
  }

  /* ---------- Ambient background ---------- */
  .aurora-blur-sphere {
    position: fixed;
    border-radius: 50%;
    filter: blur(140px);
    pointer-events: none;
    z-index: 0;
    will-change: transform;
    transition: background 0.6s var(--ease-premium);
  }
  .sphere-primary { top: -10%; left: -15%; width: 600px; height: 600px; background: var(--aurora-primary); }
  .sphere-secondary { bottom: -10%; right: -15%; width: 550px; height: 550px; background: var(--aurora-secondary); }
  .sphere-tertiary { top: 40%; left: 40%; width: 450px; height: 450px; background: var(--aurora-tertiary); opacity: 0.5; }

  /* ---------- Shared glass surface ---------- */
  .kpi-card-glass,
  .composer-card-glass,
  .calendar-nav-card,
  .timeline-container,
  .ai-assistant-card,
  .month-radial-card,
  .empty-events-banner {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    position: relative;
    width: 100%;
    max-width: 100%;
    border-radius: 18px;
  }

  /* ---------- KPI Summary Grid ---------- */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: clamp(10px, 2vw, 14px);
    margin-bottom: clamp(16px, 3vw, 24px);
    z-index: 10;
    position: relative;
  }

  .kpi-card-glass {
    padding: 18px 20px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    transition: box-shadow 0.3s var(--ease-premium), border-color 0.3s var(--ease-premium), transform 0.3s var(--ease-premium);
    will-change: transform;
    contain: layout paint;
  }
  .kpi-card-glass:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--glass-border-strong);
    transform: translateY(-2px);
  }

  .kpi-header-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    gap: 8px; 
    margin-bottom: 8px; 
  }
  .kpi-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.01em;
    line-height: 1.3;
    text-transform: uppercase;
    min-width: 0;
  }
  .kpi-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    display: flex; 
    align-items: center; 
    justify-content: center;
    flex-shrink: 0;
    background: rgba(139, 92, 246, 0.1);
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);
  }
  .kpi-main-metric {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 4px;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }
  .kpi-desc-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
    gap: 8px; 
  }
  .kpi-desc { 
    font-size: 10px; 
    color: var(--text-tertiary); 
    font-weight: 500; 
    max-width: 60%; 
    line-height: 1.4; 
  }

  /* ---------- Double pane layout ---------- */
  .calendar-dashboard-layout {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: clamp(14px, 2.5vw, 20px);
    z-index: 10;
    position: relative;
  }
  .left-pane { 
    display: flex; 
    flex-direction: column; 
    gap: clamp(14px, 2.5vw, 20px); 
    min-width: 0; 
  }
  .right-pane { 
    display: flex; 
    flex-direction: column; 
    gap: clamp(14px, 2.5vw, 20px); 
    min-width: 0; 
  }

  /* ---------- Event Composer ---------- */
  .composer-card-glass { 
    padding: 20px; 
  }
  .composer-title { 
    font-size: 15px; 
    font-weight: 700; 
    margin: 0 0 14px 0; 
    letter-spacing: -0.02em; 
  }
  .composer-form { 
    display: flex; 
    gap: 8px; 
    align-items: center; 
    flex-wrap: wrap; 
    width: 100%; 
  }

  .composer-input {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 10px 14px;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    font-family: var(--atlas-font);
    box-sizing: border-box;
    min-width: 0;
    transition: border-color 0.2s var(--ease-premium), box-shadow 0.2s var(--ease-premium), background 0.2s var(--ease-premium);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    outline: none;
  }
  .composer-input:hover { background: var(--glass-bg-elevated); border-color: var(--glass-border-strong); }
  .composer-input::placeholder { color: var(--text-tertiary); opacity: 1; }
  .composer-input:focus { border-color: var(--input-focus-border); box-shadow: 0 0 0 4px var(--input-focus-glow); background: var(--glass-bg-elevated); }
  .composer-input.title { flex: 2 1 180px; min-width: 0; }
  .composer-input.date-picker { flex: 1 1 130px; max-width: 150px; cursor: pointer; }
  .composer-input.time-picker { flex: 1 1 100px; max-width: 110px; cursor: pointer; }

  .btn-composer-add {
    position: relative;
    overflow: hidden;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--atlas-font);
    letter-spacing: -0.01em;
    cursor: pointer;
    box-shadow: 0 4px 14px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
    transition: transform 0.2s var(--ease-premium), box-shadow 0.2s var(--ease-premium), filter 0.2s var(--ease-premium);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .btn-composer-add:hover { transform: translateY(-1px); box-shadow: 0 8px 20px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset; filter: brightness(1.08); }
  .btn-composer-add:active { transform: scale(0.97); box-shadow: 0 2px 6px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset; }
  .btn-composer-content { position: relative; z-index: 3; display: flex; align-items: center; gap: 6px; }
  .btn-ripple-layer { position: absolute; inset: 0; z-index: 2; overflow: hidden; border-radius: inherit; pointer-events: none; }
  .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.32); transform: scale(0); animation: btn-ripple-expand 0.6s ease-out forwards; }
  @keyframes btn-ripple-expand { to { transform: scale(1); opacity: 0; } }

  /* ---------- Weekly ribbon (Calendar card) ---------- */
  .calendar-nav-card {
    padding: 20px;
    overflow: hidden;
  }
  .calendar-nav-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    gap: 10px; 
    margin-bottom: 16px; 
  }
  .active-month-text {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    min-width: 0;
  }

  .nav-controls-box { display: flex; gap: 6px; flex-shrink: 0; }
  .btn-nav-arrow {
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex; 
    align-items: center; 
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s var(--ease-premium), border-color 0.2s var(--ease-premium);
  }
  .btn-nav-arrow:hover { background: var(--input-bg-hover); border-color: var(--glass-border-strong); }

  .week-days-ribbon {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: clamp(3px, 1.2vw, 8px);
  }

  .day-ribbon-card {
    background: var(--input-bg);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 10px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: background 0.2s var(--ease-premium), border-color 0.2s var(--ease-premium), box-shadow 0.3s var(--ease-premium);
    position: relative;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    min-width: 0;
  }
  .day-ribbon-card:hover { background: var(--input-bg-hover); border-color: var(--glass-border); }

  .day-ribbon-card.is-today::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 15px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.16), transparent 70%);
    animation: today-halo-pulse 3.2s ease-in-out infinite;
    z-index: -1;
  }
  @keyframes today-halo-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

  .day-ribbon-card.is-selected {
    background: var(--btn-primary-bg);
    border-color: transparent;
    box-shadow: 0 4px 14px var(--btn-primary-glow), inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .day-label-text {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .day-number-text { 
    font-size: 18px; 
    font-weight: 700; 
    color: var(--text-primary); 
    letter-spacing: -0.02em; 
  }
  .day-ribbon-card.is-selected .day-label-text,
  .day-ribbon-card.is-selected .day-number-text { color: #ffffff; }

  .today-glow-dot {
    width: 4px; 
    height: 4px;
    background-color: var(--accent-amber);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
    position: absolute;
    bottom: 4px;
  }

  /* ---------- Timeline & Event Feed ---------- */
  .timeline-container { padding: 20px; }
  .timeline-axis { 
    position: relative; 
    padding-left: clamp(20px, 4vw, 28px); 
    margin-top: 14px; 
    min-width: 0; 
  }
  .timeline-axis::before {
    content: '';
    position: absolute;
    top: 6px; 
    bottom: 6px; 
    left: 7px; 
    width: 2px;
    background-image: repeating-linear-gradient(to bottom, var(--glass-border) 0px, var(--glass-border) 4px, transparent 4px, transparent 9px);
  }

  .timeline-node-dot {
    position: absolute; 
    left: 4px; 
    width: 8px; 
    height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
    border: 2px solid var(--canvas-bg);
    box-shadow: 0 0 0 3px var(--glass-border);
    z-index: 2;
  }
  .timeline-node-dot.active {
    background: var(--accent-purple);
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.4), 0 0 0 3px rgba(139, 92, 246, 0.18);
  }

  .timeline-event-wrapper { 
    position: relative; 
    margin-bottom: 20px; 
    min-width: 0; 
  }
  .timeline-event-wrapper:last-child { margin-bottom: 0; }
  .timeline-time-col { 
    font-size: 10px; 
    font-weight: 600; 
    color: var(--text-tertiary); 
    text-transform: uppercase; 
    letter-spacing: 0.02em; 
    margin-bottom: 6px; 
  }

  .event-card-tactile {
    background: var(--input-bg);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-width: 0;
    transition: transform 0.25s var(--ease-premium), border-color 0.25s var(--ease-premium), box-shadow 0.3s var(--ease-premium), background 0.25s var(--ease-premium);
  }
  .event-card-tactile:hover {
    transform: translateY(-2px);
    border-color: var(--glass-border);
    box-shadow: var(--shadow-md);
    background: var(--input-bg-hover);
  }

  .event-title-main {
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary); 
    margin: 0 0 3px 0; 
    letter-spacing: -0.01em;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  .event-meta-info { 
    font-size: 10px; 
    color: var(--text-tertiary); 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    font-weight: 500; 
    flex-wrap: wrap; 
  }
  .meta-tag { 
    background: var(--glass-border); 
    padding: 1px 6px; 
    border-radius: 5px; 
    font-weight: 500; 
  }

  .btn-delete-event {
    background: transparent; 
    border: 1px solid transparent; 
    color: var(--text-tertiary);
    cursor: pointer; 
    padding: 6px; 
    border-radius: 8px;
    display: flex; 
    align-items: center; 
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s var(--ease-premium), color 0.2s var(--ease-premium), border-color 0.2s var(--ease-premium);
  }
  .btn-delete-event:hover { 
    background: rgba(239, 68, 68, 0.1); 
    color: var(--accent-red); 
    border-color: rgba(239, 68, 68, 0.2); 
  }

  /* ---------- AI Suggestions & Progress ---------- */
  .ai-assistant-card {
    padding: 20px;
    overflow: hidden;
  }

  .ai-sparkle-icon { 
    display: inline-flex; 
    animation: ai-sparkle-twinkle 2.6s ease-in-out infinite; 
    transform-origin: center; 
  }
  @keyframes ai-sparkle-twinkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
    50% { transform: scale(1.15) rotate(8deg); opacity: 1; }
  }

  .ai-suggestion-box {
    background: var(--input-bg);
    border: 1px solid transparent;
    border-radius: 12px;
    padding: 12px;
    margin-top: 12px;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    transition: background 0.2s var(--ease-premium), border-color 0.2s var(--ease-premium), transform 0.2s var(--ease-premium);
  }
  .ai-suggestion-box:hover { 
    background: var(--input-bg-hover); 
    border-color: var(--glass-border); 
    transform: translateY(-1px); 
  }
  .ai-suggestion-box > div { min-width: 0; word-wrap: break-word; }

  .suggestion-bullet { 
    width: 6px; 
    height: 6px; 
    border-radius: 50%; 
    margin-top: 5px; 
    flex-shrink: 0; 
  }

  .month-radial-card {
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(10px, 2.5vw, 16px);
  }
  .month-radial-card > div:first-child { min-width: 0; }

  /* ---------- Empty State ---------- */
  .empty-events-banner {
    text-align: center;
    padding: 32px 16px;
    border-radius: 14px;
    border: 1px dashed var(--glass-border-strong);
    background: transparent;
    box-shadow: none;
  }
  .empty-icon-badge {
    width: 40px; 
    height: 40px; 
    border-radius: 10px;
    margin: 0 auto 12px auto;
    display: flex; 
    align-items: center; 
    justify-content: center;
    background: var(--input-bg);
    color: var(--text-tertiary);
    border: 1px solid var(--glass-border);
  }
  .empty-banner-title { 
    font-size: 13px; 
    font-weight: 600; 
    color: var(--text-primary); 
    margin: 0 0 3px 0; 
    letter-spacing: -0.01em; 
  }

  /* ======================================================================
     TABLET (769px – 1024px)
     ====================================================================== */
  @media (min-width: 769px) and (max-width: 1024px) {
    .calendar-dashboard-layout { grid-template-columns: 1fr; }
    .stats-carousel-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  /* ======================================================================
     MOBILE (<= 768px)
     ====================================================================== */
  @media (max-width: 768px) {
    .calendar-dashboard {
      padding-bottom: calc(clamp(80px, 18vw, 100px) + env(safe-area-inset-bottom)) !important;
      padding-inline: clamp(8px, 3vw, 16px) !important;
    }

    .stats-carousel-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: clamp(6px, 2vw, 10px);
      margin-bottom: clamp(14px, 3vw, 18px);
    }
    .kpi-card-glass { 
      min-height: 90px; 
      padding: 14px 16px; 
      border-radius: 14px; 
    }
    .kpi-main-metric { font-size: 26px; margin-bottom: 2px; }
    .kpi-label { font-size: 10px; }
    .kpi-desc { font-size: 9px; max-width: 100%; }
    .kpi-icon-wrapper { width: 28px; height: 28px; border-radius: 8px; }

    .calendar-dashboard-layout { 
      grid-template-columns: 1fr; 
      gap: clamp(12px, 3vw, 18px); 
    }

    .day-ribbon-card { gap: 3px; padding: 8px 2px; }
    .day-number-text { font-size: 15px; }
    .day-label-text { font-size: 9px; }
    .today-glow-dot { width: 3px; height: 3px; bottom: 3px; }

    .calendar-nav-card, .timeline-container, .ai-assistant-card { 
      padding: 16px; 
      border-radius: 16px; 
    }
    .active-month-text { font-size: 16px; }
    .composer-card-glass { display: none; }
    .month-radial-card { padding: 14px 16px; }

    /* --- Floating Action Button --- */
    .mobile-floating-add-btn {
      position: fixed;
      bottom: max(16px, env(safe-area-inset-bottom));
      right: clamp(12px, 3vw, 20px);
      width: clamp(48px, 12vw, 52px);
      height: clamp(48px, 12vw, 52px);
      border-radius: 14px;
      background: var(--btn-primary-bg);
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 6px 18px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
      z-index: 99; 
      cursor: pointer; 
      border: none;
      overflow: hidden;
    }

    .mobile-drawer-sheet {
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0;
      background: rgba(8, 7, 12, 0.85);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      z-index: 100;
      display: flex; 
      flex-direction: column; 
      justify-content: flex-end;
    }

    .mobile-drawer-body {
      background: var(--glass-bg-elevated);
      border: 1px solid var(--glass-border-strong);
      border-bottom: none;
      border-radius: 20px 20px 0 0;
      padding: clamp(18px, 5vw, 24px) clamp(14px, 4vw, 20px);
      padding-bottom: calc(clamp(18px, 5vw, 24px) + env(safe-area-inset-bottom));
      display: flex; 
      flex-direction: column; 
      gap: clamp(12px, 3vw, 16px);
      box-shadow: var(--shadow-lg);
    }

    .composer-form { flex-direction: column; align-items: stretch; }
    .composer-input { width: 100% !important; max-width: 100% !important; }
    .btn-composer-add { width: 100%; justify-content: center; }
  }

  @media (max-width: 340px) {
    .day-ribbon-card { padding-inline: 2px; }
    .day-label-text { letter-spacing: 0.02em; }
  }
`;

function getWeekDates(anchor) {
  const start = new Date(anchor)
  const day = start.getDay()
  start.setDate(start.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function CalendarWidget({ userId }) {
  const [events, setEvents] = useState([])
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [weekAnchor, setWeekAnchor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [shiftDirection, setShiftDirection] = useState(1)

  const [isMobile, setIsMobile] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [composerRipples, setComposerRipples] = useState([])
  const [fabRipples, setFabRipples] = useState([])

  useEffect(() => {
    fetchEvents()
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })
    if (!error) setEvents(data)
    setLoading(false)
  }

  async function addEvent(e) {
    e.preventDefault()
    if (!title.trim() || !date) return
    const { error } = await supabase
      .from('calendar_events')
      .insert([{ title, user_id: userId, event_date: date, event_time: time || null }])
    if (!error) {
      setTitle('')
      setDate('')
      setTime('')
      setIsMobileDrawerOpen(false)
      fetchEvents()
    }
  }

  async function deleteEvent(id) {
    await supabase.from('calendar_events').delete().eq('id', id)
    fetchEvents()
  }

  function spawnRipple(e, setter) {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now() + Math.random()
    setter((prev) => [...prev, { id, x, y, size }])
    setTimeout(() => {
      setter((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  function handleDayKeyDown(e, key, isSelected) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedDay(isSelected ? null : key)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const weekDates = getWeekDates(weekAnchor)
  const eventsByDate = {}
  events.forEach(ev => {
    if (!eventsByDate[ev.event_date]) eventsByDate[ev.event_date] = []
    eventsByDate[ev.event_date].push(ev)
  })

  function shiftWeek(delta) {
    const d = new Date(weekAnchor)
    d.setDate(d.getDate() + delta * 7)
    setShiftDirection(delta)
    setWeekAnchor(d)
    setSelectedDay(null)
  }

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : []

  const todayEventsCount = eventsByDate[today]?.length || 0
  const upcomingCount = events.filter(ev => new Date(ev.event_date) >= new Date()).length
  const completedEventsCount = events.filter(ev => new Date(ev.event_date) < new Date()).length
  const totalEventsThisMonth = events.length
  const monthProgressRate = totalEventsThisMonth > 0
    ? Math.round((completedEventsCount / totalEventsThisMonth) * 100)
    : 0

  return (
    <div className="calendar-dashboard">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="aurora-blur-sphere sphere-tertiary" />

      {/* --- KPI Summary Grid --- */}
      <motion.div
        className="stats-carousel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
        }}
      >
        <SummaryCard
          label="Today's Events"
          value={todayEventsCount}
          icon={<CalendarClock size={14} aria-hidden="true" />}
          desc="Due within 24 hours"
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
          accent="#f59e0b"
        />
        <SummaryCard
          label="Upcoming"
          value={upcomingCount}
          icon={<Clock3 size={14} aria-hidden="true" />}
          desc="Scheduled events"
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
          accent="#60a5fa"
        />
        <SummaryCard
          label="Focus Score"
          value="9.2"
          icon={<Brain size={14} aria-hidden="true" />}
          desc="Target: 9.5 scale"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
          accent="#8b5cf6"
        />
        <SummaryCard
          label="Accomplished"
          value={completedEventsCount}
          icon={<CircleCheck size={14} aria-hidden="true" />}
          desc="Finished logs"
          sparklinePath="M0,4 C10,12 20,2 30,8 C40,14 50,2 60,15"
          accent="#10b981"
        />
      </motion.div>

      {/* --- Double Pane Dashboard Panel Layout --- */}
      <div className="calendar-dashboard-layout">

        <div className="left-pane">

          {/* Calendar weekly ribbon navigation */}
          <div className="calendar-nav-card">
            <div className="calendar-nav-header">
              <AnimatePresence mode="wait">
                <motion.span
                  key={weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  className="active-month-text"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.25, ease }}
                >
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </motion.span>
              </AnimatePresence>
              <div className="nav-controls-box">
                <motion.button
                  onClick={() => shiftWeek(-1)}
                  className="btn-nav-arrow"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                  aria-label="Previous week"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </motion.button>
                <motion.button
                  onClick={() => shiftWeek(1)}
                  className="btn-nav-arrow"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                  aria-label="Next week"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={weekDates[0].toISOString().split('T')[0]}
                className="week-days-ribbon"
                initial={{ opacity: 0, x: shiftDirection > 0 ? 26 : -26 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: shiftDirection > 0 ? -26 : 26 }}
                transition={{ duration: 0.3, ease }}
              >
                {weekDates.map(d => {
                  const key = d.toISOString().split('T')[0]
                  const isToday = key === today
                  const dayEvents = eventsByDate[key] || []
                  const isSelected = selectedDay === key
                  const fullLabel = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  return (
                    <motion.div
                      key={key}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      onKeyDown={(e) => handleDayKeyDown(e, key, isSelected)}
                      className={`day-ribbon-card ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                      animate={{ y: isSelected ? -3 : 0, scale: isSelected ? 1.03 : 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                      whileTap={{ scale: 0.96 }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={`${fullLabel}${isToday ? ' (today)' : ''}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                    >
                      <span className="day-label-text">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="day-number-text">{d.getDate()}</span>
                      {isToday && <div className="today-glow-dot" aria-hidden="true" />}
                      {dayEvents.length > 0 && !isToday && (
                        <div aria-hidden="true" style={{
                          width: '4px', height: '4px', borderRadius: '50%',
                          background: isSelected ? '#ffffff' : 'var(--accent-purple)',
                          marginTop: '3px'
                        }} />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive selected day timeline view */}
          <div className="timeline-container">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
              {selectedDay ? (
                new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              ) : (
                "Today's Timeline"
              )}
            </h3>

            <div className="timeline-axis">
              {selectedDay ? (
                selectedEvents.length === 0 ? (
                  <div className="empty-events-banner">
                    <div className="empty-icon-badge"><Clock3 size={20} aria-hidden="true" /></div>
                    <span className="empty-banner-title">Nothing Scheduled</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>You have no events allocated for this day.</p>
                  </div>
                ) : (
                  selectedEvents.map((ev, index) => (
                    <div className="timeline-event-wrapper" key={ev.id}>
                      <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} aria-hidden="true" />
                      <div className="timeline-time-col">
                        {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
                      </div>
                      <div className="event-card-tactile">
                        <div style={{ minWidth: 0 }}>
                          <h4 className="event-title-main">{ev.title}</h4>
                          <div className="event-meta-info">
                            <span className="meta-tag">Course module</span>
                            <span>·</span>
                            <span>Active timeline</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="btn-delete-event"
                          aria-label={`Delete event: ${ev.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              ) : (
                (eventsByDate[today] || []).length === 0 ? (
                  <div className="empty-events-banner">
                    <div className="empty-icon-badge"><Clock3 size={20} aria-hidden="true" /></div>
                    <span className="empty-banner-title">No Events Scheduled Today</span>
                  </div>
                ) : (
                  (eventsByDate[today] || []).map((ev, index) => (
                    <div className="timeline-event-wrapper" key={ev.id}>
                      <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} aria-hidden="true" />
                      <div className="timeline-time-col">
                        {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
                      </div>
                      <div className="event-card-tactile">
                        <div style={{ minWidth: 0 }}>
                          <h4 className="event-title-main">{ev.title}</h4>
                          <div className="event-meta-info">
                            <span className="meta-tag">Today</span>
                            <span>·</span>
                            <span>Active timeline</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEvent(ev.id)}
                          className="btn-delete-event"
                          aria-label={`Delete event: ${ev.title}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>

        {/* Right Pane: Event composer & AI Suggestions */}
        <div className="right-pane">

          {!isMobile && (
            <div className="composer-card-glass">
              <h3 className="composer-title">Create Schedule Node</h3>
              <form onSubmit={addEvent} className="composer-form">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Event title..."
                  className="composer-input title"
                  aria-label="Event title"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="composer-input date-picker"
                  aria-label="Event date"
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="composer-input time-picker"
                  aria-label="Event time (optional)"
                />
                <motion.button
                  type="submit"
                  className="btn-composer-add"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  onPointerDown={(e) => spawnRipple(e, setComposerRipples)}
                  aria-label="Add event"
                >
                  <span className="btn-composer-content">
                    <Plus size={15} aria-hidden="true" />
                    <span>Add Event</span>
                  </span>
                  <span className="btn-ripple-layer">
                    {composerRipples.map((r) => (
                      <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
                    ))}
                  </span>
                </motion.button>
              </form>
            </div>
          )}

          {/* AI Insights & suggestions */}
          <div className="ai-assistant-card">
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.02em' }}>
              <span className="ai-sparkle-icon"><Sparkles size={15} color="var(--accent-amber)" aria-hidden="true" /></span>
              <span>Atlas AI Suggestions</span>
            </h3>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" aria-hidden="true" style={{ background: 'var(--accent-amber)', boxShadow: '0 0 6px rgba(245, 158, 11, 0.45)' }} />
              <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                You have <strong style={{ color: 'var(--text-primary)' }}>3 hours free</strong> in your afternoon slot. Schedule a focus session?
              </div>
            </motion.div>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" aria-hidden="true" style={{ background: 'var(--accent-red)', boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)' }} />
              <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                Assignment due tomorrow. Ensure preparation notes are reviewed.
              </div>
            </motion.div>
          </div>

          {/* Radial progress card */}
          <div className="month-radial-card">
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 3px 0', letterSpacing: '-0.02em' }}>Month Completion</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Based on overall metrics.</p>
            </div>

            <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }} role="img" aria-label={`Month completion: ${monthProgressRate}%`}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.path
                  fill="none"
                  stroke="url(#gradientRing)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: monthProgressRate / 100 }}
                  transition={{ duration: 1.2, ease }}
                />
                <defs>
                  <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {monthProgressRate}%
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Floating Action Drawer */}
      {isMobile && (
        <>
          <motion.button
            className="mobile-floating-add-btn"
            onClick={() => setIsMobileDrawerOpen(true)}
            onPointerDown={(e) => spawnRipple(e, setFabRipples)}
            animate={{ y: scrolled ? -3 : 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            aria-label="Add event"
          >
            <Plus size={22} strokeWidth={2.5} aria-hidden="true" style={{ position: 'relative', zIndex: 3 }} />
            <span className="btn-ripple-layer">
              {fabRipples.map((r) => (
                <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
              ))}
            </span>
          </motion.button>

          <AnimatePresence>
            {isMobileDrawerOpen && (
              <motion.div
                className="mobile-drawer-sheet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-label="Add event"
              >
                <div style={{ flex: 1 }} onClick={() => setIsMobileDrawerOpen(false)} />

                <motion.div
                  className="mobile-drawer-body"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                >
                  <h3 className="composer-title" style={{ margin: 0 }}>Add Event Node</h3>

                  <form onSubmit={addEvent} className="composer-form">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Event title..."
                      className="composer-input"
                      aria-label="Event title"
                    />
                    <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="composer-input"
                        style={{ flex: '1 1 130px', minWidth: 0 }}
                        aria-label="Event date"
                      />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="composer-input"
                        style={{ flex: '1 1 110px', minWidth: 0 }}
                        aria-label="Event time (optional)"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="composer-input"
                        style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'var(--input-bg)', justifyContent: 'center', cursor: 'pointer' }}
                        aria-label="Cancel adding event"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-composer-add" style={{ flex: 2, justifyContent: 'center' }} aria-label="Add event">
                        <span className="btn-composer-content" style={{ justifyContent: 'center', width: '100%' }}>Add Event</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  )
}

function SummaryCard({ label, value, icon, desc, sparklinePath, accent }) {
  const gradId = 'cal-spark-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const accentColor = accent || '#8b5cf6'
  return (
    <motion.div
      className="kpi-card-glass"
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
      }}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper" style={{ background: accentColor + '1a', color: accentColor, boxShadow: `0 0 12px ${accentColor}1a` }}>{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="1" />
            </linearGradient>
          </defs>
          <motion.path
            d={sparklinePath}
            stroke={`url(#${gradId})`}
            strokeWidth="1.75"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease, delay: 0.25 }}
          />
        </svg>
      </div>
    </motion.div>
  )
}

export default CalendarWidget;