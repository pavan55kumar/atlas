function ProgressRing({ value, size, strokeWidth, color, trackColor }) {
  const s = size || 56
  const sw = strokeWidth || 5
  const r = (s - sw) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - clamped / 100)

  return (
    <svg width={s} height={s} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
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
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

export default ProgressRing