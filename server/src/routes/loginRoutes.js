import express from "express";
import {
  login,
  register,
  getMe,
  logout,
} from "../controllers/loginController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);
router.get("/logout", logout);

export default router;
