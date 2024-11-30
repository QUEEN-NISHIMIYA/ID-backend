const express = require("express");
const { v4: uuidv4 } = require("uuid");
const KYC = require("../models/KYC");
const User = require("../models/User");

const router = express.Router();

router.post("/submit", async (req, res) => {
  const { userId, kycDocuments, kycCountry } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const kycIdentityID = uuidv4();
    const kyc = new KYC({
      userId,
      kycDocuments,
      kycCountry,
      kycIdentityID,
    });
    await kyc.save();
    user.kycStatus = "pending";
    await user.save();
    res.json({ message: "KYC submitted successfully.", kycIdentityID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error submitting KYC." });
  }
});

router.get("/status/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ kycStatus: user.kycStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching KYC status." });
  }
});

module.exports = router;
