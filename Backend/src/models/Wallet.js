const mongoose = require('mongoose');

// A single ledger entry. `type` determines whether it moved money in or out.
const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    // What the entry was for, e.g. 'topup', 'order_payment', 'withdrawal', 'refund'.
    reason: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

const walletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    transactions: [transactionSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wallet', walletSchema);