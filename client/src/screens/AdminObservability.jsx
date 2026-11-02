'use client';
import { useCallback, useEffect, useState } from 'react';
import api from '../api/axios';

function formatUptime(seconds = 0) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function AdminObservability({ token }) {
  const [activeTab, setActiveTab] = useState('traces'); // 'traces' | 'logs' | 'metrics'
  const [overview, setOverview] = useState(null);
  const [traces, setTraces] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Traces filters
  const [traceStatus, setTraceStatus] = useState('ALL');
  const [traceSlow, setTraceSlow] = useState(false);
  const [traceSearch, setTraceSearch] = useState('');

  // Logs filters
  const [logLevel, setLogLevel] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const [copiedId, setCopiedId] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const loadData = useCallback(async (isBackground = false) => {
    if (!token) return;
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const [overviewRes, tracesRes, logsRes] = await Promise.all([
        api.get('/admin/observability/overview', { headers }),
        api.get('/admin/observability/traces', {
          headers,
          params: {
            status: traceStatus,
            slowOnly: traceSlow,
            search: traceSearch.trim() || undefined,
            limit: 60,
          },
        }),
        api.get('/admin/observability/logs', {
          headers,
          params: {
            level: logLevel,
            search: logSearch.trim() || undefined,
            limit: 100,
          },
        }),
      ]);

      setOverview(overviewRes.data);
      setTraces(tracesRes.data.traces || []);
      setLogs(logsRes.data.logs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not fetch observability telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [headers, logLevel, logSearch, token, traceSearch, traceSlow, traceStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh interval (every 4 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const copyToClipboard = (text, id) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    }
  };

  const clearLogBuffer = async () => {
    if (!window.confirm('Clear all buffered logs from memory?')) return;
    try {
      await api.post('/admin/observability/logs/clear', {}, { headers });
      setNotice('Log buffer cleared successfully.');
      setTimeout(() => setNotice(''), 3000);
      loadData(true);
    } catch (err) {
      setError('Could not clear logs.');
    }
  };

  const exportLogsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `markethub-logs-${new Date().toISOString().slice(0, 19)}.json`);
    dl.click();
  };

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const metricsUrl = apiBase.replace(/\/api\/?$/, '') + '/metrics';

  return (
    <div className="obs-dashboard">
      {/* Top Banner / Toolbar */}
      <div className="obs-topbar">
        <div className="obs-topbar-title">
          <div className="obs-pulse-indicator">
            <span className="obs-pulse-dot" />
            <strong>TELEMETRY ACTIVE</strong>
          </div>
          <span className="obs-topbar-sub">OpenTelemetry Traces · Prometheus Metrics · Structured Logs</span>
        </div>
        <div className="obs-topbar-controls">
          <button
            type="button"
            className={`obs-btn-pill ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Auto-refresh every 4 seconds"
          >
            {autoRefresh ? '● Live polling (4s)' : '○ Polling paused'}
          </button>
          <button
            type="button"
            className="obs-btn-secondary"
            onClick={() => loadData(false)}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh now'}
          </button>
          <a
            href={metricsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="obs-btn-link"
            title="View raw Prometheus metrics endpoint"
          >
            /metrics ↗
          </a>
        </div>
      </div>

      {error && <div className="admin-alert error" role="alert">{error}</div>}
      {notice && <div className="admin-alert success" role="status">{notice}</div>}

      {/* KPI Cards Row */}
      <div className="obs-kpi-grid">
        {/* Card 1: System */}
        <div className="obs-kpi-card">
          <div className="obs-kpi-header">
            <span>SYSTEM & RUNTIME</span>
            <span className="obs-badge green">Healthy</span>
          </div>
          <div className="obs-kpi-main">
            <strong>{formatUptime(overview?.system?.uptimeSeconds)}</strong>
            <small>Uptime ({overview?.system?.nodeVersion || 'Node.js'})</small>
          </div>
          <div className="obs-kpi-footer">
            <span>Heap: <b>{overview?.system?.memory?.heapUsedMb || 0} MB</b></span>
            <span>RSS: <b>{overview?.system?.memory?.rssMb || 0} MB</b></span>
          </div>
        </div>

        {/* Card 2: Database */}
        <div className="obs-kpi-card">
          <div className="obs-kpi-header">
            <span>MONGODB ATLAS</span>
            <span className={`obs-badge ${overview?.database?.status === 'connected' ? 'green' : 'amber'}`}>
              {overview?.database?.status || 'Unknown'}
            </span>
          </div>
          <div className="obs-kpi-main">
            <strong>{overview?.database?.pingMs !== null && overview?.database?.pingMs >= 0 ? `${overview?.database?.pingMs} ms` : '—'}</strong>
            <small>Database Ping Latency</small>
          </div>
          <div className="obs-kpi-footer">
            <span>Docs: <b>{Number((overview?.counts?.products || 0) + (overview?.counts?.orders || 0) + (overview?.counts?.users || 0)).toLocaleString()}</b></span>
            <span>Cluster: <b>Atlas AWS</b></span>
          </div>
        </div>

        {/* Card 3: Requests & Error Rate */}
        <div className="obs-kpi-card">
          <div className="obs-kpi-header">
            <span>HTTP REQUESTS</span>
            <span className={`obs-badge ${Number(overview?.httpMetrics?.errorRatePercent || 0) < 5 ? 'green' : 'red'}`}>
              {overview?.httpMetrics?.errorRatePercent || 0}% Errors
            </span>
          </div>
          <div className="obs-kpi-main">
            <strong>{Number(overview?.httpMetrics?.totalRequests || 0).toLocaleString()}</strong>
            <small>Total Processed Requests</small>
          </div>
          <div className="obs-kpi-footer">
            <span>2xx: <b>{overview?.httpMetrics?.statusBreakdown?.['2xx'] || 0}</b></span>
            <span>4xx/5xx: <b>{(overview?.httpMetrics?.statusBreakdown?.['4xx'] || 0) + (overview?.httpMetrics?.statusBreakdown?.['5xx'] || 0)}</b></span>
          </div>
        </div>

        {/* Card 4: Latency & OTel */}
        <div className="obs-kpi-card">
          <div className="obs-kpi-header">
            <span>LATENCY & TRACING</span>
            <span className="obs-badge teal">OTel Active</span>
          </div>
          <div className="obs-kpi-main">
            <strong>{overview?.httpMetrics?.latency?.avgMs || 0} ms</strong>
            <small>Avg Latency (p95: {overview?.httpMetrics?.latency?.p95Ms || 0}ms)</small>
          </div>
          <div className="obs-kpi-footer">
            <span>Traces: <b>{traces.length} buffered</b></span>
            <span>Logs: <b>{overview?.logStats?.totalBuffered || 0}</b></span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="obs-main-card admin-card">
        <div className="obs-nav-tabs">
          <button
            type="button"
            className={`obs-tab-btn ${activeTab === 'traces' ? 'active' : ''}`}
            onClick={() => setActiveTab('traces')}
          >
            <span>Traces</span>
            <span className="obs-tab-count">{traces.length}</span>
          </button>
          <button
            type="button"
            className={`obs-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span>Structured Logs</span>
            <span className="obs-tab-count">{logs.length}</span>
          </button>
          <button
            type="button"
            className={`obs-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <span>Metrics & Engine</span>
          </button>
        </div>

        {/* TAB 1: TRACES */}
        {activeTab === 'traces' && (
          <div className="obs-tab-panel">
            <div className="obs-filter-bar">
              <div className="obs-filter-group">
                <span className="obs-filter-label">Filter:</span>
                {['ALL', '2xx', '4xx', '5xx'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`obs-chip ${traceStatus === st ? 'active' : ''}`}
                    onClick={() => setTraceStatus(st)}
                  >
                    {st}
                  </button>
                ))}
                <label className="obs-checkbox-label">
                  <input
                    type="checkbox"
                    checked={traceSlow}
                    onChange={(e) => setTraceSlow(e.target.checked)}
                  />
                  Slow only (&gt;500ms)
                </label>
              </div>
              <div className="obs-search-wrap">
                <input
                  type="text"
                  placeholder="Search endpoint, trace ID, method…"
                  value={traceSearch}
                  onChange={(e) => setTraceSearch(e.target.value)}
                  className="obs-search-input"
                />
                {traceSearch && (
                  <button type="button" className="obs-search-clear" onClick={() => setTraceSearch('')}>
                    ×
                  </button>
                )}
              </div>
            </div>

            {loading && !traces.length ? (
              <div className="admin-loading"><span />Loading distributed traces…</div>
            ) : !traces.length ? (
              <div className="admin-empty">No traces match your current filters. Make requests or trigger API endpoints to populate.</div>
            ) : (
              <div className="obs-table-container">
                <table className="obs-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Method</th>
                      <th>Endpoint</th>
                      <th>Duration</th>
                      <th>Trace ID</th>
                      <th>Client</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traces.map((trace) => {
                      const is2xx = trace.statusCode >= 200 && trace.statusCode < 300;
                      const is3xx = trace.statusCode >= 300 && trace.statusCode < 400;
                      const is4xx = trace.statusCode >= 400 && trace.statusCode < 500;
                      const is5xx = trace.statusCode >= 500;
                      const statusColor = is2xx ? 'green' : is3xx ? 'blue' : is4xx ? 'amber' : 'red';
                      const durationColor = trace.durationMs < 100 ? 'text-green' : trace.durationMs < 500 ? 'text-amber' : 'text-red';

                      return (
                        <tr key={trace.id} className={trace.isSlow ? 'row-slow' : ''}>
                          <td>
                            <span className={`obs-badge ${statusColor}`}>
                              {trace.statusCode}
                            </span>
                          </td>
                          <td>
                            <span className="obs-method-pill">{trace.method}</span>
                          </td>
                          <td className="obs-path-cell" title={trace.path}>
                            <code>{trace.path}</code>
                          </td>
                          <td>
                            <span className={`obs-duration ${durationColor}`}>
                              {trace.durationMs} ms
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="obs-trace-copy"
                              onClick={() => copyToClipboard(trace.traceId, trace.id)}
                              title="Click to copy Trace ID"
                            >
                              <code>{trace.traceId.slice(0, 14)}…</code>
                              <span className="copy-icon">
                                {copiedId === trace.id ? '✓' : '⧉'}
                              </span>
                            </button>
                          </td>
                          <td className="obs-muted-cell" title={trace.userAgent}>
                            <small>{trace.ip}</small>
                          </td>
                          <td className="obs-muted-cell">
                            <small>{new Date(trace.timestamp).toLocaleTimeString()}</small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOGS */}
        {activeTab === 'logs' && (
          <div className="obs-tab-panel">
            <div className="obs-filter-bar">
              <div className="obs-filter-group">
                <span className="obs-filter-label">Level:</span>
                {['ALL', 'ERROR', 'WARN', 'INFO'].map((lvl) => {
                  const count =
                    lvl === 'ALL'
                      ? overview?.logStats?.totalBuffered
                      : lvl === 'ERROR'
                      ? overview?.logStats?.errors
                      : lvl === 'WARN'
                      ? overview?.logStats?.warnings
                      : overview?.logStats?.info;

                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`obs-chip ${logLevel === lvl ? 'active' : ''} chip-${lvl.toLowerCase()}`}
                      onClick={() => setLogLevel(lvl)}
                    >
                      {lvl} {count !== undefined ? `(${count})` : ''}
                    </button>
                  );
                })}
              </div>
              <div className="obs-search-wrap">
                <input
                  type="text"
                  placeholder="Filter logs by message, trace ID, context…"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="obs-search-input"
                />
                {logSearch && (
                  <button type="button" className="obs-search-clear" onClick={() => setLogSearch('')}>
                    ×
                  </button>
                )}
              </div>
              <div className="obs-logs-actions">
                <button type="button" className="obs-btn-secondary small" onClick={exportLogsJson} title="Export logs as JSON">
                  Export JSON
                </button>
                <button type="button" className="obs-btn-danger small" onClick={clearLogBuffer} title="Clear in-memory buffer">
                  Clear
                </button>
              </div>
            </div>

            {loading && !logs.length ? (
              <div className="admin-loading"><span />Streaming logs…</div>
            ) : !logs.length ? (
              <div className="admin-empty">No log events recorded matching this filter.</div>
            ) : (
              <div className="obs-logs-terminal">
                {logs.map((log) => {
                  const isErr = log.level === 'ERROR';
                  const isWarn = log.level === 'WARN';
                  const levelClass = isErr ? 'log-err' : isWarn ? 'log-warn' : 'log-info';

                  return (
                    <div key={log.id} className={`obs-log-line ${levelClass}`}>
                      <div className="obs-log-meta">
                        <span className={`obs-log-badge ${log.level.toLowerCase()}`}>{log.level}</span>
                        <time className="obs-log-time">{new Date(log.timestamp).toLocaleTimeString()}</time>
                        {log.traceId && log.traceId !== 'system' && (
                          <span
                            className="obs-log-trace"
                            onClick={() => copyToClipboard(log.traceId, log.id)}
                            title="Click to copy Trace ID"
                          >
                            #{log.traceId.slice(0, 12)}
                            {copiedId === log.id && ' (copied!)'}
                          </span>
                        )}
                      </div>
                      <div className="obs-log-msg">{log.message}</div>
                      {log.error?.stack && (
                        <pre className="obs-log-stack">{log.error.stack}</pre>
                      )}
                      {log.context && Object.keys(log.context).length > 0 && (
                        <div className="obs-log-context">
                          {JSON.stringify(log.context)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: METRICS & ENGINE */}
        {activeTab === 'metrics' && (
          <div className="obs-tab-panel">
            <div className="obs-metrics-view">
              <div className="obs-metrics-section">
                <h3>OpenTelemetry Auto-Instrumentation Engine</h3>
                <p>
                  Distributed tracing is running via <code>@opentelemetry/sdk-node</code>. HTTP, Express, Mongoose, and MongoDB operations are automatically instrumented.
                </p>
                <div className="obs-engine-cards">
                  <div className="obs-engine-item">
                    <strong>Service Name</strong>
                    <span>{overview?.openTelemetry?.serviceName || 'markethub-api'}</span>
                  </div>
                  <div className="obs-engine-item">
                    <strong>Runtime Environment</strong>
                    <span>{overview?.openTelemetry?.runtime || 'Node.js'} ({overview?.openTelemetry?.platform})</span>
                  </div>
                  <div className="obs-engine-item">
                    <strong>Instrumentations</strong>
                    <span>HTTP, Express, Mongoose, MongoDB</span>
                  </div>
                  <div className="obs-engine-item">
                    <strong>OTLP Exporter Target</strong>
                    <span>{overview?.openTelemetry?.otlpEndpoint || 'In-memory buffer + stdout'}</span>
                  </div>
                </div>
              </div>

              <div className="obs-metrics-section">
                <h3>Prometheus Scraper Endpoint</h3>
                <p>
                  Prometheus metrics are collected through <code>prom-client</code> and served in open-standard format for Datadog, Prometheus, Grafana, or SigNoz at:
                </p>
                <div className="obs-code-callout">
                  <code>GET {metricsUrl}</code>
                  <a href={metricsUrl} target="_blank" rel="noopener noreferrer" className="obs-btn-link">
                    Open raw metrics ↗
                  </a>
                </div>
                <div className="obs-prom-metrics-list">
                  <div><code>http_requests_total</code> - Counter of HTTP requests by method, route, and status code.</div>
                  <div><code>http_request_duration_seconds</code> - Histogram buckets of response latency.</div>
                  <div><code>nodejs_eventloop_lag_seconds</code> - Event loop lag telemetry.</div>
                  <div><code>process_resident_memory_bytes</code> - Physical memory resident set size.</div>
                </div>
              </div>

              <div className="obs-metrics-section">
                <h3>Raw Diagnostic JSON</h3>
                <pre className="obs-raw-json">
                  {JSON.stringify(overview, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

