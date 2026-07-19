import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, X, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// STYLING — Premium CSS matching the ATLAS style token environment
// ============================================================================
const stylesCSS = `
  .licenses-container {
    max-width: 820px;
    margin: 0 auto;
    color: var(--text, #f5f5f7);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif;
    box-sizing: border-box;
  }

  .licenses-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
    padding-top: 8px;
  }

  .licenses-back-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    background-color: var(--surface, #131316);
    color: var(--text, #f5f5f7);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    flex-shrink: 0;
  }

  .licenses-back-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
    border-color: var(--text-muted, #71717a);
  }

  .licenses-back-btn:active {
    transform: scale(0.97);
  }

  .licenses-back-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
    outline-offset: 2px;
  }

  .licenses-header-content {
    flex: 1;
    min-width: 0;
  }

  .licenses-title {
    font-size: clamp(20px, 5vw, 26px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 6px 0;
    color: var(--text, #f5f5f7);
    line-height: 1.2;
  }

  .licenses-subtitle {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    margin: 0;
    line-height: 1.4;
  }

  .licenses-intro-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .licenses-intro-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-muted, #a1a1aa);
    margin: 0 0 12px 0;
  }

  .licenses-intro-text:last-child {
    margin-bottom: 0;
  }

  .licenses-search-wrapper {
    position: relative;
    margin-bottom: 24px;
  }

  .licenses-search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted, #71717a);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  .licenses-search-input {
    width: 100%;
    height: 44px;
    padding: 0 40px 0 40px;
    border-radius: 12px;
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    background-color: var(--surface, #131316);
    color: var(--text, #f5f5f7);
    font-size: 14px;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .licenses-search-input:focus {
    outline: none;
    border-color: var(--accent, #8b5cf6);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }

  .licenses-search-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: var(--text-muted, #71717a);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .licenses-search-clear:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
    color: var(--text, #f5f5f7);
  }

  .licenses-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 32px;
  }

  @media (min-width: 640px) {
    .licenses-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .license-card {
    background-color: var(--surface-2, #161618);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
    overflow: hidden;
  }

  .license-card:hover {
    border-color: var(--accent, #8b5cf6);
  }

  .license-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }

  .license-card-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: var(--text, #f5f5f7);
  }

  .license-badge {
    font-size: 10px;
    font-weight: 700;
    color: var(--accent, #8b5cf6);
    background-color: var(--accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid var(--accent-border, rgba(139, 92, 246, 0.25));
    padding: 2px 6px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .license-category {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent, #8b5cf6);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .license-description {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-muted, #a1a1aa);
    margin: 0 0 16px 0;
    flex: 1;
  }

  .license-card-footer {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 12px;
  }

  .license-expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: var(--text, #f5f5f7);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background-color 0.15s ease;
    margin-left: -12px;
  }

  .license-expand-btn:hover {
    background-color: var(--border, rgba(255, 255, 255, 0.08));
  }

  .license-expand-btn:focus-visible {
    outline: 2px solid var(--accent, #8b5cf6);
  }

  .license-details-panel {
    margin-top: 16px;
    border-top: 1px dashed var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 16px;
    animation: slideDown 0.15s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .license-copyright {
    font-size: 12px;
    font-weight: 600;
    color: var(--text, #f5f5f7);
    margin-bottom: 8px;
  }

  .license-text-box {
    background-color: var(--surface, #131316);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.05));
    border-radius: 8px;
    padding: 12px;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-muted, #71717a);
    max-height: 140px;
    overflow-y: auto;
    white-space: pre-wrap;
    box-sizing: border-box;
  }

  .licenses-empty-state {
    text-align: center;
    padding: 40px 16px;
    background-color: var(--surface-2, #161618);
    border: 1px dashed var(--border, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
  }

  .licenses-empty-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text, #f5f5f7);
    margin: 0 0 6px 0;
  }

  .licenses-empty-subtitle {
    font-size: 13px;
    color: var(--text-muted, #71717a);
    margin: 0;
  }

  .licenses-footer {
    border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
    padding-top: 24px;
    padding-bottom: 12px;
    text-align: center;
  }

  .licenses-footer-text {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-muted, #71717a);
    margin: 0 0 6px 0;
  }

  .licenses-footer-text:last-child {
    margin-bottom: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .licenses-back-btn, .license-card, .licenses-search-input, .license-expand-btn {
      transition: none !important;
    }
    .license-details-panel {
      animation: none !important;
    }
  }
`;

