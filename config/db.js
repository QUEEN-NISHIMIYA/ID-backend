const mongoose = require("mongoose");

const connectDatabases = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_AUTH, { ...options });
    console.log("Auth DB connected");

    const kycConnection = mongoose.createConnection(process.env.MONGO_URI_KYC, { ...options });
    const izumieIDConnection = mongoose.createConnection(process.env.MONGO_URI_ID, { ...options });

    module.exports.kycDB = kycConnection;
    module.exports.izumieIDDB = izumieIDConnection;
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDatabases;
