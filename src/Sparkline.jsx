import { useId } from 'react'

// Catmull-Rom -> cubic Bezier smoothing so the line reads as a smooth,
// premium curve instead of a jagged polyline. This is cheap: sparkline
// datasets here are only a handful of points (e.g. 7-day trends), so this
// is a handful of extra multiplications per render — not a perf concern,
// and no heavier than the original point-mapping that was already there.
function buildSmoothPath(points) {
  if (points.length < 2) {
    const [p] = points
    return `M${p.x},${p.y}`
  }

  let d = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 === points.length ? i + 1 : i + 2]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return d
}

function Sparkline({ data, width, height, color }) {
  // Unique per-instance id: multiple Sparklines render on screen at once
  // (Tasks trend, Today trend, etc). A hardcoded gradient id would collide
  // across instances since SVG ids are global to the document.
  const gradientId = useId()

  const w = width || 72
  const h = height || 26
  const values = data && data.length > 0 ? data : [0]
  const max = Math.max.apply(null, values.concat([1]))
  const min = Math.min.apply(null, values.concat([0]))
  const range = max - min || 1
  const c = color || 'var(--accent)'
  const glowColor = c.startsWith('#') ? `${c}66` : c

  const points = values.map(function (v, i) {
    const x = (i / (values.length - 1 || 1)) * w
    const y = h - ((v - min) / range) * h
    return { x: x, y: y }
  })

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L${w},${h} L0,${h} Z`

  return (
    <svg width={w} height={h} style={{ flexShrink: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sparkline-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.28" />
          <stop offset="100%" stopColor={c} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#sparkline-grad-${gradientId})`}
        stroke="none"
      />
      <path
        d={linePath}
        fill="none"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
      />
    </svg>
  )
}

export default Sparkline