const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema({
  applicationName: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
});

module.exports = mongoose.model("APIKey", apiKeySchema);
