const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');

// ✅ Create a new contract
router.post('/', async (req, res) => {
  const { contractId, deviceCount, status } = req.body;

  try {
    const existing = await Contract.findOne({ contractId });
    if (existing) {
      return res.status(400).json({ message: 'Contract ID already exists' });
    }

    const contract = new Contract({
      contractId,
      deviceCount,
      status: status || 'pending'
    });

    await contract.save();
    res.status(201).json({ message: 'Contract created successfully', contract });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!['pending', 'locked', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const updated = await Contract.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Contract not found' });

    res.json({ message: 'Status updated', contract: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.json(contracts);
  } catch {
    res.status(500).json({ message: 'Error fetching contracts' });
  }
});
router.get('/api/contracts', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const contracts = await Contract.find(query);
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contracts' });
  }
});
// PUT /api/contracts/:id/unlock
router.put('/:id/unlock', async (req, res) => {
  try {
    const contract = await Contract.findOne({ contractId: req.params.id });
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    contract.status = 'pending';
    await contract.save();

    res.json({ message: 'Contract unlocked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unlock contract' });
  }
});

module.exports = router;
