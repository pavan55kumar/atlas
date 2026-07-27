import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'

export async function initializePushNotifications() {
  // NEW: guard so this only runs on native builds. The web implementation
  // of this plugin needs a service worker + VAPID key setup that doesn't
  // exist in this app, so running this unconditionally on Vercel/web could
  // throw and get silently swallowed below — matches the guard pattern
  // already used in notifications.js and App.jsx.
  if (!Capacitor.isNativePlatform()) return

  try {
    // CHANGED: every listener is now attached BEFORE calling register().
    // Previously register() was called first and the listeners were
    // attached after — if the native 'registration' event fires before a
    // listener exists to catch it (Capacitor's register() promise resolves
    // once registration is INITIATED, not once the token comes back, so
    // this race is real), the event is lost with no buffering and the
    // token is never logged. This is the exact symptom described: no FCM
    // token ever appearing in logcat.

    // Device successfully registered
    PushNotifications.addListener('registration', (token) => {
      console.log('===================================')
      console.log('FCM TOKEN:')
      console.log(token.value)
      console.log('===================================')

      // Next step:
      // Save token.value into Supabase
    })

    // Registration failed
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration failed', error)
    })

    // Notification received while app is OPEN
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Notification received')
        console.log(notification)
      }
    )

    // User tapped the notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Notification clicked')
        console.log(notification)
      }
    )

    // Request notification permission
    let permission = await PushNotifications.checkPermissions()

    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions()
    }

    if (permission.receive !== 'granted') {
      console.warn('Notification permission denied')
      return
    }

    // Register with FCM/APNS — now happens AFTER all listeners exist
    await PushNotifications.register()
  } catch (error) {
    console.error('Push notification initialization failed', error)
  }
}