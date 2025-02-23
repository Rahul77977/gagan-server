// models/CarouselImage.js
const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('CarouselImage', carouselImageSchema);
