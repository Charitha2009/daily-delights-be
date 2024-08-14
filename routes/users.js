// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../middleware/auth');
const { getUserDetailsFromToken } = require('../utils/jwtUtils');
const { getUserById, addToCart, updateCart, clearCart } = require('../controllers/userController');

// JWT Secret
const jwtSecret = 'your_jwt_secret';

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: 'Strict' // Adjust based on your requirements
    });

    res.json({ success: true, token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ firstName, lastName, email, password });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// profile details
router.get('/profile', authenticateJWT, (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.error('No Authorization header found');
      return res.status(400).json({ message: 'Bad Request: No Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Token not found in Authorization header');
      return res.status(400).json({ message: 'Bad Request: Token not found' });
    }

    console.log('Token:', token);
    const userDetails = getUserDetailsFromToken(token);

    if (!userDetails) {
      console.error('Failed to get user details from token');
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    res.json({ user: userDetails });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to fetch user details by userId
router.get('/:userId', authenticateJWT, getUserById);

// Route to add item to cart
// router.post('/add-to-cart', authenticateJWT, async (req, res) => {
//   const { id, name, price, unit, type, quantity } = req.body;
//   const userId = req.user.userId; // Assuming authenticateJWT sets req.user

//   try {
//       const user = await User.findById(userId);

//       if (!user) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       // Check if item already exists in cart
//       const itemIndex = user.cart.findIndex(item => item.id.toString() === id);

//       if (itemIndex !== -1) {
//           // Update quantity if item already exists in cart
//           user.cart[itemIndex].quantity += quantity;
//       } else {
//           // Add new item to cart
//           user.cart.push({ id, name, price, unit, type, quantity });
//       }

//       await user.save();
//       res.status(200).json({ message: 'Item added to cart', cart: user.cart });
//   } catch (error) {
//       res.status(500).json({ message: 'Internal server error', error });
//   }
// });
// Route to add items to cart
router.post('/add-to-cart', authenticateJWT, addToCart);

// route to update item in cart
router.post('/update-cart', authenticateJWT, updateCart);
// clear cart
router.delete('/cart/clear', authenticateJWT, clearCart);
module.exports = router;
