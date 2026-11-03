const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, '../../client/src/screens/Home.jsx');
let homeSrc = fs.readFileSync(homePath, 'utf8');

// 1. Replace Hero image
homeSrc = homeSrc.replace(
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=90',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=90'
);

homeSrc = homeSrc.replace(
  'alt="Thoughtfully styled clothing and accessories"',
  'alt="Luxury designer perfume collection and flacons"'
);

homeSrc = homeSrc.replace(
  'A slower kind of shopping · Est. 2026',
  'Haute Parfumerie & Rare Scents · Est. 2026'
);

homeSrc = homeSrc.replace(
  'Made with care,<br />found with love.',
  'Crafted with passion,<br />scented with luxury.'
);

// 2. Replace Maker banner image
homeSrc = homeSrc.replace(
  'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=1200&q=85'
);

homeSrc = homeSrc.replace(
  'alt="A maker carefully preparing a handmade product"',
  'alt="Artisanal luxury perfumer blending rare fragrance notes"'
);

// 3. Category emojis
homeSrc = homeSrc.replace(
  "['👕', '👜', '🏠', '✨', '🌿']",
  "['🌲', '✨', '🌸', '🔥', '🌊', '💎']"
);

// 4. Fallback couch image
homeSrc = homeSrc.replace(
  /https:\/\/images\.unsplash\.com\/photo-1555041469-a586c61ea9bc\?auto=format&fit=crop&w=900&q=85/g,
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'
);

fs.writeFileSync(homePath, homeSrc);
console.log('✅ Home.jsx updated');

// Also update ProductGrid.jsx fallback couch image
const gridPath = path.join(__dirname, '../../client/src/components/ProductGrid.jsx');
let gridSrc = fs.readFileSync(gridPath, 'utf8');
gridSrc = gridSrc.replace(
  /https:\/\/images\.unsplash\.com\/photo-1555041469-a586c61ea9bc\?auto=format&fit=crop&w=900&q=85/g,
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'
);
fs.writeFileSync(gridPath, gridSrc);
console.log('✅ ProductGrid.jsx updated');
