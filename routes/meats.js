const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Meat = require('../models/Meat'); // Ensure the model is correctly imported
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

// Route to add a new meat
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

    const newMeat = new Meat({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newMeat.save();
    res.status(201).json(newMeat);
  } catch (error) {
    console.error('Error adding meat:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all meats
router.get('/', async (req, res) => {
    try {
      const meats = await Meat.find(); // Fetch all meats from MongoDB
      res.status(200).json(meats);
    } catch (error) {
      console.error('Error fetching meats:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a meat
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the meat by ID
      let meat = await Meat.findById(id);
      if (!meat) {
        return res.status(404).json({ message: 'Meat not found' });
      }

      // Update the meat details
      meat.name = name || meat.name;
      meat.description = description || meat.description;
      meat.price = price || meat.price;
      meat.unit = unit || meat.unit;
      meat.count = count || meat.count;

      // Check if a new image is uploaded
      if (req.file) {
        meat.image = req.file.filename; // Update the image path
      }

      // Save the updated meat
      await meat.save();

      res.status(200).json(meat);
    } catch (error) {
      console.error('Error updating meat:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a meat
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the meat by ID
      const meat = await Meat.findById(id);
      if (!meat) {
        return res.status(404).json({ message: 'Meat not found' });
      }

      // Delete the meat's image file if it exists
      if (meat.image) {
        const imagePath = path.join(__dirname, '../uploads', meat.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the meat from the database
      await Meat.findByIdAndDelete(id);

      res.status(200).json({ message: 'Meat deleted successfully' });
    } catch (error) {
      console.error('Error deleting meat:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;
