import express from 'express';
import {
  createCompany,
  registerCompany,
  getCompanies,
  getCompanyById,
  loginCompany,
  getMyCompany,
  updateMyCompany,
  getCompanyRequests,
  updateCompanyApproval,
  getCompanyDashboard,
  getCompanyAnalytics,
  getMyShortlistedApplications,
  getRecruiters,
  addRecruiter,
  removeRecruiter,
  searchTalent,
  requestTalentUnlock,
  listTalentUnlockRequests,
  approveTalentUnlockRequest,
  rejectTalentUnlockRequest
} from '../controllers/companyController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
  .get(getCompanies)
  .post(protect, authorize('company'), createCompany);

router.post('/register', registerCompany);
router.post('/login', loginCompany);

router.get('/me', protect, authorize('company'), getMyCompany);
router.put('/me', protect, authorize('company'), updateMyCompany);
router.get('/me/dashboard', protect, authorize('company'), getCompanyDashboard);
router.get('/me/analytics', protect, authorize('company'), getCompanyAnalytics);
router.get('/me/shortlisted-applications', protect, authorize('company'), getMyShortlistedApplications);

router.get('/me/recruiters', protect, authorize('company'), getRecruiters);
router.post('/me/recruiters', protect, authorize('company'), addRecruiter);
router.delete('/me/recruiters/:recruiterId', protect, authorize('company'), removeRecruiter);

router.get('/requests', protect, authorize('admin', 'coordinator'), getCompanyRequests);
router.put('/:id/approval', protect, authorize('admin', 'coordinator'), updateCompanyApproval);

router.get('/talent/search', protect, authorize('company'), searchTalent);
router.post('/talent/requests', protect, authorize('company'), requestTalentUnlock);
router.get('/talent/requests', protect, authorize('company'), listTalentUnlockRequests);
router.put('/talent/requests/:id/approve', protect, authorize('admin', 'coordinator'), approveTalentUnlockRequest);
router.put('/talent/requests/:id/reject', protect, authorize('admin', 'coordinator'), rejectTalentUnlockRequest);

router.route('/:id')
  .get(getCompanyById);

export default router;
