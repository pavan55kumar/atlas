import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

// ---------------------------------------------------------------------------
// Stable integer notification IDs
//
// Capacitor requires a 32-bit integer id per scheduled notification, but our
// records use UUID strings. This hashes a namespaced key (e.g. "task:<uuid>")
// into a stable positive integer, so scheduling the same task/habit/event
// twice always produces the same id — which is what lets us cancel or
// overwrite the correct pending notification on edit/delete.
// ---------------------------------------------------------------------------
function hashToId(input) {
  const str = String(input)
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h % 2147483647 // stay within Android's accepted positive int range
}

function notificationIdFor(namespace, recordId) {
  return hashToId(`${namespace}:${recordId}`)
}

const REMINDER_CHANNEL_ID = 'atlas-reminders'
const DEFAULT_HOUR = 9   // global fixed default: 9:00 AM
const DEFAULT_MINUTE = 0
const DEFAULT_EVENT_MINUTES_BEFORE = 30

let permissionChecked = false

// ---------------------------------------------------------------------------
// One-time setup. Call once at app startup (native only). Creates the
// Android notification channel (required on Android 8+/O — without it,
// scheduled notifications are silently dropped) and does nothing on web/PWA.
// ---------------------------------------------------------------------------
export async function initNotifications() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: 'Atlas Reminders',
      description: 'Reminders for tasks, habits, and calendar events',
      importance: 4, // high
      visibility: 1
    })
  } catch (err) {
    console.error('Failed to create notification channel:', err)
  }
}

export async function ensureNotificationPermission() {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const current = await LocalNotifications.checkPermissions()
    if (current.display === 'granted') {
      permissionChecked = true
      return true
    }
    if (permissionChecked) return false // already asked once this session, don't nag
    permissionChecked = true
    const requested = await LocalNotifications.requestPermissions()
    return requested.display === 'granted'
  } catch (err) {
    console.error('Notification permission check failed:', err)
    return false
  }
}

// ============================== TASKS ==============================
// One-shot reminder at 9:00 AM on the task's due_date. Cancelled instead
// of scheduled if the task has no due date or is already completed.
export async function scheduleTaskReminder(task) {
  if (!Capacitor.isNativePlatform()) return
  if (!task?.due_date || task.progress === 100) {
    await cancelTaskReminder(task?.id)
    return
  }
  const granted = await ensureNotificationPermission()
  if (!granted) return

  const [year, month, day] = task.due_date.split('-').map(Number)
  const fireDate = new Date(year, month - 1, day, DEFAULT_HOUR, DEFAULT_MINUTE, 0, 0)
  if (fireDate.getTime() <= Date.now()) return // don't schedule into the past

  const id = notificationIdFor('task', task.id)
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Task due today',
        body: task.title,
        schedule: { at: fireDate, allowWhileIdle: true },
        channelId: REMINDER_CHANNEL_ID
      }]
    })
  } catch (err) {
    console.error('Failed to schedule task reminder:', err)
  }
}

export async function cancelTaskReminder(taskId) {
  if (!Capacitor.isNativePlatform() || !taskId) return
  const id = notificationIdFor('task', taskId)
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] })
  } catch (err) {
    // Cancelling a non-existent notification is harmless; ignore.
  }
}

// ============================== HABITS ==============================
// Daily repeating reminder at a single fixed global time (9:00 AM) for
// every habit. Capacitor repeats a schedule daily automatically when only
// hour/minute are given (no day/month), so this is one schedule call, not
// a loop of future dates.
export async function scheduleHabitReminder(habit) {
  if (!Capacitor.isNativePlatform() || !habit?.id) return
  const granted = await ensureNotificationPermission()
  if (!granted) return

  const id = notificationIdFor('habit', habit.id)
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Habit reminder',
        body: `Don't forget: ${habit.name}`,
        schedule: {
          on: { hour: DEFAULT_HOUR, minute: DEFAULT_MINUTE },
          allowWhileIdle: true
        },
        channelId: REMINDER_CHANNEL_ID
      }]
    })
  } catch (err) {
    console.error('Failed to schedule habit reminder:', err)
  }
}

export async function cancelHabitReminder(habitId) {
  if (!Capacitor.isNativePlatform() || !habitId) return
  const id = notificationIdFor('habit', habitId)
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] })
  } catch (err) {
    // ignore
  }
}

// ============================== CALENDAR EVENTS ==============================
// One-shot reminder N minutes before the event's date+time (defaults to
// 9:00 AM if the event has no specific time, 30 min before if no override).
export async function scheduleEventReminder(event) {
  if (!Capacitor.isNativePlatform() || !event?.event_date) return
  const granted = await ensureNotificationPermission()
  if (!granted) return

  const [year, month, day] = event.event_date.split('-').map(Number)
  let hour = DEFAULT_HOUR
  let minute = DEFAULT_MINUTE
  if (event.event_time) {
    const [h, m] = event.event_time.split(':').map(Number)
    hour = h
    minute = m
  }
  const eventDate = new Date(year, month - 1, day, hour, minute, 0, 0)
  const minutesBefore = Number.isFinite(event.reminder_minutes_before)
    ? event.reminder_minutes_before
    : DEFAULT_EVENT_MINUTES_BEFORE
  const fireDate = new Date(eventDate.getTime() - minutesBefore * 60000)
  if (fireDate.getTime() <= Date.now()) return

  const id = notificationIdFor('event', event.id)
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Upcoming event',
        body: event.title,
        schedule: { at: fireDate, allowWhileIdle: true },
        channelId: REMINDER_CHANNEL_ID
      }]
    })
  } catch (err) {
    console.error('Failed to schedule event reminder:', err)
  }
}

export async function cancelEventReminder(eventId) {
  if (!Capacitor.isNativePlatform() || !eventId) return
  const id = notificationIdFor('event', eventId)
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] })
  } catch (err) {
    // ignore
  }
}

// ============================== BULK RESCHEDULE ==============================
// Re-fetches everything reminder-relevant and (re)schedules it. Safe to call
// repeatedly — scheduling with the same id just overwrites the pending
// notification, it never duplicates. Called once after login and again on
// every app resume, so edits made elsewhere (or made while the app was
// closed, e.g. via another device) stay in sync.
export async function rescheduleAllReminders(supabase, userId) {
  if (!Capacitor.isNativePlatform() || !userId) return
  const granted = await ensureNotificationPermission()
  if (!granted) return

  try {
    const [tasksRes, habitsRes, eventsRes] = await Promise.all([
      supabase.from('tasks').select('id, title, due_date, progress').eq('user_id', userId).not('due_date', 'is', null),
      supabase.from('habits').select('id, name'),
      supabase.from('calendar_events').select('id, title, event_date, event_time, reminder_minutes_before').eq('user_id', userId)
    ])

    await Promise.all([
      ...(tasksRes.data || []).map(scheduleTaskReminder),
      ...(habitsRes.data || []).map(scheduleHabitReminder),
      ...(eventsRes.data || []).map(scheduleEventReminder)
    ])
  } catch (err) {
    console.error('Failed to reschedule reminders:', err)
  }
}