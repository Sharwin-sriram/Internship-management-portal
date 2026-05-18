const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passwordResetRoutes = require('./routes/passwordReset.routes');
const { startTokenCleanup } = require('./utils/scheduler');
const emailService = require('./services/email.service');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9933;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/password-reset', passwordResetRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Internship Portal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      test: 'GET /api/test',
      passwordReset: {
        request: 'POST /api/password-reset/request',
        validate: 'POST /api/password-reset/validate',
        reset: 'POST /api/password-reset/reset'
      }
    },
    documentation: 'See POSTMAN_TESTING_GUIDE.md for API documentation'
  });
});

// Test endpoint (no DB required)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    routes: [
      'POST /api/password-reset/request',
      'POST /api/password-reset/validate',
      'POST /api/password-reset/reset'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Not Found - ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`[INFO] ${new Date().toISOString()}: Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Verify email service connection
  await emailService.verifyConnection();
  
  // Start background cleanup scheduler
  startTokenCleanup();
});

process.on('unhandledRejection', (err) => {
  console.error(`[ERROR] ${new Date().toISOString()}: Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
