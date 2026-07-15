import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Plus, Trash2, Sparkles,
  Flame, Target, Zap, ListTodo, Flag, TrendingUp
} from 'lucide-react'
import { supabase } from './lib/supabase'

const ease = [0.22, 1, 0.36, 1]

const PRIORITY_META = {
  low: { label: 'Low', color: '#10b981', Icon: Zap },
  medium: { label: 'Medium', color: '#f59e0b', Icon: Flag },
  high: { label: 'High', color: '#ef4444', Icon: Flame }
}

const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  :root {
    --tasks-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --canvas-bg: #08070d;
    --glass-base: rgba(20, 18, 32, 0.56);
    --glass-sheen-1: rgba(255, 255, 255, 0.045);
    --glass-sheen-2: rgba(255, 255, 255, 0.012);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-highlight: rgba(255, 255, 255, 0.10);
    --text-primary: #f5f5f7;
    --text-secondary: rgba(245, 245, 247, 0.62);
    --text-tertiary: rgba(245, 245, 247, 0.4);
    --input-bg: rgba(255, 255, 255, 0.035);
    --input-border: rgba(255, 255, 255, 0.09);
    --input-focus-border: #8b7cf6;
    --input-focus-glow: rgba(139, 124, 246, 0.16);
    --btn-primary-bg: linear-gradient(135deg, #9b87ff 0%, #6d5ef2 55%, #5a4de0 100%);
    --btn-primary-glow: rgba(124, 108, 246, 0.32);
    --card-shadow: 0 24px 48px -22px rgba(20, 10, 45, 0.55), 0 2px 0 rgba(255, 255, 255, 0.02) inset;
    --card-shadow-hover: 0 30px 56px -20px rgba(28, 14, 60, 0.6), 0 2px 0 rgba(255, 255, 255, 0.03) inset;
    --aurora-primary: rgba(139, 92, 246, 0.09);
    --aurora-secondary: rgba(96, 165, 250, 0.07);
    --sparkline-color: #8b7cf6;
    --checkbox-border: rgba(255, 255, 255, 0.16);
    --priority-low: #10b981;
    --priority-medium: #f59e0b;
    --priority-high: #ef4444;
    --accent-blue: #60a5fa;
    --accent-purple: #8b5cf6;
    --accent-gold: #e1b12c;
  }

  body.light-theme, body.light, .light-theme, .light, [data-theme="light"] {
    --canvas-bg: #f7f7fb;
    --glass-base: rgba(255, 255, 255, 0.68);
    --glass-sheen-1: rgba(255, 255, 255, 0.5);
    --glass-sheen-2: rgba(255, 255, 255, 0.18);
    --glass-border: rgba(15, 23, 42, 0.07);
    --glass-highlight: rgba(255, 255, 255, 0.85);
    --text-primary: #171529;
    --text-secondary: rgba(23, 21, 41, 0.64);
    --text-tertiary: rgba(23, 21, 41, 0.42);
    --input-bg: rgba(15, 23, 42, 0.03);
    --input-border: rgba(15, 23, 42, 0.09);
    --input-focus-border: #6d5ef2;
    --input-focus-glow: rgba(109, 94, 242, 0.13);
    --btn-primary-bg: linear-gradient(135deg, #8172f2 0%, #6152e8 100%);
    --btn-primary-glow: rgba(97, 82, 232, 0.22);
    --card-shadow: 0 16px 36px rgba(30, 20, 80, 0.06), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
    --card-shadow-hover: 0 22px 44px rgba(30, 20, 80, 0.09), 0 1px 0 rgba(255, 255, 255, 0.7) inset;
    --aurora-primary: #ece7ff;
    --aurora-secondary: #e4edff;
    --sparkline-color: #6152e8;
    --checkbox-border: rgba(15, 23, 42, 0.18);
    --priority-medium: #d97706;
  }

  .tasks-wrapper {
    font-family: var(--tasks-font);
    color: var(--text-primary);
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    padding: 24px 20px;
    box-sizing: border-box;
    overflow: visible !important;
  }

  div:has(> .tasks-wrapper),
  section:has(> .tasks-wrapper),
  article:has(> .tasks-wrapper),
  main:has(> .tasks-wrapper) {
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    border-color: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  * { -webkit-tap-highlight-color: transparent !important; }
  *:focus { outline: none !important; box-shadow: none !important; }

  .aurora-blur-sphere {
    position: absolute;
    border-radius: 50%;
    filter: blur(110px);
    pointer-events: none;
    z-index: 0;
    transition: background 0.5s ease;
  }
  .sphere-primary { top: 5%; left: -10%; width: 450px; height: 450px; background: var(--aurora-primary); }
  .sphere-secondary { bottom: 10%; right: -10%; width: 400px; height: 400px; background: var(--aurora-secondary); }

  .tasks-noise-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.025;
    mix-blend-mode: overlay;
    border-radius: inherit;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ---------- Shared glass surface ---------- */
  .subjects-hero-header,
  .kpi-card-glass,
  .task-form-card,
  .task-quest-card,
  .empty-quest-state {
    background-color: var(--glass-base);
    background-image: linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%);
    border: 1px solid var(--glass-border);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    position: relative;
  }

  .subjects-hero-header::before,
  .kpi-card-glass::before,
  .task-form-card::before,
  .task-quest-card::before,
  .empty-quest-state::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--glass-highlight), transparent);
    pointer-events: none;
  }

  /* 1. Standalone Workspace Hero Card */
  .subjects-hero-header {
    border-radius: 22px;
    padding: 24px 32px;
    margin-bottom: 28px !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
    box-sizing: border-box;
    overflow: hidden;
  }

  .workspace-console-tag {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a78bfa;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .workspace-console-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a78bfa;
    box-shadow: 0 0 5px rgba(167, 139, 250, 0.55);
  }

  .hero-info-area h1 { font-size: 28px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.02em; color: var(--text-primary); }
  .hero-info-area p { font-size: 13px; color: var(--text-secondary); margin: 0; font-weight: 450; line-height: 1.5; }
  .hero-meta-badges { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .hero-visual-stack {
    position: relative;
    width: 120px;
    height: 80px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .visual-card-element {
    position: absolute;
    width: 76px;
    height: 56px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(8px);
    transition: transform 0.3s ease;
  }

  .visual-card-element-1 {
    transform: translate(-14px, -8px) rotate(-10deg);
    background: rgba(255, 255, 255, 0.02);
    z-index: 1;
    opacity: 0.3;
  }
  .visual-card-element-2 {
    transform: translate(-5px, -3px) rotate(-5deg);
    background: rgba(255, 255, 255, 0.045);
    z-index: 2;
    opacity: 0.6;
  }
  .visual-card-element-3 {
    transform: translate(5px, 3px) rotate(0deg);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(96, 165, 250, 0.10) 100%);
    border: 1px solid rgba(139, 92, 246, 0.22);
    box-shadow: 0 10px 26px rgba(90, 60, 200, 0.18);
    z-index: 3;
  }

  .semester-pill {
    background: rgba(139, 92, 246, 0.10);
    border: 1px solid rgba(139, 92, 246, 0.16);
    color: #a78bfa;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 100px;
    white-space: nowrap;
  }

  body.light-theme .semester-pill, body.light .semester-pill, .light-theme .semester-pill, .light .semester-pill, [data-theme="light"] .semester-pill {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.16);
    color: #6152e8;
  }

  .sgpa-badge-glowing {
    background: linear-gradient(135deg, #ffe9a8 0%, var(--accent-gold) 100%);
    color: #0c0b11;
    font-size: 12px;
    font-weight: 800;
    padding: 6px 16px;
    border-radius: 100px;
    box-shadow: 0 6px 16px rgba(225, 177, 44, 0.22);
    white-space: nowrap;
  }

  /* 2. Statistics Carousel */
  .stats-carousel-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px !important;
    z-index: 10;
    position: relative;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  .kpi-card-glass {
    border-radius: 18px;
    padding: 18px;
    min-height: 112px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    box-sizing: border-box;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.3s ease;
  }

  .kpi-card-glass:hover {
    transform: translateY(-4px);
    border-color: rgba(139, 92, 246, 0.22);
    box-shadow: var(--card-shadow-hover);
  }

  .kpi-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .kpi-label { font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.07em; }
  .kpi-icon-wrapper {
    width: 26px; height: 26px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .kpi-main-metric { font-size: 26px; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 6px; letter-spacing: -0.01em; }
  .kpi-desc-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; }
  .kpi-desc { font-size: 11px; color: var(--text-tertiary); font-weight: 500; max-width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .carousel-pager-dots {
    display: none;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: -12px;
    margin-bottom: 28px !important;
  }
  .pager-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); transition: all 0.25s ease; }
  .pager-dot.active { width: 14px; border-radius: 100px; background: var(--accent-purple); }
  body.light-theme .pager-dot.active, body.light .pager-dot.active, .light-theme .pager-dot.active, .light .pager-dot.active, [data-theme="light"] .pager-dot.active { background: #6152e8; }

  /* 3. Add Task Section */
  .task-form-card {
    border-radius: 22px;
    padding: 20px;
    margin-bottom: 28px !important;
    z-index: 10;
    box-sizing: border-box;
    overflow: hidden;
  }

  .input-group { display: flex; gap: 10px; align-items: center; width: 100%; box-sizing: border-box; }

  .task-input {
    flex: 1;
    min-width: 0;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 13px;
    padding: 12px 16px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    box-sizing: border-box;
    transition: border-color 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    height: 48px;
  }
  .task-input::placeholder { color: var(--text-secondary); opacity: 0.65; font-weight: 450; }
  .task-input:focus {
    outline: none !important;
    border-color: var(--input-focus-border) !important;
    box-shadow: 0 0 0 3px var(--input-focus-glow), inset 0 1px 2px rgba(0, 0, 0, 0.08) !important;
  }

  .btn-add {
    position: relative;
    overflow: hidden;
    background: var(--btn-primary-bg);
    color: #ffffff;
    border: none;
    border-radius: 13px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px var(--btn-primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.18);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
    flex-shrink: 0;
    white-space: nowrap;
    height: 48px;
  }
  .btn-add::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 55%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
    z-index: 1;
    pointer-events: none;
  }
  .btn-add:hover { box-shadow: 0 10px 26px var(--btn-primary-glow), inset 0 1px 0 rgba(255, 255, 255, 0.22); }
  .btn-add-content { position: relative; z-index: 3; display: flex; align-items: center; gap: 8px; }
  .btn-ripple-layer { position: absolute; inset: 0; z-index: 2; overflow: hidden; border-radius: inherit; pointer-events: none; }
  .btn-ripple {
    position: absolute; border-radius: 50%;
    background: rgba(255, 255, 255, 0.32);
    transform: scale(0);
    animation: btn-ripple-expand 0.6s ease-out forwards;
  }
  @keyframes btn-ripple-expand { to { transform: scale(1); opacity: 0; } }

  .priority-options { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
  .priority-label { font-size: 11px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; }

  .priority-segment {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid var(--glass-border);
    border-radius: 14px;
    padding: 4px;
  }

  .priority-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    padding: 7px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1), color 0.25s ease;
    white-space: nowrap;
  }

  .priority-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  .priority-btn.active.low { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.35); color: #34d399; box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.14); }
  .priority-btn.active.medium { background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #fbbf5e; box-shadow: inset 0 0 10px rgba(245, 158, 11, 0.14); }
  .priority-btn.active.high { background: rgba(239, 68, 68, 0.12); border-color: rgba(239, 68, 68, 0.35); color: #f87171; box-shadow: inset 0 0 10px rgba(239, 68, 68, 0.14); }

  body.light-theme .priority-btn.active.medium, body.light .priority-btn.active.medium, .light-theme .priority-btn.active.medium, .light .priority-btn.active.medium, [data-theme="light"] .priority-btn.active.medium {
    color: #b45309;
  }

  /* 4. Filter Tabs */
  .filter-tabs-wrapper {
    position: relative;
    display: flex;
    gap: 4px;
    background: var(--input-bg);
    background-image: linear-gradient(165deg, var(--glass-sheen-1), transparent);
    border: 1px solid var(--glass-border);
    padding: 4px;
    border-radius: 14px;
    margin: 20px 0 28px 0 !important;
    z-index: 10;
    width: max-content;
    max-width: 100%;
    box-sizing: border-box;
  }

  .filter-tab {
    position: relative;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 9px;
    transition: color 0.2s ease;
    outline: none;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .filter-tab:hover { color: var(--text-primary); }
  .filter-tab.active { color: var(--text-primary); }
  .filter-tab-label { position: relative; z-index: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .active-tab-indicator {
    position: absolute;
    top: 2px; bottom: 2px; left: 2px; right: 2px;
    background: rgba(255, 255, 255, 0.09);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    z-index: -1;
  }
  body.light-theme .active-tab-indicator, body.light .active-tab-indicator, .light-theme .active-tab-indicator, .light .active-tab-indicator, [data-theme="light"] .active-tab-indicator {
    background: rgba(15, 23, 42, 0.07);
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }

  .tab-count-badge {
    position: relative; z-index: 1;
    font-size: 10px; font-weight: 700;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-secondary);
    padding: 1px 6px;
    border-radius: 6px;
    margin-left: 2px;
    flex-shrink: 0;
  }

  /* 5. Tasks List */
  .tasks-list-grid { display: grid; grid-template-columns: 1fr; gap: 10px; z-index: 10; position: relative; }

  .task-quest-card {
    border-radius: 16px;
    padding: 15px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s ease, box-shadow 0.3s ease;
    box-sizing: border-box;
    overflow: hidden;
  }
  .task-quest-card:hover { transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.1); box-shadow: var(--card-shadow-hover); }

  .task-quest-card.high-p { border-left: 2.5px solid var(--priority-high); background-image: linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, transparent 40%), linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%); }
  .task-quest-card.medium-p { border-left: 2.5px solid var(--priority-medium); background-image: linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, transparent 40%), linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%); }
  .task-quest-card.low-p { border-left: 2.5px solid var(--priority-low); background-image: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 40%), linear-gradient(165deg, var(--glass-sheen-1) 0%, var(--glass-sheen-2) 100%); }

  .checkbox-wrapper { display: flex; align-items: center; gap: 14px; cursor: pointer; flex: 1; min-width: 0; }

  .custom-checkbox-node {
    width: 21px; height: 21px;
    border-radius: 50%;
    border: 1.5px solid var(--checkbox-border);
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
    flex-shrink: 0;
  }
  .checkbox-wrapper:hover .custom-checkbox-node { border-color: var(--accent-purple); }
  .custom-checkbox-node.checked {
    background: linear-gradient(135deg, #a78bfa, var(--accent-purple));
    border-color: var(--accent-purple);
    box-shadow: 0 0 7px rgba(139, 92, 246, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  }
  body.light-theme .checkbox-wrapper:hover .custom-checkbox-node, body.light .checkbox-wrapper:hover .custom-checkbox-node, .light-theme .checkbox-wrapper:hover .custom-checkbox-node, .light .checkbox-wrapper:hover .custom-checkbox-node, [data-theme="light"] .checkbox-wrapper:hover .custom-checkbox-node { border-color: #6152e8; }
  body.light-theme .custom-checkbox-node.checked, body.light .custom-checkbox-node.checked, .light-theme .custom-checkbox-node.checked, .light .custom-checkbox-node.checked, [data-theme="light"] .custom-checkbox-node.checked { background: linear-gradient(135deg, #8172f2, #6152e8); border-color: #6152e8; box-shadow: 0 0 7px rgba(97, 82, 232, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4); }

  .custom-checkbox-node svg { color: #ffffff; opacity: 0; transform: scale(0.6); transition: opacity 0.15s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1); }
  .custom-checkbox-node.checked svg { opacity: 1; transform: scale(1); }

  .task-quest-title {
    font-size: 14px; font-weight: 500; color: var(--text-primary);
    transition: color 0.2s ease, opacity 0.2s ease;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
  }
  .task-quest-title.completed { text-decoration: line-through; color: var(--text-secondary); opacity: 0.55; }

  .card-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  .quest-priority-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
    padding: 5px 10px;
    border-radius: 100px;
    cursor: pointer; user-select: none;
    transition: transform 0.2s ease, background 0.2s ease;
    white-space: nowrap;
  }
  .quest-priority-badge:hover { transform: scale(1.04); }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
  .quest-priority-badge.badge-high { background: rgba(239, 68, 68, 0.10); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.18); }
  .quest-priority-badge.badge-medium { background: rgba(245, 158, 11, 0.10); color: #fbbf5e; border: 1px solid rgba(245, 158, 11, 0.18); }
  .quest-priority-badge.badge-low { background: rgba(16, 185, 129, 0.10); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.18); }
  body.light-theme .quest-priority-badge.badge-medium, body.light .quest-priority-badge.badge-medium, .light-theme .quest-priority-badge.badge-medium, .light .quest-priority-badge.badge-medium, [data-theme="light"] .quest-priority-badge.badge-medium { color: #b45309; }

  .btn-delete-quest {
    background: none; border: none; color: var(--text-tertiary);
    cursor: pointer; padding: 6px; border-radius: 8px;
    transition: background 0.2s ease, color 0.2s ease;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .btn-delete-quest:hover { background: rgba(239, 68, 68, 0.08); color: #f87171; }

  /* Empty state */
  .empty-quest-state {
    text-align: center;
    padding: 48px 16px;
    border-radius: 22px;
    border: 1px dashed var(--glass-border);
    z-index: 10;
    box-sizing: border-box;
  }
  .empty-state-vector-frame { width: 240px; max-width: 100%; height: 140px; margin: 0 auto 16px auto; }
  .empty-svg-sky { fill: var(--input-bg); }
  .empty-svg-accent { fill: var(--accent-purple); opacity: 0.1; }
  .empty-svg-terrain-back { fill: var(--glass-base); opacity: 0.8; }
  .empty-svg-terrain-front { fill: var(--glass-base); }
  .empty-svg-silhouette { fill: var(--text-primary); opacity: 0.85; }
  .empty-svg-stroke { stroke: var(--text-primary); opacity: 0.85; }
  .empty-quest-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.01em; }
  .empty-quest-subtitle { font-size: 13px; color: var(--text-secondary); max-width: 320px; margin: 0 auto; line-height: 1.55; }

  /* Mobile Layout */
  @media (max-width: 768px) {
    .tasks-wrapper { width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; box-sizing: border-box !important; padding: 12px 16px !important; }
    .subjects-hero-header { padding: 20px !important; margin-bottom: 24px !important; border-radius: 18px !important; }
    .hero-info-area h1 { font-size: 22px !important; }
    .hero-info-area p { font-size: 12px !important; }
    .hero-visual-stack { width: 90px !important; height: 70px !important; }
    .visual-card-element { width: 58px !important; height: 42px !important; }
    .visual-card-element-1 { transform: translate(-10px, -6px) rotate(-10deg); }
    .visual-card-element-2 { transform: translate(-4px, -2px) rotate(-5deg); }
    .visual-card-element-3 { transform: translate(4px, 2px) rotate(0deg); }

    .stats-carousel-grid {
      display: flex !important; overflow-x: auto !important; overflow-y: visible !important;
      scroll-snap-type: x mandatory !important; gap: 12px !important; padding: 4px 16px !important;
      margin-left: -16px !important; margin-right: -16px !important; margin-bottom: 12px !important;
      width: calc(100% + 32px) !important; -webkit-overflow-scrolling: touch !important; box-sizing: border-box !important;
    }
    .stats-carousel-grid::-webkit-scrollbar { display: none !important; }

    .kpi-card-glass { flex: 0 0 calc(92% - 12px) !important; scroll-snap-align: start !important; min-height: 104px !important; padding: 16px !important; border-radius: 16px !important; box-shadow: 0 10px 26px rgba(10, 6, 24, 0.35) !important; }
    .carousel-pager-dots { display: flex !important; }
    .kpi-main-metric { font-size: 24px !important; margin-bottom: 2px !important; }
    .kpi-desc { font-size: 10px !important; }
    .golden-trophy-badge { right: 8px !important; bottom: 8px !important; width: 24px !important; height: 24px !important; }

    .tasks-list-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .task-form-card { padding: 16px !important; border-radius: 18px !important; margin-bottom: 24px !important; }
    .input-group { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
    .task-input { width: 100% !important; height: 44px !important; }
    .btn-add { width: 100% !important; justify-content: center !important; height: 44px !important; }

    .priority-options { display: flex !important; flex-direction: column !important; align-items: stretch !important; gap: 8px !important; margin-top: 12px !important; }
    .priority-options > .priority-label { display: none !important; }
    .priority-segment { width: 100% !important; box-sizing: border-box !important; }
    .priority-btn { flex: 1 !important; justify-content: center !important; padding: 8px 4px !important; font-size: 11px !important; min-height: 36px !important; border-radius: 8px !important; }

    .filter-tabs-wrapper { display: flex !important; width: 100% !important; max-width: 100% !important; gap: 2px !important; padding: 3px !important; margin: 20px 0 24px 0 !important; border-radius: 12px !important; box-sizing: border-box !important; }
    .filter-tab { flex: 1 !important; padding: 8px 2px !important; font-size: 11px !important; justify-content: center !important; min-width: 0 !important; min-height: 36px !important; }
    .filter-tab-label { max-width: 100%; }
    .tab-count-badge { font-size: 9px !important; padding: 1px 4px !important; margin-left: 3px !important; }

    .task-quest-card { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; padding: 14px 16px !important; border-radius: 14px !important; min-height: auto !important; }
    .checkbox-wrapper { width: 100% !important; align-items: flex-start !important; }
    .custom-checkbox-node { margin-top: 1px !important; width: 20px !important; height: 20px !important; }
    .task-quest-title { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; font-size: 14px !important; line-height: 1.4 !important; }
    .card-actions { width: 100% !important; justify-content: space-between !important; padding-left: 34px !important; box-sizing: border-box !important; }
    .btn-delete-quest { width: 36px !important; height: 36px !important; margin: -6px -6px -6px 0 !important; }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .stats-carousel-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn-ripple { animation: none; display: none; }
  }
`;

function Tasks({ userId }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    fetchTasks()

    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    handleResize()
    window.addEventListener('resize', handleResize)

    const meta = document.querySelector('meta[name="viewport"]')
    if (meta) {
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'viewport'
      newMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      document.head.appendChild(newMeta)
    }

    const wrapper = document.querySelector('.tasks-wrapper')
    if (wrapper && wrapper.parentElement) {
      const parent = wrapper.parentElement
      parent.style.background = 'transparent'
      parent.style.backgroundColor = 'transparent'
      parent.style.border = 'none'
      parent.style.borderColor = 'transparent'
      parent.style.boxShadow = 'none'
      parent.style.padding = '0'
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  async function fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTasks(data)
    setLoading(false)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    const { error } = await supabase
      .from('tasks')
      .insert([{ title, user_id: userId, priority, progress: 0 }])
    if (!error) {
      setTitle('')
      fetchTasks()
    }
  }

  async function cyclePriority(task) {
    const priorities = ['low', 'medium', 'high']
    const nextIndex = (priorities.indexOf(task.priority) + 1) % priorities.length
    const nextPriority = priorities[nextIndex]

    const { error } = await supabase
      .from('tasks')
      .update({ priority: nextPriority })
      .eq('id', task.id)

    if (!error) fetchTasks()
  }

  async function toggleDone(task) {
    const newProgress = task.progress === 100 ? 0 : 100
    await supabase.from('tasks').update({ progress: newProgress }).eq('id', task.id)
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  function spawnRipple(e) {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.4
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now() + Math.random()
    setRipples((prev) => [...prev, { id, x, y, size }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return task.progress !== 100
    if (currentFilter === 'completed') return task.progress === 100
    return true
  })

  const totalTasksCount = tasks.length
  const completedCount = tasks.filter(t => t.progress === 100).length
  const activeCount = totalTasksCount - completedCount
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0

  return (
    <div className="tasks-wrapper" style={{ touchAction: 'pan-y' }}>
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="aurora-blur-sphere sphere-primary" />
      <div className="aurora-blur-sphere sphere-secondary" />
      <div className="tasks-noise-overlay" aria-hidden="true" />

      {/* 1. Productivity Workspace Hero Card */}
      <motion.div
        className="subjects-hero-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 16 }}
      >
        <div className="hero-info-area">
          <div className="workspace-console-tag">
            <div className="workspace-console-dot" />
            <span>Workspace Console</span>
          </div>
          <h1>Productivity Workspace</h1>
          <p>Organize objectives, evaluate priority levels, and track active performance.</p>
        </div>
        <div className="hero-meta-badges">
          <span className="semester-pill">Focused Sprint</span>
          {completionRate > 0 && <span className="sgpa-badge-glowing">{completionRate}% Done</span>}
        </div>
        <div className="hero-visual-stack">
          <div className="visual-card-element visual-card-element-1" />
          <div className="visual-card-element visual-card-element-2" />
          <div className="visual-card-element visual-card-element-3" />
        </div>
      </motion.div>

      {/* 2. Statistics Carousel */}
      <div className="stats-carousel-grid">
        <SummaryCard
          label="Active Tasks"
          value={activeCount}
          icon={<ListTodo size={15} />}
          desc={`${completedCount} accomplished`}
          sparklinePath="M0,15 C10,12 20,18 30,5 C40,2 50,14 60,8"
          accent="#60a5fa"
        />

        <SummaryCard
          label="Completed"
          value={completedCount}
          icon={<CheckCircle2 size={15} />}
          desc={`${activeCount} remaining`}
          sparklinePath="M0,8 C10,14 20,5 30,12 C40,16 50,2 60,10"
          accent="#10b981"
        />

        <motion.div
          className="kpi-card-glass"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring' } }
          }}
          whileHover={!isMobile ? { y: -4, transition: { duration: 0.25 } } : {}}
        >
          <div className="kpi-header-row">
            <span className="kpi-label">Completion Rate</span>
            <span className="kpi-icon-wrapper" style={{ background: 'rgba(225, 177, 44, 0.16)', color: 'var(--accent-gold)' }}>
              <TrendingUp size={14} />
            </span>
          </div>
          <div className="kpi-main-metric" style={{ color: 'var(--accent-gold)' }}>
            {completionRate}%
          </div>
          <div className="kpi-desc-row">
            <span className="kpi-desc">Overall performance metrics.</span>
            <div className="golden-trophy-badge" style={{ position: 'absolute', width: '26px', height: '26px', bottom: '12px', right: '12px', borderRadius: '50%', background: 'radial-gradient(circle, #ffe9a8 0%, #e1b12c 100%)', boxShadow: '0 4px 10px rgba(225, 177, 44, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="#0c0b11" strokeWidth={2.5} />
            </div>
          </div>
        </motion.div>

        <SummaryCard
          label="Total Objectives"
          value={totalTasksCount}
          icon={<Target size={15} />}
          desc="Overall logged tasks"
          sparklinePath="M0,18 C10,15 20,10 30,10 C40,10 50,3 60,3"
          accent="#8b5cf6"
        />
      </div>

      {/* 2b. Swipe indicator dots (mobile) */}
      <div className="carousel-pager-dots">
        <span className="pager-dot active" />
        <span className="pager-dot" />
        <span className="pager-dot" />
        <span className="pager-dot" />
      </div>

      {/* 3. Add Task Section */}
      <motion.div
        className="task-form-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80 }}
      >
        <form onSubmit={addTask}>
          <div className="input-group">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="task-input"
            />
            <motion.button
              type="submit"
              className="btn-add"
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              onPointerDown={spawnRipple}
            >
              <span className="btn-add-content">
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Task</span>
              </span>
              <span className="btn-ripple-layer">
                {ripples.map((r) => (
                  <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y, width: r.size, height: r.size }} />
                ))}
              </span>
            </motion.button>
          </div>

          <div className="priority-options">
            <span className="priority-label">Priority</span>
            <div className="priority-segment">
              {['low', 'medium', 'high'].map((p) => {
                const meta = PRIORITY_META[p]
                const Icon = meta.Icon
                const isActive = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn ${isActive ? 'active ' + p : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    <span className="priority-dot" style={{ background: meta.color }} />
                    <Icon size={13} strokeWidth={2.25} />
                    <span>{meta.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </form>
      </motion.div>

      {/* 4. Filter Tabs */}
      <div className="filter-tabs-wrapper">
        <button className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`} onClick={() => setCurrentFilter('all')}>
          {currentFilter === 'all' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">All Tasks</span>
          <span className="tab-count-badge">{totalTasksCount}</span>
        </button>
        <button className={`filter-tab ${currentFilter === 'active' ? 'active' : ''}`} onClick={() => setCurrentFilter('active')}>
          {currentFilter === 'active' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">Active</span>
          <span className="tab-count-badge">{activeCount}</span>
        </button>
        <button className={`filter-tab ${currentFilter === 'completed' ? 'active' : ''}`} onClick={() => setCurrentFilter('completed')}>
          {currentFilter === 'completed' && (
            <motion.div layoutId="activeTabIndicator" className="active-tab-indicator" transition={{ type: 'spring', stiffness: 350, damping: 28 }} />
          )}
          <span className="filter-tab-label">Completed</span>
          <span className="tab-count-badge">{completedCount}</span>
        </button>
      </div>

      {/* 5. Tasks List / Empty State */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>Loading tasks...</p>
      ) : filteredTasks.length === 0 ? (

        <div className="empty-quest-state">
          <svg className="empty-state-vector-frame" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="180" rx="16" className="empty-svg-sky" />
            <circle cx="150" cy="90" r="50" className="empty-svg-accent" />
            <g transform="translate(142, 60)">
              <line x1="8" y1="10" x2="8" y2="40" className="empty-svg-stroke" strokeWidth="2" />
              <path d="M5,15 Q8,8 11,15 Z" className="empty-svg-silhouette" />
              <circle cx="8" cy="11" r="2.5" className="empty-svg-silhouette" />
              <path d="M-10,35 Q8,42 26,35 Z" className="empty-svg-silhouette" />
            </g>
            <path d="M -20 180 Q 80 130 180 155 T 320 140 L 320 180 Z" className="empty-svg-terrain-back" />
            <path d="M -10 180 Q 90 145 150 162 T 310 150 L 310 180 Z" className="empty-svg-terrain-front" />
            <g transform="translate(40, 105) scale(0.6)">
              <line x1="20" y1="80" x2="20" y2="20" className="empty-svg-stroke" strokeWidth="3" />
              <line x1="20" y1="50" x2="5" y2="35" className="empty-svg-stroke" strokeWidth="2" />
              <line x1="20" y1="35" x2="35" y2="20" className="empty-svg-stroke" strokeWidth="2" />
            </g>
            <g transform="translate(240, 115) scale(0.5)">
              <line x1="20" y1="80" x2="20" y2="20" className="empty-svg-stroke" strokeWidth="3" />
              <line x1="20" y1="45" x2="32" y2="30" className="empty-svg-stroke" strokeWidth="2" />
            </g>
          </svg>
          <h4 className="empty-quest-title">Your task list is clear</h4>
          <p className="empty-quest-subtitle">
            No pending tasks. Add a new task above to get started!
          </p>
        </div>

      ) : (
        <motion.div
          className="tasks-list-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                className={`task-quest-card ${task.priority}-p`}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                whileHover={!isMobile ? { y: -2, transition: { duration: 0.2 } } : {}}
                whileTap={{ scale: 0.99 }}
              >
                <div className="checkbox-wrapper" onClick={() => toggleDone(task)}>
                  <div className={`custom-checkbox-node ${task.progress === 100 ? 'checked' : ''}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className={`task-quest-title ${task.progress === 100 ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                </div>

                <div className="card-actions">
                  <PriorityBadge priority={task.priority} onClick={() => cyclePriority(task)} />
                  <button onClick={() => deleteTask(task.id)} className="btn-delete-quest" title="Delete Task">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function PriorityBadge({ priority, onClick }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.medium
  const Icon = meta.Icon
  return (
    <span onClick={onClick} className={`quest-priority-badge badge-${priority}`} title="Click to toggle priority">
      <span className="badge-dot" style={{ background: meta.color }} />
      <Icon size={11} strokeWidth={2.25} />
      {meta.label}
    </span>
  )
}

function SummaryCard({ label, value, icon, desc, sparklinePath, accent }) {
  const gradId = 'spark-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const accentColor = accent || '#8b5cf6'
  return (
    <motion.div
      className="kpi-card-glass"
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
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
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

export default Tasks;