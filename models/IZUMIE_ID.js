
const mongoose = require("mongoose");

const izumieIDSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  izumieID: { type: String, unique: true, required: true },
  issuedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IZUMIE_ID", izumieIDSchema);
