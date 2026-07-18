import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Clock3, Sparkles, Brain, CircleCheck,
  CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2
} from 'lucide-react'
import { supabase } from './lib/supabase'

const ease = [0.22, 1, 0.36, 1]

// Atlas Command Calendar — premium, fluid, responsive stylesheet
// All existing Atlas design tokens (--canvas-bg, --glass-*, --text-*, --accent-*, --btn-primary-*)
// are preserved exactly as before. Only layout/responsiveness/visual-polish rules were added or adjusted.
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, sans-serif;

    --canvas-bg: #090810;
    --glass-base: rgba(20, 18, 32, 0.56);
    --glass-sheen-1: rgba(255, 255, 255, 0.045);
    --glass-sheen-2: rgba(255, 255, 255, 0.012);
    --glass-border: rgba(255, 255, 255, 0.09);
    --glass-highlight: rgba(255, 255, 255, 0.10);
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.6);
    --input-border: rgba(255, 255, 255, 0.09);
    --input-focus-border: #8b7cf6;
    --input-focus-glow: rgba(139, 124, 246, 0.2);

    --btn-primary-bg: linear-gradient(135deg, #9b87ff 0%, #6d5ef2 55%, #5a4de0 100%);
    --btn-primary-glow: rgba(124, 108, 246, 0.32);
    --card-shadow: 0 24px 48px -22px rgba(20, 10, 45, 0.55), 0 2px 0 rgba(255, 255, 255, 0.02) inset;
    --card-shadow-hover: 0 30px 56px -20px rgba(28, 14, 60, 0.6), 0 2px 0 rgba(255, 255, 255, 0.03) inset;

    --aurora-primary: rgba(139, 92, 246, 0.10);
    --aurora-secondary: rgba(96, 165, 250, 0.07);
    --aurora-tertiary: rgba(167, 139, 250, 0.06);
    --sparkline-color: #8b7cf6;

    --accent-purple: #8b5cf6;
    --accent-purple-light: #a78bfa;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
    --accent-blue: #60a5fa;

    /* fluid spacing/type scale tokens used throughout the redesign */
    --space-2xs: clamp(4px, 1vw, 6px);
    --space-xs: clamp(6px, 1.5vw, 10px);
    --space-sm: clamp(8px, 2vw, 14px);
    --space-md: clamp(12px, 3vw, 20px);
    --space-lg: clamp(16px, 4vw, 24px);
    --radius-card: clamp(16px, 3.5vw, 24px);
    --radius-tile: clamp(11px, 2.5vw, 18px);
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f8fafc;
    --glass-base: rgba(255, 255, 255, 0.68);
    --glass-sheen-1: rgba(255, 255, 255, 0.5);
    --glass-sheen-2: rgba(255, 255, 255, 0.18);
    --glass-border: rgba(15, 23, 42, 0.09);
    --glass-highlight: rgba(255, 255, 255, 0.85);
    --text-primary: #1e1b4b;
    --text-secondary: #475569;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(241, 245, 249, 0.75);
    --input-border: rgba(15, 23, 42, 0.09);
    --input-focus-border: #6d5ef2;
    --input-focus-glow: rgba(109, 94, 242, 0.15);

    --btn-primary-bg: linear-gradient(135deg, #8172f2 0%, #6152e8 100%);
    --btn-primary-glow: rgba(97, 82, 232, 0.22);
    --card-shadow: 0 16px 36px rgba(30, 20, 80, 0.06), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
    --card-shadow-hover: 0 22px 44px rgba(30, 20, 80, 0.09), 0 1px 0 rgba(255, 255, 255, 0.7) inset;

    --aurora-primary: #ffe9e0;
    --aurora-secondary: #e4edff;
    --aurora-tertiary: #f0e6ff;
    --sparkline-color: #6152e8;
    --accent-purple: #6d5ef2;
    --accent-purple-light: #8172f2;
    --accent-amber: #d97706;
  }

  .calendar-dashboard, .calendar-dashboard * {
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
  }

  /* Keyboard accessibility: no visible focus ring for mouse users, but always visible for keyboard nav */
  .calendar-dashboard :focus { outline: none; }
  .calendar-dashboard :focus-visible {
    outline: 2px solid var(--accent-purple-light);
    outline-offset: 2px;
    border-radius: 8px;
  }

  .calendar-dashboard {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: var(--space-lg) var(--space-md);
    padding-left: max(var(--space-md), env(safe-area-inset-left));
    padding-right: max(var(--space-md), env(safe-area-inset-right));
    padding-bottom: calc(clamp(24px, 6vw, 32px) + env(safe-area-inset-bottom));
    touch-action: pan-y;
    overflow-x: hidden;
  }

  /* ---------- Layered ambient background ---------- */
  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
    transition: background 0.5s ease;
  }
  .sphere-primary { top: 5%; left: -10%; width: min(450px, 60vw); height: min(450px, 60vw); background: var(--aurora-primary); }
  .sphere-secondary { bottom: 10%; right: -10%; width: min(400px, 55vw); height: min(400px, 55vw); background: var(--aurora-secondary); }
  .sphere-tertiary { top: 38%; left: 38%; width: min(340px, 48vw); height: min(340px, 48vw); background: var(--aurora-tertiary); }

  .calendar-noise-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.028;
    mix-blend-mode: overlay;
    border-radius: inherit;
    animation: noise-breathe 9s ease-in-out infinite;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  @keyframes noise-breathe { 0%, 100% { opacity: 0.02; } 50% { opacity: 0.035; } }

  /* ---------- Shared glass surface ---------- */
  .kpi-card-glass,
  .composer-card-glass,
  .calendar-nav-card,
  .timeline-container,
  .ai-assistant-card,
  .month-radial-card,
  .empty-events-banner {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%);
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
    min-width: 0;
  }

  .kpi-card-glass::before,
  .composer-card-glass::before,
  .calendar-nav-card::before,
  .timeline-container::before,
  .ai-assistant-card::before,
  .month-radial-card::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-highlight), transparent);
    pointer-events: none;
  }

  /* ---------- KPI Summary Grid (fluid 2x2 on mobile, 4-up on desktop) ---------- */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
    z-index: 10;
    position: relative;
  }
  @media (min-width: 720px) {
    .stats-carousel-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  .kpi-card-glass {
    border-radius: var(--radius-tile);
    padding: var(--space-sm) var(--space-md);
    min-height: clamp(84px, 18vw, 120px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.3s ease;
  }
  .kpi-card-glass:hover, .kpi-card-glass:focus-visible {
    transform: translateY(-4px);
    border-color: rgba(139, 92, 246, 0.22);
    box-shadow: var(--card-shadow-hover);
  }
  .kpi-card-glass:active { transform: translateY(-1px) scale(0.99); }

  .kpi-header-row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2xs); margin-bottom: var(--space-xs); min-width: 0; }
  .kpi-label {
    font-size: clamp(8.5px, 2.1vw, 10px);
    font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.07em;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
  }
  .kpi-icon-wrapper {
    width: clamp(22px, 6vw, 28px); height: clamp(22px, 6vw, 28px); border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .kpi-main-metric { font-size: clamp(19px, 5.2vw, 30px); font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: var(--space-2xs); letter-spacing: -0.01em; }
  .kpi-desc-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 6px; min-width: 0; }
  .kpi-desc { font-size: clamp(9px, 2vw, 11px); color: var(--text-tertiary); font-weight: 500; overflow-wrap: break-word; min-width: 0; }
  .kpi-desc-row svg { flex-shrink: 0; width: clamp(38px, 12vw, 60px); height: auto; }

  /* ---------- Double pane layout ---------- */
  .calendar-dashboard-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-lg);
    z-index: 10;
    position: relative;
  }
  @media (min-width: 900px) {
    .calendar-dashboard-layout { grid-template-columns: 1.6fr 1fr; }
  }
  .left-pane, .right-pane { display: flex; flex-direction: column; gap: var(--space-lg); min-width: 0; }

  /* ---------- Event Composer ---------- */
  .composer-card-glass { border-radius: var(--radius-card); padding: var(--space-lg); }
  .composer-title { font-size: clamp(14px, 3.2vw, 16px); font-weight: 700; margin: 0 0 var(--space-sm) 0; letter-spacing: -0.01em; }
  .composer-form { display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; width: 100%; min-width: 0; }

  .composer-input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 13px;
    padding: 12px 16px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    min-width: 0;
    transition: border-color 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .composer-input::placeholder { color: var(--text-secondary); opacity: 0.65; }
  .composer-input:focus-visible { border-color: var(--input-focus-border); box-shadow: 0 0 0 3px var(--input-focus-glow); }
  .composer-input.title { flex: 2 1 180px; min-width: 0; }
  .composer-input.date-picker { flex: 1 1 130px; min-width: 0; max-width: 180px; cursor: pointer; }
  .composer-input.time-picker { flex: 1 1 100px; min-width: 0; max-width: 140px; cursor: pointer; }

  .btn-composer-add {
    position: relative;
    overflow: hidden;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 13px;
    padding: 12px 22px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px var(--btn-primary-glow), inset 0 1px 0 rgba(255,255,255,0.18);
    transition: box-shadow 0.25s ease;
    flex-shrink: 0;
    white-space: nowrap;
    min-height: 44px;
  }
  .btn-composer-add::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 55%;
    background: linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
    z-index: 1; pointer-events: none;
  }
  .btn-composer-add:hover { box-shadow: 0 10px 26px var(--btn-primary-glow), inset 0 1px 0 rgba(255,255,255,0.22); }
  .btn-composer-content { position: relative; z-index: 3; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-ripple-layer { position: absolute; inset: 0; z-index: 2; overflow: hidden; border-radius: inherit; pointer-events: none; }
  .btn-ripple { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.32); transform: scale(0); animation: btn-ripple-expand 0.6s ease-out forwards; }
  @keyframes btn-ripple-expand { to { transform: scale(1); opacity: 0; } }

  /* ---------- Weekly ribbon (Calendar centerpiece) ---------- */
  .calendar-nav-card { border-radius: var(--radius-card); padding: var(--space-lg); overflow: hidden; }
  .calendar-nav-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-md); min-width: 0; }
  .active-month-text {
    font-size: clamp(16px, 4.2vw, 20px); font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
  }

  .nav-controls-box { display: flex; gap: var(--space-2xs); flex-shrink: 0; }
  .btn-nav-arrow {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    width: clamp(34px, 8vw, 38px); height: clamp(34px, 8vw, 38px);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
    flex-shrink: 0;
  }
  .btn-nav-arrow:hover { background: var(--glass-border); border-color: rgba(139, 92, 246, 0.25); }

  .week-days-ribbon { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: clamp(3px, 1.6vw, 12px); width: 100%; }

  .day-ribbon-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-tile);
    padding: clamp(8px, 2.6vw, 14px) clamp(2px, 1vw, 14px);
    min-height: 44px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(3px, 1vw, 8px);
    cursor: pointer;
    transition: background 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease, box-shadow 0.3s ease;
    position: relative;
    min-width: 0;
  }
  .day-ribbon-card:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.12); }

  .day-ribbon-card.is-today::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: calc(var(--radius-tile) + 3px);
    background: radial-gradient(circle, rgba(245, 158, 11, 0.16), transparent 70%);
    animation: today-halo-pulse 3.2s ease-in-out infinite;
    z-index: -1;
  }
  @keyframes today-halo-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

  .day-ribbon-card.is-selected {
    background: var(--btn-primary-bg);
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 14px 30px -10px rgba(90, 60, 220, 0.35), inset 0 1px 0 rgba(255,255,255,0.14);
  }

  .day-label-text {
    font-size: clamp(8px, 2.2vw, 11px); font-weight: 700; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;
  }
  .day-number-text { font-size: clamp(13px, 4.2vw, 20px); font-weight: 800; color: var(--text-primary); }
  .day-ribbon-card.is-selected .day-label-text,
  .day-ribbon-card.is-selected .day-number-text { color: #ffffff; }

  .today-glow-dot {
    width: 6px; height: 6px;
    background-color: var(--accent-amber);
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(245, 158, 11, 0.5);
    flex-shrink: 0;
  }

  /* ---------- Timeline & Event Feed ---------- */
  .timeline-container { border-radius: var(--radius-card); padding: var(--space-lg); }
  .timeline-axis { position: relative; padding-left: clamp(20px, 6vw, 30px); margin-top: var(--space-sm); }
  .timeline-axis::before {
    content: '';
    position: absolute;
    top: 6px; bottom: 6px; left: clamp(5px, 1.6vw, 7px); width: 2px;
    background-image: repeating-linear-gradient(to bottom, var(--glass-border) 0px, var(--glass-border) 4px, transparent 4px, transparent 9px);
  }

  .timeline-node-dot {
    position: absolute; left: clamp(2px, 1vw, 4px); width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
    border: 2px solid var(--canvas-bg);
    box-shadow: 0 0 0 3px var(--glass-border);
    z-index: 2;
  }
  .timeline-node-dot.active {
    background: var(--accent-purple-light);
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.4), 0 0 0 3px rgba(167, 139, 250, 0.18);
  }

  .timeline-event-wrapper { position: relative; margin-bottom: clamp(16px, 4vw, 26px); min-width: 0; }
  .timeline-event-wrapper:last-child { margin-bottom: 0; }
  .timeline-time-col { font-size: 11px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-2xs); }

  .event-card-tactile {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-tile);
    padding: clamp(12px, 3vw, 16px) clamp(14px, 3.5vw, 20px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-xs);
    min-width: 0;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.3s ease, background 0.25s ease;
  }
  .event-card-tactile:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: var(--card-shadow-hover);
    background: rgba(255, 255, 255, 0.045);
  }

  .event-card-text { min-width: 0; }
  .event-title-main {
    font-size: clamp(13px, 3.2vw, 14px); font-weight: 700; color: var(--text-primary); margin: 0 0 4px 0;
    overflow-wrap: break-word; word-break: break-word;
  }
  .event-meta-info { font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-weight: 500; }
  .meta-tag { background: var(--input-bg); padding: 2px 8px; border-radius: 6px; font-weight: 600; white-space: nowrap; }

  .btn-delete-event {
    background: none; border: none; color: var(--text-tertiary);
    cursor: pointer; padding: 8px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s ease, color 0.2s ease;
    min-width: 40px; min-height: 40px;
  }
  .btn-delete-event:hover { background: rgba(239, 68, 68, 0.09); color: var(--accent-red); }

  /* ---------- AI Suggestions & Progress ---------- */
  .ai-assistant-card {
    background-image: linear-gradient(150deg, rgba(139, 92, 246, 0.08) 0%, rgba(96, 165, 250, 0.04) 60%, transparent 100%);
    border-radius: var(--radius-card);
    padding: var(--space-lg);
    overflow: hidden;
  }

  .ai-sparkle-icon { display: inline-flex; animation: ai-sparkle-twinkle 2.6s ease-in-out infinite; transform-origin: center; flex-shrink: 0; }
  @keyframes ai-sparkle-twinkle {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; }
    50% { transform: scale(1.15) rotate(8deg); opacity: 1; }
  }

  .ai-suggestion-box {
    background: rgba(22, 21, 34, 0.42);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-tile);
    padding: var(--space-sm);
    margin-top: var(--space-sm);
    display: flex;
    gap: var(--space-xs);
    align-items: flex-start;
    min-width: 0;
    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.2s ease;
  }
  .ai-suggestion-box > div { min-width: 0; overflow-wrap: break-word; word-break: break-word; font-size: clamp(11.5px, 2.8vw, 12px); line-height: 1.55; }

  .suggestion-bullet { width: 6px; height: 6px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

  .month-radial-card {
    border-radius: var(--radius-card);
    padding: var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    flex-wrap: nowrap;
  }
  .month-radial-text { min-width: 0; }
  .month-radial-text h3 { font-size: clamp(13px, 3.2vw, 14px); font-weight: 700; margin: 0 0 4px 0; overflow-wrap: break-word; }
  .month-radial-text p { font-size: clamp(10px, 2.6vw, 11px); color: var(--text-secondary); margin: 0; overflow-wrap: break-word; }

  .radial-progress-wrap { position: relative; width: clamp(52px, 15vw, 68px); height: clamp(52px, 15vw, 68px); flex-shrink: 0; }
  .radial-progress-wrap svg { width: 100%; height: 100%; display: block; }
  .radial-progress-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: clamp(10.5px, 2.8vw, 12px); font-weight: 800; }

  /* ---------- Empty State (compact, intentional) ---------- */
  .empty-events-banner {
    text-align: center;
    padding: clamp(20px, 5vw, 28px) var(--space-md);
    border-radius: var(--radius-tile);
    border: 1px dashed var(--glass-border);
  }
  .empty-icon-badge {
    width: 38px; height: 38px; border-radius: 50%;
    margin: 0 auto var(--space-xs) auto;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.16), rgba(96, 165, 250, 0.08));
    color: var(--text-secondary);
    box-shadow: inset 0 1px 1px rgba(255,255,255,0.08);
  }
  .empty-banner-title { font-size: clamp(12.5px, 3vw, 14px); font-weight: 700; color: var(--text-primary); margin: 0 0 2px 0; letter-spacing: -0.01em; }
  .empty-banner-sub { font-size: clamp(10px, 2.6vw, 11px); color: var(--text-secondary); margin: 0 0 var(--space-xs) 0; }

  .btn-empty-add {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    font-size: 12px;
    font-weight: 600;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    transition: border-color 0.2s ease, background 0.2s ease;
  }
  .btn-empty-add:hover { border-color: rgba(139, 92, 246, 0.3); background: rgba(139, 92, 246, 0.08); }

  /* ---------- Floating Add Button (mobile) ---------- */
  .mobile-floating-add-btn {
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom));
    right: calc(18px + env(safe-area-inset-right));
    width: 58px; height: 58px; border-radius: 50%;
    background: var(--btn-primary-bg);
    display: flex; align-items: center; justify-content: center;
    color: #ffffff;
    box-shadow: 0 10px 24px var(--btn-primary-glow), inset 0 1px 0 rgba(255,255,255,0.18);
    z-index: 99; cursor: pointer; border: none;
    overflow: hidden;
  }

  .mobile-drawer-sheet {
    position: fixed; inset: 0;
    background: rgba(9, 8, 16, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    z-index: 100;
    display: flex; flex-direction: column; justify-content: flex-end;
  }

  .mobile-drawer-body {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%);
    border-top: 1px solid var(--glass-border);
    border-radius: 28px 28px 0 0;
    padding: clamp(20px, 6vw, 30px) var(--space-lg);
    padding-bottom: calc(clamp(20px, 6vw, 30px) + env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: var(--space-md);
    width: 100%;
    box-sizing: border-box;
  }

  /* ---------- Below 768px: single column dashboard, drawer-based composer ---------- */
  @media (max-width: 767px) {
    .calendar-dashboard { padding-bottom: calc(96px + env(safe-area-inset-bottom)); }
    .composer-card-glass { display: none; }
    .composer-form { flex-direction: column; align-items: stretch; }
    .composer-input { width: 100%; max-width: none !important; }
    .btn-composer-add { width: 100%; justify-content: center; }
  }

  @media (min-width: 768px) {
    .mobile-floating-add-btn, .mobile-drawer-sheet { display: none; }
  }

  /* Extra-narrow phones: trim gaps further without changing structure */
  @media (max-width: 340px) {
    .stats-carousel-grid { gap: 6px; }
    .week-days-ribbon { gap: 3px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .calendar-noise-overlay,
    .day-ribbon-card.is-today::after,
    .ai-sparkle-icon { animation: none !important; }
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

  const prefersReducedMotion = useReducedMotion()

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

  function handleDayKeyDown(e, key, isSelected) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedDay(isSelected ? null : key)
    }
  }

  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : []

  const todayEventsCount = eventsByDate[today]?.length || 0
  const upcomingCount = events.filter(ev => new Date(ev.event_date) >= new Date()).length
  const completedEventsCount = events.filter(ev => new Date(ev.event_date) < new Date()).length
  const totalEventsThisMonth = events.length
  const monthProgressRate = totalEventsThisMonth > 0
    ? Math.round((completedEventsCount / totalEventsThisMonth) * 100)
    : 0

  const motionOK = !prefersReducedMotion

  function renderEventList(list, emptyTitle, emptySub, tag) {
    if (list.length === 0) {
      return (
        <div className="empty-events-banner">
          <div className="empty-icon-badge"><Clock3 size={18} /></div>
          <span className="empty-banner-title">{emptyTitle}</span>
          {emptySub && <p className="empty-banner-sub">{emptySub}</p>}
          <button
            type="button"
            className="btn-empty-add"
            onClick={() => (isMobile ? setIsMobileDrawerOpen(true) : document.querySelector('.composer-input.title')?.focus())}
          >
            <Plus size={14} /> Add event
          </button>
        </div>
      )
    }
    return list.map((ev, index) => (
      <div className="timeline-event-wrapper" key={ev.id}>
        <div className={`timeline-node-dot ${index === 0 ? 'active' : ''}`} />
        <div className="timeline-time-col">
          {ev.event_time ? ev.event_time.slice(0, 5) : "All Day"}
        </div>
        <div className="event-card-tactile">
          <div className="event-card-text">
            <h4 className="event-title-main">{ev.title}</h4>
            <div className="event-meta-info">
              <span className="meta-tag">{tag}</span>
              <span>·</span>
              <span>Active timeline</span>
            </div>
          </div>
          <button onClick={() => deleteEvent(ev.id)} className="btn-delete-event" aria-label={`Delete ${ev.title}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ))
  }

  return (
    <div className="calendar-dashboard">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="aurora-blur-sphere sphere-tertiary" />
      <div className="calendar-noise-overlay" aria-hidden="true" />

      {/* --- KPI Summary Grid --- */}
      <motion.div
        className="stats-carousel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: motionOK ? 0.05 : 0 } }
        }}
      >
        <SummaryCard
          label="Today's Events"
          value={todayEventsCount}
          icon={<CalendarClock size={15} />}
          desc="Due within 24 hours"
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
          accent="#f59e0b"
          motionOK={motionOK}
        />
        <SummaryCard
          label="Upcoming"
          value={upcomingCount}
          icon={<Clock3 size={15} />}
          desc="Scheduled events"
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
          accent="#60a5fa"
          motionOK={motionOK}
        />
        <SummaryCard
          label="Focus Score"
          value="9.2"
          icon={<Brain size={15} />}
          desc="Target: 9.5 scale"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
          accent="#8b5cf6"
          motionOK={motionOK}
        />
        <SummaryCard
          label="Accomplished"
          value={completedEventsCount}
          icon={<CircleCheck size={15} />}
          desc="Finished logs"
          sparklinePath="M0,4 C10,12 20,2 30,8 C40,14 50,2 60,15"
          accent="#10b981"
          motionOK={motionOK}
        />
      </motion.div>

      {/* --- Double Pane Dashboard Panel Layout --- */}
      <div className="calendar-dashboard-layout">

        <div className="left-pane">

          {/* Calendar weekly ribbon navigation — the visual centerpiece */}
          <div className="calendar-nav-card">
            <div className="calendar-nav-header">
              <AnimatePresence mode="wait">
                <motion.span
                  key={weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  className="active-month-text"
                  initial={motionOK ? { opacity: 0, y: -6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={motionOK ? { opacity: 0, y: 6 } : {}}
                  transition={{ duration: motionOK ? 0.25 : 0, ease }}
                >
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </motion.span>
              </AnimatePresence>
              <div className="nav-controls-box">
                <motion.button
                  onClick={() => shiftWeek(-1)}
                  className="btn-nav-arrow"
                  aria-label="Previous week"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <ChevronLeft size={16} />
                </motion.button>
                <motion.button
                  onClick={() => shiftWeek(1)}
                  className="btn-nav-arrow"
                  aria-label="Next week"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={weekDates[0].toISOString().split('T')[0]}
                className="week-days-ribbon"
                initial={motionOK ? { opacity: 0, x: shiftDirection > 0 ? 26 : -26 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={motionOK ? { opacity: 0, x: shiftDirection > 0 ? -26 : 26 } : {}}
                transition={{ duration: motionOK ? 0.3 : 0, ease }}
              >
                {weekDates.map(d => {
                  const key = d.toISOString().split('T')[0]
                  const isToday = key === today
                  const dayEvents = eventsByDate[key] || []
                  const isSelected = selectedDay === key
                  return (
                    <motion.div
                      key={key}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      onKeyDown={(e) => handleDayKeyDown(e, key, isSelected)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      aria-label={d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + (isToday ? ' (today)' : '')}
                      className={`day-ribbon-card ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                      animate={{ y: isSelected ? -3 : 0, scale: isSelected ? 1.03 : 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="day-label-text">
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="day-number-text">{d.getDate()}</span>
                      {isToday && <div className="today-glow-dot" />}
                      {dayEvents.length > 0 && !isToday && (
                        <div style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: isSelected ? '#ffffff' : 'var(--accent-purple-light)',
                        }} />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive selected day / today's timeline */}
          <div className="timeline-container">
            <h3 style={{ fontSize: 'clamp(14px, 3.2vw, 15px)', fontWeight: 700, margin: '0 0 var(--space-sm) 0' }}>
              {selectedDay ? (
                new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              ) : (
                "Today's Timeline"
              )}
            </h3>

            <div className="timeline-axis">
              {selectedDay
                ? renderEventList(selectedEvents, 'Nothing Scheduled', 'You have no events allocated for this day.', 'Course module')
                : renderEventList(eventsByDate[today] || [], 'No Events Scheduled Today', null, 'Today')}
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
                  aria-label="Event time"
                />
                <motion.button
                  type="submit"
                  className="btn-composer-add"
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                  onPointerDown={(e) => spawnRipple(e, setComposerRipples)}
                >
                  <span className="btn-composer-content">
                    <Plus size={16} />
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
            <h3 style={{ fontSize: 'clamp(14px, 3.2vw, 15px)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="ai-sparkle-icon"><Sparkles size={16} color="var(--accent-amber)" /></span>
              <span>Atlas AI Suggestions</span>
            </h3>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" style={{ background: 'var(--accent-amber)', boxShadow: '0 0 6px rgba(245, 158, 11, 0.45)' }} />
              <div>
                You have <strong>3 hours free</strong> in your afternoon slot. Schedule a focus session?
              </div>
            </motion.div>

            <motion.div className="ai-suggestion-box" whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <div className="suggestion-bullet" style={{ background: 'var(--accent-red)', boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)' }} />
              <div>
                Assignment due tomorrow. Ensure preparation notes are reviewed.
              </div>
            </motion.div>
          </div>

          {/* Radial progress card */}
          <div className="month-radial-card">
            <div className="month-radial-text">
              <h3>Month Completion</h3>
              <p>Based on overall metrics.</p>
            </div>

            <div className="radial-progress-wrap">
              <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.path
                  fill="none"
                  stroke="url(#gradientRing)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: monthProgressRate / 100 }}
                  transition={{ duration: motionOK ? 1.2 : 0, ease }}
                />
                <defs>
                  <linearGradient id="gradientRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="radial-progress-label">
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
            aria-label="Add event"
            animate={{ y: scrolled ? -3 : 0 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <Plus size={24} strokeWidth={2.5} style={{ position: 'relative', zIndex: 3 }} />
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
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="composer-input"
                        style={{ flex: 1, minWidth: 0 }}
                        aria-label="Event date"
                      />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="composer-input"
                        style={{ flex: 1, minWidth: 0 }}
                        aria-label="Event time"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="composer-input"
                        style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-composer-add" style={{ flex: 2, justifyContent: 'center' }}>
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

function SummaryCard({ label, value, icon, desc, sparklinePath, accent, motionOK }) {
  const gradId = 'cal-spark-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const accentColor = accent || '#8b5cf6'
  return (
    <motion.div
      className="kpi-card-glass"
      tabIndex={0}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
      }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper" style={{ background: accentColor + '22', color: accentColor }}>{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        <svg viewBox="0 0 60 20" fill="none">
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
            transition={{ duration: motionOK ? 1.1 : 0, ease, delay: motionOK ? 0.25 : 0 }}
          />
        </svg>
      </div>
    </motion.div>
  )
}

export default CalendarWidget;