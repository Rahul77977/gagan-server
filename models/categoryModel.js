const mongoose = require("mongoose");

// Define your schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // unique: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  photo: {
    data: Buffer,
    contentType: String,
  },
});

// Check if the model is already defined
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
