const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { getTraces, getMetricsSummary } = require('../middleware/traceMiddleware');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Store = require('../models/Store');

async function getOverview(req, res) {
  try {
    const mem = process.memoryUsage();
    const memory = {
      rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
      externalMb: Math.round((mem.external / 1024 / 1024) * 10) / 10,
    };

    // Database health & ping
    const isDbReady = mongoose.connection.readyState === 1;
    let dbPingMs = null;
    if (isDbReady && mongoose.connection.db) {
      try {
        const pingStart = Date.now();
        await mongoose.connection.db.admin().ping();
        dbPingMs = Date.now() - pingStart;
      } catch (e) {
        dbPingMs = -1;
      }
    }

    const dbStateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const database = {
      status: dbStateNames[mongoose.connection.readyState] || 'unknown',
      pingMs: dbPingMs,
      host: mongoose.connection.host || 'MongoDB Atlas',
      name: mongoose.connection.name || 'markethub',
    };

    // Fast count queries
    let counts = { users: 0, products: 0, orders: 0, stores: 0 };
    if (isDbReady) {
      try {
        const [u, p, o, s] = await Promise.all([
          User.estimatedDocumentCount().catch(() => 0),
          Product.estimatedDocumentCount().catch(() => 0),
          Order.estimatedDocumentCount().catch(() => 0),
          Store.estimatedDocumentCount().catch(() => 0),
        ]);
        counts = { users: u, products: p, orders: o, stores: s };
      } catch (err) {
        // Non-blocking
      }
    }

    const httpMetrics = getMetricsSummary();
    const logStats = logger.getStats();

    const openTelemetry = {
      active: true,
      serviceName: 'markethub-api',
      runtime: `Node.js ${process.version}`,
      platform: process.platform,
      arch: process.arch,
      instrumentations: ['@opentelemetry/auto-instrumentations-node', 'prom-client', 'express', 'mongoose', 'http'],
      otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'in-memory buffer + stdout (ready for collector export)',
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        uptimeSeconds: httpMetrics.uptimeSeconds,
        memory,
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid,
      },
      database,
      counts,
      httpMetrics,
      logStats,
      openTelemetry,
    });
  } catch (error) {
    logger.error('Failed to get observability overview', { error });
    res.status(500).json({ success: false, message: 'Could not fetch observability overview.', error: error.message });
  }
}

async function getTraceList(req, res) {
  try {
    const { status, slowOnly, search, limit } = req.query;
    const traces = getTraces({ status, slowOnly, search, limit });
    res.json({
      success: true,
      count: traces.length,
      traces,
    });
  } catch (error) {
    logger.error('Failed to fetch traces', { error });
    res.status(500).json({ success: false, message: 'Could not fetch traces.' });
  }
}

async function getLogList(req, res) {
  try {
    const { level, search, limit } = req.query;
    const logs = logger.getRecentLogs({ level, search, limit });
    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    logger.error('Failed to fetch logs', { error });
    res.status(500).json({ success: false, message: 'Could not fetch logs.' });
  }
}

async function clearLogs(req, res) {
  try {
    logger.clearBuffer();
    logger.info('Observability logs buffer cleared by administrator', { traceId: req.traceId });
    res.json({ success: true, message: 'Log buffer cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not clear log buffer.' });
  }
}

async function recordClientEvent(req, res) {
  try {
    const { type, name, value, rating, error, url, userAgent, clientTraceId } = req.body || {};
    const traceId = clientTraceId || req.traceId;

    if (type === 'web-vital') {
      logger.info(`[RUM Web Vital] ${name}: ${value} (${rating || 'n/a'}) on ${url || '/'}`, {
        traceId,
        context: { metric: name, value, rating, url },
      });
    } else if (type === 'client-error') {
      logger.error(`[Client Error] ${name || 'Unhandled Error'}: ${error?.message || error || 'Unknown'}`, {
        traceId,
        context: { url, userAgent, error },
      });
    } else {
      logger.info(`[Client Event] ${name || type}`, { traceId, context: req.body });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(200).json({ success: false }); // Non-blocking for client telemetry
  }
}

module.exports = {
  getOverview,
  getTraceList,
  getLogList,
  clearLogs,
  recordClientEvent,
};

