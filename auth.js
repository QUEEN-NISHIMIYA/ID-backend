const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const router = express.Router();
const nodemailer = require('nodemailer');

// Verification Code Storage (In-memory for simplicity)
const verificationCodes = {};

// Middleware to authenticate user
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Verify Token Route
router.get('/verify-token', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Authenticated' });
});

// Send Verification Code
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
  verificationCodes[email] = verificationCode; // Save in-memory (use DB for production)

  // Configure Nodemailer with your Outlook email
  const transporter = nodemailer.createTransport({
    service: 'Outlook',
    auth: {
      user: process.env.OUTLOOK_EMAIL, // Your Outlook email address
      pass: process.env.OUTLOOK_PASSWORD, // Your Outlook email password
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${verificationCode}`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify Code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (verificationCodes[email] === code) {
    delete verificationCodes[email]; // Clear the code after successful verification
    return res.json({ message: 'Email verified successfully!' });
  }

  res.status(400).json({ error: 'Invalid verification code' });
});

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const izumieID = generateIZUMIEID();

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
      izumieID,
    });

    await user.save();

    res.json({
      message: "User registered successfully.",
      izumieID: user.izumieID,
    });
  } catch (err) {
    res.status(500).json({ error: "Error registering user." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Error logging in." });
  }
});

// 2FA Setup Route
router.post("/2fa/setup", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const secret = speakeasy.generateSecret({ name: "IZUMIE" });
    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      message: "2FA setup completed.",
      qrCode,
    });
  } catch (err) {
    res.status(500).json({ error: "Error setting up 2FA." });
  }
});

// Helper Function to Generate IZUMIE ID
function generateIZUMIEID() {
  return "IZU" + Math.random().toString(36).slice(-9).toUpperCase();
}

module.exports = router;
