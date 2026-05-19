import jwt from "jsonwebtoken";
import User from "../models/user.js";
import logger from "../utils/logger.js";

let io = null;

const COMPANY_ROOM_PREFIX = "company:";
const STUDENT_ROOM_PREFIX = "student:";
const COORDINATOR_ROOM = "coordinators";

export function initSocket(httpServer) {
  return import("socket.io").then(({ Server }) => {
    io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
      },
      path: "/socket.io",
    });

    io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.split(" ")[1];

        if (!token) {
          return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.user = user;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      const { user } = socket;
      logger.info(`Socket connected: ${user.email} (${user.role})`);

      socket.join(`user:${user._id}`);

      if (user.role === "company") {
        socket.join(`${COMPANY_ROOM_PREFIX}${user._id}`);
      }
      if (user.role === "student") {
        socket.join(`${STUDENT_ROOM_PREFIX}${user._id}`);
      }
      if (["coordinator", "admin"].includes(user.role)) {
        socket.join(COORDINATOR_ROOM);
      }
      if (user.role === "interviewer") {
        socket.join(`interviewer:${user._id}`);
      }

      socket.on("disconnect", () => {
        logger.info(`Socket disconnected: ${user.email}`);
      });
    });

    logger.info("Socket.IO initialized");
    return io;
  });
}

export function getIO() {
  return io;
}

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitInterviewScheduled(companyUserId, studentUserId, payload) {
  if (!io) return;
  emitToUser(companyUserId, "interview:scheduled", payload);
  emitToUser(studentUserId, "interview:invitation", payload);
  io.to(COORDINATOR_ROOM).emit("interview:scheduled", payload);
}

export function emitInterviewResponse(companyUserId, payload) {
  if (!io) return;
  emitToUser(companyUserId, "interview:response", payload);
  io.to(COORDINATOR_ROOM).emit("interview:response", payload);
}

export function emitInterviewFeedback(companyUserId, coordinatorOnly, payload) {
  if (!io) return;
  emitToUser(companyUserId, "interview:feedback_submitted", payload);
  io.to(COORDINATOR_ROOM).emit("interview:feedback_submitted", payload);
}
