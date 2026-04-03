import { useState, useMemo } from 'react'
import { PLATFORMS, FIELD_MAPPINGS, getMappingKey } from './crmData'

const platformIds = Object.keys(PLATFORMS)

export default function App() {
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

  return (
    <div className="app">
      <header className="header">
        <h1>Integration<em>Map</em></h1>
        <p className="header-subtitle">
          Compare how CRM platforms connect — shared data objects, API endpoints,
          webhook payloads, and where sync conflicts happen.
        </p>
      </header>

      {/* PLATFORM SELECTORS */}
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

        {/* Show platform summaries when both are selected */}
        {pA && pB && (
          <div className="platform-summary">
            <PlatformSummaryCard platform={pA} />
            <PlatformSummaryCard platform={pB} />
          </div>
        )}
      </div>

      {/* INTEGRATION MAP */}
      {mapping ? (
        <div className="map-container" key={`${platformA}-${platformB}`}>
          {/* DATA MAPPINGS */}
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

          {/* ENDPOINTS */}
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

          {/* WEBHOOKS */}
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

          {/* CONFLICTS */}
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

      <footer className="footer">
        <p>
          Built by <a href="https://colewinslow.com" target="_blank" rel="noopener">Cole Winslow</a> · Based on real integration experience
        </p>
      </footer>
    </div>
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
