const mongoose = require('mongoose'); // <-- Added mongoose to validate IDs
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const Category = require('../models/Category');

// @desc    List all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return sendSuccess(res, 200, { categories });
});

// @desc    Get single category by slug OR ID
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const param = req.params.slug;
  let query = { isActive: true };

  // SMART ROUTING: If the parameter looks like a MongoDB ID, search by ID OR slug
  if (mongoose.isValidObjectId(param)) {
    query.$or = [{ _id: param }, { slug: param }];
  } else {
    // Otherwise, strictly search by slug text
    query.slug = param;
  }

  const category = await Category.findOne(query);
  
  if (!category) throw new ApiError(404, 'Category not found');
  
  return sendSuccess(res, 200, { category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return sendSuccess(res, 201, { category }, 'Category created');
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  Object.assign(category, req.body);
  await category.save();

  return sendSuccess(res, 200, { category }, 'Category updated');
});

// @desc    Delete (deactivate) category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  category.isActive = false;
  await category.save();

  return sendSuccess(res, 200, null, 'Category deleted');
});

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };