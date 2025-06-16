const express = require('express');
const Shipment = require('../models/Shipment');
const Contract = require('../models/Contract');
const ContractStatus = require('../models/ContractStatus');
const Admin = require('../models/Admin');
const sendContractAlert = require('../utils/sendEmail');

const router = express.Router();

// 🔹 Create a new shipment
router.post('/', async (req, res) => {
  const { contractId, shipmentNo, count, userEmail } = req.body;

  try {
    const contract = await Contract.findOne({ contractId });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.status === 'locked') {
      return res.status(403).json({ message: 'Contract is locked. Cannot submit shipment.' });
    }

    const exists = await Shipment.findOne({ contractId, shipmentNo });
    if (exists) {
      return res.status(400).json({ message: 'Shipment number already exists for this contract' });
    }

    const existingShipments = await Shipment.find({ contractId });
    const currentTotal = existingShipments.reduce((acc, s) => acc + s.count, 0);
    const newTotal = currentTotal + Number(count);

    let statusMessage = 'Shipment submitted.';

    // 🔹 Get admin email
    const admin = await Admin.findOne();
    const adminEmail = admin?.email || adminEmail;

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

      statusMessage = 'Shipment exceeds contract device count. Contract has been locked and admin notified.';
    }

    const newShipment = new Shipment({
      contractId,
      shipmentNo,
      count,
      userEmail
    });
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

// 🔹 Get all shipments for a contract
router.get('/:contractId', async (req, res) => {
  try {
    const shipments = await Shipment.find({ contractId: req.params.contractId });
    res.json(shipments);
  } catch {
    res.status(500).json({ message: 'Failed to fetch shipments' });
  }
});

// 🔹 Delete a shipment by ID (optional)
router.delete('/:id', async (req, res) => {
  try {
    const result = await Shipment.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Shipment not found' });
    res.json({ message: 'Shipment deleted' });
  } catch {
    res.status(500).json({ message: 'Delete failed' });
  }
});
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 }); // latest first
    res.json(shipments);
  } catch (err) {
    console.error('Error fetching shipments:', err);
    res.status(500).json({ message: 'Failed to fetch shipments' });
  }
});
module.exports = router;