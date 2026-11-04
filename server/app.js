const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const {
  register,
  metricsMiddleware,
} = require("./middleware/metrics");
const { traceMiddleware } = require('./middleware/traceMiddleware');
const observabilityController = require('./controllers/observabilityController');

const mongoose = require('mongoose');

const app = express();

// Set TRUST_PROXY to the number of trusted reverse proxies in production so
// req.ip identifies clients correctly behind a load balancer/CDN.
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY);
app.use(cors());
app.disable('x-powered-by');
app.use(traceMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(metricsMiddleware);

app.post('/api/observability/client-event', observabilityController.recordClientEvent);

app.get('/health', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, database: ready ? 'connected' : 'unavailable' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});
  

// Netlify rewrites /api/* through this function path. Strip its prefix so the
// same Express app works both in Netlify Functions and on the local server.
app.use((req, res, next) => {
  const functionPrefix = '/.netlify/functions/api';
  if (req.url.startsWith(`${functionPrefix}/`)) {
    req.url = req.url.slice(functionPrefix.length);
  }
  next();
});

const connectDB = require('./config/db');
app.use(async (req, res, next) => {
  if (
    req.path === '/api/health' ||
    req.path === '/health' ||
    req.path === '/metrics' ||
    req.path.startsWith('/api/observability')
  ) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    console.error('Serverless DB middleware error:', err.message);
    res.status(503).json({ success: false, message: 'Database connection failed. Please retry.' });
  }
});


app.use('/api/auth', authRoutes);

app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clinic', clinicRoutes);


app.get('/', (req, res) => {
  res.json({ success: true, message: 'MarketHub backend is running!' });
});

app.get("/metrics", async (req, res) => {
  try {
    const metrics = await register.metrics();

    res.set("Content-Type", register.contentType);
    res.status(200).send(metrics);

  } catch (error) {
    console.error("PROMETHEUS METRICS ERROR:", error);

    res.status(500).json({
      message: "Metrics generation failed",
      error: error.message,
    });
  }
});


module.exports = app;
