const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Vegetable = require('../models/Vegetable'); // Ensure the model is correctly imported
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

// Route to add a new vegetable
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

    const newVegetable = new Vegetable({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newVegetable.save();
    res.status(201).json(newVegetable);
  } catch (error) {
    console.error('Error adding vegetable:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all vegetables
router.get('/', async (req, res) => {
    try {
      const vegetables = await Vegetable.find(); // Fetch all vegetables from MongoDB
      res.status(200).json(vegetables);
    } catch (error) {
      console.error('Error fetching vegetables:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a vegetable
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the vegetable by ID
      let vegetable = await Vegetable.findById(id);
      if (!vegetable) {
        return res.status(404).json({ message: 'Vegetable not found' });
      }

      // Update the vegetable details
      vegetable.name = name || vegetable.name;
      vegetable.description = description || vegetable.description;
      vegetable.price = price || vegetable.price;
      vegetable.unit = unit || vegetable.unit;
      vegetable.count = count || vegetable.count;

      // Check if a new image is uploaded
      if (req.file) {
        vegetable.image = req.file.filename; // Update the image path
      }

      // Save the updated vegetable
      await vegetable.save();

      res.status(200).json(vegetable);
    } catch (error) {
      console.error('Error updating vegetable:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a vegetable
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the vegetable by ID
      const vegetable = await Vegetable.findById(id);
      if (!vegetable) {
        return res.status(404).json({ message: 'Vegetable not found' });
      }

      // Delete the vegetable's image file if it exists
      if (vegetable.image) {
        const imagePath = path.join(__dirname, '../uploads', vegetable.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the vegetable from the database
      await Vegetable.findByIdAndDelete(id);

      res.status(200).json({ message: 'Vegetable deleted successfully' });
    } catch (error) {
      console.error('Error deleting vegetable:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
module.exports = router;
