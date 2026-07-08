import { useState } from 'react'
import { supabase } from './lib/supabase'
import { inputStyle, primaryButton } from './styles'

function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else setMessage('✅ Check your email to confirm your account.')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('❌ ' + error.message)
      else onLogin(data.user)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)',
        width: '340px'
      }}>
        <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.03em', marginBottom: '6px' }}>
          ATLAS
        </p>
        <h2 className="font-display" style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 400 }}>
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
          style={{ ...inputStyle, width: '100%', marginBottom: '10px' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
          style={{ ...inputStyle, width: '100%', marginBottom: '16px' }} />

        <button type="submit" disabled={loading} style={{ ...primaryButton, width: '100%' }}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        {message && <p style={{ marginTop: '12px', fontSize: '13px' }}>{message}</p>}

        <p style={{ marginTop: '18px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsSignUp(!isSignUp)} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </form>
    </div>
  )
}

export default Auth