const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env.config');

exports.register = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = new User({
    email: userData.email,
    passwordHash: hashedPassword,
    role: userData.role || 'student',
    name: userData.name,
    companyName: userData.companyName,
  });

  await user.save();

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  return { user, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
  return { user, token };
};

exports.logout = async (token) => {
  // Implement token blacklist logic if needed
  return true;
};
