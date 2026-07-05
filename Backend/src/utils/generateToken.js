const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

/**
 * Signs a JWT for the user and sets it as an httpOnly cookie on the response.
 * Also returns the raw token so it can be included in the JSON body as well,
 * for clients (e.g. mobile apps) that can't rely on cookies.
 */
const sendTokenResponse = (res, userId) => {
  const token = generateToken(userId);

  const days = Number(process.env.COOKIE_EXPIRES_DAYS || 30);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  });

  return token;
};

module.exports = { generateToken, sendTokenResponse };