const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminEmails = process.env.ADMIN_EMAILS.split(",");

const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = decoded;
    req.isAdmin = adminEmails.includes(user.email);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateUser;
