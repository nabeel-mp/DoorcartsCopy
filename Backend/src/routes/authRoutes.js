const express = require('express');
const { sendOtp, verifyOtp, getMe, updateMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { otpRequestLimiter, otpVerifyLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/send-otp', otpRequestLimiter, sendOtp);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;