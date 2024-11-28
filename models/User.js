const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  izumieID: { type: DataTypes.STRING, unique: true },
  kycStatus: { type: DataTypes.STRING, defaultValue: "pending" },
});

module.exports = User;
