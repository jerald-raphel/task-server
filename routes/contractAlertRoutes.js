// routes/contractAlert.js
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

router.post('/contract-alert', async (req, res) => {
  const {
    contractId,
    deviceCount,
    batteriesShipped,
    threshold,
    isLocked,
    lastUpdated,
    shipmentId,
    adminEmail
  } = req.body;

  if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
    return res.status(500).json({ message: 'Missing email credentials in .env' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: adminEmail,
    subject: 'Contract Shipment Alert',
    text: `
🔔 New Shipment Alert

Contract ID: ${contractId}
Device Count: ${deviceCount}
Batteries Shipped: ${batteriesShipped}
Threshold: ${threshold}
Shipment ID: ${shipmentId}
Is Locked: ${isLocked ? 'Yes' : 'No'}
Last Updated: ${new Date(lastUpdated).toLocaleString()}

Please check the dashboard for more details.
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Admin email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router;
