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

    /* Deep, clean canvas */
    --canvas-bg: #08070c;
    --canvas-bg-2: #0c0b14;
    
    /* Airy, subtle glass */
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
    --btn-primary-glow: rgba(139, 92, 246, 0.4);
    
    /* Unified Soft Shadow System */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.1);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.15), 0 24px 48px rgba(0,0,0,0.2);
    --shadow-glow: 0 0 0 1px rgba(255,255,255,0.05), 0 12px 32px rgba(139, 92, 246, 0.15);

    --aurora-primary: rgba(139, 92, 246, 0.15);
    --aurora-secondary: rgba(236, 72, 153, 0.1);
    --aurora-tertiary: rgba(59, 130, 246, 0.08);

    --accent-purple: #8b5cf6;
    --accent-pink: #ec4899;
    --accent-gold: #f59e0b;
    --accent-green: #10b981;
    --accent-amber: #f59e0b;
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
    --btn-primary-glow: rgba(99, 102, 241, 0.25);
    
    --shadow-sm: 0 1px 2px rgba(31, 38, 135, 0.04), 0 1px 3px rgba(31, 38, 135, 0.03);
    --shadow-md: 0 4px 12px rgba(31, 38, 135, 0.05), 0 12px 32px rgba(31, 38, 135, 0.04);
    --shadow-lg: 0 8px 24px rgba(31, 38, 135, 0.06), 0 24px 48px rgba(31, 38, 135, 0.05);
    --shadow-glow: 0 0 0 1px rgba(255,255,255,0.8), 0 12px 32px rgba(99, 102, 241, 0.1);

    --aurora-primary: rgba(255, 220, 200, 0.4);
    --aurora-secondary: rgba(210, 220, 255, 0.4);
    --aurora-tertiary: rgba(230, 210, 255, 0.35);

    --accent-purple: #6366f1;
    --accent-pink: #ec4899;
    --accent-gold: #d97706;
    --accent-green: #059669;
    --accent-amber: #d97706;
  }

  .subjects-wrapper {
    font-family: var(--atlas-font);
    color: var(--text-primary);
    max-width: 1120px;
    margin: 0 auto;
    position: relative;
    padding: 32px 24px 48px;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Ambient Background */
  .aurora-blur-sphere {
    position: fixed; /* Fixed to not cause scroll lag */
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
    will-change: transform;
    transition: background 0.6s var(--ease-premium);
  }
  .sphere-primary { top: -5%; left: -10%; width: 500px; height: 500px; background: var(--aurora-primary); }
  .sphere-secondary { bottom: -5%; right: -10%; width: 450px; height: 450px; background: var(--aurora-secondary); }
  .sphere-tertiary { top: 40%; left: 40%; width: 350px; height: 350px; background: var(--aurora-tertiary); opacity: 0.6; }

  /* ---------- HERO HEADER ---------- */
  .subjects-hero-header {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    padding: 28px 32px;
    margin-bottom: 24px;
    box-shadow: var(--shadow-md);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    flex-wrap: wrap;
    gap: 16px;
    overflow: hidden;
  }

  .hero-info-area { position: relative; z-index: 1; }
  .hero-info-area h1 { 
    font-size: 28px; 
    font-weight: 700; 
    margin: 0 0 4px 0; 
    letter-spacing: -0.03em; 
    color: var(--text-primary);
    line-height: 1.1;
  }
  .hero-info-area p { 
    font-size: 14px; 
    color: var(--text-secondary); 
    margin: 0; 
    font-weight: 400; 
    letter-spacing: -0.01em;
  }
  .hero-meta-badges { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; position: relative; z-index: 1; }

  .semester-pill {
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 6px 12px;
    border-radius: 100px;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  .sgpa-badge-glowing {
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border-radius: 100px;
    white-space: nowrap;
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .sgpa-badge-glowing::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-gold);
    box-shadow: 0 0 8px var(--accent-gold);
  }

  /* ---------- STATS GRID ---------- */
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
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    transition: box-shadow 0.4s var(--ease-premium), 
                border-color 0.4s var(--ease-premium),
                transform 0.4s var(--ease-premium);
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
    margin-bottom: 12px; 
  }
  .kpi-label { 
    font-size: 12px; 
    font-weight: 500; 
    color: var(--text-secondary); 
    letter-spacing: -0.01em; 
  }
  .kpi-icon-wrapper { 
    color: var(--text-tertiary); 
    display: flex; 
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: var(--input-bg);
  }
  .kpi-main-metric { 
    font-size: 30px; 
    font-weight: 700; 
    color: var(--text-primary); 
    line-height: 1; 
    margin-bottom: 6px; 
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
    font-size: 11px; 
    color: var(--text-tertiary); 
    font-weight: 500; 
    max-width: 65%; 
    line-height: 1.4; 
  }

  /* ---------- SUBJECT FORM ---------- */
  .subject-form-panel {
    background: transparent;
    border: none;
    padding: 0;
    margin-bottom: 24px;
    z-index: 10;
    position: relative;
    box-sizing: border-box;
  }

  .subject-form { 
    display: flex; 
    gap: 8px; 
    align-items: center; 
    width: 100%; 
  }

  .subject-input {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    font-family: var(--atlas-font);
    box-sizing: border-box;
    transition: border-color 0.2s var(--ease-premium), 
                box-shadow 0.2s var(--ease-premium),
                background 0.2s var(--ease-premium);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .subject-input:hover { 
    background: var(--glass-bg-elevated); 
    border-color: var(--glass-border-strong);
  }
  .subject-input::placeholder { color: var(--text-tertiary); opacity: 1; }
  .subject-input:focus { 
    outline: none; 
    border-color: var(--input-focus-border); 
    box-shadow: 0 0 0 4px var(--input-focus-glow);
    background: var(--glass-bg-elevated);
  }

  .subject-input.name { flex: 2; min-width: 200px; }
  .subject-input.credits { width: 100px; min-width: 80px; }
  .subject-input.faculty { flex: 1.2; min-width: 150px; }

  .btn-subject-add {
    position: relative;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    font-family: var(--atlas-font);
    letter-spacing: -0.01em;
    cursor: pointer;
    box-shadow: 0 4px 12px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
    transition: transform 0.2s var(--ease-premium), 
                box-shadow 0.2s var(--ease-premium),
                filter 0.2s var(--ease-premium);
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    white-space: nowrap;
    overflow: hidden;
  }
  .btn-subject-add:hover { 
    transform: translateY(-1px); 
    box-shadow: 0 8px 20px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
    filter: brightness(1.08);
  }
  .btn-subject-add:active { 
    transform: translateY(0) scale(0.98); 
    box-shadow: 0 2px 8px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
  }

  /* ---------- DESKTOP DASHBOARD GRID ---------- */
  .subjects-dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    z-index: 10;
    position: relative;
  }

  .premium-subject-card {
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 24px;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(20px) saturate(1.5);
    -webkit-backdrop-filter: blur(20px) saturate(1.5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    position: relative;
    overflow: visible;
    transition: box-shadow 0.35s var(--ease-premium), 
                border-color 0.35s var(--ease-premium),
                transform 0.35s var(--ease-premium);
    will-change: transform;
    contain: layout paint;
  }
  .premium-subject-card:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--glass-border-strong);
    transform: translateY(-3px);
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
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-purple);
    flex-shrink: 0;
  }

  .academic-completetion-chip {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 4px 10px;
    border-radius: 100px;
    background: rgba(16, 185, 129, 0.1);
    color: var(--accent-green);
    border: 1px solid rgba(16, 185, 129, 0.15);
    white-space: nowrap;
  }

  .academic-pending-chip {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 4px 10px;
    border-radius: 100px;
    background: var(--input-bg);
    color: var(--text-secondary);
    border: 1px solid var(--glass-border);
    white-space: nowrap;
  }

  .card-text-body { margin: 20px 0; z-index: 2; position: relative; }

  .card-subject-name { 
    font-size: 16px; 
    font-weight: 600; 
    color: var(--text-primary); 
    margin: 0 0 6px 0; 
    line-height: 1.3; 
    letter-spacing: -0.02em;
  }

  .card-subject-meta { 
    font-size: 12px; 
    color: var(--text-tertiary); 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    font-weight: 500; 
    flex-wrap: wrap; 
  }

  .card-credits-indicator { 
    background: var(--input-bg); 
    padding: 2px 8px; 
    border-radius: 6px; 
    font-weight: 500;
    border: 1px solid var(--glass-border);
    font-size: 11px;
  }

  .card-grades-tray { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    gap: 12px; 
    z-index: 20; 
    position: relative; 
    margin-top: auto;
  }

  /* ---------- CUSTOM DROPDOWN ---------- */
  .custom-dropdown-container { position: relative; width: 120px; z-index: 30; }

  .dropdown-trigger-btn {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
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
    letter-spacing: -0.01em;
  }
  .dropdown-trigger-btn:hover { 
    background: var(--input-bg-hover); 
    border-color: var(--glass-border-strong);
  }
  .dropdown-trigger-btn:focus { 
    border-color: var(--input-focus-border); 
    box-shadow: 0 0 0 3px var(--input-focus-glow); 
  }
  .dropdown-chevron { 
    color: var(--text-tertiary); 
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
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid var(--glass-border-strong);
    border-radius: 12px;
    padding: 4px;
    margin: 0;
    list-style: none;
    box-shadow: var(--shadow-lg);
    box-sizing: border-box;
    z-index: 100;
  }

  .dropdown-option-item {
    padding: 8px 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s var(--ease-premium), color 0.15s var(--ease-premium);
    letter-spacing: -0.01em;
  }

  .dropdown-option-item:hover { 
    background: var(--input-bg-hover); 
    color: var(--text-primary); 
  }
  .dropdown-option-item.selected { 
    background: var(--btn-primary-bg); 
    color: #ffffff;
    box-shadow: 0 2px 6px var(--btn-primary-glow);
  }

  .dropdown-click-outside-overlay { 
    position: fixed; 
    top: 0; left: 0; right: 0; bottom: 0; 
    z-index: 90; 
    background: transparent; 
  }

  .btn-destroy-subject {
    background: var(--input-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 8px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s var(--ease-premium), 
                color 0.2s var(--ease-premium),
                border-color 0.2s var(--ease-premium),
                transform 0.15s var(--ease-premium);
    flex-shrink: 0;
  }
  .btn-destroy-subject:hover { 
    background: rgba(239, 68, 68, 0.1); 
    color: #ef4444; 
    border-color: rgba(239, 68, 68, 0.2);
  }
  .btn-destroy-subject:active { transform: scale(0.92); }

  /* ---------- EMPTY STATE ---------- */
  .dashboard-empty-state {
    text-align: center;
    padding: 64px 20px;
    border-radius: 24px;
    border: 1px dashed var(--glass-border-strong);
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 10;
    position: relative;
    box-sizing: border-box;
  }

  .empty-banner-title { 
    font-size: 18px; 
    font-weight: 600; 
    color: var(--text-primary); 
    margin: 16px 0 6px 0; 
    letter-spacing: -0.02em;
  }
  .empty-banner-subtitle { 
    font-size: 14px; 
    color: var(--text-secondary); 
    max-width: 340px; 
    margin: 0 auto; 
    line-height: 1.5; 
  }

  /* ============================================================
     PERFORMANCE-FIRST ACCORDION
     Uses CSS grid-template-rows (0fr → 1fr) — no JS height
     measurement, no layout thrashing, GPU-friendly.
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
    .subjects-wrapper { padding: 16px 12px 32px; }
    .subjects-hero-header { 
      padding: 20px; 
      margin-bottom: 16px; 
      border-radius: 20px; 
      flex-direction: row; 
      align-items: center; 
      gap: 12px; 
    }
    .subjects-hero-header h1 { font-size: 20px !important; letter-spacing: -0.02em; }
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
      flex: 0 0 75%; 
      scroll-snap-align: start; 
      min-height: 110px; 
      padding: 16px; 
      border-radius: 16px; 
    }
    .kpi-main-metric { font-size: 22px !important; margin-bottom: 2px; }
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
      box-shadow: var(--shadow-sm);
      backdrop-filter: blur(20px) saturate(1.5);
      -webkit-backdrop-filter: blur(20px) saturate(1.5);
      overflow: hidden;
      box-sizing: border-box;
      transition: border-color 0.25s var(--ease-premium), 
                  box-shadow 0.25s var(--ease-premium);
      contain: layout;
    }

    .mobile-subject-accordion-item:hover {
      box-shadow: var(--shadow-md);
    }
    .mobile-subject-accordion-item.is-active { 
      border-color: var(--glass-border-strong);
      box-shadow: var(--shadow-md);
    }

    .mobile-accordion-closed-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      min-height: 68px;
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
      background: var(--input-bg); 
      border: 1px solid var(--glass-border);
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: var(--accent-purple); 
      flex-shrink: 0;
    }

    .mobile-subject-info-block { display: flex; flex-direction: column; min-width: 0; gap: 2px; }
    .mobile-subject-name { 
      font-size: 14px; 
      font-weight: 600; 
      color: var(--text-primary); 
      margin: 0; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
      letter-spacing: -0.01em;
    }
    .mobile-subject-meta-inline { 
      font-size: 12px; 
      color: var(--text-tertiary); 
      font-weight: 500; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }

    .mobile-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .mobile-chevron-chevron { 
      color: var(--text-tertiary); 
      transition: transform 0.3s var(--ease-premium); 
      will-change: transform;
    }
    .mobile-chevron-chevron.is-open { transform: rotate(180deg); }

    .mobile-accordion-drawer-body { 
      padding: 0 16px 16px 16px; 
    }
    .mobile-drawer-controls { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 12px; 
      padding-top: 12px; 
      border-top: 1px solid var(--glass-border);
    }

    .subject-form-panel { 
      padding: 0; 
      margin-bottom: 16px; 
      border-radius: 0; 
    }
    .subject-form { flex-direction: column; align-items: stretch; gap: 8px; }
    .subject-input { width: 100% !important; }
    .btn-subject-add { width: 100% !important; justify-content: center; }

    .mobile-add-subject-form-trigger {
      position: relative;
      background: var(--btn-primary-bg);
      border-radius: 14px;
      padding: 14px;
      text-align: center;
      color: #ffffff;
      font-weight: 600;
      font-size: 14px;
      font-family: var(--atlas-font);
      letter-spacing: -0.01em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 16px;
      box-shadow: 0 4px 12px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
      transition: transform 0.2s var(--ease-premium), box-shadow 0.2s var(--ease-premium);
    }
    .mobile-add-subject-form-trigger:active { 
      transform: scale(0.97); 
      box-shadow: 0 2px 6px var(--btn-primary-glow), 0 1px 0 rgba(255,255,255,0.2) inset;
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
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
      >
        <div className="hero-info-area">
          <h1>Academic Workspace</h1>
          <p>Track academic status, GPA metrics, and course credit distribution.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">
            <CalendarDays size={12} strokeWidth={2} />
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
          visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
        }}
      >
        <SummaryCard
          label="Subjects"
          value={totalSubjectsCount}
          icon={<BookOpen size={14} />}
          desc={`${gradedSubjects.length} subjects graded`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
        />

        <SummaryCard
          label="Total Credits"
          value={totalCredits}
          icon={<Layers size={14} />}
          desc={`${gradedCredits} graded credits`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
        />

        <motion.div
          className="kpi-card-glass"
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Cumulative SGPA</span>
            <span className="kpi-icon-wrapper" style={{ color: 'var(--accent-gold)' }}>
              <Award size={14} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: 'var(--accent-gold)' }}>
            {sgpa ?? '—'}
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc">Based on evaluated modules.</span>
            <div className="golden-trophy-badge" style={{ position: 'absolute', width: '24px', height: '24px', top: 'unset', right: '14px', bottom: '14px', borderRadius: '50%', background: 'var(--input-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
              <GraduationCap size={12} color="var(--accent-gold)" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        <SummaryCard
          label="Graded Ratio"
          value={`${gradedSubjects.length}/${totalSubjectsCount}`}
          icon={<TrendingUp size={14} />}
          desc={`${completedPercentage}% of workload graded`}
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {!isMobile ? (
          <motion.div
            className="subject-form-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                <form onSubmit={addSubject} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Subject name..."
                    className="subject-input"
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAddFormExpanded(false)}
                      className="subject-input"
                      style={{ flex: 1, border: '1px solid var(--glass-border)', background: 'var(--input-bg)', justifyContent: 'center', cursor: 'pointer' }}
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
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', fontWeight: 500 }}>Loading subjects...</p>
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
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
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

const PremiumSubjectCard = memo(function PremiumSubjectCard({ subject: s, onUpdateGrade, onDelete }) {
  const isGraded = s.grade_point !== null && s.grade_point !== undefined

  return (
    <motion.div
      className="premium-subject-card"
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 16 } }
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

const MobileAccordionItem = memo(function MobileAccordionItem({ subject: s, isExpanded, onToggle, onUpdateGrade, onDelete }) {
  const isGraded = s.grade_point !== null && s.grade_point !== undefined

  return (
    <div className={`mobile-subject-accordion-item ${isExpanded ? 'is-active' : ''}`}>
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
        <ChevronDown size={14} className={`dropdown-chevron ${isOpen ? 'open' : ''}`} />
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
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } } }}
      whileHover={{ y: -2, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="kpi-header-row">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon-wrapper">{icon}</span>
      </div>
      <div className="kpi-main-metric">{value}</div>
      <div className="kpi-desc-row">
        <span className="kpi-desc">{desc}</span>
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ opacity: 0.7 }} aria-hidden="true">
          <path d={sparklinePath} stroke="var(--accent-purple)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  )
})

export default Subjects;