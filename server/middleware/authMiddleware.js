const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwtUtils');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: 'Access denied. No token provided or invalid format.'
    });
  }

  const token = authHeader.split(' ')[1];

  // Guest Token Bypass
  if (token === 'guest-token') {
    req.user = { 
      userId: 0, 
      username: 'guest', 
      nickname: '游客' 
    };
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Add user info to request object
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;
