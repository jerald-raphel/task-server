// routes/adminRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');

const SECRET = 'adminsecret123'; // use .env in production

// ✅ Register a new admin
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: 'Admin already exists' });
  }

  const newAdmin = new Admin({ email, password });
  await newAdmin.save();

  res.status(201).json({ message: 'Admin registered successfully' });
});

// 🔐 Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email, password });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  const token = jwt.sign({ id: admin._id }, SECRET, { expiresIn: '1d' });

  res.json({ token, email: admin.email });
});

// ✅ Check if admin exists
router.get('/exists', async (req, res) => {
  const admin = await Admin.findOne();
  if (admin) {
    res.json({ exists: true, email: admin.email });
  } else {
    res.json({ exists: false });
  }
});

module.exports = router;
