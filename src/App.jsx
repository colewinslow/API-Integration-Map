import { useState, useMemo } from 'react'
import { PLATFORMS, FIELD_MAPPINGS, getMappingKey } from './crmData'

const platformIds = Object.keys(PLATFORMS)

export default function App() {
  const [mode, setMode] = useState('explore')
  const [explorePlatform, setExplorePlatform] = useState(null)
  const [platformA, setPlatformA] = useState(null)
  const [platformB, setPlatformB] = useState(null)

  // Import state
  const [importText, setImportText] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState(null)
  const [importedApi, setImportedApi] = useState(null)

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

  async function handleImportParse(text) {
    if (!text.trim()) {
      setImportError('Paste some API documentation or enter a URL first.')
      return
    }
    setImportLoading(true)
    setImportError(null)
    setImportedApi(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Extract all API endpoints, data objects, webhook events, auth methods, and rate limits from this documentation. Return ONLY valid JSON with no preamble or backticks, structured as: { "name": "API Name", "baseUrl": "", "auth": "", "rateLimits": "", "endpoints": [{"method":"GET|POST|PUT|PATCH|DELETE","path":"","description":""}], "dataObjects": [{"name":"","fields":[]}], "webhooks": [{"event":"","description":"","payload":[]}] }\n\nDocumentation:\n${text}`
          }]
        })
      })

      if (!response.ok) {
        const err = await response.text()
        throw new Error(`API request failed (${response.status}): ${err}`)
      }

      const data = await response.json()
      const content = data.content?.[0]?.text
      if (!content) throw new Error('No response content from API')

      const parsed = JSON.parse(content)
      setImportedApi(parsed)
    } catch (e) {
      setImportError(e.message)
    } finally {
      setImportLoading(false)
    }
  }

  async function handleFetchUrl() {
    if (!importUrl.trim()) {
      setImportError('Enter a URL to fetch.')
      return
    }
    setImportLoading(true)
    setImportError(null)

    try {
      const response = await fetch(importUrl)
      if (!response.ok) throw new Error(`Failed to fetch URL (${response.status})`)
      const text = await response.text()
      setImportText(text.slice(0, 50000))
      setImportLoading(false)
      await handleImportParse(text.slice(0, 50000))
    } catch (e) {
      setImportError(`Could not fetch URL: ${e.message}`)
      setImportLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Integration<em>Map</em></h1>
        <p className="header-subtitle">
          Explore CRM APIs, compare how platforms connect, or import any API documentation.
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
        <button
          className={`tab-btn ${mode === 'import' ? 'active' : ''}`}
          onClick={() => handleTabChange('import')}
        >
          <TabIcon type="import" />
          Import
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

      {/* =================== IMPORT MODE =================== */}
      {mode === 'import' && (
        <div className="mode-content" key="import">
          <div className="import-section">
            <p className="import-intro">
              Paste raw API documentation, a JSON spec, or an OpenAPI definition below.
              It will be parsed and displayed in the same format as the built-in platforms.
            </p>

            <div className="import-url-row">
              <input
                type="url"
                className="import-url-input"
                placeholder="Or enter a URL to API docs..."
                value={importUrl}
                onChange={e => setImportUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
              />
              <button
                className="import-fetch-btn"
                onClick={handleFetchUrl}
                disabled={importLoading}
              >
                Fetch
              </button>
            </div>

            <textarea
              className="import-textarea"
              placeholder="Paste API documentation, OpenAPI spec, or JSON here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              rows={10}
            />

            <div className="import-actions">
              <button
                className="import-parse-btn"
                onClick={() => handleImportParse(importText)}
                disabled={importLoading}
              >
                {importLoading ? (
                  <>
                    <span className="spinner" />
                    Parsing...
                  </>
                ) : (
                  'Parse with Claude'
                )}
              </button>
              {importedApi && (
                <button
                  className="import-clear-btn"
                  onClick={() => { setImportedApi(null); setImportText(''); setImportUrl(''); setImportError(null) }}
                >
                  Clear
                </button>
              )}
            </div>

            {importError && (
              <div className="import-error">
                {importError}
              </div>
            )}
          </div>

          {importedApi && (
            <ImportedApiView api={importedApi} />
          )}

          {!importedApi && !importLoading && (
            <div className="empty-state" style={{ marginTop: 24 }}>
              <svg className="empty-icon" viewBox="0 0 64 64" fill="none">
                <rect x="16" y="12" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M24 24h16M24 30h16M24 36h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M32 4v8M28 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>Import any API</p>
              <p>Paste documentation or an OpenAPI spec and it will be parsed into a structured view.</p>
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

/* =================== IMPORTED API VIEW =================== */
function ImportedApiView({ api }) {
  const color = '#4a6cf0'

  return (
    <div className="map-container" style={{ marginTop: 24 }}>
      <div className="single-platform-header">
        <div className="single-platform-info">
          <span className="platform-summary-dot" style={{ background: color }} />
          <div>
            <h2 className="single-platform-name">{api.name || 'Imported API'}</h2>
          </div>
        </div>
        <div className="single-platform-meta">
          {api.baseUrl && (
            <div className="meta-item">
              <span className="meta-label">Base URL</span>
              <span className="meta-value mono">{api.baseUrl}</span>
            </div>
          )}
          {api.auth && (
            <div className="meta-item">
              <span className="meta-label">Authentication</span>
              <span className="meta-value mono">{api.auth}</span>
            </div>
          )}
          {api.rateLimits && (
            <div className="meta-item">
              <span className="meta-label">Rate Limits</span>
              <span className="meta-value mono">{api.rateLimits}</span>
            </div>
          )}
        </div>
      </div>

      {/* Data Objects */}
      {api.dataObjects?.length > 0 && (
        <div className="section-block">
          <SectionHeader title="Data Objects" />
          <div className="objects-grid">
            {api.dataObjects.map((obj, i) => (
              <div className="object-card" key={i}>
                <div className="object-card-header">
                  <span className="object-card-name" style={{ color }}>{obj.name}</span>
                  <span className="object-card-count">{obj.fields?.length || 0} fields</span>
                </div>
                {obj.fields?.length > 0 && (
                  <div className="field-list">
                    {obj.fields.map((f, j) => (
                      <span className="field-tag" key={j}>{typeof f === 'string' ? f : f.name || JSON.stringify(f)}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Endpoints */}
      {api.endpoints?.length > 0 && (
        <div className="section-block">
          <SectionHeader title="API Endpoints" />
          <div className="endpoint-panel single-panel">
            <div className="panel-header">
              <span className="dot" style={{ background: color }} />
              <span className="panel-header-name">{api.name || 'API'}</span>
              {api.auth && <span className="panel-header-meta">{api.auth}</span>}
            </div>
            <div className="endpoint-list">
              {api.endpoints.map((ep, i) => (
                <div className="endpoint-row" key={i}>
                  <span className={`method-badge ${(ep.method || 'GET').toUpperCase()}`}>
                    {(ep.method || 'GET').toUpperCase()}
                  </span>
                  <span className="endpoint-path">{ep.path}</span>
                  <span className="endpoint-desc">{ep.description || ep.desc || ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Webhooks */}
      {api.webhooks?.length > 0 && (
        <div className="section-block">
          <SectionHeader title="Webhook Events" />
          <div className="webhook-panel single-panel">
            <div className="panel-header">
              <span className="dot" style={{ background: color }} />
              <span className="panel-header-name">{api.name || 'API'} Webhooks</span>
            </div>
            <div className="webhook-list">
              {api.webhooks.map((wh, i) => (
                <div className="webhook-item" key={i}>
                  <div className="webhook-event">{wh.event}</div>
                  {(wh.description || wh.desc) && (
                    <div className="webhook-desc">{wh.description || wh.desc}</div>
                  )}
                  {wh.payload && (
                    <>
                      <div className="webhook-payload-label">Payload fields</div>
                      <div className="webhook-payload">
                        {(Array.isArray(wh.payload) ? wh.payload : Object.keys(wh.payload)).map((f, j) => (
                          <span className="payload-field" key={j}>{typeof f === 'string' ? f : JSON.stringify(f)}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
  if (type === 'compare') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="3" width="5" height="10" rx="1" /><rect x="10" y="3" width="5" height="10" rx="1" /><path d="M6 8h4" strokeDasharray="2 1" />
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="10" height="12" rx="1.5" /><path d="M6 6h4M6 9h4" /><path d="M8 0v2M6.5 0.5L8 2l1.5-1.5" />
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
