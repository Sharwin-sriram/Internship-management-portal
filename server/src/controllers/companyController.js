import Company from '../models/Company.js';

// @desc    Create a new company
// @route   POST /api/companies
// @access  Public/Private
export const createCompany = async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
