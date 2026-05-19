import express from 'express';
import { protect, authorize } from '../middlewares/auth.js';
import {
  createContract,
  generateContractPDFHandler,
  getContract,
  getAllContracts,
  signContract,
  approveContract,
  terminateContract,
} from '../controllers/contractController.js';

const router = express.Router();

// Apply protection to all routes below
router.use(protect);

// Routes for Coordinators and Admins
router.route('/')
  .post(authorize('coordinator', 'admin'), createContract)
  .get(getAllContracts); // get all is also accessible by student/company but filtered

router.route('/:id')
  .get(getContract);

router.route('/:id/generate-pdf')
  .post(authorize('coordinator', 'admin', 'company'), generateContractPDFHandler);

router.route('/:id/sign')
  .post(authorize('student', 'company'), signContract);

router.route('/:id/approve')
  .put(authorize('coordinator', 'admin'), approveContract);

router.route('/:id/terminate')
  .put(authorize('coordinator', 'admin'), terminateContract);

export default router;
