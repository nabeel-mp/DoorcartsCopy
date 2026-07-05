const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  fullName: { type: String },
  address: { type: String },
  photo: { type: String }, // URL to photo
  walletBalance: { type: Number, default: 0 },
  otp: { type: String },
  otpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);