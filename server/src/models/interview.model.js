const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    scheduledAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', InterviewSchema);
