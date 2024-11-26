const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const QRCode = require('qrcode');
const router = express.Router();

// Generate QR Code
router.get('/generate-qr', async (req, res) => {
  try {
    const qrCode = await QRCode.toDataURL('https://izumie.rf.gd/terms-and-conditions');
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code' });
  }
});

// Authenticate Token Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Authorization token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Profile Retrieval
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email izumieID');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update User Profile
router.put('/update', authenticateToken, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.email = email || user.email;
    await user.save();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete User Profile
router.delete('/delete', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Admin Access
router.get('/admin-access', authenticateToken, (req, res) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  res.json({ message: 'Welcome Admin! You have direct access.' });
});

// Admin QR Code
router.get('/admin-qr', async (req, res) => {
  try {
    const qrCode = await QRCode.toDataURL('https://izumie.rf.gd/admin-dashboard');
    res.json({ qrCode });
  } catch (error) {
    res.status(500).json({ error: 'Error generating QR code for admin' });
  }
});

module.exports = router;
