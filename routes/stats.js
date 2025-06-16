const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Shipment = require('../models/Shipment');

// GET /api/stats/device-to-shipment
router.get('/device-to-shipment', async (req, res) => {
  try {
    // Total deviceCount from all contracts
    const contracts = await Contract.find({});
    const totalDevices = contracts.reduce((sum, c) => sum + c.deviceCount, 0);

    // Total count from all shipments
    const shipments = await Shipment.find({});
    const totalShipped = shipments.reduce((sum, s) => sum + s.count, 0);

    // Calculate ratio
    const ratio = totalDevices && totalShipped
      ? (totalShipped / totalDevices).toFixed(2)
      : "N/A";

    res.json({
      totalDeviceCount: totalDevices,
      totalShipmentCount: totalShipped,
      shipmentToDeviceRatio: ratio  // e.g., 0.78 or 1.12
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

module.exports = router;
