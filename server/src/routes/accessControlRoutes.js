import express from "express";
import { getUsers, updateUserRole, getRoles, deleteUser, updateUserApproval } from "../controllers/accessControlController.js";
import { getStudentProfile, getStudentsForAdmin } from "../controllers/studentApprovalController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.get("/roles", protect, getRoles);
router.get("/users", protect, authorize("admin", "coordinator"), getUsers);
router.get("/students", protect, authorize("admin", "coordinator"), getStudentsForAdmin);
router.get("/students/:id", protect, authorize("admin", "coordinator"), getStudentProfile);
router.post("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("admin", "coordinator"), deleteUser);
router.put("/users/:id/approval", protect, authorize("admin", "coordinator"), updateUserApproval);

export default router;
