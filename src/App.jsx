import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './Auth'
import Dashboard from './Dashboard'
import { BrowserRouter } from 'react-router-dom'

function App() {
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setCheckingSession(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (checkingSession) return null

  return !user ? (
    <Auth onLogin={setUser} />
  ) : (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  )
}

export default App