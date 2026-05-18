/**
 * Standardized response utilities for API endpoints
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send in response
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
exports.sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {Error|Object} error - Error object or error data
 * @param {Number} statusCode - HTTP status code (default: 500)
 */
exports.sendError = (res, error, statusCode = 500) => {
  const message = error.message || error.msg || 'An error occurred';
  
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
  });
};
