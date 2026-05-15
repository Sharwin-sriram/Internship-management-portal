exports.sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

exports.sendError = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message: error.message || 'An error occurred'
  });
};