// ============================================================================
// DATA STRUCTURE — Clean, verifiable dependencies used in the ATLAS build
// ============================================================================
const DEPENDENCIES = [
  {
    id: "react",
    name: "React",
    license: "MIT",
    category: "UI Framework",
    description: "A JavaScript library for building component-based user interfaces.",
    copyright: "Copyright (c) Meta Platforms, Inc. and affiliates.",
    text: `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`
  },
  {
    id: "vite",
    name: "Vite",
    license: "MIT",
    category: "Build Tooling",
    description: "A fast, modern frontend build tool powering the development workflow and assets compilation.",
    copyright: "Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors",
    text: `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`
  },
  {
    id: "supabase",
    name: "Supabase JS",
    license: "MIT",
    category: "Backend Services",
    description: "Isomorphic Client library enabling interface connectivity with Supabase data models and edge functions.",
    copyright: "Copyright (c) 2020 Supabase",
    text: `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`
  },
  {
    id: "framer-motion",
    name: "Framer Motion",
    license: "MIT",
    category: "Animations",
    description: "A production-ready React motion library backing page transitions, gestures, and fluid layout physics.",
    copyright: "Copyright (c) 2018 Framer B.V.",
    text: `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`
  },
  {
    id: "lucide-react",
    name: "Lucide React",
    license: "ISC",
    category: "Graphics & Icons",
    description: "A community-designed open-source icon suite delivering modern UI graphics to layout sections.",
    copyright: "Copyright (c) 2022, Lucide Contributors",
    text: `Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS.`
  },
  {
    id: "capacitor",
    name: "Capacitor Runtime",
    license: "MIT",
    category: "Native Core",
    description: "A cross-platform native runtime enabling the ATLAS web layer to interface natively with Android and iOS APIs.",
    copyright: "Copyright (c) 2017-present Drifty Co.",
    text: `Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`
  }
];

// ============================================================================
// MAIN EXPORT
// ============================================================================
export default function Licenses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState({});

  const handleBack = () => {
    navigate('/about');
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredDependencies = useMemo(() => {
    if (!searchQuery.trim()) return DEPENDENCIES;
    const q = searchQuery.toLowerCase().trim();
    return DEPENDENCIES.filter(dep =>
      dep.name.toLowerCase().includes(q) ||
      dep.license.toLowerCase().includes(q) ||
      dep.category.toLowerCase().includes(q) ||
      dep.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="licenses-container">
      <style dangerouslySetInnerHTML={{ __html: stylesCSS }} />

      {/* ============================================================ HEADER */}
      <header className="licenses-header">
        <button
          className="licenses-back-btn"
          onClick={handleBack}
          aria-label="Navigate back to About ATLAS"
          title="Back to About"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="licenses-header-content">
          <h1 className="licenses-title">Open Source Licenses</h1>
          <p className="licenses-subtitle">
            The open-source technologies that help power ATLAS.
          </p>
        </div>
      </header>

      {/* ============================================================ INTRODUCTION */}
      <section className="licenses-intro-card" aria-labelledby="intro-title">
        <p className="licenses-intro-text">
          ATLAS is built using and depends on open-source software. We sincerely
          appreciate the developers, maintainers, and communities behind these
          projects for making their work freely available.
        </p>
        <p className="licenses-intro-text">
          Individual open-source components remain subject to their respective 
          licenses and copyright notices as detailed below.
        </p>
      </section>

      {/* ============================================================ SEARCH FILTERS */}
      <div className="licenses-search-wrapper">
        <span className="licenses-search-icon">
          <Search size={16} />
        </span>
        <input
          type="text"
          className="licenses-search-input"
          placeholder="Search libraries, categories, or licenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search open source dependencies"
        />
        {searchQuery && (
          <button
            className="licenses-search-clear"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search input"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ============================================================ LICENSE LIST */}
      {filteredDependencies.length > 0 ? (
        <div className="licenses-grid">
          {filteredDependencies.map((dep) => {
            const isExpanded = !!expandedIds[dep.id];
            return (
              <article key={dep.id} className="license-card">
                <div className="license-card-header">
                  <h2 className="license-card-title">{dep.name}</h2>
                  <span className="license-badge">{dep.license}</span>
                </div>
                <div className="license-category">{dep.category}</div>
                <p className="license-description">{dep.description}</p>
                <div className="license-card-footer">
                  <button
                    className="license-expand-btn"
                    onClick={() => toggleExpand(dep.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`details-${dep.id}`}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? "Hide License" : "View License"}
                  </button>
                </div>

                {isExpanded && (
                  <div id={`details-${dep.id}`} className="license-details-panel">
                    <div className="license-copyright">{dep.copyright}</div>
                    <pre className="license-text-box" tabIndex={0}>
                      {dep.text}
                    </pre>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="licenses-empty-state" role="status">
          <h3 className="licenses-empty-title">No matches found</h3>
          <p className="licenses-empty-subtitle">
            Try adjusting your search terms or keywords.
          </p>
        </div>
      )}

      {/* ============================================================ FOOTER */}
      <footer className="licenses-footer">
        <p className="licenses-footer-text">
          All listed open-source projects remain the property of their respective copyright holders.
        </p>
        <p className="licenses-footer-text">
          Trademarks belong to their respective owners. Inclusion of an open-source project does not 
          imply endorsement of ATLAS by that project's maintainers or organization.
        </p>
        <p className="licenses-footer-text">
          Each open-source component is distributed or used according to its applicable license terms.
        </p>
      </footer>
    </div>
  );
}