const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/markethub');
  const Product = mongoose.model('Product', new mongoose.Schema({ name: String, imageUrl: String }));

  const sofaRes = await Product.updateOne(
    { _id: '6ae055128050cf1509723d8c' },
    { imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85' }
  );

  const glassRes = await Product.updateOne(
    { _id: '6ae053cf8050cf1509723d8b' },
    { imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85' }
  );

  console.log('Updated sofa:', sofaRes);
  console.log('Updated glass:', glassRes);

  const items = await Product.find({ name: { $in: ['sofa', 'glass'] } });
  console.log('Current items in DB:', items);
  process.exit(0);
}

run().catch(console.error);

