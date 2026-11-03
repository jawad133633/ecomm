const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

async function syncDemo() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}).sort({ createdAt: 1 });
  
  const demoProducts = products.map((p, idx) => ({
    _id: 'perfume-' + (idx + 1),
    name: p.name,
    category: p.category,
    price: p.price,
    store: { name: (p.name.split(' ')[0] || 'Luxury') + ' Official', slug: (p.name.split(' ')[0] || 'perfume').toLowerCase() },
    imageUrl: p.imageUrl,
    label: p.price > 6000 ? 'EXCLUSIVE' : 'BESTSELLER',
    description: p.description
  }));

  const homePath = path.join(__dirname, '../../client/src/screens/Home.jsx');
  let homeSrc = fs.readFileSync(homePath, 'utf8');

  const categories = ['Everything', 'Woody & Fresh', 'Luxury Oud', 'Floral & Sweet', 'Warm & Spicy', 'Aquatic & Fresh', 'Amber Floral'];
  const demoStr = 'export const demoProducts = ' + JSON.stringify(demoProducts, null, 2) + ';\nconst categories = ' + JSON.stringify(categories) + ';';

  homeSrc = homeSrc.replace(/export const demoProducts = \[[\s\S]*?\];\s*const categories = \[[^\]]*\];/, demoStr);
  fs.writeFileSync(homePath, homeSrc);
  console.log(`✅ Synced ${demoProducts.length} demoProducts directly from Atlas to Home.jsx`);
  process.exit(0);
}

syncDemo();

