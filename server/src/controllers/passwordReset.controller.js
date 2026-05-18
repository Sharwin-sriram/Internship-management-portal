const passwordResetService = require('../services/passwordReset.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

exports.requestReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, { message: 'Email is required' }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, { message: 'Invalid email format' }, 400);
    }

    const result = await passwordResetService.requestPasswordReset(email);
    sendSuccess(res, result);
  } catch (error) {
    logger.error(`Password reset request error: ${error.message}`);
    sendError(res, error, 500);
  }
};

exports.validateToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, { message: 'Token is required' }, 400);
    }

    const result = await passwordResetService.validateResetToken(token);
    sendSuccess(res, result);
  } catch (error) {
    logger.error(`Token validation error: ${error.message}`);
    sendError(res, error, 400);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validation
    if (!token || !newPassword || !confirmPassword) {
      return sendError(res, { message: 'All fields are required' }, 400);
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, { message: 'Passwords do not match' }, 400);
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return sendError(res, { message: 'Password must be at least 8 characters long' }, 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return sendError(res, { 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      }, 400);
    }

    const result = await passwordResetService.resetPassword(token, newPassword);
    sendSuccess(res, result);
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    sendError(res, error, 400);
  }
};
