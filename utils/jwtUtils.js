// utils/jwtUtils.js

const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';

const getUserDetailsFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded; // Contains user details
  } catch (error) {
    console.error('Error decoding token:', error);
    return null; // Invalid token or token expired
  }
};

module.exports = { getUserDetailsFromToken };
