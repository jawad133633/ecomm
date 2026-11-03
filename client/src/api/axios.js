import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Trace & Latency Interceptors for Full Client-Server Observability Correlation
api.interceptors.request.use((config) => {
  const clientTraceId = `clnt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  config.headers = config.headers || {};
  config.headers['x-client-trace-id'] = clientTraceId;
  config.metadata = { startTime: typeof performance !== 'undefined' ? performance.now() : Date.now(), clientTraceId };
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
  if (response.config?.metadata && typeof performance !== 'undefined') {
    const duration = Math.round(performance.now() - response.config.metadata.startTime);
    response.durationMs = duration;
    response.traceId = response.headers?.['x-trace-id'] || response.config.metadata.clientTraceId;
  }
  return response;
}, (error) => {
  if (error.config?.metadata && typeof performance !== 'undefined') {
    const duration = Math.round(performance.now() - error.config.metadata.startTime);
    error.durationMs = duration;
    error.traceId = error.response?.headers?.['x-trace-id'] || error.config.metadata.clientTraceId;
  }
  return Promise.reject(error);
});

export default api;
