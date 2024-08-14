// models/Snack.js

const mongoose = require('mongoose');

const snackSchema = new mongoose.Schema({
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
}, { collection: 'snacks' }); // Specify the collection name

module.exports = mongoose.model('Snack', snackSchema);
