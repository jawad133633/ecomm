const crypto = require('node:crypto');
const logger = require('../utils/logger');

const MAX_TRACES = 150;
const traceBuffer = [];
let traceCounter = 0;

// Aggregate telemetry counters
const metricsState = {
  totalRequests: 0,
  status2xx: 0,
  status3xx: 0,
  status4xx: 0,
  status5xx: 0,
  totalDurationMs: 0,
  durations: [],
  startedAt: Date.now(),
};

function generateTraceId() {
  return `trc_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

const traceMiddleware = (req, res, next) => {
  // Extract or generate trace ID
  const incomingTraceId =
    req.headers['x-trace-id'] ||
    req.headers['x-request-id'] ||
    (req.headers['traceparent'] ? req.headers['traceparent'].split('-')[1] : null);

  const traceId = incomingTraceId || generateTraceId();
  req.traceId = traceId;
  res.setHeader('x-trace-id', traceId);

  const startHrTime = process.hrtime.bigint();
  const startTimeIso = new Date().toISOString();

  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const durationMs = Number(endHrTime - startHrTime) / 1e6;
    const roundedDuration = Math.round(durationMs * 100) / 100;

    const statusCode = res.statusCode;
    const isSlow = roundedDuration > 500;
    const isError = statusCode >= 500;
    const isWarning = statusCode >= 400 && statusCode < 500;

    // Aggregate metrics
    metricsState.totalRequests += 1;
    metricsState.totalDurationMs += roundedDuration;
    if (statusCode >= 200 && statusCode < 300) metricsState.status2xx += 1;
    else if (statusCode >= 300 && statusCode < 400) metricsState.status3xx += 1;
    else if (statusCode >= 400 && statusCode < 500) metricsState.status4xx += 1;
    else if (statusCode >= 500) metricsState.status5xx += 1;

    metricsState.durations.push(roundedDuration);
    if (metricsState.durations.length > 500) metricsState.durations.shift();

    const traceEntry = {
      id: `trace_${++traceCounter}`,
      traceId,
      method: req.method,
      path: req.originalUrl || req.url,
      route: req.route?.path || req.path || 'unmatched',
      statusCode,
      durationMs: roundedDuration,
      isSlow,
      timestamp: startTimeIso,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    traceBuffer.unshift(traceEntry);
    if (traceBuffer.length > MAX_TRACES) {
      traceBuffer.pop();
    }

    // Automatically emit structured log
    const logMeta = {
      traceId,
      context: {
        method: req.method,
        path: traceEntry.path,
        statusCode,
        durationMs: roundedDuration,
        ip: traceEntry.ip,
      },
    };

    const logMessage = `${req.method} ${traceEntry.path} -> ${statusCode} (${roundedDuration}ms)`;
    if (isError) {
      logger.error(logMessage, logMeta);
    } else if (isWarning || isSlow) {
      logger.warn(logMessage, logMeta);
    } else {
      logger.info(logMessage, logMeta);
    }
  });

  next();
};

function getTraces({ status, slowOnly, search, limit = 50 } = {}) {
  let result = traceBuffer;
  if (status && status !== 'ALL') {
    if (status === '2xx') result = result.filter((t) => t.statusCode >= 200 && t.statusCode < 300);
    else if (status === '4xx') result = result.filter((t) => t.statusCode >= 400 && t.statusCode < 500);
    else if (status === '5xx') result = result.filter((t) => t.statusCode >= 500);
  }
  if (slowOnly === 'true' || slowOnly === true) {
    result = result.filter((t) => t.isSlow);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((t) =>
      t.path.toLowerCase().includes(q) ||
      t.traceId.toLowerCase().includes(q) ||
      t.method.toLowerCase().includes(q) ||
      String(t.statusCode).includes(q)
    );
  }
  return result.slice(0, Math.min(Number(limit) || 50, MAX_TRACES));
}

function getMetricsSummary() {
  const sortedDurations = [...metricsState.durations].sort((a, b) => a - b);
  const count = sortedDurations.length;
  const p50 = count ? sortedDurations[Math.floor(count * 0.5)] : 0;
  const p95 = count ? sortedDurations[Math.floor(count * 0.95)] : 0;
  const avg = metricsState.totalRequests ? Math.round((metricsState.totalDurationMs / metricsState.totalRequests) * 100) / 100 : 0;

  const uptimeSeconds = Math.round(process.uptime());
  const errorRate = metricsState.totalRequests
    ? Math.round(((metricsState.status4xx + metricsState.status5xx) / metricsState.totalRequests) * 1000) / 10
    : 0;

  return {
    uptimeSeconds,
    startedAt: new Date(metricsState.startedAt).toISOString(),
    totalRequests: metricsState.totalRequests,
    statusBreakdown: {
      '2xx': metricsState.status2xx,
      '3xx': metricsState.status3xx,
      '4xx': metricsState.status4xx,
      '5xx': metricsState.status5xx,
    },
    latency: {
      avgMs: avg,
      p50Ms: p50,
      p95Ms: p95,
      recentSamples: count,
    },
    errorRatePercent: errorRate,
  };
}

module.exports = {
  traceMiddleware,
  getTraces,
  getMetricsSummary,
};

