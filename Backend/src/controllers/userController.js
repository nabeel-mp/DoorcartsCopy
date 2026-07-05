const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const User = require('../models/User');

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = req.user;
  const address = req.body;

  if (address.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push(address);
  await user.save();

  return sendSuccess(res, 201, { addresses: user.addresses }, 'Address added');
});

// @desc    List addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, { addresses: req.user.addresses });
});

// @desc    Update an address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, 'Address not found');

  if (req.body.isDefault) {
    req.user.addresses.forEach((a) => (a.isDefault = false));
  }

  Object.assign(address, req.body);
  await req.user.save();

  return sendSuccess(res, 200, { addresses: req.user.addresses }, 'Address updated');
});

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) throw new ApiError(404, 'Address not found');

  address.deleteOne();
  await req.user.save();

  return sendSuccess(res, 200, { addresses: req.user.addresses }, 'Address removed');
});

// @desc    Admin: list all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [users, total] = await Promise.all([
    User.find().skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments()
  ]);

  return sendSuccess(res, 200, { users, total, page, pages: Math.ceil(total / limit) });
});

module.exports = { addAddress, getAddresses, updateAddress, deleteAddress, getAllUsers };