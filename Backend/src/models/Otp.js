const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Auto-delete expired OTP documents 10 minutes after they expire
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Otp', otpSchema);