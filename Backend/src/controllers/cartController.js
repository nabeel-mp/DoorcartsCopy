const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await (await getOrCreateCart(req.user._id)).populate(
    'items.product',
    'name images price discountPrice stock isActive'
  );
  return sendSuccess(res, 200, { cart });
});

// @desc    Add an item to the cart (or increment quantity if already present)
// @route   POST /api/cart/items
// @access  Private
const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new ApiError(400, 'productId is required');

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.stock < quantity) throw new ApiError(400, 'Not enough stock available');

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    existingItem.price = effectivePrice;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), price: effectivePrice });
  }

  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');

  return sendSuccess(res, 200, { cart }, 'Item added to cart');
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/items/:productId
// @access  Private
const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) throw new ApiError(400, 'quantity must be at least 1');

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((item) => item.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  item.quantity = Number(quantity);
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');

  return sendSuccess(res, 200, { cart }, 'Cart item updated');
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
const removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate('items.product', 'name images price discountPrice stock isActive');

  return sendSuccess(res, 200, { cart }, 'Item removed from cart');
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  return sendSuccess(res, 200, { cart }, 'Cart cleared');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };