const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true,
    unique: true
  },
  deviceCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'locked', 'completed'],
    default: 'pending'
  }
});

module.exports = mongoose.model('Contract', contractSchema);
