const User = require('../models/user.model');

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  return user;
};

exports.updateUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) throw new Error('User not found');
  return user;
};

exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error('User not found');
  return true;
};
