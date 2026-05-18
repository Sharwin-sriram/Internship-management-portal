const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String },
    url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
