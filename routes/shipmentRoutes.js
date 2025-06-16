// shipmentRoutes.js
const express = require('express');
const Shipment = require('../models/Shipment');
const Contract = require('../models/Contract');
const ContractStatus = require('../models/ContractStatus');
const Admin = require('../models/Admin');
const sendContractAlert = require('../utils/sendEmail');

module.exports = function(io) {
  const router = express.Router();

  // Create Shipment
  router.post('/', async (req, res) => {
    const { contractId, shipmentNo, count, userEmail } = req.body;

    try {
      const contract = await Contract.findOne({ contractId });
      if (!contract) return res.status(404).json({ message: 'Contract not found' });

      if (contract.status === 'locked') {
        return res.status(403).json({ message: 'Contract is locked. Cannot submit shipment.' });
      }

      const exists = await Shipment.findOne({ contractId, shipmentNo });
      if (exists) return res.status(400).json({ message: 'Shipment number already exists' });

      const existingShipments = await Shipment.find({ contractId });
      const currentTotal = existingShipments.reduce((acc, s) => acc + s.count, 0);
      const newTotal = currentTotal + Number(count);

      let statusMessage = 'Shipment submitted.';
      const admin = await Admin.findOne();
      const adminEmail = admin?.email || 'admin@example.com';

      if (newTotal > contract.deviceCount) {
        contract.status = 'locked';
        await contract.save();

        await sendContractAlert({
          contractId: contract.contractId,
          deviceCount: contract.deviceCount,
          batteriesShipped: newTotal,
          threshold: contract.deviceCount,
          isLocked: true,
          lastUpdated: new Date(),
          shipmentId: `S-${Date.now()}`,
          adminEmail
        });

        statusMessage = 'Shipment exceeds device count. Contract locked. Admin notified.';
        io.emit('contractLocked', { contractId, message: statusMessage }); // 👈 Emit event
      }

      const newShipment = new Shipment({ contractId, shipmentNo, count, userEmail });
      await newShipment.save();

      if (newTotal === contract.deviceCount) {
        contract.status = 'completed';
        await contract.save();
      }

      await ContractStatus.findOneAndUpdate(
        { contractId },
        {
          contractId,
          deviceCount: contract.deviceCount,
          batteriesShipped: newTotal,
          threshold: contract.deviceCount * 1.2,
          isLocked: contract.status === 'locked',
          lastUpdated: new Date(),
          $push: {
            notificationsSent: {
              email: adminEmail,
              message: statusMessage
            }
          }
        },
        { upsert: true, new: true }
      );

      // 🔥 Emit socket event on successful shipment
      io.emit('newShipment', {
        shipment: newShipment,
        contractId,
        message: 'New shipment created.'
      });

      if (contract.status === 'locked') {
        return res.status(400).json({ message: statusMessage });
      }

      res.status(201).json({
        message: 'Shipment created successfully',
        shipment: newShipment
      });

    } catch (err) {
      console.error('Shipment error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Other routes (GET, DELETE) remain unchanged
  router.get('/:contractId', async (req, res) => {
    try {
      const shipments = await Shipment.find({ contractId: req.params.contractId });
      res.json(shipments);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch shipments' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const shipments = await Shipment.find().sort({ createdAt: -1 });
      res.json(shipments);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch shipments' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const result = await Shipment.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ message: 'Shipment not found' });
      res.json({ message: 'Shipment deleted' });
    } catch {
      res.status(500).json({ message: 'Delete failed' });
    }
  });

  return router;
};
