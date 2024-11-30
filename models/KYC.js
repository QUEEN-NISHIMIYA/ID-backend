const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  kycDocuments: { type: Object, required: true },
  kycCountry: { type: String, required: true },
  kycIdentityID: { type: String, unique: true },
});

module.exports = mongoose.model("KYC", kycSchema);
