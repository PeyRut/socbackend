// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer TOKEN'

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token to request
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Verify Admin Privileges
const verifyAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Access denied. Admins only.' });
  next();
};

module.exports = { verifyToken, verifyAdmin };
