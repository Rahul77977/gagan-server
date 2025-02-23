const express = require("express");
const { verifyToken } = require("../middlewere/auth"); // Destructure verifyToken
const  adminMiddleware = require("../middlewere/admin-middlewere"); // Destructure adminMiddleware
const {
  createProductController,
  updateProductController,
  getProductController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  productFiltersController,
  productcountcontroller,
  productListController,
  searchProductController,
  getrelatedproduct,
  getProductsByCategoryController,
  productCategoryController,
  dummyPaymentController,
  uploadCarouselImagesController,
  getci,
  updateCarouselImagesController,
  deleteCarouselImagesController,
} = require("../controller/prodcutcontroller");
const { upload } = require("../middlewere/multer");
const carouselimage = require("../models/carouselimage");

const router = express.Router();

// Product CRUD Routes
router.post("/create-product", verifyToken, adminMiddleware, upload, createProductController);
// router.put("/update-product/:pid", verifyToken, adminMiddleware, upload, updateProductController);
router.put("/update-product/:pid", verifyToken, adminMiddleware, upload, updateProductController);

router.delete("/delete-product/:pid", verifyToken, adminMiddleware, deleteProductController);



// Product Retrieval Routes
router.get("/get-products", getProductController);
router.get("/get-product/:slug", getSingleProductController);
router.get("/product-photo/:pid", productPhotoController);

// Filtering and Searching
router.post("/product-filters", productFiltersController);
router.get("/product-count", productcountcontroller);
router.get("/product-list/:page", productListController);
router.get("/search/:keyword", searchProductController);

// Similar product
router.get("/similar-product/:pid/:cid", getrelatedproduct);

// Product category
router.get('/product-category/:slug', productCategoryController);

// Payment routes
router.post("/payment", verifyToken, dummyPaymentController);
router.post("/uploadc", verifyToken, adminMiddleware, upload, uploadCarouselImagesController);
router.post('/updatec/:id', verifyToken, adminMiddleware, updateCarouselImagesController);
router.post('/deletec/:id', verifyToken, adminMiddleware, deleteCarouselImagesController);

// Route for getting all carousel images (if needed)
router.get('/carousel-images', getci);

module.exports = router;
