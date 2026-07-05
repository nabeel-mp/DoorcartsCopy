const Razorpay = require('razorpay');

let instance = null;

/**
 * Lazily creates the Razorpay client the first time it's needed.
 * This avoids crashing the whole app at startup if RAZORPAY_KEY_ID /
 * RAZORPAY_KEY_SECRET are missing from .env (e.g. in local dev before
 * the developer has set up their Razorpay account).
 */
const getRazorpayInstance = () => {
  if (instance) return instance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }

  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return instance;
};

module.exports = getRazorpayInstance;