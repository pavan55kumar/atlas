import React from 'react'

const skeletonCss = `
  .skeleton-shape {
    position: relative;
    overflow: hidden;
    background-color: var(--surface-2);
    border-radius: 8px;
    box-sizing: border-box;
  }
  
  .skeleton-shape::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(124, 58, 237, 0) 0%,
      rgba(124, 58, 237, 0.07) 40%,
      rgba(124, 58, 237, 0.12) 50%,
      rgba(124, 58, 237, 0.07) 60%,
      rgba(124, 58, 237, 0) 100%
    );
    animation: skeleton-shimmer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation-delay: inherit;
    will-change: transform;
  }
  
  @keyframes skeleton-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  
  @media (prefers-reduced-motion: reduce) {
    .skeleton-shape::after {
      animation: none;
      background: none;
    }
    
    .skeleton-shape {
      background-color: var(--surface-2);
      border: 1px solid var(--border);
    }
  }
`

function Skeleton({ height, width, radius, style }) {
  const h = height || '16px'
  const w = width || '100%'
  const r = radius || '8px'

  return (
    <>
      <style>{skeletonCss}</style>
      <div
        aria-hidden="true"
        className="skeleton-shape"
        style={Object.assign({
          height: h,
          width: w,
          borderRadius: r,
        }, style || {})}
      />
    </>
  )
}

export function SkeletonKpiRow() {
  const cards = [0, 1, 2, 3]
  
  return (
    <div 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '16px',
        width: '100%'
      }}
      aria-hidden="true"
    >
      {cards.map(function (i) {
        const delay = `${i * 0.12}s`
        return (
          <div 
            key={i} 
            className="card" 
            style={{ 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '160px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Skeleton width="44px" height="44px" radius="12px" style={{ animationDelay: delay }} />
              <Skeleton width="48px" height="48px" radius="50%" style={{ animationDelay: delay }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <Skeleton width="60%" height="12px" radius="4px" style={{ animationDelay: delay }} />
              <Skeleton width="85%" height="24px" radius="6px" style={{ animationDelay: delay }} />
              <Skeleton width="40%" height="10px" radius="4px" style={{ animationDelay: delay }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SkeletonLines({ count }) {
  const n = count || 3
  
  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
      aria-hidden="true"
    >
      {Array.from({ length: n }).map(function (_, i) {
        const delay = `${i * 0.1}s`
        return <Skeleton key={i} height="14px" width={i % 2 === 0 ? '90%' : '70%'} style={{ animationDelay: delay }} />
      })}
    </div>
  )
}

export default Skeleton