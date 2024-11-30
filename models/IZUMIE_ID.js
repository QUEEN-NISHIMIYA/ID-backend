const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const IZUMIE_ID = sequelize.define("IZUMIE_ID", {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  izumieID: { type: DataTypes.STRING, unique: true, allowNull: false },
  issuedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = IZUMIE_ID;
