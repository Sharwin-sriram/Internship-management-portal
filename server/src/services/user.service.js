const User = require('../models/user.model');

exports.getAllUsers = async () => {
  return await User.findAll();
};

exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

exports.updateUser = async (id, data) => {
  const user = await User.update(id, data);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

exports.deleteUser = async (id) => {
  const result = await User.delete(id);
  if (!result) {
    throw new Error('User not found');
  }
  return result;
};
