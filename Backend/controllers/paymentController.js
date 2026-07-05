const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, items, deliveryAddress } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works in paise (multiply by 100)
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save initial order in DB
    const newOrder = new Order({
      user: req.user.id, // From authMiddleware
      items,
      totalAmount: amount,
      deliveryAddress,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'Pending'
    });
    await newOrder.save();

    res.status(200).json({ success: true, order: razorpayOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating Razorpay order', error });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'Completed', razorpayPaymentId: razorpay_payment_id, status: 'Processed' }
      );
      return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature sent!' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification Error', error });
  }
};