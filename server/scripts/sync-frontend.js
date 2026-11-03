const fs = require('fs');

const seedSrc = fs.readFileSync(__dirname + '/seed-perfumes.js', 'utf8');

// Match between const perfumeCatalog = [ and ];\n\nasync function run()
const startIdx = seedSrc.indexOf('const perfumeCatalog = [');
const endIdx = seedSrc.indexOf('];\n\nasync function run()');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate perfumeCatalog boundaries');
  process.exit(1);
}

const catalogSub = seedSrc.substring(startIdx + 'const perfumeCatalog = '.length, endIdx + 1);
const perfumeCatalog = eval(catalogSub);

const imagesStart = seedSrc.indexOf('const perfumeImages = [');
const imagesEnd = seedSrc.indexOf('];\n\nconst perfumeCatalog');
const imagesSub = seedSrc.substring(imagesStart + 'const perfumeImages = '.length, imagesEnd + 1);
const perfumeImages = eval(imagesSub);

const demoProducts = perfumeCatalog.map((p, idx) => ({
  _id: 'perfume-' + (idx + 1),
  name: p.name,
  category: p.category,
  price: p.price,
  store: { name: (p.brand || 'Luxury Fragrance') + ' Official', slug: (p.brand || 'fragrance').toLowerCase().replace(/[^a-z0-9]+/g, '-') },
  imageUrl: perfumeImages[idx % perfumeImages.length],
  label: p.label || (p.price > 6000 ? 'LUXURY' : 'BESTSELLER'),
  description: p.description
}));

const categories = ['Everything', 'Woody & Fresh', 'Luxury Oud', 'Floral & Sweet', 'Warm & Spicy', 'Aquatic & Fresh', 'Amber Floral'];

// Update client/src/screens/Home.jsx
const homePath = __dirname + '/../../client/src/screens/Home.jsx';
let homeSrc = fs.readFileSync(homePath, 'utf8');
const demoStr = 'export const demoProducts = ' + JSON.stringify(demoProducts, null, 2) + ';\nconst categories = ' + JSON.stringify(categories) + ';';

homeSrc = homeSrc.replace(/export const demoProducts = \[[\s\S]*?\];\s*const categories = \[[^\]]*\];/, demoStr);
fs.writeFileSync(homePath, homeSrc);

// Update client/src/screens/Catalog.jsx
const catPath = __dirname + '/../../client/src/screens/Catalog.jsx';
let catSrc = fs.readFileSync(catPath, 'utf8');
catSrc = catSrc.replace(/const categories = \[[^\]]*\];/, 'const categories = ' + JSON.stringify(categories) + ';');
fs.writeFileSync(catPath, catSrc);

console.log('✅ Successfully updated Home.jsx and Catalog.jsx with', demoProducts.length, 'perfumes!');
