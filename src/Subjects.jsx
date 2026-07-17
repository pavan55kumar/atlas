import { useEffect, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, BookOpen, Award, Layers, Trash2, CalendarDays, Plus,
  ChevronDown, Flame, CheckCircle, TrendingUp, Sparkles, School, Library
} from 'lucide-react'
import { supabase } from './lib/supabase'

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  :root {
    --atlas-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    --canvas-bg: #090810;
    --canvas-bg-2: #0d0b18;
    --glass-bg: rgba(18, 16, 30, 0.62);
    --glass-bg-elevated: rgba(24, 21, 40, 0.78);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-border-strong: rgba(255, 255, 255, 0.1);
    --glass-border-glow: linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(236, 72, 153, 0.35) 100%);
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --text-tertiary: #64748b;
    --input-bg: rgba(26, 23, 44, 0.55);
    --input-bg-hover: rgba(34, 30, 56, 0.7);
    --input-border: rgba(255, 255, 255, 0.07);
    --input-focus-border: #8b5cf6;
    --input-focus-glow: rgba(139, 92, 246, 0.28);

    --btn-primary-bg: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    --btn-primary-bg-shine: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 50%);
    --btn-primary-glow: rgba(139, 92, 246, 0.45);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 1px 2px rgba(0, 0, 0, 0.2),
      0 12px 28px -8px rgba(0, 0, 0, 0.4),
      0 24px 56px -16px rgba(0, 0, 0, 0.55);
    --card-shadow-hover: 
      0 1px 0 rgba(255, 255, 255, 0.07) inset,
      0 2px 4px rgba(0, 0, 0, 0.25),
      0 18px 36px -8px rgba(0, 0, 0, 0.5),
      0 32px 72px -16px rgba(0, 0, 0, 0.6);

    --aurora-primary: rgba(139, 92, 246, 0.13);
    --aurora-secondary: rgba(236, 72, 153, 0.09);
    --aurora-tertiary: rgba(59, 130, 246, 0.09);

    --accent-purple: #8b5cf6;
    --accent-pink: #ec4899;
    --accent-gold: #e1b12c;
    --accent-green: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f6f7fb;
    --canvas-bg-2: #eef0f7;
    --glass-bg: rgba(255, 255, 255, 0.74);
    --glass-bg-elevated: rgba(255, 255, 255, 0.9);
    --glass-border: rgba(15, 23, 42, 0.06);
    --glass-border-strong: rgba(15, 23, 42, 0.1);
    --glass-border-glow: linear-gradient(135deg, rgba(92, 71, 245, 0.18) 0%, rgba(224, 83, 93, 0.18) 100%);
    --text-primary: #1a1740;
    --text-secondary: #5a6275;
    --text-tertiary: #94a3b8;
    --input-bg: rgba(247, 248, 252, 0.8);
    --input-bg-hover: rgba(241, 244, 251, 0.9);
    --input-border: rgba(15, 23, 42, 0.08);
    --input-focus-border: #6366f1;
    --input-focus-glow: rgba(99, 102, 241, 0.18);

    --btn-primary-bg: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    --btn-primary-bg-shine: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
    --btn-primary-glow: rgba(99, 102, 241, 0.28);
    --card-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.9) inset,
      0 1px 2px rgba(31, 38, 135, 0.04),
      0 8px 24px -6px rgba(31, 38, 135, 0.07),
      0 16px 40px -10px rgba(31, 38, 135, 0.06);
    --card-shadow-hover: 
      0 1px 0 rgba(255, 255, 255, 1) inset,
      0 2px 4px rgba(31, 38, 135, 0.05),
      0 12px 30px -6px rgba(99, 102, 241, 0.12),
      0 24px 56px -10px rgba(31, 38, 135, 0.1);

    --aurora-primary: rgba(255, 220, 200, 0.5);
    --aurora-secondary: rgba(210, 220, 255, 0.45);
    --aurora-tertiary: rgba(230, 210, 255, 0.4);

    --accent-purple: #6366f1;
    --accent-pink: #ec4899;
    --accent-gold: #d4a017;
    --accent-green: #10b981;
    --accent-amber: #f59e0b;
    --accent-red: #ef4444;
  }

  .subjects-wrapper {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1120px;
    margin: 0 auto;
    position: relative;
    padding: 24px 0 40px;
    box-sizing: border-box;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
    z-index: 0;
    will-change: transform;
    transition: background 0.6s var(--ease-premium);
  }

  .sphere-primary { top: 2%; left: -12%; width: 480px; height: 480px; background: var(--aurora-primary); }
  .sphere-secondary { bottom: 8%; right: -12%; width: 420px; height: 420px; background: var(--aurora-secondary); }
  .sphere-tertiary { top: 38%; left: 38%; width: 360px; height: 360px; background: var(--aurora-tertiary); }

  /* ---------- HERO HEADER ---------- */
  .subjects-hero-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    padding: 32px 40px;
    margin-bottom: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    flex-wrap: wrap;
    gap: 16px;
    overflow: hidden;
  }
  .subjects-hero-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  .hero-info-area { position: relative; z-index: 1; }
  .hero-info-area h1 { 
    font-size: 32px; 
    font-weight: 800; 
    margin: 0 0 6px 0; 
    letter-spacing: -0.025em; 
    color: var(--text-primary);
    line-height: 1.1;
  }
  .hero-info-area p { 
    font-size: 14px; 
    color: var(--text-secondary); 
    margin: 0; 
    font-weight: 500; 
    letter-spacing: -0.005em;
  }
  .hero-meta-badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; position: relative; z-index: 1; }

  .semester-pill {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(139, 92, 246, 0.06) 100%);
    border: 1px solid rgba(139, 92, 246, 0.22);
    color: #a78bfa;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 7px 14px;
    border-radius: 100px;
    white-space: nowrap;
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 4px 12px rgba(139, 92, 246, 0.14);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  body.light-theme .semester-pill, .light-theme .semester-pill {
    color: #6366f1;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.04) 100%);
    border-color: rgba(99, 102, 241, 0.18);
  }

  .sgpa-badge-glowing {
    background: linear-gradient(135deg, #ffeaa7 0%, #e1b12c 100%);
    color: #16130a;
    font-size: 12px;
    font-weight: 800;
    padding: 7px 16px;
    border-radius: 100px;
    box-shadow: 
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 6px 18px rgba(225, 177, 44, 0.4),
      0 0 0 1px rgba(225, 177, 44, 0.15);
    white-space: nowrap;
    letter-spacing: -0.01em;
  }

  /* ---------- STATS GRID ---------- */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
    z-index: 10;
    position: relative;
  }

  .kpi-card-glass {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 20px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 122px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transition: box-shadow 0.4s var(--ease-premium), 
                border-color 0.4s var(--ease-premium),
                transform 0.4s var(--ease-premium);
    will-change: transform;
    contain: layout paint;
  }
  .kpi-card-glass::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
  body.light-theme .kpi-card-glass::after, .light-theme .kpi-card-glass::after {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  }

  .kpi-header-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 14px; 
  }
  .kpi-label { 
    font-size: 10.5px; 
    font-weight: 700; 
    color: var(--text-secondary); 
    text-transform: uppercase; 
    letter-spacing: 0.08em; 
  }
  .kpi-icon-wrapper { 
    color: var(--text-secondary); 
    opacity: 0.8; 
    display: flex; 
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: var(--input-bg);
  }
  .kpi-main-metric { 
    font-size: 28px; 
    font-weight: 800; 
    color: var(--text-primary); 
    line-height: 1; 
    margin-bottom: 6px; 
    letter-spacing: -0.025em; 
    font-variant-numeric: tabular-nums;
  }
  .kpi-desc-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-end; 
    gap: 8px; 
  }
  .kpi-desc { 
    font-size: 10.5px; 
    color: var(--text-tertiary); 
    font-weight: 500; 
    max-width: 65%; 
    line-height: 1.4; 
  }

  /* ---------- SUBJECT FORM ---------- */
  .subject-form-panel {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    z-index: 10;
    position: relative;
    box-sizing: border-box;
  }

  .subject-form { display: flex; gap: 12px; align-items: center; width: 100%; }

  .subject-input {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 13px;
    padding: 13px 16px;
    color: var(--text-primary);
    font-size: 13.5px;
    font-weight: 500;
    font-family: var(--atlas-font);
    box-sizing: border-box;
    transition: border-color 0.2s var(--ease-premium), 
                box-shadow 0.2s var(--ease-premium),
                background 0.2s var(--ease-premium);
  }
  .subject-input:hover { background: var(--input-bg-hover); }
  .subject-input::placeholder { color: var(--text-secondary); opacity: 0.6; }
  .subject-input:focus { 
    outline: none; 
    border-color: var(--input-focus-border); 
    box-shadow: 0 0 0 3px var(--input-focus-glow);
    background: var(--input-bg);
  }

  .subject-input.name { flex: 2; min-width: 200px; }
  .subject-input.credits { width: 100px; min-width: 80px; }
  .subject-input.faculty { flex: 1.2; min-width: 150px; }

  .btn-subject-add {
    position: relative;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 13px;
    padding: 13px 22px;
    font-size: 13.5px;
    font-weight: 700;
    font-family: var(--atlas-font);
    letter-spacing: -0.005em;
    cursor: pointer;
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.25) inset,
      0 6px 18px var(--btn-primary-glow),
      0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s var(--ease-premium), 
                box-shadow 0.2s var(--ease-premium);
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
  }
  .btn-subject-add::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--btn-primary-bg-shine);
    opacity: 0;
    transition: opacity 0.3s var(--ease-premium);
    pointer-events: none;
  }
  .btn-subject-add:hover { 
    transform: translateY(-1px); 
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.3) inset,
      0 10px 26px var(--btn-primary-glow),
      0 4px 8px rgba(0, 0, 0, 0.12);
  }
  .btn-subject-add:hover::before { opacity: 1; }
  .btn-subject-add:active { transform: translateY(0) scale(0.98); }

  /* ---------- DESKTOP DASHBOARD GRID ---------- */
  .subjects-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    z-index: 10;
    position: relative;
  }

  .premium-subject-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 22px;
    padding: 22px;
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 216px;
    position: relative;
    overflow: visible;
    transition: box-shadow 0.35s var(--ease-premium), 
                border-color 0.35s var(--ease-premium),
                transform 0.35s var(--ease-premium);
    will-change: transform;
    contain: layout paint;
  }
  .premium-subject-card::before {
    content: '';
    position: absolute;
    top: 0; left: 16px; right: 16px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
  body.light-theme .premium-subject-card::before, .light-theme .premium-subject-card::before {
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  }
  .premium-subject-card:hover {
    box-shadow: var(--card-shadow-hover);
    border-color: rgba(139, 92, 246, 0.28);
  }

  .card-top-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: flex-start; 
    z-index: 2; 
    position: relative; 
  }

  .academic-brand-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(139, 92, 246, 0.04) 100%);
    border: 1px solid rgba(139, 92, 246, 0.18);
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-purple);
    flex-shrink: 0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  }
  body.light-theme .academic-brand-icon, .light-theme .academic-brand-icon {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.03) 100%);
    border-color: rgba(99, 102, 241, 0.16);
  }

  .academic-completetion-chip {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.22);
    white-space: nowrap;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  body.light-theme .academic-completetion-chip, .light-theme .academic-completetion-chip {
    background: rgba(16, 185, 129, 0.08);
    color: #059669;
  }

  .academic-pending-chip {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(245, 158, 11, 0.12);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.22);
    white-space: nowrap;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }
  body.light-theme .academic-pending-chip, .light-theme .academic-pending-chip {
    background: rgba(245, 158, 11, 0.08);
    color: #d97706;
  }

  .card-text-body { margin: 18px 0; z-index: 2; position: relative; }

  .card-subject-name { 
    font-size: 16.5px; 
    font-weight: 700; 
    color: var(--text-primary); 
    margin: 0 0 6px 0; 
    line-height: 1.3; 
    letter-spacing: -0.015em;
  }

  .card-subject-meta { 
    font-size: 11.5px; 
    color: var(--text-secondary); 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-weight: 500; 
    flex-wrap: wrap; 
  }

  .card-credits-indicator { 
    background: var(--input-bg); 
    padding: 2px 9px; 
    border-radius: 7px; 
    font-weight: 600;
    border: 1px solid var(--glass-border);
  }

  .card-divider-line { 
    height: 1px; 
    background: linear-gradient(90deg, transparent, var(--glass-border) 20%, var(--glass-border) 80%, transparent);
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

  /* ---------- CUSTOM DROPDOWN ---------- */
  .custom-dropdown-container { position: relative; width: 130px; z-index: 30; }

  .dropdown-trigger-btn {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 11px;
    padding: 9px 12px;
    color: var(--text-primary);
    font-size: 12.5px;
    font-weight: 700;
    font-family: var(--atlas-font);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: border-color 0.2s var(--ease-premium), 
                box-shadow 0.2s var(--ease-premium),
                background 0.2s var(--ease-premium);
    box-sizing: border-box;
    outline: none;
    letter-spacing: -0.005em;
  }
  .dropdown-trigger-btn:hover { background: var(--input-bg-hover); }
  .dropdown-trigger-btn:focus { 
    border-color: var(--input-focus-border); 
    box-shadow: 0 0 0 3px var(--input-focus-glow); 
  }
  .dropdown-chevron { 
    color: var(--text-secondary); 
    transition: transform 0.25s var(--ease-premium);
    will-change: transform;
  }
  .dropdown-chevron.open { transform: rotate(180deg); }

  .dropdown-options-list {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 0;
    width: 100%;
    background: var(--glass-bg-elevated);
    backdrop-filter: blur(28px) saturate(1.5);
    -webkit-backdrop-filter: blur(28px) saturate(1.5);
    border: 1px solid var(--glass-border-strong);
    border-radius: 13px;
    padding: 6px;
    margin: 0;
    list-style: none;
    box-shadow: 
      0 1px 0 rgba(255, 255, 255, 0.06) inset,
      0 18px 40px rgba(0, 0, 0, 0.4),
      0 8px 16px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    z-index: 100;
  }

  .dropdown-option-item {
    padding: 8px 11px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s var(--ease-premium), color 0.15s var(--ease-premium);
    letter-spacing: -0.005em;
  }

  .dropdown-option-item:hover { background: var(--input-bg); color: var(--text-primary); }
  .dropdown-option-item.selected { 
    background: var(--btn-primary-bg); 
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(139, 92, 246, 0.3);
  }

  .dropdown-click-outside-overlay { 
    position: fixed; 
    top: 0; left: 0; right: 0; bottom: 0; 
    z-index: 90; 
    background: transparent; 
  }

  .btn-destroy-subject {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 8px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s var(--ease-premium), 
                color 0.2s var(--ease-premium),
                transform 0.15s var(--ease-premium);
    flex-shrink: 0;
  }
  .btn-destroy-subject:hover { 
    background: rgba(239, 68, 68, 0.12); 
    color: #f87171; 
  }
  .btn-destroy-subject:active { transform: scale(0.92); }

  /* ---------- EMPTY STATE ---------- */
  .dashboard-empty-state {
    text-align: center;
    padding: 64px 20px;
    border-radius: 26px;
    border: 1.5px dashed var(--glass-border-strong);
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
    box-sizing: border-box;
  }

  .empty-banner-title { 
    font-size: 19px; 
    font-weight: 700; 
    color: var(--text-primary); 
    margin: 16px 0 6px 0; 
    letter-spacing: -0.015em;
  }
  .empty-banner-subtitle { 
    font-size: 13.5px; 
    color: var(--text-secondary); 
    max-width: 340px; 
    margin: 0 auto; 
    line-height: 1.5; 
  }

  /* ============================================================
     PERFORMANCE-FIRST ACCORDION
     Uses CSS grid-template-rows (0fr → 1fr) — no JS height
     measurement, no layout thrashing, GPU-friendly.
     Only the expanding content animates; siblings untouched.
     ============================================================ */
  .mobile-accordion-drawer-grid {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.32s var(--ease-out-quart);
    will-change: grid-template-rows;
    contain: content;
  }
  .mobile-accordion-drawer-grid.is-open { 
    grid-template-rows: 1fr; 
  }

  .mobile-accordion-drawer-inner {
    overflow: hidden;
    min-height: 0;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.18s ease, transform 0.18s ease;
    will-change: opacity, transform;
  }
  .mobile-accordion-drawer-grid.is-open .mobile-accordion-drawer-inner {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.24s ease 0.08s, transform 0.24s var(--ease-out-quart) 0.08s;
  }

  /* ---------- RESPONSIVE: MOBILE ---------- */
  @media (max-width: 768px) {
    .subjects-wrapper { padding: 16px 0 32px; }
    .subjects-hero-header { 
      padding: 18px 20px; 
      margin-bottom: 16px; 
      border-radius: 20px; 
      flex-direction: row; 
      align-items: center; 
      gap: 12px; 
    }
    .subjects-hero-header h1 { font-size: 21px !important; letter-spacing: -0.02em; }
    .subjects-hero-header p { display: none; }

    .stats-carousel-grid {
      display: flex;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      gap: 10px;
      padding-bottom: 4px;
      margin-bottom: 16px;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }

    .stats-carousel-grid::-webkit-scrollbar { display: none; }

    .kpi-card-glass { 
      flex: 0 0 72%; 
      scroll-snap-align: start; 
      min-height: 96px; 
      padding: 14px; 
      border-radius: 16px; 
    }
    .kpi-main-metric { font-size: 21px !important; margin-bottom: 2px; }
    .kpi-desc { font-size: 10px !important; }
    .golden-trophy-badge { display: none !important; }

    .subjects-dashboard-grid { display: none; }

    .mobile-accordion-list-container { 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
      z-index: 10; 
      position: relative; 
    }

    .mobile-subject-accordion-item {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      box-shadow: var(--card-shadow);
      backdrop-filter: blur(20px) saturate(1.3);
      -webkit-backdrop-filter: blur(20px) saturate(1.3);
      overflow: hidden;
      box-sizing: border-box;
      transition: border-color 0.25s var(--ease-premium), 
                  box-shadow 0.25s var(--ease-premium);
      contain: layout;
    }

    .mobile-subject-accordion-item:hover {
      box-shadow: var(--card-shadow-hover);
    }
    .mobile-subject-accordion-item.is-active { 
      border-left: 3px solid var(--accent-purple); 
    }
    .mobile-subject-accordion-item.is-graded { 
      border-left: 3px solid var(--accent-green); 
    }

    .mobile-accordion-closed-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 16px;
      min-height: 72px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-sizing: border-box;
      transition: background 0.2s var(--ease-premium);
    }
    .mobile-accordion-closed-row:active { 
      background: var(--input-bg); 
    }

    .mobile-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }

    .mobile-accordion-icon {
      width: 36px; height: 36px; 
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(139, 92, 246, 0.04) 100%); 
      border: 1px solid rgba(139, 92, 246, 0.18);
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: var(--accent-purple); 
      flex-shrink: 0;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .mobile-subject-info-block { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
    .mobile-subject-name { 
      font-size: 14.5px; 
      font-weight: 700; 
      color: var(--text-primary); 
      margin: 0; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
      letter-spacing: -0.01em;
    }
    .mobile-subject-meta-inline { 
      font-size: 11px; 
      color: var(--text-secondary); 
      font-weight: 500; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }

    .mobile-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

    .mobile-chevron-chevron { 
      color: var(--text-tertiary); 
      transition: transform 0.3s var(--ease-premium); 
      will-change: transform;
    }
    .mobile-chevron-chevron.is-open { transform: rotate(180deg); }

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

    .subject-form-panel { 
      padding: 16px; 
      margin-bottom: 16px; 
      border-radius: 18px; 
    }
    .subject-form { flex-direction: column; align-items: stretch; gap: 12px; }
    .subject-input { width: 100% !important; }
    .btn-subject-add { width: 100% !important; justify-content: center; }

    .mobile-add-subject-form-trigger {
      position: relative;
      background: var(--btn-primary-bg);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 14px;
      font-family: var(--atlas-font);
      letter-spacing: -0.005em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
      box-shadow: 
        0 1px 0 rgba(255, 255, 255, 0.25) inset,
        0 6px 18px var(--btn-primary-glow),
        0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s var(--ease-premium), box-shadow 0.2s var(--ease-premium);
    }
    .mobile-add-subject-form-trigger::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--btn-primary-bg-shine);
      opacity: 0;
      transition: opacity 0.3s var(--ease-premium);
      pointer-events: none;
    }
    .mobile-add-subject-form-trigger:active { 
      transform: scale(0.97); 
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .subjects-dashboard-grid { grid-template-columns: repeat(2, 1fr); }
    .stats-carousel-grid { grid-template-columns: repeat(2, 1fr); }
    .subject-form { flex-wrap: wrap; }
  }
