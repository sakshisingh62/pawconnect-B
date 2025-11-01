// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const protect = async (req, res, next) => {
  let token;

  // ✅ 1. Check if Bearer token exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // ✅ 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded); // should show { id: '...' }

      // ✅ 3. Find user from decoded.id
      req.user = await User.findById(decoded.id).select('-password');
      console.log("Decoded user from middleware:", req.user);

      // ✅ 4. If no user found
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // ✅ 5. Continue to next middleware/route
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
