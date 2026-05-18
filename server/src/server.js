import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
import rbacRoutes from "./routes/accessControlRoutes.js";
import { startTokenCleanup } from "./utils/scheduler.js";
import emailService from "./services/emailService.js";
import logger from "./utils/logger.js";
import envConfig from "./config/env.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = envConfig.PORT || process.env.PORT;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/rbac", rbacRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Internship Portal API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "GET /health",
      test: "GET /api/test",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
        changePassword: "PUT /api/auth/password",
        changeEmail: "PUT /api/auth/email",
        reauth: "POST /api/auth/reauth",
      },
      companies: "GET /api/companies",
      passwordReset: {
        request: "POST /api/password-reset/request",
        validate: "POST /api/password-reset/validate",
        reset: "POST /api/password-reset/reset",
      },
    },
    documentation: "See POSTMAN_TESTING_GUIDE.md for API documentation",
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working",
    timestamp: new Date().toISOString(),
    routes: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "POST /api/auth/logout",
      "PUT /api/auth/password",
      "PUT /api/auth/email",
      "POST /api/auth/reauth",
      "GET /api/companies",
      "POST /api/password-reset/request",
      "POST /api/password-reset/validate",
      "POST /api/password-reset/reset",
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, message: `Not Found - ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    ...(envConfig.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`http://localhost:${PORT}`);
  console.log(
    `[INFO] ${new Date().toISOString()}: Server running in ${envConfig.NODE_ENV || "development"} mode on port ${PORT}`,
  );

  // Verify email service connection
  await emailService.verifyConnection();

  // Start background cleanup scheduler
  startTokenCleanup();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(
    `[ERROR] ${new Date().toISOString()}: Unhandled Rejection: ${err.message}`,
  );
  server.close(() => process.exit(1));
});

export default app;
