const fs = require("fs");
const slugify = require("slugify");
const productModel = require("../models/productmodel.js");
const categoryModel = require("../models/categoryModel.js");
const Order = require("../models/orderModel.js");
const User=require('../models/User.js') 
const cloudinary = require("cloudinary");
const getDataUri = require("../config/datauri.js");

// dotenv config
const dotenv = require("dotenv");
const carouselimage = require("../models/carouselimage.js");
dotenv.config();

// console.log(process.env);

const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock, // replaced quantity with stock
      shipping,
      discountedPrice,
      discount,
      rating,
    } = req.body; // Assuming you use req.body for other fields

    // Validate required fields
    if (!name) return res.status(400).send({ error: "Name is Required" });
    if (!description) return res.status(400).send({ error: "Description is Required" });
    if (!price) return res.status(400).send({ error: "Price is Required" });
    if (!category) return res.status(400).send({ error: "Category is Required" });
    if (stock === undefined || stock === null) return res.status(400).send({ error: "Stock is Required" });
    if (!discountedPrice) return res.status(400).send({ error: "Discounted Price is Required" });
    if (!discount) return res.status(400).send({ error: "Discount is Required" });
    if (!rating) return res.status(400).send({ error: "Rating is Required" });

    // Convert shipping to Boolean
    const shippingValue = shipping === "Yes" || shipping === true;

    // Handle file uploads using Cloudinary
    const images = [];
    if (req.files) {
      for (const file of req.files) {
        const fileUri = getDataUri(file); // Convert file to data URI
        const cdb = await cloudinary.uploader.upload(fileUri); // Upload to Cloudinary
        images.push({
          public_id: cdb.public_id,
          url: cdb.secure_url,
        });
      }
    }

    // Create new product with the 'stock' field
    const product = new productModel({
      name,
      description,
      price,
      category,
      stock, // using stock here
      shipping: shippingValue,
      discountedPrice,
      discount,
      rating,
      slug: slugify(name),
      images, // Save Cloudinary image info to `images`
    });

    // Save the product to the database
    await product.save();

    // Send response
    res.status(201).send({
      success: true,
      message: "Product Created Successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProductController:", error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error: error.message,
    });
  }
};

const getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate({
        path: 'category',
        select: 'name slug',
      })
      .select('-images.data')
      .limit(12)
      .sort({ createdAt: -1 });

    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      stock: product.stock,
      images: product.images.map(img => ({ url: img.url })) // Return objects with a url property
    }));

    res.status(200).send({
      success: true,
      countTotal: products.length,
      message: 'All Products',
      products: formattedProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in getting products',
      error: error.message,
    });
  }
};

const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .populate({
        path: "category",
        select: "name slug" // Only select relevant fields from category
      })
      .select("-images.data"); // Exclude binary image data

    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });

    console.log(product);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while getting single product",
      error,
    });
  }
};

const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("images");
    
    if (!product || !product.images || product.images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found for this product",
      });
    }

    // Return the list of images (public_id and URL)
    res.status(200).json({
      success: true,
      images: product.images,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting photos",
      error,
    });
  }
};

  const updateProductController = async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        stock, // replacing quantity with stock
        shipping,
        discountedPrice,
        discount,
        rating,
      } = req.body;
      const { pid } = req.params; 
      // Product ID from URL parameters

      // Validate required fields
      if (!pid) return res.status(400).send({ error: "Product ID is Required" });

      // Find the existing product
      const product = await productModel.findById(pid);
      if (!product) return res.status(404).send({ error: "Product Not Found" });

      // Update fields if they are provided
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = price;
      if (category) product.category = category;
      if (stock !== undefined) product.stock = stock;
      if (shipping) product.shipping = shipping === "Yes" || shipping === true;
      if (discountedPrice) product.discountedPrice = discountedPrice;
      if (discount) product.discount = discount;
      if (rating) product.rating = rating;

      // Handle file uploads using Cloudinary
      if (req.files) {
        const images = [];
        for (const file of req.files) {
          const fileUri = getDataUri(file);
          const cdb = await cloudinary.uploader.upload(fileUri);
          images.push({
            public_id: cdb.public_id,
            url: cdb.secure_url,
          });
        }
        product.images = images;
      }

      // Save the updated product to the database
      await product.save();

      res.status(200).send({
        success: true,
        message: "Product Updated Successfully",
        product,
      });
    } catch (error) {
      console.error("Error in updateProductController:", error);
      res.status(500).send({
        success: false,
        message: "Error in updating product",
        error: error.message,
      });
    }
  };

    const deleteProductController = async (req, res) => {
      try {
        // Find the product by ID
        const product = await productModel.findById(req.params.pid);

        if (!product) {
          return res.status(404).send({
            success: false,
            message: "Product not found",
          });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
          for (const image of product.images) {
            try {
              await cloudinary.uploader.destroy(image.public_id);
            } catch (deleteError) {
              console.error("Error deleting image:", deleteError);
              // Continue deleting other images if one fails
            }
          }
        }

        // Delete the product
        await productModel.findByIdAndDelete(req.params.pid);

        res.status(200).send({
          success: true,
          message: "Product deleted successfully",
        });
      } catch (error) {
        console.error("Error while deleting product:", error);
        res.status(500).send({
          success: false,
          message: "Error while deleting product",
          error: error.message,
        });
      }
    };

