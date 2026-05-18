const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'company', 'admin', 'coordinator'], required: true },
    name: { type: String },
    companyName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

