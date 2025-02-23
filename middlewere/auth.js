// middleware/auth.js
const admin = require("../firebase");

const verifyToken = async (req, res, next) => {
  let idToken = req.headers.authorization;
  
  // Log the raw token received from the client
  console.log("Raw token from header:", idToken);

  if (!idToken) {
    return res.status(401).send("Unauthorized");
  }

  // Remove 'Bearer ' prefix if present
  if (idToken.startsWith("Bearer ")) {
    idToken = idToken.split(" ")[1];
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Log the decoded token details
    console.log("Decoded token:", decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).send("Unauthorized");
  }
};

module.exports = { verifyToken };
