const slugify = require("slugify");
const fs = require("fs");
const categoryModel = require("../models/categoryModel");

// Create Category Controller
const createCategoryController = async (req, res) => {
  try {
    const { name } = req.fields; // Accessing fields from formidable

    if (!name) {
      return res.status(401).send({ message: "Name is required" });
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res.status(200).send({ success: false, message: "Category Already Exists" });
    }

    const category = new categoryModel({
      name,
      slug: slugify(name),
    });

    // Handle photo upload
    if (req.files && req.files.photo) {
      const { photo } = req.files;
      category.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    await category.save();
    res.status(201).send({ success: true, message: "New category created", category });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error in Category" });
  }
};

// Update Category Controller
const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.fields; // Accessing fields from formidable
    const { id } = req.params;

    // Find the category by ID
    const category = await categoryModel.findById(id);
    if (!category) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }

    // Update the name and slug if provided
    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }

    // Handle photo upload if provided
    if (req.files && req.files.photo) {
      const { photo } = req.files;
      category.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    // Save the updated category
    await category.save();
    res.status(200).send({ success: true, message: "Category Updated Successfully", category });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while updating category" });
  }
};

// Get All Categories Controller
const categoryControlller = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({ success: true, message: "All Categories List", categories });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while getting all categories" });
  }
};

// Get Single Category Controller
const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).send({ success: false, message: "Category not found" });
    }
    res.status(200).send({ success: true, message: "Get Single Category Successfully", category });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while getting Single Category" });
  }
};

// Delete Category Controller
const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({ success: true, message: "Category Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error while deleting category", error });
  }
};

// Get Category Image Controller
const getCategoryImageController = async (req, res) => {
  try {
    const category = await categoryModel.findById(req.params.id);
    if (!category || !category.photo) {
      return res.status(404).send({ message: "Category or image not found" });
    }
    // Send image as response
    res.set('Content-Type', category.photo.contentType);
    res.send(category.photo.data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error while retrieving category image", error });
  }
};

module.exports = {
  createCategoryController,
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryController,
  getCategoryImageController,
};
