const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const QRCode = require('qrcode');

const router = express.Router();

// Generate QR Code for Terms and Conditions
router.get('/generate-qr', async (req, res) => {
  try {
    const qrCode = await QRCode.toDataURL('https://yourwebsite.com/terms-and-conditions');
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Authorization token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['email', 'izumieID'] });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Information
router.put('/update', authenticateToken, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.email = email || user.email;
    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete User
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Access - No Login Required
router.get('/admin-access', async (req, res) => {
  try {
    res.json({ message: 'Welcome Admin! You have direct access.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// QR Code for Admin Panel Access
router.get('/admin-qr', async (req, res) => {
  try {
    const qrCode = await QRCode.toDataURL('https://yourwebsite.com/admin');
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code for admin' });
  }
});

module.exports = router;
