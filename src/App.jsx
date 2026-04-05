import { useState, useMemo } from 'react'
import { PLATFORMS, FIELD_MAPPINGS, getMappingKey } from './crmData'

const platformIds = Object.keys(PLATFORMS)

export default function App() {
  const [mode, setMode] = useState('explore')
  const [explorePlatform, setExplorePlatform] = useState(null)
  const [platformA, setPlatformA] = useState(null)
  const [platformB, setPlatformB] = useState(null)

  const mapping = useMemo(() => {
    if (!platformA || !platformB) return null
    const result = getMappingKey(platformA, platformB)
    if (!result) return null
    return {
      data: FIELD_MAPPINGS[result.key],
      reversed: result.reversed,
      left: result.reversed ? PLATFORMS[platformB] : PLATFORMS[platformA],
      right: result.reversed ? PLATFORMS[platformA] : PLATFORMS[platformB],
    }
  }, [platformA, platformB])

  const pA = platformA ? PLATFORMS[platformA] : null
  const pB = platformB ? PLATFORMS[platformB] : null

  function handleCompareWith(platformId) {
    setPlatformA(platformId)
    setPlatformB(null)
    setMode('compare')
  }

  function handleTabChange(newMode) {
    setMode(newMode)
    if (newMode === 'explore') {
      // keep explorePlatform
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Integration<em>Map</em></h1>
        <p className="header-subtitle">
          Explore CRM APIs and compare how platforms connect.
        </p>
      </header>

      {/* TAB NAVIGATION */}
      <nav className="tab-bar">
        <button
          className={`tab-btn ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => handleTabChange('explore')}
        >
          <TabIcon type="explore" />
          Explore
        </button>
        <button
          className={`tab-btn ${mode === 'compare' ? 'active' : ''}`}
          onClick={() => handleTabChange('compare')}
        >
          <TabIcon type="compare" />
          Compare
        </button>
      </nav>

      {/* =================== EXPLORE MODE =================== */}
      {mode === 'explore' && (
        <div className="mode-content" key="explore">
          <div className="selector-section">
            <span className="selector-label">Choose a platform to explore</span>
            <div className="platform-options">
              {platformIds.map(id => {
                const p = PLATFORMS[id]
                const isSelected = explorePlatform === id
                return (
                  <button
                    key={id}
                    className={`platform-btn ${isSelected ? 'selected' : ''}`}
                    style={isSelected ? { borderColor: p.color + '88' } : {}}
                    onClick={() => setExplorePlatform(isSelected ? null : id)}
                  >
                    <span className="platform-dot" style={{ background: p.color }} />
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>

          {explorePlatform ? (
            <SinglePlatformView
              platform={PLATFORMS[explorePlatform]}
              onCompareWith={() => handleCompareWith(explorePlatform)}
            />
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="16" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 26h40" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="18" cy="21" r="2" fill="currentColor" opacity="0.3" />
                <circle cx="24" cy="21" r="2" fill="currentColor" opacity="0.3" />
              </svg>
              <p>Select a platform to explore its API</p>
              <p>View endpoints, data objects, webhooks, and authentication details.</p>
            </div>
          )}
        </div>
      )}

      {/* =================== COMPARE MODE =================== */}
      {mode === 'compare' && (
        <div className="mode-content" key="compare">
          <div className="selector-section">
            <div className="selector-row">
              <div className="selector-group">
                <span className="selector-label">Platform A</span>
                <div className="platform-options">
                  {platformIds.map(id => {
                    const p = PLATFORMS[id]
                    const isSelected = platformA === id
                    const isDisabled = platformB === id
                    return (
                      <button
                        key={id}
                        className={`platform-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        style={isSelected ? { borderColor: p.color + '88' } : {}}
                        onClick={() => setPlatformA(isSelected ? null : id)}
                      >
                        <span className="platform-dot" style={{ background: p.color }} />
                        {p.short}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="selector-divider">
                <div className="selector-divider-inner">↔</div>
              </div>

              <div className="selector-group">
                <span className="selector-label">Platform B</span>
                <div className="platform-options">
                  {platformIds.map(id => {
                    const p = PLATFORMS[id]
                    const isSelected = platformB === id
                    const isDisabled = platformA === id
                    return (
                      <button
                        key={id}
                        className={`platform-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        style={isSelected ? { borderColor: p.color + '88' } : {}}
                        onClick={() => setPlatformB(isSelected ? null : id)}
                      >
                        <span className="platform-dot" style={{ background: p.color }} />
                        {p.short}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {pA && pB && (
              <div className="platform-summary">
                <PlatformSummaryCard platform={pA} />
                <PlatformSummaryCard platform={pB} />
              </div>
            )}
          </div>

          {mapping ? (
            <div className="map-container" key={`${platformA}-${platformB}`}>
              <div className="section-block">
                <SectionHeader title="Data Object Mappings" />
                <p className="section-desc">
                  How records in {mapping.left.short} correspond to records in {mapping.right.short}.
                  Field names show which properties map to each other.
                </p>
                <div className="mappings-grid">
                  {mapping.data.mappings.map((m, i) => (
                    <div className="mapping-card" key={i}>
                      <div className="mapping-left">
                        <div className="mapping-object-label">{mapping.left.short}</div>
                        <div className="mapping-object" style={{ color: mapping.left.color }}>{m.from}</div>
                        <div className="field-list">
                          {Object.keys(m.fields).map(f => (
                            <span className="field-tag from" key={f}>{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mapping-arrow">
                        <span className="mapping-arrow-icon">→</span>
                        <span className={`confidence-badge ${m.confidence}`}>{m.confidence}</span>
                      </div>
                      <div className="mapping-right">
                        <div className="mapping-object-label">{mapping.right.short}</div>
                        <div className="mapping-object" style={{ color: mapping.right.color }}>{m.to}</div>
                        <div className="field-list">
                          {Object.values(m.fields).map(f => (
                            <span className="field-tag" key={f}>{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-block">
                <SectionHeader title="API Endpoints" />
                <p className="section-desc">
                  The REST endpoints you'd use to read and write data on each platform.
                </p>
                <div className="endpoints-columns">
                  <EndpointPanel platform={mapping.left} />
                  <EndpointPanel platform={mapping.right} />
                </div>
              </div>

              <div className="section-block">
                <SectionHeader title="Webhook Events" />
                <p className="section-desc">
                  Events each platform fires when data changes — the triggers that drive real-time sync.
                </p>
                <div className="webhooks-columns">
                  <WebhookPanel platform={mapping.left} />
                  <WebhookPanel platform={mapping.right} />
                </div>
              </div>

              <div className="section-block">
                <SectionHeader title="Sync Conflicts & Gotchas" />
                <p className="section-desc">
                  Known issues when syncing data between these two platforms — the problems
                  you only find after building the integration.
                </p>
                <div className="conflicts-grid">
                  {mapping.data.conflicts.map((c, i) => (
                    <div className="conflict-card" key={i}>
                      <span className="conflict-type">{c.type}</span>
                      <p className="conflict-desc">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 64 64" fill="none">
                <circle cx="20" cy="32" r="11" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="44" cy="32" r="11" stroke="currentColor" strokeWidth="1.5" />
                <path d="M31 32h2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              </svg>
              <p>Select two platforms to compare</p>
              <p>You'll see how their data objects, endpoints, webhooks, and sync conflicts line up.</p>
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>
          Built by <a href="https://colewinslow.com" target="_blank" rel="noopener">Cole Winslow</a> · Based on real integration experience
        </p>
      </footer>
    </div>
  )
}

/* =================== SINGLE PLATFORM VIEW =================== */
function SinglePlatformView({ platform, onCompareWith }) {
  return (
    <div className="map-container">
      {/* Platform header card */}
      <div className="single-platform-header">
        <div className="single-platform-info">
          <span className="platform-summary-dot" style={{ background: platform.color }} />
          <div>
            <h2 className="single-platform-name">{platform.name}</h2>
            <p className="single-platform-desc">{platform.description}</p>
          </div>
        </div>
        <div className="single-platform-meta">
          <div className="meta-item">
            <span className="meta-label">Base URL</span>
            <span className="meta-value mono">{platform.baseUrl}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Authentication</span>
            <span className="meta-value mono">{platform.authType}</span>
          </div>
        </div>
        <button className="compare-with-btn" onClick={onCompareWith}>
          Compare with another platform →
        </button>
      </div>

      {/* Data Objects */}
      <div className="section-block">
        <SectionHeader title="Data Objects" />
        <p className="section-desc">
          The core record types in {platform.short} and the fields available on each.
        </p>
        <div className="objects-grid">
          {platform.objects.map((obj, i) => (
            <div className="object-card" key={i}>
              <div className="object-card-header">
                <span className="object-card-name" style={{ color: platform.color }}>{obj.label}</span>
                <span className="object-card-count">{obj.fields.length} fields</span>
              </div>
              <div className="field-list">
                {obj.fields.map(f => (
                  <span className="field-tag" key={f}>{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div className="section-block">
        <SectionHeader title="API Endpoints" />
        <p className="section-desc">
          REST endpoints for reading and writing {platform.short} data.
        </p>
        <div className="endpoint-panel single-panel">
          <div className="panel-header">
            <span className="dot" style={{ background: platform.color }} />
            <span className="panel-header-name">{platform.short}</span>
            <span className="panel-header-meta">{platform.authType}</span>
          </div>
          <div className="endpoint-list">
            {platform.endpoints.map((ep, i) => (
              <div className="endpoint-row" key={i}>
                <span className={`method-badge ${ep.method}`}>{ep.method}</span>
                <span className="endpoint-path">{ep.path}</span>
                <span className="endpoint-desc">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Webhooks */}
      <div className="section-block">
        <SectionHeader title="Webhook Events" />
        <p className="section-desc">
          Events {platform.short} fires when data changes — useful for building real-time integrations.
        </p>
        <div className="webhook-panel single-panel">
          <div className="panel-header">
            <span className="dot" style={{ background: platform.color }} />
            <span className="panel-header-name">{platform.short} Webhooks</span>
          </div>
          <div className="webhook-list">
            {platform.webhooks.map((wh, i) => (
              <div className="webhook-item" key={i}>
                <div className="webhook-event">{wh.event}</div>
                <div className="webhook-desc">{wh.desc}</div>
                <div className="webhook-payload-label">Payload fields</div>
                <div className="webhook-payload">
                  {wh.payload.map(f => (
                    <span className="payload-field" key={f}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =================== SHARED COMPONENTS =================== */
function TabIcon({ type }) {
  if (type === 'explore') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="3" width="5" height="10" rx="1" /><rect x="10" y="3" width="5" height="10" rx="1" /><path d="M6 8h4" strokeDasharray="2 1" />
    </svg>
  )
}

function PlatformSummaryCard({ platform }) {
  return (
    <div className="platform-summary-card">
      <span className="platform-summary-dot" style={{ background: platform.color }} />
      <div className="platform-summary-info">
        <div className="platform-summary-name">{platform.name}</div>
        <div className="platform-summary-desc">{platform.description}</div>
        <div className="platform-summary-meta">
          <span>{platform.authType}</span>
          <span>{platform.baseUrl}</span>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <div className="line" />
    </div>
  )
}

function EndpointPanel({ platform }) {
  return (
    <div className="endpoint-panel">
      <div className="panel-header">
        <span className="dot" style={{ background: platform.color }} />
        <span className="panel-header-name">{platform.short}</span>
        <span className="panel-header-meta">{platform.authType}</span>
      </div>
      <div className="endpoint-list">
        {platform.endpoints.map((ep, i) => (
          <div className="endpoint-row" key={i}>
            <span className={`method-badge ${ep.method}`}>{ep.method}</span>
            <span className="endpoint-path">{ep.path}</span>
            <span className="endpoint-desc">{ep.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebhookPanel({ platform }) {
  return (
    <div className="webhook-panel">
      <div className="panel-header">
        <span className="dot" style={{ background: platform.color }} />
        <span className="panel-header-name">{platform.short} Webhooks</span>
      </div>
      <div className="webhook-list">
        {platform.webhooks.map((wh, i) => (
          <div className="webhook-item" key={i}>
            <div className="webhook-event">{wh.event}</div>
            <div className="webhook-desc">{wh.desc}</div>
            <div className="webhook-payload-label">Payload fields</div>
            <div className="webhook-payload">
              {wh.payload.map(f => (
                <span className="payload-field" key={f}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
