import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Auth from './Auth'
import Dashboard from './Dashboard'

function App() {
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // App version checking states
  const [checkingVersion, setCheckingVersion] = useState(true)
  const [updateRequired, setUpdateRequired] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Check Android app version
  useEffect(() => {
    checkAppVersion()
  }, [])

  async function checkAppVersion() {
    try {
      // Version enforcement only applies to native Android.
      // Vercel/PWA/browser versions remain unaffected.
      if (
        !Capacitor.isNativePlatform() ||
        Capacitor.getPlatform() !== 'android'
      ) {
        setCheckingVersion(false)
        return
      }

      // Get installed Android app information
      const appInfo = await CapacitorApp.getInfo()

      console.log('Installed Atlas version:', appInfo.version)
      console.log('Installed Atlas build:', appInfo.build)

      const installedVersionCode = Number(appInfo.build)

      // Get Android version configuration from Supabase
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('platform', 'android')
        .single()

      if (error) {
        console.error('Failed to fetch app version configuration:', error)

        // Fail open so a temporary Supabase/network issue
        // does not lock users out of Atlas.
        setCheckingVersion(false)
        return
      }

      const minimumVersionCode = Number(data.minimum_version_code)

      console.log('Minimum Atlas version code:', minimumVersionCode)

      // Block only when force update is enabled
      // AND the installed Android build is too old.
      if (
        data.force_update === true &&
        Number.isFinite(installedVersionCode) &&
        Number.isFinite(minimumVersionCode) &&
        installedVersionCode < minimumVersionCode
      ) {
        setUpdateInfo(data)
        setUpdateRequired(true)
      }
    } catch (error) {
      console.error('Atlas version check failed:', error)

      // Fail open on unexpected errors.
    } finally {
      setCheckingVersion(false)
    }
  }

  // Check Supabase authentication session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setCheckingSession(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // Wait until version check is complete.
  // Prevents the normal app from briefly appearing
  // before the forced-update screen.
  if (checkingVersion) {
    return null
  }

  // Mandatory update screen
  if (updateRequired) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg)',
          color: 'var(--text)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '32px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '24px'
          }}
        >
          <h1
            style={{
              fontSize: '26px',
              marginBottom: '12px'
            }}
          >
            Update Required
          </h1>

          <p
            style={{
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}
          >
            A newer version of Atlas is required to continue.
            Please update the app to access the latest features
            and improvements.
          </p>

          {updateInfo?.latest_version && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}
            >
              Latest version: {updateInfo.latest_version}
            </p>
          )}

          {updateInfo?.update_url ? (
            <button
              onClick={() => {
                window.location.href = updateInfo.update_url
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                border: 'none',
                borderRadius: '12px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              Update Atlas
            </button>
          ) : (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)'
              }}
            >
              Please contact the Atlas developer to get the latest version.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Wait for authentication check
  if (checkingSession) {
    return null
  }

  return !user ? (
    <Auth onLogin={setUser} />
  ) : (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      theme={theme}
      onToggleTheme={() =>
        setTheme(theme === 'dark' ? 'light' : 'dark')
      }
    />
  )
}

export default App