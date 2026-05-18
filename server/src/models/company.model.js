const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
