const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const Wallet = require('../models/Wallet');

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0, transactions: [] });
  }
  return wallet;
};

// @desc    Get the current user's wallet (balance + transaction history)
// @route   GET /api/wallet
// @access  Private
const getWallet = asyncHandler(async (req, res) => {
  const wallet = await getOrCreateWallet(req.user._id);
  return sendSuccess(res, 200, { wallet });
});

// @desc    Add money to the wallet (demo top-up - no real payment gateway wired here yet)
// @route   POST /api/wallet/topup
// @access  Private
const topUpWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new ApiError(400, 'A positive amount is required');
  }

  const wallet = await getOrCreateWallet(req.user._id);
  wallet.balance += numericAmount;
  wallet.transactions.unshift({
    type: 'credit',
    reason: 'topup',
    amount: numericAmount,
    description: 'Wallet top-up',
    status: 'completed'
  });
  await wallet.save();

  return sendSuccess(res, 200, { wallet }, 'Money added to wallet');
});

// @desc    Withdraw money from the wallet (demo - instantly marks as pending)
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFromWallet = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new ApiError(400, 'A positive amount is required');
  }

  const wallet = await getOrCreateWallet(req.user._id);
  if (wallet.balance < numericAmount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  wallet.balance -= numericAmount;
  wallet.transactions.unshift({
    type: 'debit',
    reason: 'withdrawal',
    amount: numericAmount,
    description: 'Withdrawal to bank account',
    status: 'pending'
  });
  await wallet.save();

  return sendSuccess(res, 200, { wallet }, 'Withdrawal requested');
});

module.exports = { getWallet, topUpWallet, withdrawFromWallet };