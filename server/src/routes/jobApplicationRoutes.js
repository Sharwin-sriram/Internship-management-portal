import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createJobApplication, getJobApplications, getJobApplicationById } from "../controllers/jobApplicationController.js";

const router = express.Router();

// ── Multer setup for resume uploads ──────────────────────────────────────────
const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF and DOCX files are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// ── POST /api/job-applications ────────────────────────────────────────────────
router.post("/", upload.single("resume"), createJobApplication);

// ── GET /api/job-applications ─────────────────────────────────────────────────
router.get("/", getJobApplications);

// ── GET /api/job-applications/:id ─────────────────────────────────────────────
router.get("/:id", getJobApplicationById);

export default router;
