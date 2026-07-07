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

  // Clear existing data
  await Category.deleteMany();
  await Product.deleteMany();

  console.log('Seeding Categories...');
  // FIXED: Use .create() in a loop so pre('save') hooks run and slugs are generated
  for (const cat of categories) {
    await Category.create(cat);
  }

  const createdCategories = await Category.find();
  const electronics = createdCategories.find((c) => c.name === 'Electronics');
  const plumbing = createdCategories.find((c) => c.name === 'Plumbing');
  const hardware = createdCategories.find((c) => c.name === 'Hardware & Tools');

  console.log('Seeding Products...');
  const productsToSeed = [
    {
      name: 'Havells 1.5 sq mm Wire',
      description: 'High quality copper wire for domestic electrical wiring. 90m length.',
      images: ['https://www.flipkart.com/havells-hrfr-pvc-red-90-m-wire/p/itmfhws5hzytghze'],
      category: electronics._id,
      price: 1200,
      discountPrice: 1050,
      stock: 100,
      brand: 'Havells'
    },
    {
      name: 'Ashirvad PVC Pipes (2 inch)',
      description: 'Durable PVC pipes for drainage and plumbing needs. 3m length.',
      images: ['https://www.indiamart.com/proddetail/ashirvad-2-inch-upvc-pipe-24300919055.html?srsltid=AfmBOoozN2ypmEN-vR2_oIlHwVJNQN11CV-OzM-b9LkHVGiYew8UHRvj'],
      category: plumbing._id,
      price: 450,
      stock: 200,
      brand: 'Ashirvad'
    },
    {
      name: 'Crompton Ceiling Fan',
      description: 'Energy efficient high speed ceiling fan.',
      images: ['https://www.bestofelectricals.com/crompton-greaves-aura-1400-56?srsltid=AfmBOoqxhhr6Vmg1yLoQuzhW-1ZBARDPZeyptTSeHIR-Y14JvHVstWqg'],
      category: electronics._id,
      price: 2100,
      discountPrice: 1850,
      stock: 45,
      brand: 'Crompton'
    },
    {
      name: 'Jaguar Bathroom Tap',
      description: 'Premium stainless steel bathroom tap with chrome finish.',
      images: ['https://www.jaquar.com/en/faucets'],
      category: plumbing._id,
      price: 1500,
      discountPrice: 1350,
      stock: 30,
      brand: 'Jaguar'
    },
    {
      name: 'Bosch Power Drill',
      description: '500W professional power drill machine.',
      images: ['https://www.liontoolsmart.com/products/bosch-impact-drill-gsb-501-13mm?srsltid=AfmBOopI1r4E0HBo1hMM1jpOz-EqozO2OyQ5X5qbF4VTZb_abIIM60Cz'],
      category: hardware._id,
      price: 3200,
      stock: 15,
      brand: 'Bosch'
    }
  ];

  // FIXED: Use .create() to ensure product slugs generate correctly
  for (const prod of productsToSeed) {
    await Product.create(prod);
  }

  const adminPhone = process.env.SEED_ADMIN_PHONE || '+919999999999';
  const existingAdmin = await User.findOne({ phone: adminPhone });
  if (!existingAdmin) {
    await User.create({ phone: adminPhone, name: 'Admin', role: 'admin' });
    console.log(`Admin user created with phone ${adminPhone}`);
  }

  console.log('Seed data imported successfully!');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});