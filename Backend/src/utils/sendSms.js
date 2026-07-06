const axios = require('axios');

/**
 * Sends an SMS using the TextBee SMS Gateway (https://textbee.dev).
 * TextBee only sends the raw text message - it has no concept of "OTP"
 * itself, so OTP generation/storage/expiry/verification is handled by us
 * (see src/models/Otp.js and src/controllers/authController.js).
 *
 * Requires TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID from the TextBee dashboard,
 * and an Android device running the TextBee app registered to that account.
 */
const sendSms = async (recipientPhone, message) => {
  const baseUrl = process.env.TEXTBEE_BASE_URL || 'https://api.textbee.dev/api/v1';
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  const apiKey = process.env.TEXTBEE_API_KEY;

  if (!deviceId || !apiKey) {
    throw new Error('TextBee is not configured. Set TEXTBEE_API_KEY and TEXTBEE_DEVICE_ID in .env');
  }

  const url = `${baseUrl}/gateway/devices/${deviceId}/send-sms`;

  try {
    const response = await axios.post(
      url,
      {
        recipients: [recipientPhone],
        message
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    const detail = error.response?.data || error.message;
    console.error('TextBee send-sms failed:', detail);
    throw new Error('Failed to send SMS via TextBee');
  }
};

const sendOtpSms = async (phone, code) => {
  const minutes = process.env.OTP_EXPIRES_MINUTES || 5;
  const message = `Your Doorcarts verification code is ${code}. It expires in ${minutes} minutes. Do not share this code with anyone.`;
  console.log('\n=============================================');
  console.log(`📱 MOCK SMS TO ${phone}:`);
  console.log(`🔑 OTP CODE: ${code}`);
  console.log('=============================================\n');
  return { success: true };
  // return sendSms(phone, message);
};

module.exports = { sendSms, sendOtpSms };