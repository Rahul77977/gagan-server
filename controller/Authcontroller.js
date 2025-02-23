const User = require("../models/User");
const Order = require("../models/orderModel");
// Ensure you import your product model if needed for counts
const productmodel = require("../models/productmodel.js");

// Google authentication controller
const googleAuth = async (req, res) => {
  // Extract user details from Firebase token decoded in the verifyToken middleware
  const { uid, name, email, picture, phone_number } = req.user;

  try {
    // Check if the user already exists
    let user = await User.findOne({ uid });
    // If not, create a new user record
    if (!user) {
      user = new User({
        uid,
        name,
        email,
        picture,
        phoneNumber: phone_number,
      });
      await user.save();
    }
    // Return the user object
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Additional controllers

const getAllUsersController = async (req, res) => {
  try {
    // Fetch all users and select only the necessary fields
    const users = await User.find().select("uid name email picture phoneNumber isAdmin");
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const userProfileController = async (req, res) => {
  try {
    const userId = req.params.userId;
    // If not admin and the requesting user doesn't match the requested userId, deny access
    if (!req.user.isAdmin && req.user._id !== userId) {
      return res.status(403).json({ message: "Forbidden. You can't access this profile." });
    }
    // Find by _id
    const user = await User.findById(userId).select("uid name email picture phoneNumber isAdmin");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      userData: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        picture: user.picture,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email || !answer || !newPassword) {
      return res.status(400).json({
        message: "Email, answer, and new password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }
    if (user.answer !== answer) {
      return res.status(400).json({
        success: false,
        message: "Incorrect security answer",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: password ? password : user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error While Updating Profile",
      error,
    });
  }
};

// ----- Order Controllers -----

// Get all orders for the authenticated user (non-admin)
// Now finds the user by Firebase UID and uses the MongoDB _id to filter orders.
const getAllOrdersController = async (req, res) => {
  try {
    // Find the user in the User collection by Firebase UID
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const orders = await Order.find({ buyer: user._id })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price images",
      })
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    console.log("Authenticated User:", req.user);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

// controllers/Authcontroller.js (or your appropriate controller file)
const getOrderByIdController = async (req, res) => {
  try {
    // Fetch order and populate product details and buyer info (including uid)
    const order = await Order.findById(req.params.id)
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price images description",
      })
      .populate("buyer", "name uid"); // include uid for debugging

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Instead of comparing MongoDB _id fields, we compare Firebase UID values.
    // We already have the authenticated user's uid from the decoded token.
    console.log("Order Buyer UID:", order.buyer?.uid);
    console.log("Authenticated User UID:", req.user.uid);

    // Allow access only if the order's buyer uid matches the authenticated user's uid.
    if (order.buyer?.uid !== req.user.uid) {
      return res.status(403).json({ message: "Forbidden. You cannot access this order." });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("getOrderByIdController error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error,
    });
  }
};


// Update order status
const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updating Order",
      error,
    });
  }
};

// Admin: Get all orders (for admin users)
const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: "products.product",
        select: "name description price discountedPrice quantity images",
      })
      .populate({
        path: "buyer",
        select: "name",
      })
      .sort({ createdAt: -1 });
    console.log("Populated orders:", orders);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

const getTotalCounts = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await productmodel.countDocuments();
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({}, "payment");
    let totalSales = 0;
    for (const order of orders) {
      if (order.payment && order.payment.amount) {
        totalSales += order.payment.amount;
      }
    }
    res.status(200).json({
      success: true,
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
    });
    console.log("Total Users:", totalUsers);
    console.log("Total Products:", totalProducts);
    console.log("Total Orders:", totalOrders);
    console.log("Total Sales:", totalSales);
  } catch (error) {
    console.error("Error fetching counts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch counts",
    });
  }
};

module.exports = {
  googleAuth,
  userProfileController,
  forgotPasswordController,
  updateProfileController,
  getAllOrdersController,
  getOrderByIdController,
  getAdminOrders,
  orderStatusController,
  getTotalCounts,
  getAllUsersController,
};
