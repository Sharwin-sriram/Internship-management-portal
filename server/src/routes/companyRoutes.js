import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById
} from '../controllers/companyController.js';

const router = express.Router();

router.route('/')
  .get(getCompanies)
  .post(createCompany);

router.route('/:id')
  .get(getCompanyById);

export default router;
