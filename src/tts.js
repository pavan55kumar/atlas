import { TextToSpeech } from '@capacitor-community/text-to-speech'

// ---------------------------------------------------------------------------
// Cross-platform "read aloud" wrapper.
//
// The old implementation called window.speechSynthesis directly, which
// works in a real browser (Chrome/Edge/Safari) but Capacitor's Android
// WebView either doesn't implement it reliably or returns an empty voice
// list from getVoices() — a long-standing WebView limitation. That's why
// Read Aloud worked on Vercel/web but did nothing at all inside the
// Capacitor Android build.
//
// @capacitor-community/text-to-speech provides:
//   - a NATIVE implementation on Android/iOS when running inside Capacitor
//     (uses the device's own OS-level TTS engine — always available)
//   - a WEB fallback (still backed by window.speechSynthesis) when running
//     in a plain browser
// so this one wrapper is correct in both environments — no "is this
// native or web" branching needed inside the component itself.
// ---------------------------------------------------------------------------

export async function speakText(text, { onStart, onEnd } = {}) {
  if (!text) return
  try {
    onStart?.()
    await TextToSpeech.speak({
      text,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    })
  } catch (err) {
    // A manual "stop" while speech is in progress can cause this promise
    // to reject on some platforms — that's expected and harmless, not a
    // real failure, so this is a console-only log, not surfaced to the user.
    console.error('Read aloud stopped or failed:', err)
  } finally {
    onEnd?.()
  }
}

export async function stopSpeaking() {
  try {
    await TextToSpeech.stop()
  } catch (err) {
    // Stopping an already-idle TTS engine can reject harmlessly; ignore.
  }
}