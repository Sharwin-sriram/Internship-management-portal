import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  register,
  login,
  getMe,
  logout,
} from '../controllers/loginController.js';
import {
  changePassword,
  changeEmail,
  reauthenticate,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const emailChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newEmail').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
];

const reauthValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
];

const validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Public routes
router.post('/register', registerValidation, validationErrorHandler, register);
router.post('/login', loginValidation, validationErrorHandler, login);

// Protected auth routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/password', protect, passwordChangeValidation, validationErrorHandler, changePassword);
router.put('/email', protect, emailChangeValidation, validationErrorHandler, changeEmail);
router.post('/reauth', protect, reauthValidation, validationErrorHandler, reauthenticate);

export default router;
