const mongoose = require('mongoose');

const contractStatusSchema = new mongoose.Schema({
    contractId: { type: String, required: true, unique: true },
    deviceCount: { type: Number, required: true },
    batteriesShipped: { type: Number, required: true },
    threshold: { type: Number, required: true },
    isLocked: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
    notificationsSent: [
      {
        email: String,
        timestamp: { type: Date, default: Date.now },
        message: String
      }
    ]
  });

module.exports = mongoose.model('ContractStatus', contractStatusSchema);