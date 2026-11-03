const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const p1 = await Product.findOne({ name: /Rasasi Hawas/i });
  const p2 = await Product.findOne({ name: /Acqua di Parma/i });
  console.log('Rasasi Hawas:', p1 ? p1.imageUrl : 'not found');
  console.log('Acqua di Parma:', p2 ? p2.imageUrl : 'not found');

  const all = await Product.find({}, 'name imageUrl');
  console.log('\nAll products and images:');
  all.forEach((p, i) => console.log(`${i+1}. ${p.name} => ${p.imageUrl}`));
  process.exit(0);
}

main();
