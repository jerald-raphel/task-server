const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const SECRET = 'secretkey123'; // Use process.env.SECRET in production

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const user = new User({ name, email, password });
  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1d' });

  res.json({ token, name: user.name, email: user.email });
});
// ✅ Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email'); // only return name & email
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
