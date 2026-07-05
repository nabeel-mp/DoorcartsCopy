const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

// Reads the JWT from the httpOnly cookie, or falls back to the
// Authorization: Bearer <token> header for non-browser clients.
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized, invalid or expired token');
  }

  const user = await User.findById(decoded.id).select('-__v');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Not authorized, user no longer exists or is inactive');
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};

module.exports = { protect, adminOnly };