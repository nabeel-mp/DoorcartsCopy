/**
 * Normalizes a phone number to E.164 format.
 * If no country code is present, defaults to DEFAULT_COUNTRY_CODE (India +91).
 */
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return null;

  const defaultCode = process.env.DEFAULT_COUNTRY_CODE || '+91';
  let phone = String(rawPhone).trim().replace(/[\s()-]/g, '');

  if (phone.startsWith('+')) {
    return phone;
  }

  // Strip any leading zeros (common when users type local numbers with a trunk 0)
  phone = phone.replace(/^0+/, '');

  return `${defaultCode}${phone}`;
};

/**
 * Basic E.164 validation: + followed by 8-15 digits.
 */
const isValidE164 = (phone) => /^\+[1-9]\d{7,14}$/.test(phone);

module.exports = { normalizePhone, isValidE164 };