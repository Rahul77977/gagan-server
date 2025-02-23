const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, unique: true },
  picture: String,
  phoneNumber: { type: String, unique: true, sparse: true }, // Add phone number
  isAdmin: {
    type: Boolean,
    default: false,
  },

});

const User = mongoose.model("User", userSchema);
module.exports = User;
