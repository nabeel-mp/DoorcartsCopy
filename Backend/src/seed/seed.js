require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const categories = [
  { name: 'Electronics' },
  { name: 'Plumbing' },
  { name: 'Hardware & Tools' },
  { name: 'Electricals' }
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
  const plumbing = createdCategories.find((c) => c.name === 'Plumbing');
  const hardware = createdCategories.find((c) => c.name === 'Hardware & Tools');

  await Product.insertMany([
    {
      name: 'Havells 1.5 sq mm Wire',
      description: 'High quality copper wire for domestic electrical wiring. 90m length.',
      images: ['https://via.placeholder.com/500x500?text=Wire'],
      category: electronics._id,
      price: 1200,
      discountPrice: 1050,
      stock: 100,
      brand: 'Havells'
    },
    {
      name: 'Ashirvad PVC Pipes (2 inch)',
      description: 'Durable PVC pipes for drainage and plumbing needs. 3m length.',
      images: ['https://via.placeholder.com/500x500?text=PVC+Pipe'],
      category: plumbing._id,
      price: 450,
      stock: 200,
      brand: 'Ashirvad'
    },
    {
      name: 'Crompton Ceiling Fan',
      description: 'Energy efficient high speed ceiling fan.',
      images: ['https://via.placeholder.com/500x500?text=Ceiling+Fan'],
      category: electronics._id,
      price: 2100,
      discountPrice: 1850,
      stock: 45,
      brand: 'Crompton'
    },
    {
      name: 'Jaguar Bathroom Tap',
      description: 'Premium stainless steel bathroom tap with chrome finish.',
      images: ['https://via.placeholder.com/500x500?text=Bathroom+Tap'],
      category: plumbing._id,
      price: 1500,
      discountPrice: 1350,
      stock: 30,
      brand: 'Jaguar'
    },
    {
      name: 'Bosch Power Drill',
      description: '500W professional power drill machine.',
      images: ['https://via.placeholder.com/500x500?text=Power+Drill'],
      category: hardware._id,
      price: 3200,
      stock: 15,
      brand: 'Bosch'
    }
  ]);

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