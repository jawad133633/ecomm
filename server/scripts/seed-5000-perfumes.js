const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');

const verifiedImages = [
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

const perfumeBrands = [
  {
    brand: 'Dior',
    models: ['Sauvage', 'J’adore', 'Dior Homme Intense', 'Fahrenheit', 'Miss Dior', 'Poison Girl', 'Eden-Roc', 'Gris Dior', 'Dior Homme Sport', 'Oud Ispahan', 'Ambre Nuit', 'Tobacolor'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Chanel',
    models: ['Bleu de Chanel', 'Coco Mademoiselle', 'Chanel N°5', 'Chance Eau Tendre', 'Allure Homme Sport', 'Coco Noir', 'Egoiste Platinum', 'Coromandel', 'Sycomore', 'Antaeus', 'Paris-Deauville'],
    category: 'Amber Floral',
    defaultImg: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Tom Ford',
    models: ['Oud Wood', 'Black Orchid', 'Lost Cherry', 'Tobacco Vanille', 'Tuscan Leather', 'Neroli Portofino', 'Bitter Peach', 'Soleil Blanc', 'Ombré Leather', 'Fucking Fabulous', 'Noir Extreme', 'Grey Vetiver'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Creed',
    models: ['Aventus', 'Green Irish Tweed', 'Silver Mountain Water', 'Millesime Imperial', 'Viking Cologne', 'Virgin Island Water', 'Royal Oud', 'Himalaya', 'Original Santal', 'Aventus for Her', 'Absolu Aventus'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Maison Francis Kurkdjian',
    models: ['Baccarat Rouge 540', 'Grand Soir', 'Gentle Fluidity Silver', 'Gentle Fluidity Gold', 'Aqua Universalis', 'Oud Satin Mood', '724', 'Amyris Homme', 'L’Homme À la Rose', 'Baccarat Rouge 540 Extrait'],
    category: 'Amber Floral',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Yves Saint Laurent',
    models: ['Y Eau de Parfum', 'Libre', 'Black Opium', 'La Nuit de L’Homme', 'L’Homme', 'Kouros', 'Tuxedo', 'Babycat', 'Mon Paris', 'Y Le Parfum', 'Libre Le Parfum'],
    category: 'Floral & Sweet',
    defaultImg: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Giorgio Armani',
    models: ['Acqua Di Giò Profondo', 'Acqua Di Giò Parfum', 'Armani Code', 'Sì Passione', 'My Way', 'Stronger With You Intensely', 'Stronger With You Absolutely', 'Rose d’Arabie', 'Oud Royal', 'Acqua Di Giò Absolu'],
    category: 'Aquatic & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Versace',
    models: ['Eros', 'Dylan Blue', 'Pour Homme', 'Bright Crystal', 'Crystal Noir', 'Eros Flame', 'Oud Noir', 'The Dreamer', 'Yellow Diamond', 'Eros Energy'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Parfums de Marly',
    models: ['Layton', 'Pegasus Exclusif', 'Herod', 'Carlisle', 'Percival', 'Delina Exclusif', 'Sedley', 'Haltane', 'Greenley', 'Althair', 'Oajan', 'Kalan'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Xerjoff',
    models: ['Naxos 1861', 'Erba Pura', 'Alexandria II', 'Renaissance', '40 Knots', 'Tony Iommi Monkey Special', 'Torino21', 'Bouquet Ideale', 'Lira', 'Accento Overdose'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Kilian',
    models: ['Angels’ Share', 'Black Phantom', 'Love Don’t Be Shy', 'Straight to Heaven', 'Vodka on the Rocks', 'Apple Brandy on the Rocks', 'Intoxicated', 'Smoking Hot', 'Roses on Ice'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Amouage',
    models: ['Interlude Man', 'Reflection Man', 'Jubilation XXV', 'Guidance', 'Memoir Man', 'Epic Man', 'Overture Man', 'Interlude Black Iris', 'Royal Tobacco', 'Enclave'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Byredo',
    models: ['Gypsy Water', 'Mojave Ghost', 'Bal d’Afrique', 'Rose of No Man’s Land', 'Blanche', 'Black Saffron', 'Bibliothèque', 'Super Cedar', 'Oud Immortel', 'Mixed Emotions'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Le Labo',
    models: ['Santal 33', 'Another 13', 'Rose 31', 'Thé Noir 29', 'Bergamote 22', 'Vetiver 46', 'Matcha 26', 'Tonka 25', 'Baie 19', 'Lys 41', 'Gaiac 10'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Jo Malone',
    models: ['Wood Sage & Sea Salt', 'English Pear & Freesia', 'Lime Basil & Mandarin', 'Pomegranate Noir', 'Myrrh & Tonka', 'Oud & Bergamot', 'Peony & Blush Suede', 'Wild Bluebell'],
    category: 'Floral & Sweet',
    defaultImg: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Roja Parfums',
    models: ['Elysium Pour Homme', 'Enigma Pour Homme', 'Danger Pour Homme', 'Scandal', 'Apex', 'Burlington 1819', 'Oceania', 'Amber Aoud', 'Sweetie Aoud'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Mancera',
    models: ['Cedrat Boise', 'Red Tobacco', 'Roses Vanille', 'Instant Crush', 'Hindu Kush', 'Holidays', 'Lemon Line', 'Aoud Lemon Mint', 'Sicily', 'Coco Vanille'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Montale',
    models: ['Chocolate Greedy', 'Intense Cafe', 'Arabians Tonka', 'Starry Nights', 'Black Aoud', 'Honey Aoud', 'Sensual Instinct', 'Ristretto Intense Cafe', 'Vanilla Cake'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Nishane',
    models: ['Hacivat', 'Ani', 'Fan Your Flames', 'Hundred Silent Ways', 'Wulong Cha', 'B-612', 'Ambra Calabria', 'Ege', 'Kredo', 'Papilefiko'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Initio Parfums',
    models: ['Oud for Greatness', 'Side Effect', 'Rehab', 'Musk Therapy', 'Blessed Baraka', 'Paragon', 'Atomic Rose', 'Oud for Happiness', 'Absolute Aphrodisiac'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Lattafa',
    models: ['Khamrah', 'Khamrah Qahwa', 'Asad', 'Yara', 'Yara Tous', 'Bade’e Al Oud for Glory', 'Nebras', 'Fakhar Black', 'Ameer Al Oudh Intense Oud', 'Ejaazi', 'Velvet Rose'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Rasasi',
    models: ['Hawas for Him', 'Hawas Ice', 'Hawas for Her', 'La Yuqawam Pour Homme', 'Shuhrah Pour Homme', 'Daarej Pour Homme', 'Al Wisam Day', 'Fattan Pour Homme', 'Tasmeem'],
    category: 'Aquatic & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Afnan',
    models: ['9 PM', '9 AM Dive', 'Supremacy Not Only Intense', 'Turathi Blue', 'Rare Carbon', 'Modest Une Pour Homme', 'Supremacy Silver', 'Historic Doria', 'Zimaya Sharaf Blend'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Armaf',
    models: ['Club de Nuit Intense Man', 'Club de Nuit Milestone', 'Club de Nuit Sillage', 'Club de Nuit Untold', 'Club de Nuit Iconic', 'Urban Man Elixir', 'Craze', 'Tres Nuit'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Paco Rabanne',
    models: ['1 Million Elixir', '1 Million Royal', '1 Million Lucky', 'Invictus Victory Elixir', 'Invictus Platinum', 'Phantom Parfum', 'Black XS', 'Olympea Flora', 'Fame Parfum'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Carolina Herrera',
    models: ['Good Girl Velvet Fatale', 'Good Girl Blush', 'Very Good Girl Glam', 'Bad Boy Cobalt Elixir', 'Bad Boy Extreme', '212 VIP Black', '212 Men NYC', 'CH Men Prive'],
    category: 'Floral & Sweet',
    defaultImg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Jean Paul Gaultier',
    models: ['Le Male Elixir', 'Le Male Le Parfum', 'Ultra Male', 'Le Beau Le Parfum', 'Scandal Pour Homme Absolu', 'Gaultier Divine', 'La Belle Le Parfum', 'Le Male Pride'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Dolce & Gabbana',
    models: ['The One Eau de Parfum', 'The One For Men Gold', 'Light Blue Intense Pour Homme', 'Light Blue Summer Vibes', 'K by Dolce & Gabbana', 'Q by Dolce & Gabbana', 'Devotion', 'Velvet Desert Oud'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Hermes',
    models: ['Terre d’Hermès Parfum', 'Terre d’Hermès Eau Givrée', 'H24 Herbes Vives', 'Voyage d’Hermès', 'Un Jardin Sur Le Nil', 'Eau des Merveilles', 'Twilly d’Hermès', 'Ambre Narguile'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Hugo Boss',
    models: ['Boss Bottled Elixir', 'Boss Bottled Pacific', 'Boss Bottled Infinite', 'Boss The Scent Magnetic', 'Boss Bottled Night', 'Boss The Scent Le Parfum', 'Hugo Man Extreme', 'Boss Alive'],
    category: 'Woody & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Prada',
    models: ['Paradoxe Intense', 'Luna Rossa Carbon', 'Luna Rossa Black', 'Prada L’Homme Intense', 'Infusion d’Iris', 'Prada Amber Pour Homme', 'Luna Rossa Ocean Le Parfum', 'Paradoxe Virtual Flower'],
    category: 'Amber Floral',
    defaultImg: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Gucci',
    models: ['Gucci Bloom Ambrosia', 'Gucci Guilty Pour Homme Parfum', 'Gucci Flora Gorgeous Gardenia', 'Gucci Guilty Black', 'Memoire d’une Odeur', 'A Chant for the Nymph', 'The Eyes of the Tiger', 'Gucci Pour Homme'],
    category: 'Floral & Sweet',
    defaultImg: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Valentino',
    models: ['Born In Roma Donna Intense', 'Born In Roma Uomo Intense', 'Uomo Born In Roma Coral Fantasy', 'Donna Born In Roma Yellow Dream', 'Valentino Noir Absolu', 'Voce Viva Intensa'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Viktor & Rolf',
    models: ['Spicebomb Extreme', 'Flowerbomb Ruby Orchid', 'Spicebomb Nightvision', 'Flowerbomb Nectar', 'Spicebomb Infrared', 'Flowerbomb Dew', 'Good Fortune Elixir'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Acqua di Parma',
    models: ['Colonia Essenza', 'Colonia Futura', 'Blu Mediterraneo Fico di Amalfi', 'Bergamotto di Calabria', 'Mirto di Panarea', 'Oud & Spice', 'Signatures of the Sun Zafferano', 'Colonia Club'],
    category: 'Aquatic & Fresh',
    defaultImg: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Penhaligon’s',
    models: ['The Tragedy of Lord George', 'Halfeti', 'Halfeti Cedar', 'The Blazing Mr Sam', 'The Bewitching Yasmine', 'Juniper Sling', 'Endymion Concentré', 'Sartorial'],
    category: 'Luxury Oud',
    defaultImg: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85'
  },
  {
    brand: 'Maison Margiela',
    models: ['Replica Jazz Club', 'Replica By the Fireplace', 'Replica Sailing Day', 'Replica Whispers in the Library', 'Replica Coffee Break', 'Replica Under the Lemon Trees', 'Replica Autumn Vibes', 'Replica Beach Walk'],
    category: 'Warm & Spicy',
    defaultImg: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85'
  }
];

const editions = [
  { suffix: 'Eau de Parfum 100ml', mult: 1.0, label: 'BESTSELLER' },
  { suffix: 'Extrait de Parfum 100ml', mult: 1.35, label: 'LUXURY' },
  { suffix: 'Parfum Intense 60ml', mult: 1.15, label: 'INTENSE' },
  { suffix: 'Elixir Absolu 100ml', mult: 1.45, label: 'EXCLUSIVE' },
  { suffix: 'Eau de Toilette 100ml', mult: 0.85, label: 'POPULAR' },
  { suffix: 'Collector Edition 100ml', mult: 1.3, label: 'LIMITED' },
  { suffix: 'Travel Flacon 50ml', mult: 0.72, label: 'TRAVEL' },
  { suffix: 'Private Reserve 100ml', mult: 1.5, label: 'SIGNATURE' },
  { suffix: 'Grand Flacon 200ml', mult: 1.6, label: 'SUPER SIZE' },
  { suffix: 'Vintage Batch 100ml', mult: 1.25, label: 'VINTAGE' },
  { suffix: 'Pure Essence 75ml', mult: 1.1, label: 'TOP RATED' },
  { suffix: 'Prestige Edition 100ml', mult: 1.4, label: 'PRESTIGE' },
  { suffix: 'L’Eau Fraîche 100ml', mult: 0.8, label: 'SUMMER' },
  { suffix: 'Nocturne Parfum 100ml', mult: 1.2, label: 'NIGHT' },
  { suffix: 'Haute Parfumerie 100ml', mult: 1.55, label: 'HERITAGE' }
];

async function seed5000() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas');

  let store = await Store.findOne({ name: /parfum|fragrance|shoping/i });
  if (!store) store = await Store.findOne({});
  let owner = await User.findOne({ role: 'admin' }) || await User.findOne({});

  console.log(`Using Store: "${store.name}" (_id: ${store._id})`);
  console.log(`Using Owner: "${owner.email}" (_id: ${owner._id})`);

  // Clear existing products so we have a pure 5,000 perfume collection
  await Product.deleteMany({});
  console.log('Cleared old products.');

  const targetCount = 5000;
  const products = [];

  let brandIdx = 0;
  let modelIdx = 0;
  let editionIdx = 0;

  for (let i = 0; i < targetCount; i++) {
    const brandObj = perfumeBrands[i % perfumeBrands.length];
    const model = brandObj.models[(Math.floor(i / perfumeBrands.length)) % brandObj.models.length];
    const edition = editions[i % editions.length];

    const fullName = `${brandObj.brand} ${model} – ${edition.suffix}`;

    // Base price calculation in PKR range (Rs. 1,850 to Rs. 7,800)
    const basePrices = [2400, 2900, 3400, 3800, 4200, 4600, 4950, 5200, 5600, 6200, 6800, 7200];
    let price = Math.round((basePrices[i % basePrices.length] * edition.mult) / 50) * 50;
    if (price < 1850) price = 1850;
    if (price > 7800) price = 7800;

    const img = (i % 3 === 0 && brandObj.defaultImg) ? brandObj.defaultImg : verifiedImages[i % verifiedImages.length];

    const desc = `Authentic ${brandObj.brand} ${model}. Expertly blended with exquisite top notes, heart accords, and a deep, long-lasting signature drydown. Guaranteed authentic luxury fragrance presentation.`;

    products.push({
      name: fullName,
      description: desc,
      price: price,
      imageUrl: img,
      category: brandObj.category,
      stock: 15 + (i % 70),
      isAvailable: true,
      store: store._id,
      owner: owner._id,
    });
  }

  console.log(`Generated ${products.length} perfumes in memory. Inserting into Atlas in batches...`);

  const batchSize = 1000;
  for (let b = 0; b < products.length; b += batchSize) {
    const chunk = products.slice(b, b + batchSize);
    await Product.insertMany(chunk, { ordered: false });
    console.log(`Inserted batch ${b + 1} to ${Math.min(b + batchSize, products.length)}`);
  }

  const finalCount = await Product.countDocuments({});
  console.log(`\n========================================================`);
  console.log(`✅ SUCCESS: ${finalCount} LUXURY PERFUMES LIVE IN ATLAS!`);
  console.log(`========================================================`);

  await Store.findByIdAndUpdate(store._id, { productCount: finalCount });

  process.exit(0);
}

seed5000().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
