const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const APIKey = sequelize.define("APIKey", {
  applicationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdBy: {
    type: DataTypes.INTEGER, // Assuming User has an integer primary key
    references: {
      model: "Users", // Table name for users
      key: "id",
    },
  },
}, {
  timestamps: true,
});

module.exports = APIKey;
