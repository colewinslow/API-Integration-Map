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
        <div className="header-tag">IntegrationMap</div>
        <h1>How CRMs <em>actually connect</em></h1>
        <p>
          Pick two platforms. See what data syncs, which endpoints handle it,
          where webhook payloads clash, and where conflicts hide.
        </p>
      </header>

      {/* PLATFORM SELECTORS */}
      <div className="selector-section">
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
                  style={isSelected ? { borderColor: p.color + '66' } : {}}
                  onClick={() => setPlatformA(isSelected ? null : id)}
                >
                  <span className="platform-dot" style={{ background: p.color }} />
                  {p.short}
                </button>
              )
            })}
          </div>
        </div>

        <div className="selector-divider">↔</div>

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
                  style={isSelected ? { borderColor: p.color + '66' } : {}}
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

      {/* INTEGRATION MAP */}
      {mapping ? (
        <div className="map-container" key={`${platformA}-${platformB}`}>
          {/* DATA MAPPINGS */}
          <SectionHeader title="Data Object Mappings" />
          <div className="mappings-grid">
            {mapping.data.mappings.map((m, i) => (
              <div className="mapping-card" key={i}>
                <div className="mapping-left">
                  <div className="mapping-object" style={{ color: mapping.left.color }}>{m.from}</div>
                  <div className="field-list">
                    {Object.keys(m.fields).map(f => (
                      <span className="field-tag from" key={f}>{f}</span>
                    ))}
                  </div>
                </div>
                <div className="mapping-arrow">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                  <span className={`confidence-badge ${m.confidence}`}>{m.confidence}</span>
                </div>
                <div className="mapping-right">
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

          {/* ENDPOINTS */}
          <SectionHeader title="API Endpoints" />
          <div className="endpoints-columns">
            <EndpointPanel platform={mapping.left} />
            <EndpointPanel platform={mapping.right} />
          </div>

          {/* WEBHOOKS */}
          <SectionHeader title="Webhook Events" />
          <div className="webhooks-columns">
            <WebhookPanel platform={mapping.left} />
            <WebhookPanel platform={mapping.right} />
          </div>

          {/* CONFLICTS */}
          <SectionHeader title="Sync Conflicts & Gotchas" />
          <div className="conflicts-grid">
            {mapping.data.conflicts.map((c, i) => (
              <div className="conflict-card" key={i}>
                <span className="conflict-type">{c.type}</span>
                <p className="conflict-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 64 64" fill="none">
            <circle cx="20" cy="32" r="10" stroke="#55556e" strokeWidth="1.5" />
            <circle cx="44" cy="32" r="10" stroke="#55556e" strokeWidth="1.5" />
            <path d="M30 32h4" stroke="#55556e" strokeWidth="1.5" strokeDasharray="2 2" />
          </svg>
          <p>Select two platforms above to see how they connect</p>
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
        {platform.short}
        <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {platform.authType}
        </span>
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
        {platform.short} Webhooks
      </div>
      <div className="webhook-list">
        {platform.webhooks.map((wh, i) => (
          <div className="webhook-item" key={i}>
            <div className="webhook-event">{wh.event}</div>
            <div className="webhook-desc">{wh.desc}</div>
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
