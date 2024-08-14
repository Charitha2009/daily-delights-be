const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Fruit = require('../models/Fruit'); // Ensure the model is correctly imported
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

// Route to add a new fruit
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

    const newFruit = new Fruit({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newFruit.save();
    res.status(201).json(newFruit);
  } catch (error) {
    console.error('Error adding fruit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all fruits
router.get('/', async (req, res) => {
    try {
      const fruits = await Fruit.find(); // Fetch all fruits from MongoDB
      res.status(200).json(fruits);
    } catch (error) {
      console.error('Error fetching fruits:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a fruit
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the fruit by ID
      let fruit = await Fruit.findById(id);
      if (!fruit) {
        return res.status(404).json({ message: 'Fruit not found' });
      }

      // Update the fruit details
      fruit.name = name || fruit.name;
      fruit.description = description || fruit.description;
      fruit.price = price || fruit.price;
      fruit.unit = unit || fruit.unit;
      fruit.count = count || fruit.count;

      // Check if a new image is uploaded
      if (req.file) {
        fruit.image = req.file.filename; // Update the image path
      }

      // Save the updated fruit
      await fruit.save();

      res.status(200).json(fruit);
    } catch (error) {
      console.error('Error updating fruit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a fruit
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the fruit by ID
      const fruit = await Fruit.findById(id);
      if (!fruit) {
        return res.status(404).json({ message: 'Fruit not found' });
      }

      // Delete the fruit's image file if it exists
      if (fruit.image) {
        const imagePath = path.join(__dirname, '../uploads', fruit.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the fruit from the database
      await Fruit.findByIdAndDelete(id);

      res.status(200).json({ message: 'Fruit deleted successfully' });
    } catch (error) {
      console.error('Error deleting fruit:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
