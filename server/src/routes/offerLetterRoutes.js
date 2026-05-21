import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  generateOfferLetter,
  generateDirectOfferLetter,
  generateOfferLetterPDFHandler,
  sendOfferLetter,
  getOfferLetter,
  getAllOfferLetters,
  acceptOfferLetter,
  rejectOfferLetter,
  generateModelPDF,
} from '../controllers/offerLetterController.js';

const router = express.Router();

// Apply protection to all routes below
router.use(protect);

// Routes for Coordinators, Admins, and Companies
router.route('/generate-model-pdf')
  .post(authorize('coordinator', 'admin', 'company'), generateModelPDF);

router.route('/generate')
  .post(authorize('coordinator', 'admin', 'company'), generateOfferLetter);

router.route('/generate-direct')
  .post(authorize('company'), generateDirectOfferLetter);

router.route('/:id/generate-pdf')
  .post(authorize('coordinator', 'admin', 'company'), generateOfferLetterPDFHandler);

router.route('/:id/send')
  .post(authorize('coordinator', 'admin', 'company'), sendOfferLetter);

router.route('/:id/download')
  .get(downloadOfferLetterPDF);

// Routes accessible by relevant parties (auth handled in controller for private access)
router.route('/')
  .get(getAllOfferLetters);

router.route('/:id')
  .get(getOfferLetter);

// Routes specifically for Students
router.route('/:id/accept')
  .put(authorize('student'), acceptOfferLetter);

router.route('/:id/reject')
  .put(authorize('student'), rejectOfferLetter);

export default router;
