import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
import profileRoutes from "./routes/profileRoutes.js";
import rbacRoutes from "./routes/accessControlRoutes.js";
import studentDashboardRoutes from "./routes/studentDashboardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import offerLetterRoutes from "./routes/offerLetterRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import jobApplicationRoutes from "./routes/jobApplicationRoutes.js";
import {
  startTokenCleanup,
  startInterviewReminderScheduler,
} from "./utils/scheduler.js";
import { initSocket } from "./services/socketService.js";
import emailService from "./services/emailService.js";
import logger from "./utils/logger.js";
import envConfig from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = envConfig.PORT || process.env.PORT;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/exports", express.static(path.join(__dirname, "../exports")));

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/rbac", rbacRoutes);
app.use("/api/student-dashboard", studentDashboardRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/offer-letters", offerLetterRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/exports", exportRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/job-applications", jobApplicationRoutes);

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
      documents: {
        upload: "POST /api/documents/upload",
        list: "GET /api/documents",
        delete: "DELETE /api/documents/:filename",
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

// HTTP server (required for Socket.IO)
const httpServer = http.createServer(app);

// Start server
httpServer.listen(PORT, async () => {
  console.log(`http://localhost:${PORT}`);
  console.log(
    `[INFO] ${new Date().toISOString()}: Server running in ${envConfig.NODE_ENV || "development"} mode on port ${PORT}`,
  );

  await initSocket(httpServer);

  await emailService.verifyConnection();

  startTokenCleanup();
  startInterviewReminderScheduler();
});

const server = httpServer;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(
    `[ERROR] ${new Date().toISOString()}: Unhandled Rejection: ${err.message}`,
  );
  server.close(() => process.exit(1));
});

export default app;