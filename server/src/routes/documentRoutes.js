import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middlewares/auth.js';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  downloadDocument
} from '../controllers/documentController.js';
import { getVerificationHistory, updateVerificationStatus } from '../controllers/verificationController.js';
import { getDocumentVersions, restoreDocumentVersion, downloadDocumentVersion } from '../controllers/documentVersionController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter to accept only specific file types
const fileFilter = (req, file, cb) => {
  const documentType = req.body?.documentType;

  if (documentType === 'resume') {
    if (file.mimetype === 'application/pdf') {
      return cb(null, true);
    }
    return cb(new Error('Resume must be a PDF file.'), false);
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Apply protection to all routes below
router.use(protect);

// Routes
router.route('/')
  .get(getDocuments);

router.route('/upload')
  .post(upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(deleteDocument);

router.route('/:id/verify')
  .put(authorize('coordinator', 'admin'), updateVerificationStatus);

router.route('/:id/verifications')
  .get(authorize('coordinator', 'admin'), getVerificationHistory);

router.route('/:id/versions')
  .get(getDocumentVersions);

router.route('/:id/versions/:versionId/restore')
  .post(restoreDocumentVersion);
  
router.route('/:id/download')
  .get(downloadDocument);

router.route('/:id/versions/:versionId/download')
  .get(downloadDocumentVersion);

export default router;
