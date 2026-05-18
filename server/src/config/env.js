import dotenv from "dotenv";
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "24h",
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 24,
};
