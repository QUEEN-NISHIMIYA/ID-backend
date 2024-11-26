const jwt = require("jsonwebtoken");
const adminEmails = process.env.ADMIN_EMAILS.split(",");
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (adminEmails.includes(decoded.email)) {
      req.isAdmin = true;
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = authenticateUser;
