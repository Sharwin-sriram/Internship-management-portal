import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import { exportDocuments, cleanupExports } from '../controllers/exportController.js';

const router = express.Router();

// Apply protection to all routes below
router.use(protect);

// Export routes are only for coordinators and admins
router.route('/')
  .post(authorize('coordinator', 'admin'), exportDocuments);

router.route('/cleanup')
  .delete(authorize('admin'), cleanupExports);

export default router;
