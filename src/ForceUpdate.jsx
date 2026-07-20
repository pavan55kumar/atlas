import './ForceUpdate.css'

function ForceUpdate({ updateInfo }) {
  const handleUpdate = () => {
    if (updateInfo?.update_url) {
      window.location.href = updateInfo.update_url
    }
  }

  return (
    <div className="force-update-page">
      {/* Animated Background */}
      <div className="force-update-aurora" />
      <div className="force-update-glow glow-1" />
      <div className="force-update-glow glow-2" />
      <div className="force-update-noise" />

      <div className="force-update-card">
        {/* Logo */}
        <div className="force-update-logo">
          <div className="logo-ring">
            <div className="logo-inner">A</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="force-update-title">
          Atlas Has Evolved
        </h1>

        {/* Subtitle */}
        <p className="force-update-description">
          A newer version of Atlas is available with performance improvements,
          bug fixes, and new productivity features.

          <br />
          <br />

          Updating is required before continuing.
        </p>

        {/* Version */}
        {updateInfo?.latest_version && (
          <div className="force-update-version">
            <span>Latest Version</span>
            <strong>{updateInfo.latest_version}</strong>
          </div>
        )}

        {/* What's New */}
        <div className="force-update-features">
          <div className="feature">
            <span>⚡</span>
            <p>Faster performance</p>
          </div>

          <div className="feature">
            <span>🛡️</span>
            <p>Improved stability</p>
          </div>

          <div className="feature">
            <span>✨</span>
            <p>Premium interface improvements</p>
          </div>

          <div className="feature">
            <span>🚀</span>
            <p>New productivity features</p>
          </div>
        </div>

        {/* Button */}
        {updateInfo?.update_url ? (
          <button
            className="force-update-button"
            onClick={handleUpdate}
          >
            Update Atlas
          </button>
        ) : (
          <div className="force-update-contact">
            Please contact the Atlas developer to receive the latest version.
          </div>
        )}

        <p className="force-update-footer">
          Updating takes less than a minute.
        </p>
      </div>
    </div>
  )
}

export default ForceUpdate