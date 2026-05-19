import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // MongoDB Atlas connection with proper options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(` MongoDB Connected Successfully`);
    
    mongoose.connection.on('error', (err) => {
      console.error(`.. MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('..MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('..  MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error("..Database connection error:", error.message);
    
    // Provide helpful error messages
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.log("\n Troubleshooting MongoDB Atlas Connection:");
      console.log("   1. ✓ Check your internet connection");
      console.log("   2. ✓ Verify MongoDB Atlas cluster is running (not paused)");
      console.log("   3. ✓ Check if your IP address is whitelisted in MongoDB Atlas");
      console.log("      - Go to: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)");
      console.log("   4. ✓ Verify the connection string is correct");
      console.log("   5. ✓ Check if your MongoDB Atlas account is active\n");
    }
    
    console.error(" Server will continue without database. Some features may not work.\n");
    // Don't exit, let the server run without database for now
  }
};

export default connectDB;