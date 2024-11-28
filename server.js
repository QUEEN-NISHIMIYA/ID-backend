const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { sequelize } = require("./config/db");
const authRoutes = require("./routes/auth");
const kycRoutes = require("./routes/kyc");
const userRoutes = require("./routes/user");
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
connectDB();
sequelize.sync({ alter: true })
  .then(() => console.log("Models synchronized successfully."))
  .catch(err => console.error("Error synchronizing models:", err));
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/user", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
