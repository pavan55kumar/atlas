import { useState } from 'react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles' // Kept for import compatibility

// Custom CSS stylesheet matching your dashboard styling perfectly (Optimized for single-screen mobile usage)
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=300;400;500;600;700&display=swap');
  
  .auth-container {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at center, #151324 0%, #0a0812 100%);
    padding: 24px;
    box-sizing: border-box;
    color: #ffffff;
  }
  
  .auth-card {
    display: flex;
    width: 1040px;
    height: 660px;
    background: #0e0d16;
    border-radius: 28px;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.3s ease;
  }
  
  .auth-form-column {
    flex: 1;
    padding: 50px 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    background-color: #0e0d16;
  }
  
  .auth-illustration-column {
    flex: 1.2;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0e0c15 0%, #050407 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 40px;
    box-sizing: border-box;
    border-left: 1px solid rgba(255, 255, 255, 0.03);
  }

  /* Decorative ambient light leaks on the illustration side */
  .glowing-bg-orb {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(92, 71, 245, 0) 70%);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1;
  }
  
  .input-wrapper {
    position: relative;
    margin-bottom: 14px;
  }
  
  .input-field {
    width: 100%;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid transparent;
    background-color: #eef2ff;
    font-size: 15px;
    font-weight: 500;
    color: #0a0812;
    transition: all 0.25s ease;
    box-sizing: border-box;
  }
  
  .input-field::placeholder {
    color: #8c8da0;
    font-weight: 400;
  }
  
  .input-field:focus {
    outline: none;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(92, 71, 245, 0.3);
  }
  
  .password-toggle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #5d5b70;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.2s;
  }
  
  .password-toggle:hover {
    color: #5c47f5;
  }
  
  .recovery-link {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #8e8c9d;
    text-decoration: none;
    margin-top: 2px;
    margin-bottom: 24px;
    font-weight: 500;
    transition: color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 100%;
  }
  
  .recovery-link:hover {
    color: #5c47f5;
  }
  
  .btn-submit {
    width: 100%;
    padding: 16px;
    background-color: #5c47f5;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(92, 71, 245, 0.3);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .btn-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    background-color: #4a35db;
    box-shadow: 0 12px 28px rgba(92, 71, 245, 0.45);
  }
  
  .btn-submit:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  .btn-submit:disabled {
    background: #252335;
    color: #5d5b70;
    cursor: not-allowed;
    box-shadow: none;
  }
  
  .divider-container {
    display: flex;
    align-items: center;
    margin: 28px 0;
    color: #5d5b70;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .divider-line {
    flex: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .divider-text {
    padding: 0 14px;
  }
  
  .social-container {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
  
  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 48px;
    background: #161522;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .social-btn:hover {
    transform: translateY(-2px);
    background: #1b1928;
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
  
  .toggle-auth-text {
    text-align: center;
    margin-top: 28px;
    font-size: 13px;
    color: #8e8c9d;
  }
  
  .toggle-auth-link {
    color: #5c47f5;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s;
    margin-left: 4px;
  }
  
  .toggle-auth-link:hover {
    color: #7b69f7;
    text-decoration: underline;
  }

  /* --- Premium CSS Dashboard / AI Hero Banner Styling --- */
  .hero-interactive-canvas {
    position: relative;
    flex: 1;
    width: 100%;
    margin: 32px 0;
    border-radius: 20px;
    background: #0d0c14;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 15px 35px rgba(0,0,0,0.5);
    overflow: hidden;
    z-index: 2;
    box-sizing: border-box;
    min-height: 310px;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: center;
  }

  /* Abstract Perspective Lines */
  .coordinate-line-left {
    position: absolute;
    top: 50%;
    left: 0;
    width: 50%;
    height: 1px;
    background: linear-gradient(90deg, rgba(92, 71, 245, 0) 0%, rgba(92, 71, 245, 0.2) 100%);
    transform: rotate(15deg);
    transform-origin: left;
  }

  .coordinate-line-right {
    position: absolute;
    top: 50%;
    right: 0;
    width: 50%;
    height: 1px;
    background: linear-gradient(-90deg, rgba(124, 58, 237, 0) 0%, rgba(124, 58, 237, 0.2) 100%);
    transform: rotate(-15deg);
    transform-origin: right;
  }

  /* Dynamic breathing neural center core */
  .ai-core-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border: 1.5px dashed rgba(92, 71, 245, 0.3);
    border-radius: 50%;
    animation: rotateRing 20s infinite linear;
  }

  .ai-core-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 56px;
    height: 56px;
    background: radial-gradient(circle, #7c3aed 0%, #5c47f5 100%);
    border-radius: 50%;
    box-shadow: 0 0 35px rgba(92, 71, 245, 0.8);
    animation: pulseCore 3s infinite alternate ease-in-out;
  }

  @keyframes pulseCore {
    0% { transform: translate(-50%, -50%) scale(0.9); box-shadow: 0 0 20px rgba(92, 71, 245, 0.5); opacity: 0.8; }
    100% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 45px rgba(92, 71, 245, 0.95); opacity: 1; }
  }

  @keyframes rotateRing {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Glassmorphic overlay widget cards */
  .floating-glass-card {
    position: absolute;
    background: rgba(22, 21, 34, 0.45);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.3s ease;
  }

  /* Staggered Floating Parallax Movements */
  .card-habit {
    top: 15%;
    left: 10%;
    animation: floatHabit 5s infinite alternate ease-in-out;
  }

  .card-focus {
    bottom: 15%;
    left: 12%;
    animation: floatFocus 6s infinite alternate ease-in-out;
  }

  .card-academics {
    top: 18%;
    right: 8%;
    animation: floatAcademics 5.5s infinite alternate ease-in-out;
  }

  @keyframes floatHabit {
    0% { transform: translateY(0px) rotate(-1deg); }
    100% { transform: translateY(-10px) rotate(1deg); }
  }

  @keyframes floatFocus {
    0% { transform: translateY(0px); }
    100% { transform: translateY(12px) rotate(-1.5deg); }
  }

  @keyframes floatAcademics {
    0% { transform: translateY(0px) rotate(1deg); }
    100% { transform: translateY(-12px) rotate(-1deg); }
  }

  /* Micro status badge styles */
  .status-circle-pulse {
    width: 6px;
    height: 6px;
    background-color: #34d399;
    border-radius: 50%;
    box-shadow: 0 0 8px #34d399;
    animation: pulseStatus 1.5s infinite alternate;
  }

  @keyframes pulseStatus {
    0% { opacity: 0.4; }
    100% { opacity: 1; }
  }

  /* Vector charts overlay */
  .metric-chart-path {
    stroke-dasharray: 600;
    stroke-dashoffset: 600;
    animation: drawPath 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes drawPath {
    to { stroke-dashoffset: 0; }
  }

  .toast-message {
    margin-top: 16px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.4;
  }

  .toast-error {
    background-color: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .toast-success {
    background-color: rgba(16, 185, 129, 0.12);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  /* =========================================================================
     MOBILE SECURE RENDERING - HANDCRAFTED NATIVE iOS APP UX (BELOW 768PX)
     ========================================================================= */
  @media (max-width: 768px) {
    .auth-container {
      padding: 12px;
    }
    
    .auth-card {
      flex-direction: column;
      width: 100%;
      height: auto;
      min-height: auto;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      border-radius: 24px;
    }
    
    /* Reduced hero banner height strictly to 180px */
    .auth-illustration-column {
      order: 1;
      height: 180px;
      padding: 16px 20px;
      margin: 6px;
      border-radius: 18px;
      border-left: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    .hero-interactive-canvas {
      min-height: 110px;
      margin: 10px 0;
      border-radius: 12px;
    }

    .ai-core-ring {
      width: 64px;
      height: 64px;
    }

    .ai-core-center {
      width: 32px;
      height: 32px;
      box-shadow: 0 0 20px rgba(92, 71, 245, 0.8);
    }

    /* Scales down floating status badges proportionally */
    .card-focus {
      display: none !important; /* Hide third card on mobile to reduce height */
    }

    .card-habit {
      top: 10%;
      left: 6%;
      transform: scale(0.68);
      transform-origin: top left;
    }

    .card-academics {
      top: 12%;
      right: 6%;
      transform: scale(0.68);
      transform-origin: top right;
    }

    .auth-illustration-column h3 {
      font-size: 15px !important;
      margin-bottom: 2px !important;
    }

    .auth-illustration-column p {
      font-size: 11px !important;
    }

    /* Hide unneeded carousel controls and footer text on mobile */
    .auth-illustration-column .carousel-controls,
    .auth-illustration-column div:last-child {
      display: none !important;
    }
    
    /* Unified form container directly below the simplified banner */
    .auth-form-column {
      order: 2;
      padding: 24px 20px;
      flex: none;
    }

    .auth-form-column h2 {
      font-size: 24px !important;
      margin-bottom: 4px !important;
    }

    .auth-form-column p {
      font-size: 12px !important;
      margin-bottom: 16px !important;
    }

    /* Custom dark glassmorphic input fields (replaces massive white inputs) */
    .input-field {
      background-color: rgba(22, 21, 34, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      color: #ffffff !important;
      border-radius: 12px !important;
      padding: 14px 16px !important;
      font-size: 14px !important;
    }

    .input-field::placeholder {
      color: #5d5b70 !important;
    }

    .input-field:focus {
      border-color: #8b5cf6 !important;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25) !important;
      background-color: rgba(27, 25, 42, 0.85) !important;
    }

    .password-toggle {
      color: #5d5b70 !important;
    }

    .recovery-link {
      margin-bottom: 16px !important;
      font-size: 11px !important;
    }

    /* Dynamic purple-pink login submit button */
    .btn-submit {
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%) !important;
      padding: 14px !important;
      font-size: 14px !important;
      border-radius: 12px !important;
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3) !important;
    }

    .btn-submit:active {
      transform: scale(0.97) !important;
    }

    .divider-container {
      margin: 18px 0 !important;
    }

    /* Compact circular social login nodes */
    .social-container {
      gap: 12px !important;
    }

    .social-btn {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background: rgba(22, 21, 34, 0.6) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    .social-btn:hover {
      background: rgba(27, 25, 42, 0.8) !important;
      border-color: rgba(255, 255, 255, 0.15) !important;
    }

    .toggle-auth-text {
      margin-top: 18px !important;
      font-size: 12px !important;
    }

    .glowing-bg-orb {
      width: 250px;
      height: 250px;
    }
  }

  @media (max-width: 375px) {
    .auth-form-column {
      padding: 24px 16px;
    }
    .social-btn {
      width: 40px !important;
      height: 40px !important;
    }
    .auth-illustration-column {
      height: 160px;
    }
    .hero-interactive-canvas {
      min-height: 100px;
    }
  }
`;

function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage('❌ ' + error.message);
      else setMessage('✅ Check your email to confirm your account.');
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message);
      else onLogin(data.user);
    }
    setLoading(false);
  }

  // Trigger Google Sign-In with Supabase
  async function handleGoogleSignIn() {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setMessage('❌ ' + error.message);
      setLoading(false);
    }
  }

  // Trigger standard Supabase Password Recovery Flow
  async function handlePasswordRecovery() {
    if (!email.trim()) {
      setMessage('❌ Please enter your email address in the input field above to request a reset link.');
      return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage('✅ A password reset link has been dispatched to your email.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <style dangerouslySetInnerHTML={{ __html: styleSheet }} />
      <div className="auth-card">
        
        {/* Top (on Mobile) / Right (on Laptop): Visual Illustration Banner */}
        <div className="auth-illustration-column">
          <div className="glowing-bg-orb" />
          
          <div style={{ zIndex: 2 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: '0 0 4px 0' }}>
              Designed to optimize your life
            </h3>
            <p style={{ fontSize: '13px', color: '#8e8c9d', margin: 0 }}>
              The unified center for habits, tasks, and productivity.
            </p>
          </div>

          <div className="hero-interactive-canvas">
            <div className="grid-overlay" />
            <div className="coordinate-line-left" />
            <div className="coordinate-line-right" />

            <div className="ai-core-ring" />
            <div className="ai-core-center" />

            <svg style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', height: '140px', pointerEvents: 'none' }} viewBox="0 0 300 100" preserveAspectRatio="none">
              <path 
                className="metric-chart-path"
                d="M-10,90 Q30,50 70,75 T150,25 T230,60 T310,10" 
                fill="none" 
                stroke="url(#purpleGrad)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <path 
                d="M-10,90 Q30,50 70,75 T150,25 T230,60 T310,10 L310,100 L-10,100 Z" 
                fill="url(#chartAreaGrad)" 
                opacity="0.15"
              />
              <defs>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5c47f5" />
                  <stop offset="50%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#0e0c15" />
                </linearGradient>
              </defs>
            </svg>

            <div className="floating-glass-card card-habit">
              <span className="status-circle-pulse" style={{ backgroundColor: '#ff7a59', boxShadow: '0 0 8px #ff7a59' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Habit Streak</span>
                <span style={{ fontSize: '10px', color: '#ff7a59', fontWeight: 700 }}>Streak: 5 Days 🔥</span>
              </div>
            </div>

            <div className="floating-glass-card card-academics">
              <span className="status-circle-pulse" style={{ backgroundColor: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Academic Plan</span>
                <span style={{ fontSize: '10px', color: '#a78bfa', fontWeight: 600 }}>Active Study: 90%</span>
              </div>
            </div>

            <div className="floating-glass-card card-focus">
              <span className="status-circle-pulse" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ffffff' }}>Focus Engine</span>
                <span style={{ fontSize: '10px', color: '#34d399', fontWeight: 600 }}>Mode Active</span>
              </div>
            </div>
          </div>

          <div style={{ zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#5d5b70', fontWeight: 600, letterSpacing: '0.06em' }}>
              ATLAS AI SYSTEM
            </span>
            <div className="carousel-controls">
              <button className="carousel-btn" style={{ borderColor: 'rgba(255,255,255,0.1)' }} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
              <button className="carousel-btn" style={{ borderColor: 'rgba(255,255,255,0.1)' }} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom (on Mobile) / Left (on Laptop): Auth Form */}
        <div className="auth-form-column">
          <p style={{ fontSize: '11px', color: '#5c47f5', fontWeight: 700, letterSpacing: '0.12em', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
            ATLAS AI
          </p>
          <h2 style={{ fontSize: '30px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: '13px', color: '#8e8c9d', fontWeight: 500, margin: '0 0 32px 0' }}>
            {isSignUp ? 'Organize your life, habits, and academics today.' : 'Please enter your account details to continue.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="input-field"
              />
            </div>
            
            <div className="input-wrapper">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="input-field"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>

            {!isSignUp && (
              <button 
                type="button" 
                onClick={handlePasswordRecovery} 
                className="recovery-link"
              >
                Recover Password
              </button>
            )}

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {message && (
            <div className={`toast-message ${message.includes('❌') ? 'toast-error' : 'toast-success'}`}>
              {message}
            </div>
          )}

          <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">Or continue with</span>
            <div className="divider-line"></div>
          </div>

          <div className="social-container">
            {/* Google */}
            <button type="button" onClick={handleGoogleSignIn} className="social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
          </div>

          <p className="toggle-auth-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <span onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }} className="toggle-auth-link">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Auth;