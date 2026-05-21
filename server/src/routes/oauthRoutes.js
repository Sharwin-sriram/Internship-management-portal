import express from "express";
import {
  startGoogle,
  googleCallback,
  startGithub,
  githubCallback,
  exchangeCode,
  handleNextAuthLogin,
} from "../controllers/oauthController.js";

const router = express.Router();

router.get("/google", startGoogle);
router.get("/google/callback", googleCallback);
router.get("/github", startGithub);
router.get("/github/callback", githubCallback);
router.post("/exchange", exchangeCode);
router.post("/nextauth-login", handleNextAuthLogin);

export default router;
