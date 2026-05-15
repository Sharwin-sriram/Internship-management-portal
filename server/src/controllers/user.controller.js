const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, users);
  } catch (error) {
    sendError(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, user);
  } catch (error) {
    sendError(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, user);
  } catch (error) {
    sendError(res, error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    sendSuccess(res, { message: 'User deleted successfully' });
  } catch (error) {
    sendError(res, error);
  }
};
