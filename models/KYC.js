const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const KYC = sequelize.define("KYC", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  kycDocuments: { type: DataTypes.JSONB },
  kycCountry: { type: DataTypes.STRING },
  kycIdentityID: { type: DataTypes.STRING, unique: true },
});

module.exports = KYC;
