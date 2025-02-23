// middlewere/admin-middlewere.js
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    console.log("Decoded token from request:", req.user);
    // Find the user in your database using the uid from the decoded token
    const user = await User.findOne({ uid: req.user.uid });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }
    
    // If user is an admin, continue to the next middleware/controller  
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    next(error);
  }
};

module.exports = adminMiddleware;
