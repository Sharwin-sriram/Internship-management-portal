import express from "express";
import { getUsers, updateUserRole, getRoles } from "../controllers/accessControlController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/roles", protect, getRoles);
router.get("/users", protect, authorize("admin", "coordinator"), getUsers);
router.post("/users/:id/role", protect, authorize("admin"), updateUserRole);

export default router;
