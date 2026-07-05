const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const { normalizePhone, isValidE164 } = require('../utils/phone');
const { sendOtpSms } = require('../utils/sendSms');
const { sendTokenResponse } = require('../utils/generateToken');
const Otp = require('../models/Otp');
const User = require('../models/User');

const OTP_LENGTH = Number(process.env.OTP_LENGTH || 6);
const OTP_EXPIRES_MINUTES = Number(process.env.OTP_EXPIRES_MINUTES || 5);
const RESEND_COOLDOWN_SECONDS = 30;

const generateOtpCode = () => {
  const max = 10 ** OTP_LENGTH;
  const code = crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, '0');
  return code;
};

// @desc    Send an OTP to a phone number via TextBee
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { phone: rawPhone } = req.body;
  if (!rawPhone) throw new ApiError(400, 'Phone number is required');

  const phone = normalizePhone(rawPhone);
  if (!isValidE164(phone)) throw new ApiError(400, 'Invalid phone number format');

  const existing = await Otp.findOne({ phone }).sort({ createdAt: -1 });
  if (existing && existing.lastSentAt) {
    const secondsSinceLast = (Date.now() - existing.lastSentAt.getTime()) / 1000;
    if (secondsSinceLast < RESEND_COOLDOWN_SECONDS) {
      throw new ApiError(429, `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLast)}s before requesting another OTP`);
    }
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  // Invalidate any previous unverified OTPs for this number, then create a fresh one
  await Otp.deleteMany({ phone, verified: false });
  await Otp.create({ phone, code, expiresAt, lastSentAt: new Date() });

  await sendOtpSms(phone, code);

  return sendSuccess(res, 200, { phone }, 'OTP sent successfully');
});

// @desc    Verify OTP and log the user in (creating the account if new)
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone: rawPhone, code, name } = req.body;
  if (!rawPhone || !code) throw new ApiError(400, 'Phone and code are required');

  const phone = normalizePhone(rawPhone);
  const otpDoc = await Otp.findOne({ phone, verified: false }).sort({ createdAt: -1 });

  if (!otpDoc) throw new ApiError(400, 'No pending OTP request found for this number');

  if (otpDoc.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, 'OTP has expired, please request a new one');
  }

  if (otpDoc.attempts >= 5) {
    throw new ApiError(429, 'Too many incorrect attempts, please request a new OTP');
  }

  if (otpDoc.code !== String(code)) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new ApiError(400, 'Incorrect OTP code');
  }

  otpDoc.verified = true;
  await otpDoc.save();

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone, name: name || '' });
  }

  const token = sendTokenResponse(res, user._id);

  return sendSuccess(res, 200, { user, token }, 'Logged in successfully');
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { user: req.user });
});

// @desc    Update current user's basic profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email;
  await req.user.save();
  return sendSuccess(res, 200, { user: req.user }, 'Profile updated');
});

// @desc    Log the user out by clearing the auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { httpOnly: true, expires: new Date(Date.now() + 1000) });
  return sendSuccess(res, 200, null, 'Logged out successfully');
});

module.exports = { sendOtp, verifyOtp, getMe, updateMe, logout };