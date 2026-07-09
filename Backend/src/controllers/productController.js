const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const Product = require('../models/Product');
const Category = require('../models/Category'); // Added Category model
const mongoose = require('mongoose');

// @desc    List products with search, category filter, price range, sort, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sort = '-createdAt',
    page = 1,
    limit = 12
  } = req.query;

  const query = { isActive: true };

  if (keyword) {
    query.$text = { $search: keyword };
  }

  // FIXED: Handle both ObjectId and Slug filtering safely
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      // If a slug was passed instead of an ID, look up the category first
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category slug doesn't exist, return empty results early
        return sendSuccess(res, 200, { products: [], total: 0, page: 1, pages: 0 });
      }
    }
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query)
  ]);

  return sendSuccess(res, 200, {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum)
  });
});

// @desc    Admin: list all products, including inactive ones
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProducts = asyncHandler(async (req, res) => {
  const { keyword, category, sort = '-createdAt', page = 1, limit = 100 } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }

  if (category) {
    query.category = category;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query)
  ]);

  return sendSuccess(res, 200, {
    products,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum)
  });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug; // This catches whatever is at the end of the URL
  
  let query = { isActive: true };

  // SMART ROUTING: Check if the frontend sent a MongoDB ObjectId or a text Slug
  if (mongoose.Types.ObjectId.isValid(param)) {
    query._id = param; // Search by ID
  } else {
    query.slug = param; // Search by Slug
  }

  const product = await Product.findOne(query).populate(
    'category',
    'name slug'
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  return sendSuccess(res, 200, { product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return sendSuccess(res, 201, { product }, 'Product created');
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  Object.assign(product, req.body);
  await product.save();

  return sendSuccess(res, 200, { product }, 'Product updated');
});

// @desc    Delete (deactivate) product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  product.isActive = false;
  await product.save();

  return sendSuccess(res, 200, null, 'Product deleted');
});

module.exports = {
  getProducts,
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};
