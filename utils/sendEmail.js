const nodemailer = require('nodemailer');
require('dotenv').config();

const sendContractAlert = async ({
  contractId,
  deviceCount,
  batteriesShipped,
  threshold,
  isLocked,
  lastUpdated,
  shipmentId,
  adminEmail
}) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify connection before sending
    await transporter.verify();
    console.log('✅ Email server is ready');

    // Email body
    const mailOptions = {
      from: `"PBR System" <${process.env.EMAIL}>`,
      to: adminEmail,
      subject: `⚠️ Contract ${contractId} Exceeded Threshold`,
      html: `
        <h2>🚨 Contract Threshold Exceeded</h2>
        <p><strong>Contract ID:</strong> ${contractId}</p>
        <p><strong>Device Count:</strong> ${deviceCount}</p>
        <p><strong>Batteries Shipped:</strong> ${batteriesShipped}</p>
        <p><strong>Threshold Limit:</strong> ${threshold}</p>
        <p><strong>Locked:</strong> ${isLocked ? '✅ YES' : '❌ NO'}</p>
        <p><strong>Last Updated:</strong> ${new Date(lastUpdated).toLocaleString()}</p>
        <p><strong>Shipment ID:</strong> ${shipmentId}</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to:', adminEmail);
    console.log('📬 Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
};

module.exports = sendContractAlert;
