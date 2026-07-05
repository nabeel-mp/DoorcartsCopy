const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const getRazorpayInstance = require('../utils/razorpayClient');
const Order = require('../models/Order');

// Step 1 (already done elsewhere): an internal Order record is created via
// POST /api/orders when the user checks out from their cart.

// Step 2: create a Razorpay order tied to that internal Order.
// @desc    Create a Razorpay order for an existing internal order
// @route   POST /api/payments/create-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) throw new ApiError(400, 'orderId is required');

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized for this order');
  }
  if (order.isPaid) throw new ApiError(400, 'Order is already paid');

  const razorpay = getRazorpayInstance();

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100), // amount in paise
    currency: 'INR',
    receipt: order._id.toString(),
    notes: { orderId: order._id.toString(), userId: req.user._id.toString() }
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return sendSuccess(
    res,
    200,
    {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id
    },
    'Razorpay order created'
  );
});

// Step 3: after the Razorpay Checkout succeeds on the frontend, verify the
// HMAC signature it hands back before marking the order as paid.
// @desc    Verify Razorpay payment signature after checkout completes
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new ApiError(400, 'Missing required payment verification fields');
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, 'Order/payment mismatch');
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed - invalid signature');
  }

  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;
  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();

  return sendSuccess(res, 200, { order }, 'Payment verified successfully');
});

// @desc    Razorpay webhook - authoritative server-to-server payment confirmation
// @route   POST /api/payments/webhook
// @access  Public (verified via HMAC signature header, not auth middleware)
//
// IMPORTANT: this route must receive the RAW request body (not JSON-parsed)
// to compute a matching HMAC. See app.js, where express.json() captures the
// raw body via its `verify` callback into req.rawBody for this route.
const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(400).json({ success: false, message: 'Missing webhook signature or secret' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const razorpayOrderId = payload.payment.entity.order_id;
    const paymentId = payload.payment.entity.id;

    const order = await Order.findOne({ razorpayOrderId });
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.razorpayPaymentId = paymentId;
      await order.save();
    }
  }

  // Always acknowledge receipt so Razorpay doesn't keep retrying
  return res.status(200).json({ success: true });
});

module.exports = { createRazorpayOrder, verifyPayment, razorpayWebhook };