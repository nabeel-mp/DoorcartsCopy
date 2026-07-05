const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Send OTP
exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60000); // 5 minutes expiry

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber });
    }
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send SMS via Textbee
    const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${process.env.TEXTBEE_DEVICE_ID}/send-sms`;
    
    await axios.post(textbeeUrl, {
      receivers: [`+91${phoneNumber}`],
      smsBody: `Your Doorcarts verification code is ${otp}. Valid for 5 minutes.`
    }, {
      headers: { 'x-api-key': process.env.TEXTBEE_API_KEY }
    });

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Check if user has filled profile (fullName exists)
    const isProfileComplete = !!user.fullName;

    res.status(200).json({ success: true, token, isProfileComplete, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};