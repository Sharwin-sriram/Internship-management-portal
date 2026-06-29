import express from "express";
import { body, validationResult } from "express-validator";
import { loginAdmin, getAdminMe, seedDemoAdmin } from "../controllers/adminController.js";
import {
  listAdminInternships,
  getAdminInternshipDetail,
  getAdminCompanyProfile,
} from "../controllers/adminManagementController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

const loginValidation = [
  body("email").trim().isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

router.post("/login", loginValidation, validationErrorHandler, loginAdmin);
router.post("/seed-demo", seedDemoAdmin);
router.get("/me", protect, authorize("admin"), getAdminMe);

router.get("/internships", protect, authorize("admin"), listAdminInternships);
router.get("/internships/:id", protect, authorize("admin"), getAdminInternshipDetail);
router.get("/companies/:id", protect, authorize("admin"), getAdminCompanyProfile);

export default router;
