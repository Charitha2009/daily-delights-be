const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DairyProduct = require('../models/DairyProduct'); // Ensure the model is correctly imported
const fs = require('fs');

// Set up storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to add a new dairy product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, unit, count } = req.body;
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!name || !description || !price || !count) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Log received data for debugging
    console.log('Received data:', { name, description, price, count, image });

    const newDairyProduct = new DairyProduct({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newDairyProduct.save();
    res.status(201).json(newDairyProduct);
  } catch (error) {
    console.error('Error adding dairy product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all dairy products
router.get('/', async (req, res) => {
    try {
      const dairyProducts = await DairyProduct.find(); // Fetch all dairy products from MongoDB
      res.status(200).json(dairyProducts);
    } catch (error) {
      console.error('Error fetching dairy products:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a dairy product
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the dairy product by ID
      let dairyProduct = await DairyProduct.findById(id);
      if (!dairyProduct) {
        return res.status(404).json({ message: 'Dairy Product not found' });
      }

      // Update the dairyProduct details
      dairyProduct.name = name || dairyProduct.name;
      dairyProductruit.description = description || dairyProduct.description;
      dairyProduct.price = price || dairyProduct.price;
      dairyProduct.unit = unit || dairyProduct.unit;
      dairyProduct.count = count || dairyProduct.count;

      // Check if a new image is uploaded
      if (req.file) {
        dairyProduct.image = req.file.filename; // Update the image path
      }

      // Save the updated dairyProduct
      await dairyProduct.save();

      res.status(200).json(dairyProduct);
    } catch (error) {
      console.error('Error updating dairyProduct:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a dairyProduct
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the dairyProduct by ID
      const dairyProduct = await DairyProduct.findById(id);
      if (!dairyProduct) {
        return res.status(404).json({ message: 'Dairy product not found' });
      }

      // Delete the dairyProduct's image file if it exists
      if (dairyProduct.image) {
        const imagePath = path.join(__dirname, '../uploads', dairyProduct.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the dairyProduct from the database
      await DairyProduct.findByIdAndDelete(id);

      res.status(200).json({ message: 'Dairy Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting dairyProduct:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
