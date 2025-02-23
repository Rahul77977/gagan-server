const express = require('express');
const { verifyToken } = require('../middlewere/auth'); // Destructure the verifyToken function
const  adminMiddleware  = require('../middlewere/admin-middlewere'); // Assuming you export this as adminMiddleware
const formidable = require("express-formidable");
const categoryController = require('../controller/categoryController');
const router = express.Router();

// Create Category
router.post(
  '/create-category',
  verifyToken,        // Check if the user is authenticated
  adminMiddleware,    // Check if the user has admin privileges
  formidable(),       // Parse form data including files
  categoryController.createCategoryController
);

// Update Category
router.put(
  "/update-category/:id",
  verifyToken,        // Check if the user is authenticated
  adminMiddleware,    // Check if the user has admin privileges
  formidable(),       // Parse form data including files
  categoryController.updateCategoryController
);

// Get All Categories
router.get(
  "/get-category",
  categoryController.categoryControlller
);

// Get Single Category
router.get(
  "/single-category/:slug",
  verifyToken,        // Check if the user is authenticated
  categoryController.singleCategoryController
);

// Delete Category
router.delete(
  "/delete-category/:id",
  verifyToken,        // Check if the user is authenticated
  adminMiddleware,    // Check if the user has admin privileges
  categoryController.deleteCategoryController
);

// Get Category Image
router.get(
  '/category-image/:id',
  categoryController.getCategoryImageController
);

module.exports = router;
