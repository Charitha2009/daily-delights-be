// controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const newUser = new User({ firstName, lastName, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Error creating user', error });
    }
  }
};

// Controller to get user details by userId
const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
};

const addToCart = async (req, res) => {
  try {
    const { cart } = req.body; // The updated cart from the client
    const userId = req.user.userId; // Assuming req.user contains the authenticated user's details

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = cart.map(item => ({
      ...item,
      image: item.image // Ensure image is included
    }));
    await user.save();

    res.status(200).json({ message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
      const userId = req.user.userId; // Assuming user ID is available in req.user from middleware
      const { cart } = req.body;

      if (!Array.isArray(cart)) {
          return res.status(400).json({ message: 'Invalid cart format' });
      }

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Create a map for existing cart items
      const existingCartItems = new Map();
      user.cart.forEach(item => existingCartItems.set(item.id.toString(), item));

      // Update or add new items to the cart
      cart.forEach(newItem => {
        if (existingCartItems.has(newItem.id)) {
          const existingItem = existingCartItems.get(newItem.id);
          existingItem.quantity = newItem.quantity;
          existingItem.image = newItem.image; // Ensure image is updated
          existingCartItems.set(newItem.id, existingItem);
        } else {
          existingCartItems.set(newItem.id, newItem);
        }
      });

      // Convert map back to array
      const updatedCart = Array.from(existingCartItems.values());

      // Update user's cart
      user.cart = updatedCart;
      await user.save();

      res.status(200).json({ cart: updatedCart });
  } catch (error) {
      console.error('Error updating cart in database:', error);
      res.status(500).json({ message: 'Error updating cart' });
  }
};

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = {
  createUser,
  getUserById,
  addToCart,
  updateCart,
  clearCart
};
