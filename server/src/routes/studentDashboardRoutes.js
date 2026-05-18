import express from "express";
import { getStudentDashboardData } from "../controllers/studentDashboardController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize("student"));

router.get("/", getStudentDashboardData);

export default router;
