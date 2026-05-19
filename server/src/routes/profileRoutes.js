import express from "express";
import { getProfile, updateProfile, getProfileById } from "../controllers/profileController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getProfile);
router.put("/", updateProfile);
router.get("/:id", getProfileById);

export default router;
