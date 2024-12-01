const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const APIKey = require("../models/APIKey");
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
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working" });
});
router.post("/send-verification", async (req, res) => {
  console.log("Request received:", req.body); // Log incoming request

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  console.log("Generating verification code...");
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = verificationCode;

  console.log("Creating mail transporter...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  console.log("Setting mail options...");
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is ${verificationCode}.`,
  };

  try {
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    res.json({ message: "Verification code sent!" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});


  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
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
    const user = await User.create({
      email,
      password: hashedPassword,
      izumieID,
    });
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
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Error logging in." });
  }
});

// Other routes remain the same
function generateIZUMIEID() {
  return "IZU" + Math.random().toString(36).slice(-9).toUpperCase();
}

module.exports = router;
