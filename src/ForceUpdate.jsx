import React, { useState } from 'react'
import './ForceUpdate.css'

function ForceUpdate({ updateInfo }) {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleUpdate = () => {
    if (updateInfo?.update_url) {
      setIsRedirecting(true)
      window.location.href = updateInfo.update_url
    }
  }

  return (
    <div className="force-update-page" role="dialog" aria-labelledby="force-update-heading" aria-modal="true">
      {/* Ambient background */}
      <div className="fu-field" aria-hidden="true" />
      <div className="fu-glow fu-glow-a" aria-hidden="true" />
      <div className="fu-glow fu-glow-b" aria-hidden="true" />
      <div className="fu-grain" aria-hidden="true" />

      <div className="fu-stage">

        {/* Hero */}
        <div className="fu-hero">
          <div className="fu-logo" aria-hidden="true">
            <div className="fu-logo-border"></div>
            <div className="fu-logo-core">
              <img src="/pwa-512x512.png" alt="" className="fu-logo-img" />
            </div>
          </div>

          <div className="fu-badge">
            <span className="fu-badge-dot"></span>
            <span>New release available</span>
          </div>

          <h1 id="force-update-heading" className="fu-title">
            Atlas Has Evolved
          </h1>

          <p className="fu-description">
            A required update is ready. It brings a faster core, tighter security,
            and a refined interface throughout Atlas.
          </p>
        </div>

        {/* Version comparison */}
        <div className="fu-version" role="group" aria-label="Version comparison">
          <div className="fu-version-item">
            <span className="fu-version-label">Current</span>
            <span className="fu-version-number fu-version-number--current">
              v{updateInfo?.current_version || '1.0.0'}
            </span>
          </div>

          <div className="fu-version-track" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <polyline points="14 6 20 12 14 18"></polyline>
            </svg>
          </div>

          <div className="fu-version-item fu-version-item--latest">
            <span className="fu-version-label">Latest</span>
            <span className="fu-version-number fu-version-number--latest">
              v{updateInfo?.latest_version}
            </span>
          </div>
        </div>

        {/* Single release notes panel */}
        <div className="fu-panel" aria-label="What's new in this release">
          <span className="fu-panel-heading">What's new</span>

          <ul className="fu-panel-list">
            <li className="fu-panel-row">
              <span className="fu-panel-icon" aria-hidden="true">⚡</span>
              <span className="fu-panel-text">Faster performance</span>
            </li>
            <li className="fu-panel-row">
              <span className="fu-panel-icon" aria-hidden="true">🛡</span>
              <span className="fu-panel-text">Security improvements</span>
            </li>
            <li className="fu-panel-row">
              <span className="fu-panel-icon" aria-hidden="true">✨</span>
              <span className="fu-panel-text">UI refinements</span>
            </li>
            <li className="fu-panel-row">
              <span className="fu-panel-icon" aria-hidden="true">🚀</span>
              <span className="fu-panel-text">Productivity enhancements</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        {updateInfo?.update_url ? (
          <button
            className="fu-cta"
            onClick={handleUpdate}
            disabled={isRedirecting}
            aria-label="Update Atlas now"
          >
            <span className="fu-cta-ripple" aria-hidden="true"></span>
            {isRedirecting ? (
              <span className="fu-cta-loader" aria-hidden="true"></span>
            ) : (
              <span className="fu-cta-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Update Atlas</span>
                <svg className="fu-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            )}
          </button>
        ) : (
          <div className="fu-contact">
            Please contact the Atlas developer to receive the latest version.
          </div>
        )}

        <p className="fu-footer">
          Updating usually takes less than a minute.
        </p>
      </div>
    </div>
  )
}

export default ForceUpdate