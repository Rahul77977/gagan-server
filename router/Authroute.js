const express = require("express");
const router = express.Router();

const {
  googleAuth,
  userProfileController,
  forgotPasswordController,
  updateProfileController,
  getAllOrdersController,
  getOrderByIdController,
  getAdminOrders,
  orderStatusController,
  getTotalCounts,
} = require("../controller/Authcontroller");

const { verifyToken } = require("../middlewere/auth");
const getallusers = require("../controller/admin-controller");
const adminMiddleware = require("../middlewere/admin-middlewere");

// Token info route
router.get("/token-info", verifyToken, (req, res) => {
  console.log("Decoded token:", req.user);
  res.status(200).json({ tokenInfo: req.user });
});

// Google authentication route
router.post("/googleAuth", verifyToken, googleAuth);





router.get('/users', verifyToken,getallusers);

// User profile route
router.get("/profile/:userId", verifyToken, userProfileController);

// Forgot password route
router.post("/forgot-password", forgotPasswordController);

// Update profile route
router.put("/profile", verifyToken, updateProfileController);






// Orders of user
router.get("/orders", verifyToken, getAllOrdersController);




//order details page
router.get("/orders/:id", verifyToken, getOrderByIdController);


// Admin orders and order status routes
router.get("/all-orders", verifyToken, getAdminOrders);
router.put("/order-status/:orderId", verifyToken, orderStatusController);

// Total counts route
router.get("/total-counts",  getTotalCounts);

module.exports = router;
