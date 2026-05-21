import express from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  listPublicInternships,
  createInternship,
  getMyInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
} from "../controllers/internshipController.js";

const router = express.Router();

router.get("/", listPublicInternships);
router.post("/", protect, authorize("company"), createInternship);
router.get("/me", protect, authorize("company"), getMyInternships);
router.get("/:id", getInternshipById);
router.put("/:id", protect, authorize("company"), updateInternship);
router.delete("/:id", protect, authorize("company"), deleteInternship);

export default router;
