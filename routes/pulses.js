const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Pulse = require('../models/Pulse'); // Ensure the model is correctly imported
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

// Route to add a new pulse
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

    const newPulse = new Pulse({
      name,
      description,
      price,
      unit,
      count,
      image,
    });

    await newPulse.save();
    res.status(201).json(newPulse);
  } catch (error) {
    console.error('Error adding pulse:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to get all pulses
router.get('/', async (req, res) => {
    try {
      const pulses = await Pulse.find(); // Fetch all pulses from MongoDB
      res.status(200).json(pulses);
    } catch (error) {
      console.error('Error fetching pulses:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT route to update a pulse
  router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, unit, count } = req.body;

    try {
      // Find the pulse by ID
      let pulse = await Pulse.findById(id);
      if (!pulse) {
        return res.status(404).json({ message: 'Pulse not found' });
      }

      // Update the pulse details
      pulse.name = name || pulse.name;
      pulse.description = description || pulse.description;
      pulse.price = price || pulse.price;
      pulse.unit = unit || pulse.unit;
      pulse.count = count || pulse.count;

      // Check if a new image is uploaded
      if (req.file) {
        pulse.image = req.file.filename; // Update the image path
      }

      // Save the updated pulse
      await pulse.save();

      res.status(200).json(pulse);
    } catch (error) {
      console.error('Error updating pulse:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // DELETE route to delete a pulse
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      // Find the pulse by ID
      const pulse = await Pulse.findById(id);
      if (!pulse) {
        return res.status(404).json({ message: 'Pulse not found' });
      }

      // Delete the pulse's image file if it exists
      if (pulse.image) {
        const imagePath = path.join(__dirname, '../uploads', pulse.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error deleting image file:', err);
          }
        });
      }

      // Delete the pulse from the database
      await Pulse.findByIdAndDelete(id);

      res.status(200).json({ message: 'Pulse deleted successfully' });
    } catch (error) {
      console.error('Error deleting pulse:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


module.exports = router;
