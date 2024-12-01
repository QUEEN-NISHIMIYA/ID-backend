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

// Middleware for token authentication
function authenticateUser(req, res, next) {
  console.log("Authenticating user...");
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ message: 'No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("User authenticated:", decoded);
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
}

// Test route to verify the auth router works
router.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({ message: "Auth routes are working" });
});

// Verify token route
router.get('/verify-token', authenticateUser, (req, res) => {
  console.log("Token verified successfully.");
  res.status(200).json({ message: 'Authenticated' });
});

// Send verification email
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  console.log("Received request to send verification email to:", email);

  if (!email) {
    console.error("Email is required.");
    return res.status(400).json({ error: "Email is required" });
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = verificationCode;
  console.log("Generated verification code:", verificationCode);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: "Verification Code",
    text: `Your verification code is ${verificationCode}. Do not share this code with anyone.`,
  };

  try {
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
    res.json({ message: "Verification code sent!" });
  } catch (err) {
    console.error("Failed to send email:", err);
    res.status(500).json({ error: "Failed to send verification code" });
  }
});

// Verify code
router.post('/verify-code', (req, res) => {
  const { email, code } = req.body;
  console.log("Verifying code for email:", email);

  if (verificationCodes[email] === code) {
    console.log("Code verified successfully for email:", email);
    delete verificationCodes[email];
    return res.json({ message: 'Email verified successfully!' });
  }

  console.error("Invalid verification code for email:", email);
  res.status(400).json({ error: 'Invalid verification code' });
});

// Register user
router.post("/register", async (req, res) => {
  try {
    console.log("Registering user with data:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Email and password are required.");
      return res.status(400).json({ error: "Email and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const izumieID = generateIZUMIEID();
    console.log("Generated IZUMIE ID:", izumieID);

    const user = await User.create({
      email,
      password: hashedPassword,
      izumieID,
    });

    console.log("User registered successfully:", user.email);
    res.json({
      message: "User registered successfully.",
      izumieID: user.izumieID,
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).json({ error: "Error registering user." });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for email:", email);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password for email:", email);
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful for email:", email);
    res.json({ token });
  } catch (err) {
    console.error("Error logging in user:", err.message);
    res.status(500).json({ error: "Error logging in." });
  }
});

// Generate IZUMIE ID
function generateIZUMIEID() {
  const id = "IZU" + Math.random().toString(36).slice(-9).toUpperCase();
  console.log("Generated IZUMIE ID:", id);
  return id;
}

module.exports = router;
