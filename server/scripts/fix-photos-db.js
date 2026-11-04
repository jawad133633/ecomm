require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

async function fixDb() {
  if (!process.env.MONGO_URI) {
    console.log('No MONGO_URI in .env');
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  const r1 = await Product.updateMany(
    { imageUrl: { $regex: 'photo-1588405748880-12d1d2a59f75' } },
    { $set: { imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85' } }
  );

  const r2 = await Product.updateMany(
    { imageUrl: { $regex: 'photo-1619994403073-2cec844b8e63' } },
    { $set: { imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85' } }
  );

  console.log(`Updated in DB: ${r1.modifiedCount} Rasasi photos and ${r2.modifiedCount} Acqua photos.`);
  await mongoose.disconnect();
}

fixDb().catch(console.error);
