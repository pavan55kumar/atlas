function Sparkline({ data, width, height, color }) {
  const w = width || 72
  const h = height || 26
  const values = data && data.length > 0 ? data : [0]
  const max = Math.max.apply(null, values.concat([1]))
  const min = Math.min.apply(null, values.concat([0]))
  const range = max - min || 1

  const points = values.map(function (v, i) {
    const x = (i / (values.length - 1 || 1)) * w
    const y = h - ((v - min) / range) * h
    return x + ',' + y
  }).join(' ')

  const areaPoints = points + ' ' + w + ',' + h + ' 0,' + h

  return (
    <svg width={w} height={h} style={{ flexShrink: 0, overflow: 'visible' }}>
      <polyline points={areaPoints} fill={color || 'var(--accent)'} opacity="0.12" stroke="none" />
      <polyline points={points} fill="none" stroke={color || 'var(--accent)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Sparkline