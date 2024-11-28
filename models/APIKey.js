const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const APIKey = sequelize.define("APIKey", {
  applicationName: { type: DataTypes.STRING, allowNull: false },
  apiKey: { type: DataTypes.STRING, allowNull: false, unique: true },
  createdBy: { type: DataTypes.INTEGER }, // Reference to User
});

module.exports = APIKey;
