require('dotenv').config(); // Must be first — loads .env into process.env

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────

// CORS — dynamically allow the requesting origin to support Vercel preview/production domains and localhost
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Parse incoming JSON bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions if needed later)
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check — useful for testing that the server is alive
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Student List API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Student routes — /api/students/:studentId and /api/students/:studentId/download
app.use('/api/students', studentRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀  Server running at http://localhost:${PORT}`);
    console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
