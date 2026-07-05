const express = require('express');
const { createRazorpayOrder, verifyPayment, razorpayWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public webhook - authenticated via HMAC signature, not JWT/cookies.
// NOTE: raw body for this route is captured in app.js's express.json() verify callback.
router.post('/webhook', razorpayWebhook);

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;