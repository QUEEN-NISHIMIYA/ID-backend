const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();
const verificationCodes = {};
const otpCache = {};
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
router.get('/verify-token', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Authenticated' });
});
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = verificationCode;
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.OUTLOOK_EMAIL,
      pass: process.env.OUTLOOK_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.OUTLOOK_EMAIL,
    to: email,
    subject: 'IZUMIE Verification Code',
    text: `Your verification code is ${verificationCode}. Do not share this code with anyone.`,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Verification code sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (verificationCodes[email] === code) {
    delete verificationCodes[email];
    return res.json({ message: 'Email verified successfully!' });
  }
  res.status(400).json({ error: 'Invalid verification code' });
});
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const izumieID = generateIZUMIEID();
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
router.post('/send-reset-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = crypto.randomInt(100000, 999999).toString();
    otpCache[email] = { otp, expires: Date.now() + 10 * 60 * 1000 }; // Valid for 10 minutes
    const transporter = nodemailer.createTransport({
      service: 'Outlook365',
      auth: {
        user: process.env.OUTLOOK_EMAIL,
        pass: process.env.OUTLOOK_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: process.env.OUTLOOK_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    });

    res.json({ message: 'OTP sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error });
  }
});
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const cache = otpCache[email];
  if (!cache || cache.otp !== otp || cache.expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    delete otpCache[email];
    res.json({ message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});
function generateIZUMIEID() {
  return "IZU" + Math.random().toString(36).slice(-9).toUpperCase();
}
module.exports = router;
