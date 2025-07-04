const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../config/auth');

const authMiddleware = async (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null };
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return { user: null };
    }

    return { user };
  } catch (error) {
    return { user: null };
  }
};

module.exports = authMiddleware;