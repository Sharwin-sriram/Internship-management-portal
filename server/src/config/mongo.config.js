const mongoose = require('mongoose');
const { MONGO_URI } = require('./env.config');

async function connect() {
  if (!MONGO_URI) throw new Error('MONGO_URI is not set in environment');

  try {
    console.log('Connecting to MongoDB using URI:', MONGO_URI.startsWith('mongodb+srv://') ? 'mongodb+srv://<hidden>' : MONGO_URI);
    await mongoose.connect(MONGO_URI, {
      // options kept default for mongoose 7+
    });
    console.log('MongoDB connected successfully');
    return mongoose;
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message.includes('querySrv')) {
      console.error('MongoDB connection failed. If you are using an Atlas URI with mongodb+srv://, try using the standard non-SRV connection string from Atlas.')
      console.error('Also ensure your Atlas IP whitelist includes your current client IP address.');
    }
    throw error;
  }
}

module.exports = { connect, mongoose };