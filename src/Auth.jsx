import { useState } from 'react'
import { supabase } from './lib/supabase'

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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--surface)',
        padding: '40px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        width: '320px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {isSignUp ? 'Create your Atlas account' : 'Welcome back'}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>

        {message && <p style={{ marginTop: '12px', fontSize: '14px' }}>{message}</p>}

        <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: 'var(--accent)', cursor: 'pointer' }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: '14px'
}

const buttonStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px'
}

export default Auth