const productFiltersController = async (req, res) => {
  try {
    const { checked = [], radio = [] } = req.body;
    let filterArgs = {};

    // Add category filter if any
    if (checked.length > 0) {
      filterArgs.category = { $in: checked };
    }

    // Add price range filter if provided and valid
    if (radio.length === 2) {
      const [minPrice, maxPrice] = radio.map(Number);
      
      if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice >= 0 && maxPrice >= minPrice) {
        filterArgs.price = { $gte: minPrice, $lte: maxPrice };
      } else {
        return res.status(400).send({
          success: false,
          message: "Invalid price range",
        });
      }
    }

    // Fetch filtered products
    const products = await productModel.find(filterArgs);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in filtering products:", error);
    res.status(400).send({
      success: false,
      message: "Error while filtering products",
      error: error.message,
    });
  }
};

const productcountcontroller = async (req, res) => {
  try {
    const total = await productModel.countDocuments();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.error("Error while counting products:", error);
    res.status(400).send({
      success: false,
      message: "Error while counting products",
      error: error.message,
    });
  }
};

const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select({}); // Update from -photo to -images
    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error In Search Product API",
      error,
    });
  }
};

const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = parseInt(req.params.page) || 1;
    const products = await productModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    const total = await productModel.countDocuments();
    res.status(200).send({
      success: true,
      products,
      total,
      perPage,
      page,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error in per page product list",
      error,
    });
  }
};

const getrelatedproduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    console.log("Category ID:", cid);
    console.log("Product ID:", pid);

    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(4)
      .populate({
        path: "category",
        select: "name slug"
      });

    console.log("Related Products:", products);

    res.status(200).send({
      success: true,
      products
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in related product list",
      error: error.message,
    });
  }
};

const getProductsByCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    const products = await productModel
      .find({ category: category._id })
      .populate("category")
      .select("images");

    res.status(200).json({
      success: true,
      message: `Products for category ${category.name}`,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in fetching products by category",
      error: error.message,
    });
  }
};

const productCategoryController = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 6 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (pageNumber <= 0 || pageSize <= 0) {
      return res.status(400).send({
        success: false,
        message: 'Invalid pagination parameters.',
      });
    }

    const category = await categoryModel.findOne({ slug });

    if (!category) {
      return res.status(404).send({
        success: false,
        message: 'Category not found.',
      });
    }

    const totalProducts = await productModel.countDocuments({ category });

    const products = await productModel
      .find({ category })
      .populate('category')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select({});

    res.status(200).send({
      success: true,
      category,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: 'Error while getting products',
    });
  }
};



const dummyPaymentController = async (req, res) => {
  try {
    const { cart } = req.body; // Expecting an array of cart items with "stock"
    let total = 0;
    cart.forEach((item) => {
      total += item.price * (item.stock || 1); // Use item.stock here
    });

    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      throw new Error("User not found for UID: " + req.user.uid);
    }

    const order = new Order({
      products: cart.map((item) => ({
        product: item.product, // Ensure this is a valid Product ID
        stock: item.stock,     // Use the "stock" field from the request
        price: item.price,
      })),
      buyer: user._id, // Use the MongoDB _id from the User document
      status: "Not Process",
      payment: {
        status: "Success",
        transactionId: "dummyTransactionId123",
      },
    });

    // Save the new order
    await order.save();

    // After saving the order, update each product's stock dynamically
    // by subtracting the purchased amount (item.stock) from its current stock.
    for (const item of cart) {
      await productModel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.stock } },
        { new: true }
      );
    }

    res.json({ ok: true, totalAmount: total });
  } catch (error) {
    console.error("DummyPaymentController Error:", error);
    res.status(500).json({ ok: false, message: "An error occurred", error: error.message });
  }
};






// Carousel Image Controller
const uploadCarouselImagesController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded.",
      });
    }

    const images = [];
    for (const file of req.files) {
      const fileUri = getDataUri(file);
      const result = await cloudinary.uploader.upload(fileUri);

      const newImage = {
        public_id: result.public_id,
        url: result.secure_url,
      };

      const carouselImage = await carouselimage.create(newImage);
      images.push(carouselImage);
    }

    res.status(201).json({
      success: true,
      message: "Carousel images uploaded successfully.",
      images,
    });
  } catch (error) {
    console.error("Error in uploadCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while uploading carousel images",
      error: error.message,
    });
  }
};

const updateCarouselImagesController = async (req, res) => {
  try {
    const { id } = req.params;
    const { public_id, url } = req.body;

    if (!public_id || !url) {
      return res.status(400).json({
        success: false,
        message: "Public ID and URL are required.",
      });
    }

    const updatedImage = await carouselimage.findByIdAndUpdate(
      id,
      { public_id, url },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image updated successfully.",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error in updateCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating the image",
      error: error.message,
    });
  }
};

const deleteCarouselImagesController = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await carouselimage.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    await cloudinary.uploader.destroy(image.public_id);
    await carouselimage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteCarouselImagesController:", error);
    res.status(500).json({
      success: false,
      message: "Error while deleting the image",
      error: error.message,
    });
  }
};

const getci = ("/carousel-images", async (req, res) => {
  try {
    const images = await carouselimage.find();
    res.json({
      success: true,
      images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching carousel images",
      error: error.message,
    });
  }
});

module.exports = {
  getProductController,
  createProductController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
  productFiltersController,
  productListController,
  searchProductController,
  productcountcontroller,
  getrelatedproduct,
  getProductsByCategoryController,
  productCategoryController,
  dummyPaymentController,
  productPhotoController,
  uploadCarouselImagesController,
  getci,
  updateCarouselImagesController,
  deleteCarouselImagesController,
};
