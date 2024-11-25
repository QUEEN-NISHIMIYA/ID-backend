const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();
connectDB();
const app = express();
app.use(express.json());
app.use(cors({
  origin: ["https://izumie.rf.gd"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
const authRoutes = require("./routes/auth");
const kycRoutes = require("./routes/kyc");
const userRoutes = require("./routes/user");
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/user", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
