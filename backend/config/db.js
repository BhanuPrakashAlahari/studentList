const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI stored in .env
 * Retries are handled automatically by Mongoose's built-in
 * server-selection timeout.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are the safe modern defaults for Mongoose 7+
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit — server can't run without DB
  }
};

module.exports = connectDB;
