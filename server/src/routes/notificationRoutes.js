import express from "express";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

router.use(protect);

router.get("/", asyncHandler(listNotifications));
router.patch("/read-all", asyncHandler(markAllRead));
router.patch("/:id/read", asyncHandler(markRead));

export default router;
