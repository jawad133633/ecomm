const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');

async function clean() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Find all products
  const all = await Product.find({});
  console.log('Total products currently in DB:', all.length);

  // Any product whose category is still one of the old categories:
  const oldCategories = ['Clothing', 'Accessories', 'Home & living', 'Beauty', 'Lifestyle'];
  const oldProducts = await Product.find({ category: { $in: oldCategories } });
  console.log('Old non-perfume products count:', oldProducts.length);

  if (oldProducts.length > 0) {
    const res = await Product.deleteMany({ category: { $in: oldCategories } });
    console.log('Deleted old products:', res.deletedCount);
  }

  const remaining = await Product.find({});
  console.log('Final product count in DB (all perfumes):', remaining.length);
  remaining.slice(0, 5).forEach((p, idx) => console.log(`${idx + 1}. ${p.name} - ${p.category} (Rs. ${p.price})`));

  process.exit(0);
}

clean();

