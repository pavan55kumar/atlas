import { useEffect, useState, useRef } from 'react'
import { supabase } from './lib/supabase'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network' // NEW: Capacitor network plugin, replaces window 'online' event
import Auth from './Auth'
import Dashboard from './Dashboard'
import ForceUpdate from './ForceUpdate'

function App() {
  const [theme, setTheme] = useState('dark')
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // App version checking states
  const [checkingVersion, setCheckingVersion] = useState(true)
  const [updateRequired, setUpdateRequired] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)

  // NEW: refs used only for network-change de-duplication.
  // Refs (not state) so they don't trigger re-renders and always
  // hold the latest value inside the network listener's closure.
  const isCheckingRef = useRef(false)      // guards against overlapping checkAppVersion() calls
  const wasOfflineRef = useRef(false)      // tracks previous connection status to detect the offline -> online transition

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Check Android app version
  useEffect(() => {
    checkAppVersion()
  }, [])

  // ---------------------------------------------------------
  // REPLACED: previously used window.addEventListener('online', ...).
  // Now uses @capacitor/network, which is the reliable, native-backed
  // way to detect connectivity changes on Android (window 'online'/'offline'
  // events are unreliable inside Capacitor WebViews).
  // ---------------------------------------------------------
  useEffect(() => {
    let listenerHandle

    // Wrapper that only calls checkAppVersion() on a genuine
    // offline -> online transition, and never lets two checks run at once.
    const runGuardedVersionCheck = async () => {
      if (isCheckingRef.current) {
        // A check is already in flight — ignore this event.
        return
      }
      isCheckingRef.current = true
      try {
        await checkAppVersion()
      } finally {
        isCheckingRef.current = false
      }
    }

    const handleNetworkChange = (status) => {
      const isOnline = status.connected

      if (isOnline && wasOfflineRef.current) {
        // Device just came back online after being offline — re-check version.
        runGuardedVersionCheck()
      }

      wasOfflineRef.current = !isOnline
    }

    // Initialize wasOfflineRef with the current status so the very first
    // event fired (which some platforms send immediately on listener add)
    // doesn't cause a false-positive "just came online" trigger.
    Network.getStatus().then((status) => {
      wasOfflineRef.current = !status.connected
    })

    Network.addListener('networkStatusChange', handleNetworkChange).then((handle) => {
      listenerHandle = handle
    })

    // Cleanup: remove the network listener on unmount
    return () => {
      listenerHandle?.remove()
    }
  }, [])

  // Existing resume listener — unchanged
  useEffect(() => {
    let listener

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener("resume", () => {
        checkAppVersion()
      }).then(handle => {
        listener = handle
      })
    }

    return () => {
      listener?.remove()
    }
  }, [])

  // Listen for native deep link OAuth redirects
  useEffect(() => {
    let listenerHandle

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', async (event) => {
        try {
          // Only handle the Atlas OAuth callback
          if (!event.url?.startsWith('atlas://auth/callback')) {
            return
          }

          const parsedUrl = new URL(event.url)
          const code = parsedUrl.searchParams.get('code')

          if (!code) {
            console.error(
              'OAuth callback received without authorization code'
            )
            return
          }

          const { error } =
            await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error(
              'OAuth session exchange failed:',
              error.message
            )
          }
        } catch (error) {
          console.error('Deep link handling error:', error)
        }
      }).then((handle) => {
        listenerHandle = handle
      })
    }

    return () => {
      if (listenerHandle) {
        listenerHandle.remove()
      }
    }
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
        <ForceUpdate
            updateInfo={updateInfo}
        />
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