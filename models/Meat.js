// models/Meat.js

const mongoose = require('mongoose');

const meatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // Path to the uploaded image
  },
}, { collection: 'meats' }); // Specify the collection name

module.exports = mongoose.model('Meat', meatSchema);
