const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

const SHIPPING_FLAT_RATE = 49;
const TAX_RATE = 0.05; // 5%

// @desc    Create an order from the current user's cart (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'razorpay' } = req.body;
  if (!shippingAddress) throw new ApiError(400, 'shippingAddress is required');

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new ApiError(400, 'Your cart is empty');

  const orderItems = [];
  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new ApiError(400, `Product ${item.product?.name || ''} is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: item.price,
      quantity: item.quantity
    });
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 999 ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  });

  // Note: stock is intentionally NOT decremented here.
  // It is decremented only when an admin confirms the order (see confirmOrder below).

  cart.items = [];
  await cart.save();

  return sendSuccess(res, 201, { order }, 'Order created');
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, { orders });
});

// @desc    Get single order by id (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name phone email');
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  return sendSuccess(res, 200, { order });
});

// @desc    Admin: list all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.orderStatus = status;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name phone')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  return sendSuccess(res, 200, { orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
});

// @desc    Admin: confirm an order - this is the ONLY place stock gets decremented
// @route   PUT /api/orders/:id/confirm
// @access  Private/Admin
const confirmOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (!order.isPaid && order.paymentMethod === 'razorpay') {
    throw new ApiError(400, 'Cannot confirm an unpaid order');
  }
  if (order.stockDecremented) {
    throw new ApiError(400, 'Order stock has already been decremented');
  }

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.name} to confirm this order`);
    }
    product.stock -= item.quantity;
    await product.save();
  }

  order.stockDecremented = true;
  order.orderStatus = 'confirmed';
  await order.save();

  return sendSuccess(res, 200, { order }, 'Order confirmed and stock updated');
});

// @desc    Admin: update order status (shipped / delivered / cancelled)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  order.orderStatus = status;
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();

  return sendSuccess(res, 200, { order }, `Order marked as ${status}`);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  confirmOrder,
  updateOrderStatus
};