function Skeleton({ height, width, radius, style }) {
  const h = height || '16px'
  const w = width || '100%'
  const r = radius || '8px'

  return (
    <div
      style={Object.assign({
        height: h,
        width: w,
        borderRadius: r,
        background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.4s ease-in-out infinite'
      }, style || {})}
    />
  )
}

export function SkeletonKpiRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
      {[0, 1, 2, 3].map(function (i) {
        return (
          <div key={i} className="card">
            <Skeleton width="30px" height="30px" radius="9px" style={{ marginBottom: '14px' }} />
            <Skeleton width="60%" height="28px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80%" height="12px" />
          </div>
        )
      })}
    </div>
  )
}

export function SkeletonLines({ count }) {
  const n = count || 3
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: n }).map(function (_, i) {
        return <Skeleton key={i} height="14px" width={i % 2 === 0 ? '90%' : '70%'} />
      })}
    </div>
  )
}

export default Skeleton