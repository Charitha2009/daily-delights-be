const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Nut = require('../models/Nut'); // Ensure the model is correctly imported
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

// Route to add a new nut
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

    const newNut = new Nut({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newNut.save();
    res.status(201).json(newNut);
  } catch (error) {
    console.error('Error adding nut:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all nuts
router.get('/', async (req, res) => {
    try {
      const nuts = await Nut.find(); // Fetch all nuts from MongoDB
      res.status(200).json(nuts);
    } catch (error) {
      console.error('Error fetching nuts:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a nut
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the nut by ID
      let nut = await Nut.findById(id);
      if (!nut) {
        return res.status(404).json({ message: 'Nut not found' });
      }

      // Update the nut details
      nut.name = name || nut.name;
      nut.description = description || nut.description;
      nut.price = price || nut.price;
      nut.unit = unit || nut.unit;
      nut.count = count || nut.count;

      // Check if a new image is uploaded
      if (req.file) {
        nut.image = req.file.filename; // Update the image path
      }

      // Save the updated nut
      await nut.save();

      res.status(200).json(nut);
    } catch (error) {
      console.error('Error updating nut:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a nut
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the nut by ID
      const nut = await Nut.findById(id);
      if (!nut) {
        return res.status(404).json({ message: 'Nut not found' });
      }

      // Delete the nut's image file if it exists
      if (nut.image) {
        const imagePath = path.join(__dirname, '../uploads', nut.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the nut from the database
      await Nut.findByIdAndDelete(id);

      res.status(200).json({ message: 'Nut deleted successfully' });
    } catch (error) {
      console.error('Error deleting nut:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


module.exports = router;
