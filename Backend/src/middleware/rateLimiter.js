const rateLimit = require('express-rate-limit');

// The OTP controller already enforces a 30s per-phone-number resend cooldown
// (see authController.js), but that does nothing to stop someone hammering
// the endpoint from many different numbers/IPs at once - which is exactly
// the kind of thing that runs up your TextBee SMS bill or lets someone probe
// for valid accounts. These limiters add a per-IP ceiling on top.

// Generous enough for real users retrying a typo, tight enough to block abuse.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 OTP sends per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests from this device. Please try again later.'
  }
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // a bit higher since legitimate typos/resends count against this too
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this device. Please try again later.'
  }
});

// A looser, app-wide limiter as a general safety net against scraping/abuse.
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' }
});

module.exports = { otpRequestLimiter, otpVerifyLimiter, generalApiLimiter };