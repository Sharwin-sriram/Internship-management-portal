import express from "express";
import { authorize, protect } from "../middlewares/auth.js";
import {
  createIndustry,
  deleteIndustry,
  getIndustries,
  updateIndustry,
} from "../controllers/industryController.js";

const router = express.Router();

router.get("/", getIndustries);
router.post("/", protect, authorize("admin"), createIndustry);
router.put("/:id", protect, authorize("admin"), updateIndustry);
router.delete("/:id", protect, authorize("admin"), deleteIndustry);

export default router;
