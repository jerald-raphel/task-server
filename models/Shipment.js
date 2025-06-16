const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  contractId: {
    type: String,
    required: true
  },
  shipmentNo: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique shipmentNo per contract
shipmentSchema.index({ contractId: 1, shipmentNo: 1 }, { unique: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
