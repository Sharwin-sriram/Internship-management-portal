const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, result, 201);
  } catch (error) {
    sendError(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    await authService.logout(req.body.token);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (error) {
    sendError(res, error);
  }
};
