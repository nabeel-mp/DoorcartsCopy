require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const categories = [
  { name: 'Electronics' },
  { name: 'Fashion' },
  { name: 'Home & Kitchen' },
  { name: 'Beauty & Personal Care' }
];

const run = async () => {
  await connectDB();

  if (process.argv.includes('-d')) {
    await Promise.all([Category.deleteMany(), Product.deleteMany()]);
    console.log('Categories and products destroyed');
    process.exit(0);
  }

  await Category.deleteMany();
  await Product.deleteMany();

  const createdCategories = await Category.insertMany(categories);
  const electronics = createdCategories.find((c) => c.name === 'Electronics');
  const fashion = createdCategories.find((c) => c.name === 'Fashion');

  await Product.insertMany([
    {
      name: 'Wireless Bluetooth Earbuds',
      description: 'Compact true wireless earbuds with active noise cancellation and 30-hour battery life.',
      images: ['https://via.placeholder.com/500x500?text=Earbuds'],
      category: electronics._id,
      price: 2999,
      discountPrice: 2299,
      stock: 50,
      brand: 'AudioMax'
    },
    {
      name: 'Smart Fitness Band',
      description: 'Track heart rate, steps, sleep, and SpO2 with a 7-day battery.',
      images: ['https://via.placeholder.com/500x500?text=Fitness+Band'],
      category: electronics._id,
      price: 1999,
      stock: 30,
      brand: 'FitTrack'
    },
    {
      name: "Men's Casual Cotton Shirt",
      description: 'Breathable 100% cotton shirt, regular fit, available in multiple colors.',
      images: ['https://via.placeholder.com/500x500?text=Shirt'],
      category: fashion._id,
      price: 899,
      discountPrice: 699,
      stock: 100,
      brand: 'UrbanThread'
    }
  ]);

  // Optional: create a default admin so there's an account to manage the store.
  // Change this phone number to your own before running the seed script.
  const adminPhone = process.env.SEED_ADMIN_PHONE || '+919999999999';
  const existingAdmin = await User.findOne({ phone: adminPhone });
  if (!existingAdmin) {
    await User.create({ phone: adminPhone, name: 'Admin', role: 'admin' });
    console.log(`Admin user created with phone ${adminPhone}`);
  }

  console.log('Seed data imported successfully');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});