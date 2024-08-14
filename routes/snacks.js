const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Snack = require('../models/Snack'); // Ensure the model is correctly imported
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

// Route to add a new snack
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

    const newSnack = new Snack({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newSnack.save();
    res.status(201).json(newSnack);
  } catch (error) {
    console.error('Error adding snack:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all snacks
router.get('/', async (req, res) => {
    try {
      const snacks = await Snack.find(); // Fetch all snacks from MongoDB
      res.status(200).json(snacks);
    } catch (error) {
      console.error('Error fetching snacks:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a snack
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the snack by ID
      let snack = await Snack.findById(id);
      if (!snack) {
        return res.status(404).json({ message: 'Snack not found' });
      }

      // Update the snack details
      snack.name = name || snack.name;
      snack.description = description || snack.description;
      snack.price = price || snack.price;
      snack.unit = unit || snack.unit;
      snack.count = count || snack.count;

      // Check if a new image is uploaded
      if (req.file) {
        snack.image = req.file.filename; // Update the image path
      }

      // Save the updated snack
      await snack.save();

      res.status(200).json(snack);
    } catch (error) {
      console.error('Error updating snack:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a snack
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the snack by ID
      const snack = await Snack.findById(id);
      if (!snack) {
        return res.status(404).json({ message: 'Snack not found' });
      }

      // Delete the snack's image file if it exists
      if (snack.image) {
        const imagePath = path.join(__dirname, '../uploads', snack.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the snack from the database
      await Snack.findByIdAndDelete(id);

      res.status(200).json({ message: 'Snack deleted successfully' });
    } catch (error) {
      console.error('Error deleting snack:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


module.exports = router;