`

function fieldsEqual(a, b) {
  return a.id === b.id && a.name === b.name && a.credits === b.credits &&
    a.faculty === b.faculty && a.grade_point === b.grade_point
}

function Subjects({ userId }) {
  const [subjects, setSubjects] = useState([])
  const [name, setName] = useState('')
  const [credits, setCredits] = useState('')
  const [faculty, setFaculty] = useState('')
  const [loading, setLoading] = useState(true)

  const [isMobile, setIsMobile] = useState(false)
  const [expandedSubjectId, setExpandedSubjectId] = useState(null)
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(false)

  useEffect(() => {
    fetchSubjects()
    let ticking = false
    const handleResize = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setIsMobile(window.innerWidth <= 768)
        ticking = false
      })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchSubjects = useCallback(async () => {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setSubjects(data)
    setLoading(false)
  }, [])

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
      setIsAddFormExpanded(false)
      fetchSubjects()
    }
  }

  const updateGrade = useCallback(async (subject, value) => {
    const gp = value === '' ? null : parseFloat(value)
    await supabase.from('subjects').update({ grade_point: gp }).eq('id', subject.id)
    fetchSubjects()
  }, [fetchSubjects])

  const deleteSubject = useCallback(async (id) => {
    await supabase.from('subjects').delete().eq('id', id)
    fetchSubjects()
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
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="aurora-blur-sphere sphere-tertiary" />

      <motion.div
        className="subjects-hero-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
      >
        <div className="hero-info-area">
          <h1>Academic Workspace</h1>
          <p>Track academic status, GPA metrics, and course credit distribution.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">
            <CalendarDays size={11} strokeWidth={2.5} />
            Current Semester
          </span>
          {sgpa && <span className="sgpa-badge-glowing">{sgpa} SGPA</span>}
        </div>
      </motion.div>

      <motion.div
        className="stats-carousel-grid"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
        }}
      >
        <SummaryCard
          label="Subjects"
          value={totalSubjectsCount}
          icon={<BookOpen size={15} />}
          desc={`${gradedSubjects.length} subjects graded`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
        />

        <SummaryCard
          label="Total Credits"
          value={totalCredits}
          icon={<Layers size={15} />}
          desc={`${gradedCredits} graded credits`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
        />

        <motion.div
          className="kpi-card-glass"
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Cumulative SGPA</span>
            <span className="kpi-icon-wrapper" style={{ color: '#e1b12c', background: 'rgba(225, 177, 44, 0.12)' }}>
              <Award size={15} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: '#e1b12c' }}>
            {sgpa ?? '—'}
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc">Based on evaluated modules.</span>
            <div className="golden-trophy-badge" style={{ position: 'absolute', width: '28px', height: '28px', top: 'unset', right: '14px', bottom: '14px', borderRadius: '50%', background: 'radial-gradient(circle, #ffeaa7 0%, #e1b12c 100%)', boxShadow: '0 4px 12px rgba(225, 177, 44, 0.35), inset 0 1px 0 rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={14} color="#0c0b11" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        <SummaryCard
          label="Graded Ratio"
          value={`${gradedSubjects.length}/${totalSubjectsCount}`}
          icon={<TrendingUp size={15} />}
          desc={`${completedPercentage}% of workload graded`}
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {!isMobile ? (
          <motion.div
            className="subject-form-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.1 }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Subject</span>
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <div style={{ marginBottom: '16px', zIndex: 10, position: 'relative' }}>
            {!isAddFormExpanded ? (
              <motion.div
                className="mobile-add-subject-form-trigger"
                onClick={() => setIsAddFormExpanded(true)}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12 }}
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

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', fontWeight: 500 }}>Loading subjects...</p>
      ) : subjects.length === 0 ? (

        <div className="dashboard-empty-state">
          <GraduationCap size={48} color="var(--accent-purple)" opacity="0.8" style={{ margin: '0 auto' }} />
          <h4 className="empty-banner-title">No subjects added yet</h4>
          <p className="empty-banner-subtitle">
            Create subjects and allocate credit values above to activate your dashboard.
          </p>
        </div>

      ) : !isMobile ? (
        <motion.div
          className="subjects-dashboard-grid"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        >
          {subjects.map((s) => (
            <PremiumSubjectCard
              key={s.id}
              subject={s}
              onUpdateGrade={updateGrade}
              onDelete={deleteSubject}
            />
          ))}
        </motion.div>
      ) : (
        <div className="mobile-accordion-list-container">
          {subjects.map((s) => (
            <MobileAccordionItem
              key={s.id}
              subject={s}
              isExpanded={expandedSubjectId === s.id}
              onToggle={handleToggleExpand}
              onUpdateGrade={updateGrade}
              onDelete={deleteSubject}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* Memoized desktop card — only re-renders when this subject's own fields change */
const PremiumSubjectCard = memo(function PremiumSubjectCard({ subject: s, onUpdateGrade, onDelete }) {
  const isGraded = s.grade_point !== null && s.grade_point !== undefined

  return (
    <motion.div
      className="premium-subject-card"
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 90, damping: 16 } }
      }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="card-top-header">
        <div className="academic-brand-icon">
          <School size={18} />
        </div>
        <span className={isGraded ? 'academic-completetion-chip' : 'academic-pending-chip'}>
          {isGraded ? 'Graded' : 'Active'}
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

      <div className="card-grades-tray">
        <CustomGradeDropdown
          value={s.grade_point}
          onChange={(val) => onUpdateGrade(s, val)}
        />
        <button onClick={() => onDelete(s.id)} className="btn-destroy-subject" title="Delete Course">
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  )
}, function areEqual(prev, next) {
  return fieldsEqual(prev.subject, next.subject) &&
    prev.onUpdateGrade === next.onUpdateGrade &&
    prev.onDelete === next.onDelete
})

/* Memoized mobile accordion item — uses CSS grid-template-rows (GPU-friendly),
   avoiding Framer Motion's per-frame scrollHeight measurement (the source of lag).
   Only the expanding drawer animates; siblings are never re-rendered. */
const MobileAccordionItem = memo(function MobileAccordionItem({ subject: s, isExpanded, onToggle, onUpdateGrade, onDelete }) {
  const isGraded = s.grade_point !== null && s.grade_point !== undefined

  return (
    <div className={`mobile-subject-accordion-item ${isExpanded ? 'is-active' : ''} ${isGraded ? 'is-graded' : ''}`}>
      <div className="mobile-accordion-closed-row" onClick={() => onToggle(s.id)}>
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
          <span className={isGraded ? 'academic-completetion-chip' : 'academic-pending-chip'}>
            {isGraded ? `GP: ${s.grade_point}` : 'Active'}
          </span>
          <ChevronDown size={16} className={`mobile-chevron-chevron ${isExpanded ? 'is-open' : ''}`} />
        </div>
      </div>

      <div className={`mobile-accordion-drawer-grid ${isExpanded ? 'is-open' : ''}`}>
        <div className="mobile-accordion-drawer-inner">
          <div className="mobile-accordion-drawer-body">
            <div className="mobile-drawer-controls">
              <CustomGradeDropdown
                value={s.grade_point}
                onChange={(val) => onUpdateGrade(s, val)}
              />
              <button onClick={() => onDelete(s.id)} className="btn-destroy-subject" title="Delete Course">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, function areEqual(prev, next) {
  return fieldsEqual(prev.subject, next.subject) &&
    prev.isExpanded === next.isExpanded &&
    prev.onToggle === next.onToggle &&
    prev.onUpdateGrade === next.onUpdateGrade &&
    prev.onDelete === next.onDelete
})

/* Memoized dropdown — prevents re-render when parent card re-renders for unrelated reasons */
const CustomGradeDropdown = memo(function CustomGradeDropdown({ value, onChange }) {
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
        <ChevronDown size={13} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="dropdown-click-outside-overlay" onClick={() => setIsOpen(false)} />

            <motion.ul
              className="dropdown-options-list"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
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
}, function areEqual(prev, next) {
  return prev.value === next.value && prev.onChange === next.onChange;
})

const SummaryCard = memo(function SummaryCard({ label, value, icon, desc, sparklinePath }) {
  return (
    <motion.div
      className="kpi-card-glass"
      variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper">{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ opacity: 0.7 }} aria-hidden="true">
          <path d={sparklinePath} stroke="var(--accent-purple, #8b5cf6)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
})

export default Subjects;