/**
 * Structured Logger with in-memory circular buffer for Observability Dashboard
 */

const MAX_LOGS = 300;
const logBuffer = [];
let logCounter = 0;

function formatLog({ level, message, traceId, context, error }) {
  return {
    id: `log_${++logCounter}`,
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    traceId: traceId || 'system',
    message: String(message || ''),
    context: context || null,
    error: error ? {
      message: error.message || String(error),
      stack: error.stack || null,
      name: error.name || 'Error',
    } : null,
  };
}

function pushLog(entry) {
  logBuffer.unshift(entry);
  if (logBuffer.length > MAX_LOGS) {
    logBuffer.pop();
  }

  // Structured console output
  const output = process.env.NODE_ENV === 'production'
    ? JSON.stringify(entry)
    : `[${entry.timestamp}] [${entry.level}] [${entry.traceId}] ${entry.message} ${entry.error ? `\n${entry.error.stack || entry.error.message}` : ''}`;

  if (entry.level === 'ERROR') {
    console.error(output);
  } else if (entry.level === 'WARN') {
    console.warn(output);
  } else {
    console.log(output);
  }

  return entry;
}

const logger = {
  info(message, meta = {}) {
    return pushLog(formatLog({ level: 'INFO', message, ...meta }));
  },
  warn(message, meta = {}) {
    return pushLog(formatLog({ level: 'WARN', message, ...meta }));
  },
  error(message, meta = {}) {
    return pushLog(formatLog({ level: 'ERROR', message, ...meta }));
  },
  debug(message, meta = {}) {
    if (process.env.DEBUG || process.env.NODE_ENV !== 'production') {
      return pushLog(formatLog({ level: 'DEBUG', message, ...meta }));
    }
  },
  getRecentLogs({ level, search, limit = 100 } = {}) {
    let result = logBuffer;
    if (level && level !== 'ALL') {
      const targetLevel = level.toUpperCase();
      result = result.filter((l) => l.level === targetLevel);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((l) =>
        l.message.toLowerCase().includes(q) ||
        (l.traceId && l.traceId.toLowerCase().includes(q)) ||
        (l.error && l.error.message && l.error.message.toLowerCase().includes(q))
      );
    }
    return result.slice(0, Math.min(Number(limit) || 100, MAX_LOGS));
  },
  clearBuffer() {
    logBuffer.length = 0;
    return true;
  },
  getStats() {
    return {
      totalBuffered: logBuffer.length,
      errors: logBuffer.filter((l) => l.level === 'ERROR').length,
      warnings: logBuffer.filter((l) => l.level === 'WARN').length,
      info: logBuffer.filter((l) => l.level === 'INFO').length,
    };
  },
};

// Initial system startup log
logger.info('Observability Logger initialized', { context: { environment: process.env.NODE_ENV || 'development' } });

module.exports = logger;

