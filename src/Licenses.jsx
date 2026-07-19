import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronDown, Info } from 'lucide-react';

const LICENSES = [
  {
    name: 'React',
    license: 'MIT',
    category: 'UI Framework',
    description: 'A JavaScript library for building user interfaces.',
    attribution: 'Copyright (c) Meta Platforms, Inc. and affiliates.'
  },
  {
    name: 'Vite',
    license: 'MIT',
    category: 'Build Tool',
    description: 'Next generation frontend tooling. It\'s fast!',
    attribution: 'Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors.'
  },
  {
    name: 'Supabase',
    license: 'MIT',
    category: 'Backend / Database',
    description: 'An open source Firebase alternative. Provides auth, database, and storage.',
    attribution: 'Copyright (c) 2020 Supabase, Inc.'
  },
  {
    name: 'Framer Motion',
    license: 'MIT',
    category: 'Animation',
    description: 'A production-ready motion library for React.',
    attribution: 'Copyright (c) 2018 Framer B.V.'
  },
  {
    name: 'Lucide React',
    license: 'ISC',
    category: 'Iconography',
    description: 'Beautiful & consistent icon toolkit.',
    attribution: 'Copyright (c) 2020, Lucide Contributors.'
  },
  {
    name: 'Capacitor',
    license: 'MIT',
    category: 'Cross-Platform',
    description: 'Build cross-platform Native Progressive Web Apps.',
    attribution: 'Copyright (c) 2017-present Drifty Co.'
  },
  {
    name: 'React Router',
    license: 'MIT',
    category: 'Routing',
    description: 'Declarative routing for React applications.',
    attribution: 'Copyright (c) React Training 2015-2019, Remix Software 2020-2022.'
  }
];

export default function Licenses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState({});

  const handleBack = () => {
    // Safely navigate back using the app's existing history stack
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Fallback to About ATLAS if no history exists
      navigate('/about');
    }
  };

  const filteredLicenses = useMemo(() => {
    if (!query.trim()) return LICENSES;
    const lowerQuery = query.toLowerCase();
    return LICENSES.filter(l => 
      l.name.toLowerCase().includes(lowerQuery) ||
      l.license.toLowerCase().includes(lowerQuery) ||
      l.category.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const toggleExpand = (name) => {
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="atlas-licenses-container">
      <style>{`
        .atlas-licenses-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          width: 100%;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          font-family: 'Inter', sans-serif;
          color: var(--text);
        }
        .atlas-licenses-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 8px;
        }
        .atlas-licenses-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--surface-2);
          color: var(--text);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s;
        }
        .atlas-licenses-back-btn:hover, .atlas-licenses-back-btn:focus-visible {
          background: var(--surface);
          border-color: var(--accent);
          outline: none;
        }
        .atlas-licenses-title-block {
          flex: 1;
          min-width: 0;
        }
        .atlas-licenses-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .atlas-licenses-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 4px 0 0 0;
        }
        
        .atlas-licenses-intro {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .atlas-licenses-notice {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--text-muted);
        }
        
        .atlas-licenses-search-wrap {
          position: relative;
          width: 100%;
        }
        .atlas-licenses-search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .atlas-licenses-search {
          width: 100%;
          padding: 12px 16px 12px 44px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .atlas-licenses-search:focus {
          border-color: var(--accent);
        }
        
        .atlas-licenses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .atlas-license-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .atlas-license-card:hover {
          border-color: var(--accent);
        }
        .atlas-license-card-header {
          padding: 20px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          color: inherit;
          font-family: inherit;
        }
        .atlas-license-info {
          flex: 1;
          min-width: 0;
        }
        .atlas-license-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .atlas-license-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
        }
        .atlas-license-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(124, 92, 255, 0.15);
          color: var(--accent);
          border: 1px solid rgba(124, 92, 255, 0.25);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .atlas-license-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .atlas-license-category {
          font-size: 11px;
          color: var(--text-muted);
          opacity: 0.7;
          margin-top: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .atlas-license-chevron {
          color: var(--text-muted);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .atlas-license-chevron.expanded {
          transform: rotate(180deg);
        }
        
        .atlas-license-details-inner {
          padding: 0 20px 20px 20px;
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .atlas-license-details-content {
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        
        .atlas-licenses-footer {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.6;
        }
        
        .atlas-licenses-empty {
          text-align: center;
          padding: 48px 20px;
          color: var(--text-muted);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
        }
        
        @media (max-width: 640px) {
          .atlas-licenses-grid {
            grid-template-columns: 1fr;
          }
          .atlas-licenses-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="atlas-licenses-header">
        <button 
          className="atlas-licenses-back-btn" 
          onClick={handleBack}
          aria-label="Go back to About ATLAS"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="atlas-licenses-title-block">
          <h1 className="atlas-licenses-title">Open Source Licenses</h1>
          <p className="atlas-licenses-subtitle">The open-source technologies that help power ATLAS.</p>
        </div>
      </div>

      {/* Intro */}
      <div className="atlas-licenses-intro">
        ATLAS is built with and depends upon open-source software. We sincerely acknowledge and appreciate the developers, maintainers, and communities behind these technologies for their invaluable contributions.
        <div className="atlas-licenses-notice">
          <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            Individual open-source components remain subject to their respective licenses and copyright notices. The inclusion of these projects does not imply endorsement of ATLAS by their maintainers.
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="atlas-licenses-search-wrap">
        <Search size={16} className="atlas-licenses-search-icon" />
        <input 
          type="text"
          className="atlas-licenses-search"
          placeholder="Search dependencies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search open source licenses"
        />
      </div>

      {/* List */}
      {filteredLicenses.length === 0 ? (
        <div className="atlas-licenses-empty">
          No licenses found matching "{query}".
        </div>
      ) : (
        <div className="atlas-licenses-grid">
          {filteredLicenses.map((lib) => (
            <div key={lib.name} className="atlas-license-card">
              <button 
                className="atlas-license-card-header"
                onClick={() => toggleExpand(lib.name)}
                aria-expanded={!!expanded[lib.name]}
                aria-controls={`details-${lib.name.replace(/\s+/g, '-')}`}
              >
                <div className="atlas-license-info">
                  <div className="atlas-license-top">
                    <span className="atlas-license-name">{lib.name}</span>
                    <span className="atlas-license-badge">{lib.license}</span>
                  </div>
                  <p className="atlas-license-desc">{lib.description}</p>
                  <div className="atlas-license-category">{lib.category}</div>
                </div>
                <ChevronDown 
                  size={18} 
                  className={`atlas-license-chevron ${expanded[lib.name] ? 'expanded' : ''}`}
                />
              </button>
              
              <AnimatePresence initial={false}>
                {expanded[lib.name] && (
                  <motion.div 
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="atlas-license-details-inner" id={`details-${lib.name.replace(/\s+/g, '-')}`}>
                      <div className="atlas-license-details-content">
                        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Attribution</strong>
                        {lib.attribution}
                        <br /><br />
                        This package is distributed under the {lib.license} license.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="atlas-licenses-footer">
        Open-source projects listed remain the property of their respective copyright holders. Trademarks belong to their respective owners. Each open-source component is distributed or used according to its applicable license terms.
      </div>
    </div>
  );
}