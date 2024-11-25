const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  izumieID: { type: String, unique: true },
  twoFactorSecret: { type: String },
  kycDocuments: { type: Object },
  kycCountry: { type: String },
  kycStatus: { type: String, default: "pending" },
});
module.exports = mongoose.model("User", userSchema);
