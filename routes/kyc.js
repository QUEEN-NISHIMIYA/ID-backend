const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Submit KYC
router.post("/submit", async (req, res) => {
  const { userId, kycDocuments, kycCountry } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.kycDocuments = kycDocuments;
    user.kycCountry = kycCountry;
    user.kycStatus = "pending";

    await user.save();

    res.json({ message: "KYC submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error submitting KYC." });
  }
});

// Check KYC Status
router.get("/status/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ kycStatus: user.kycStatus });
  } catch (err) {
    res.status(500).json({ error: "Error fetching KYC status." });
  }
});

module.exports = router;
