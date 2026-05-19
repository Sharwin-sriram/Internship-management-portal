import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import JobApplication from "../models/JobApplication.js";

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
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, yearOfStudying, stream, department, skills,
    } = req.body;

    // Parse skills (sent as JSON string from form)
    const parsedSkills = skills ? JSON.parse(skills) : [];

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    const application = new JobApplication({
      firstName,
      lastName,
      email,
      phone,
      yearOfStudying,
      stream,
      department,
      skills: parsedSkills,
      resumeUrl: req.file.path,
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: { id: application._id, email: application.email },
    });
  } catch (err) {
    console.error("[JobApplication] Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


// ── GET /api/job-applications ─────────────────────────────────────────────────
router.get("/", async (_req, res) => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
