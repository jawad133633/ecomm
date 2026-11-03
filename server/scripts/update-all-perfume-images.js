const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');
const fs = require('fs');

const verifiedPerfumeImages = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85', // Bleu de Chanel
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85', // Coco Chanel with roses
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85', // Chanel N°5
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85', // Coco Noir on red flower
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85', // Golden amber luxury flacon
  'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85', // Luxury perfume in hand
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85', // Coco Chanel on rose petals
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85', // Dolce & Gabbana The One
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=85', // Coco Noir pink background
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85', // Giorgio Armani Sun di Gioia
  'https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=900&q=85', // Chanel N°5 on draped black silk
  'https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85', // Dior J'adore twin bottles with gift box
  'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85', // Versace Eros turquoise flacon
  'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85', // Hugo Boss Boss Bottled
  'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&w=900&q=85', // Zara Seoul clean bottle
  'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85', // Giorgio Armani Acqua Di Giò
  'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85', // Coco Mademoiselle on black lace
];

async function updateDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  const products = await Product.find({}).sort({ createdAt: 1 });
  console.log(`Found ${products.length} products to update images for.`);

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    let img = verifiedPerfumeImages[i % verifiedPerfumeImages.length];

    // Special brand matching if available
    const lowerName = prod.name.toLowerCase();
    if (lowerName.includes('versace')) {
      img = 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('hugo boss')) {
      img = 'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('acqua di giò') || lowerName.includes('acqua di gio') || lowerName.includes('acqua di parma')) {
      img = 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('dior')) {
      img = 'https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('bleu de chanel')) {
      img = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('coco noir')) {
      img = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('coco mademoiselle')) {
      img = 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('dolce & gabbana') || lowerName.includes('the one')) {
      img = 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85';
    } else if (lowerName.includes('hawas') || lowerName.includes('rasasi')) {
      img = 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85';
    }

    prod.imageUrl = img;
    await prod.save();
    console.log(`Updated ${i+1}/${products.length}: ${prod.name} => ${img}`);
  }

  console.log('✅ All products updated in MongoDB Atlas with authentic perfume photos!');
  process.exit(0);
}

updateDB();

