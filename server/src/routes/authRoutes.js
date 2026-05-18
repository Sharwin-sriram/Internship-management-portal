import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  getUsers,
  getUser,
  updateUserRole,
  deleteUser
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validationErrorHandler } from '../middleware/errorHandler.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

const updateUserRoleValidation = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
];

// Public routes
router.post('/register', registerValidation, validationErrorHandler, registerUser);
router.post('/login', loginValidation, validationErrorHandler, loginUser);
router.post('/forgot-password', forgotPasswordValidation, validationErrorHandler, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validationErrorHandler, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidation, validationErrorHandler, updateProfile);
router.put('/password', protect, updatePasswordValidation, validationErrorHandler, updatePassword);
router.post('/logout', protect, logout);

// Admin only routes
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/users/:id', protect, authorize('admin'), getUser);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRoleValidation, validationErrorHandler, updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
