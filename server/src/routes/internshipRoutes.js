import express from "express";
import {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
} from "../controllers/internshipController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Public routes for listing and viewing
router.get("/", getInternships);
router.get("/:id", getInternshipById);

// Protected routes requiring authentication and authorization
router.post(
  "/",
  protect,
  authorize("company", "admin", "coordinator"),
  createInternship
);

router.put(
  "/:id",
  protect,
  authorize("company", "admin", "coordinator"),
  updateInternship
);

router.delete(
  "/:id",
  protect,
  authorize("company", "admin", "coordinator"),
  deleteInternship
);

export default router;
