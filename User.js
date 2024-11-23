const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  izumieID: { type: String, unique: true },
  twoFactorSecret: { type: String }, // For 2FA
  kycDocuments: { type: Object }, // Store KYC files or details
  kycCountry: { type: String },
  kycStatus: { type: String, default: "pending" }, // 'pending', 'approved', or 'rejected'
});

module.exports = mongoose.model("User", userSchema);
