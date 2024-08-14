// routes/dashboard.js

const express = require('express');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticateJWT, (req, res) => {
  // Access req.user for the authenticated user's details
  res.json({ message: `Welcome to your dashboard, ${req.user.email}` });
});

module.exports = router;
