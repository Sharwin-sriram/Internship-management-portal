const mongoose = require('mongoose');

const InternshipSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', InternshipSchema);
