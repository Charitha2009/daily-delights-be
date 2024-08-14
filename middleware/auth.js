// // middleware/auth.js
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No valid token provided.' });
  }

  const jwtToken = token.split(' ')[1];

  try {
    const decoded = jwt.verify(jwtToken, jwtSecret);
    req.user = decoded; // Store user details in request object for later use
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateJWT;
