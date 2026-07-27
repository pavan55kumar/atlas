// PERF: hoisted — static (no prop/state dependency), previously recreated
// on every render of every ProgressRing instance (there are several on
// screen at once: hero score, 2 KPI rings, plus any other dashboard use).
const SVG_STYLE = { transform: 'rotate(-90deg)', flexShrink: 0 }
const PROGRESS_CIRCLE_STYLE = { transition: 'stroke-dashoffset 0.6s ease' }

function ProgressRing({ value, size, strokeWidth, color, trackColor }) {
  const s = size || 56
  const sw = strokeWidth || 5
  const r = (s - sw) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - clamped / 100)

  return (
    <svg width={s} height={s} style={SVG_STYLE}>
      <circle
        cx={s / 2} cy={s / 2} r={r}
        fill="none" stroke={trackColor || 'var(--border)'} strokeWidth={sw}
      />
      <circle
        cx={s / 2} cy={s / 2} r={r}
        fill="none" stroke={color || 'var(--accent)'} strokeWidth={sw}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={PROGRESS_CIRCLE_STYLE}
      />
    </svg>
  )
}

export default ProgressRing