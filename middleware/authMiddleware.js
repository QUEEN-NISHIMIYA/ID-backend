const jwt = require("jsonwebtoken");

const adminEmails = ["braveizumie@outlook.com"]; // Add your admin emails

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if the user is an admin
    if (adminEmails.includes(decoded.email)) {
      req.isAdmin = true; // Add admin flag
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticateUser;
