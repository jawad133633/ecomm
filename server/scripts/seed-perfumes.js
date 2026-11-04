const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Product = require('../models/Product');
const Store = require('../models/Store');
const User = require('../models/User');

const perfumeImages = [
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1527632911563-ee5b6d53465b?auto=format&fit=crop&w=900&q=85',
];

const perfumeCatalog = [
  {
    name: 'Dior Sauvage Eau de Parfum',
    brand: 'Dior',
    category: 'Woody & Fresh',
    price: 4850,
    description: 'An iconic raw and noble composition. Radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot, enveloped in warm smoky accents of Papua New Guinean vanilla absolute.',
    label: 'BESTSELLER',
    stock: 35,
  },
  {
    name: 'Bleu de Chanel Parfum',
    brand: 'Chanel',
    category: 'Woody & Aromatic',
    price: 5600,
    description: 'An intensely aromatic, woody fragrance for the man who defies convention. A timeless scent housed in an enigmatic blue bottle with cedar and sandalwood accords.',
    label: 'SIGNATURE',
    stock: 28,
  },
  {
    name: 'Tom Ford Oud Wood',
    brand: 'Tom Ford',
    category: 'Luxury Oud',
    price: 6800,
    description: 'Rare exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood, and vetiver. Tonka bean and amber add warmth and sensuality.',
    label: 'LUXURY',
    stock: 22,
  },
  {
    name: 'Creed Aventus Millésime',
    brand: 'Creed',
    category: 'Fruity & Smoky',
    price: 7200,
    description: 'A sensual, audacious, and contemporary scent combining opening notes of blackcurrant and Italian bergamot with a smoky birch, patchouli, and Moroccan jasmine base.',
    label: 'TOP RATED',
    stock: 18,
  },
  {
    name: 'Baccarat Rouge 540 Extrait',
    brand: 'Maison Francis Kurkdjian',
    category: 'Amber Floral',
    price: 7500,
    description: 'Luminous and sophisticated, with breezy jasmine petals and radiant saffron that carry mineral facets of ambergris and woody tones of freshly cut cedar.',
    label: 'EXCLUSIVE',
    stock: 15,
  },
  {
    name: 'YSL Libre Eau de Parfum',
    brand: 'Yves Saint Laurent',
    category: 'Floral & Sweet',
    price: 4950,
    description: 'The perfume of a strong, bold woman living her roaring freedom. French lavender essence combines with the sensuality of Moroccan orange blossom and daring musk.',
    label: 'BESTSELLER',
    stock: 30,
  },
  {
    name: 'Giorgio Armani Acqua Di Giò Profondo',
    brand: 'Giorgio Armani',
    category: 'Aquatic & Fresh',
    price: 4500,
    description: 'A captivating dive into the profoundness of the ocean. Marine notes awaken the senses alongside green mandarin, rosemary, lavender, and woody patchouli.',
    label: 'SUMMER FAVORITE',
    stock: 40,
  },
  {
    name: 'Versace Eros Flame Eau de Parfum',
    brand: 'Versace',
    category: 'Spicy & Woody',
    price: 3850,
    description: 'A fragrance for a passionate, confident man. Olfactory notes of Italian lemon, pepperwood, rosemary, cedarwood, and vetiver create an unforgettable trail.',
    label: 'POPULAR',
    stock: 32,
  },
  {
    name: 'Tom Ford Black Orchid',
    brand: 'Tom Ford',
    category: 'Dark & Sensual',
    price: 6200,
    description: 'A luxurious and sensual fragrance of rich dark accords and an alluring potion of black orchids, spice, ylang-ylang, and golden amber.',
    label: 'ICONIC',
    stock: 20,
  },
  {
    name: 'Maison Margiela Replica Jazz Club',
    brand: 'Maison Margiela',
    category: 'Warm & Spicy',
    price: 5400,
    description: 'Heady cocktails and rich cigar smoke in a cozy Brooklyn jazz club. Notes of pink pepper, rum absolute, tobacco leaf, and bourbon vanilla.',
    label: 'NICHE PICK',
    stock: 25,
  },
  {
    name: 'Chanel Coco Mademoiselle Intense',
    brand: 'Chanel',
    category: 'Floral & Sweet',
    price: 5800,
    description: 'The essence of a bold, free woman. An amber woody fragrance with an extreme character centered around an overdose of patchouli warmed by amber, vanilla, and tonka bean.',
    label: 'BESTSELLER',
    stock: 26,
  },
  {
    name: 'Dior J’adore L’Or Essence',
    brand: 'Dior',
    category: 'Floral & Sweet',
    price: 4600,
    description: 'An ode to women and their audacity. Grandiflorum jasmine and Centifolia rose from Grasse mingle with exotic Tahitian vanilla and creamy tonka bean.',
    label: 'FEMININE',
    stock: 24,
  },
  {
    name: 'Gucci Bloom Ambrosia di Fiori',
    brand: 'Gucci',
    category: 'Floral & Sweet',
    price: 4200,
    description: 'An intense vibrant bouquet featuring precious velvety orris root and Damascena rose alongside jasmine bud extract and tuberose.',
    label: 'SPRING CLASSIC',
    stock: 29,
  },
  {
    name: 'YSL Y Eau de Parfum Intense',
    brand: 'Yves Saint Laurent',
    category: 'Woody & Fresh',
    price: 4700,
    description: 'Deeply fresh and intensely powerful. Sage and juniper from Provence are amplified by an elegant cedarwood base and rich Indonesian patchouli.',
    label: 'TRENDING',
    stock: 34,
  },
  {
    name: 'Dolce & Gabbana Light Blue Intense',
    brand: 'Dolce & Gabbana',
    category: 'Aquatic & Fresh',
    price: 3600,
    description: 'Sun-drenched Mediterranean escape. Crisp Granny Smith apple and zesty Calabrian lemon meet marigold and luminous amber woods.',
    label: 'CRISP & FRESH',
    stock: 38,
  },
  {
    name: 'Jo Malone Wood Sage & Sea Salt',
    brand: 'Jo Malone London',
    category: 'Aquatic & Fresh',
    price: 3900,
    description: 'Escape the everyday along the windswept shore. Waves breaking white, air fresh with sea salt and spray, alive with the mineral scent of the rugged cliffs.',
    label: 'CLEAN SCENT',
    stock: 27,
  },
  {
    name: 'Byredo Gypsy Water',
    brand: 'Byredo',
    category: 'Woody & Fresh',
    price: 6500,
    description: 'An ode to the beauty of Romany culture, free-spirited and connected to the earth. Bergamot, juniper berries, incense, pine needles, and amber.',
    label: 'NICHE LUXURY',
    stock: 19,
  },
  {
    name: 'Prada Paradoxe Intense',
    brand: 'Prada',
    category: 'Floral & Amber',
    price: 4850,
    description: 'An augmentation of floral power with an infusion of jasmine superessence and warm Ambrofix, grounded by a bold moss accord.',
    label: 'JUST IN',
    stock: 31,
  },
  {
    name: 'Paco Rabanne 1 Million Elixir',
    brand: 'Paco Rabanne',
    category: 'Warm & Spicy',
    price: 3950,
    description: 'Peak intensity in a solid gold bar. Rich Turkish damascena rose, osmanthus, wild tonka beans, and precious davana liqueur.',
    label: 'BESTSELLER',
    stock: 36,
  },
  {
    name: 'Carolina Herrera Good Girl Velvet Fatale',
    brand: 'Carolina Herrera',
    category: 'Floral & Sweet',
    price: 4300,
    description: 'It’s so good to be bad. The iconic stiletto bottle filled with almond, coffee, tuberose, tonka bean, and cacao.',
    label: 'FEMME FATALE',
    stock: 33,
  },
  {
    name: 'Valentino Born In Roma Donna Intense',
    brand: 'Valentino',
    category: 'Floral & Amber',
    price: 5100,
    description: 'An magnetic ambery floral pushing vanilla bourbon and luminous jasmine into modern haute couture extravagance.',
    label: 'HAUTE COUTURE',
    stock: 22,
  },
  {
    name: 'Lancôme La Vie Est Belle Iris Absolu',
    brand: 'Lancôme',
    category: 'Floral & Sweet',
    price: 4400,
    description: 'Life is beautiful. A concentrated tribute to the iconic Iris Pallida flower, spun with gourmand spun sugar and warm patchouli.',
    label: 'GIFT FAVORITE',
    stock: 30,
  },
  {
    name: 'Viktor & Rolf Flowerbomb Ruby Orchid',
    brand: 'Viktor & Rolf',
    category: 'Floral & Sweet',
    price: 4600,
    description: 'A sensual, magnetic floral explosion inspired by the theatrical world of burlesque with ruby orchid and red vanilla bean.',
    label: 'SEDUCTIVE',
    stock: 25,
  },
  {
    name: 'Kilian Angels’ Share',
    brand: 'Kilian Paris',
    category: 'Gourmand & Warm',
    price: 7400,
    description: 'Heritage cognac essence distilled from actual liquor, infused with cinnamon bark, oak absolute, tonka bean, and praline.',
    label: 'CONNOISSEUR',
    stock: 16,
  },
  {
    name: 'Hermès Terre d’Hermès Parfum',
    brand: 'Hermès',
    category: 'Woody & Mineral',
    price: 4900,
    description: 'Narrating the relationship between man and earth, an alliance of citrus and flint with cedar, benzoin, and shiso.',
    label: 'GENTLEMAN',
    stock: 28,
  },
  {
    name: 'Armani Si Passione Éclat',
    brand: 'Giorgio Armani',
    category: 'Floral & Fruity',
    price: 4500,
    description: 'A sparkling and modern feminine rose bouquet electrified with juicy blackcurrant and Centifolia rose from Grasse.',
    label: 'ROMANTIC',
    stock: 29,
  },
  {
    name: 'Jean Paul Gaultier Le Male Elixir',
    brand: 'Jean Paul Gaultier',
    category: 'Warm & Spicy',
    price: 4200,
    description: 'A burning glow of lavender, mint, honey-sweet benzoin, and rich tonka bean on a sailor’s gilded torso.',
    label: 'MAGNETIC',
    stock: 34,
  },
  {
    name: 'Burberry Goddess Eau de Parfum',
    brand: 'Burberry',
    category: 'Gourmand Vanilla',
    price: 4100,
    description: 'A unique aromatic gourmand led by a powerful trio of distinct vanillas enriched with luminous lavender.',
    label: 'NEW CLASSIC',
    stock: 31,
  },
  {
    name: 'Roja Parfums Elysium Pour Homme',
    brand: 'Roja Parfums',
    category: 'Ultra Luxury Citrus',
    price: 7600,
    description: 'An ultra-rare elixir of pure elegance. Zesty grapefruit and lime meet pink pepper, vetiver, and rich ambergris.',
    label: 'ELITE',
    stock: 14,
  },
  {
    name: 'Amouage Interlude Man (The Blue Beast)',
    brand: 'Amouage',
    category: 'Luxury Oud',
    price: 7800,
    description: 'Frankincense and myrrh in a harmonious storm of oregano, pimento berry, leather, oud, and sandalwood.',
    label: 'ROYAL OUD',
    stock: 12,
  },
  {
    name: 'Parfums de Marly Layton Royal Essence',
    brand: 'Parfums de Marly',
    category: 'Warm & Spicy',
    price: 7200,
    description: 'The grandeur of the Versailles court. Bergamot, apple, lavender, geranium, violet, and caramelized vanilla.',
    label: 'NOBILITY',
    stock: 15,
  },
  {
    name: 'Xerjoff Naxos 1861',
    brand: 'Xerjoff',
    category: 'Warm & Spicy',
    price: 7500,
    description: 'A celebration of Mediterranean Sicily. Honeyed tobacco leaf, vibrant citrus, cinnamon, cashmere, and rich vanilla.',
    label: 'MASTERPIECE',
    stock: 15,
  },
  {
    name: 'Le Labo Santal 33',
    brand: 'Le Labo',
    category: 'Woody & Smoky',
    price: 6900,
    description: 'An intoxicating spirit of the American West. Australian sandalwood, cedarwood, cardamom, iris, and leather.',
    label: 'CULT FAVORITE',
    stock: 21,
  },
  {
    name: 'Diptyque Philosykos Eau de Parfum',
    brand: 'Diptyque',
    category: 'Green & Woody',
    price: 5200,
    description: 'An ode to the whole fig tree: green freshness of leaves, milky flavor of ripe figs, and density of white cedar wood.',
    label: 'PARISIAN CHIC',
    stock: 23,
  },
  {
    name: 'Tom Ford Lost Cherry',
    brand: 'Tom Ford',
    category: 'Fruity & Gourmand',
    price: 7300,
    description: 'A full-bodied journey into the once-forbidden. Black cherry infused with bitter almond, Turkish rose, and roasted tonka.',
    label: 'INTOXICATING',
    stock: 17,
  },
  {
    name: 'Chanel Allure Homme Sport Eau Extrême',
    brand: 'Chanel',
    category: 'Fresh & Woody',
    price: 4900,
    description: 'An intense rush of adrenaline. Sparkling Sicilian mandarin pairs with spicy Moroccan cypress and sensual white musk.',
    label: 'ATHLETIC LUXURY',
    stock: 35,
  },
  {
    name: 'Dior Homme Intense Eau de Parfum',
    brand: 'Dior',
    category: 'Iris & Woody',
    price: 4750,
    description: 'The pinnacle of masculine sophistication. Tuscan iris enhanced by ambrette seed, Virginia cedar, and vetiver.',
    label: 'EVENING SCENT',
    stock: 27,
  },
  {
    name: 'Acqua di Parma Colonia Essenza',
    brand: 'Acqua di Parma',
    category: 'Aquatic & Fresh',
    price: 4300,
    description: 'Italian sunshine bottled. Classic Golden Fruits citrus balanced by rosemary, delicate floral heart, and woody vetiver.',
    label: 'ITALIAN HERITAGE',
    stock: 26,
  },
  {
    name: 'Guerlain Shalimar Millésime Iris',
    brand: 'Guerlain',
    category: 'Amber & Powder',
    price: 4600,
    description: 'The legendary temple of love. Radiant bergamot, powdery iris, and an intoxicating overdose of pure Guerlinade vanilla.',
    label: 'VINTAGE ICON',
    stock: 20,
  },
  {
    name: 'Montblanc Explorer Platinum',
    brand: 'Montblanc',
    category: 'Woody & Aromatic',
    price: 2900,
    description: 'A tribute to the majestic mountains. Crispy violet leaves, herbaceous clary sage, and intense Alaskan cedarwood.',
    label: 'GREAT VALUE',
    stock: 45,
  },
  {
    name: 'Club de Nuit Intense Man Pure Parfum',
    brand: 'Armaf',
    category: 'Fruity & Smoky',
    price: 2450,
    description: 'Legendary powerhouse fragrance. Fresh lemon, blackcurrant, pineapple, birch, jasmine, and rich ambergris base.',
    label: 'BEAST MODE',
    stock: 50,
  },
  {
    name: 'Lattafa Khamrah Qahwa',
    brand: 'Lattafa',
    category: 'Warm & Spicy',
    price: 2800,
    description: 'Arabian hospitality in a crystal flask. Spiced coffee, dates, praline, cinnamon, tonka bean, and bourbon vanilla.',
    label: 'VIRAL HIT',
    stock: 48,
  },
  {
    name: 'Rasasi Hawas for Him',
    brand: 'Rasasi',
    category: 'Aquatic & Fresh',
    price: 3400,
    description: 'Adventurous aquatic blend. Italian citrus, crisp green apple, plum, cardamom, marine accord, and driftwood.',
    label: 'HOT SELLER',
    stock: 42,
  },
  {
    name: 'Afnan 9 PM Elixir',
    brand: 'Afnan',
    category: 'Sweet & Warm',
    price: 2600,
    description: 'The ultimate party fragrance. Sweet apple, wild cinnamon, wild lavender, orange blossom, amber, and patchouli.',
    label: 'NIGHTOUT PICK',
    stock: 45,
  },
  {
    name: 'Mancera Cedrat Boise Intense',
    brand: 'Mancera',
    category: 'Citrus & Woody',
    price: 5100,
    description: 'Vibrant Sicilian citrus burst with blackcurrant, spices, leather, patchouli, Cambodian oud, and white musk.',
    label: 'NICHE FAVORITE',
    stock: 24,
  },
  {
    name: 'Montale Chocolate Greedy',
    brand: 'Montale',
    category: 'Gourmand & Warm',
    price: 4900,
    description: 'Decadent mouth-watering dark chocolate truffle, rich cocoa butter, roasted tonka bean, and orange zest.',
    label: 'DELICIOUS',
    stock: 22,
  },
  {
    name: 'Calvin Klein CK One Gold Collector',
    brand: 'Calvin Klein',
    category: 'Fresh & Woody',
    price: 2200,
    description: 'A seasonal golden tribute. Juicy fig, neroli, luminous jasmine, sage, and radiant vetiver woods.',
    label: 'DAILY ESSENTIAL',
    stock: 50,
  },
  {
    name: 'Davidoff Cool Water Reborn',
    brand: 'Davidoff',
    category: 'Aquatic & Fresh',
    price: 1950,
    description: 'The timeless oceanic icon reinvented with upcycled rosemary, green galbanum, and sustainable Haitian vetiver.',
    label: 'AFFORDABLE',
    stock: 55,
  },
  {
    name: 'Hugo Boss Boss Bottled Elixir',
    brand: 'Hugo Boss',
    category: 'Woody & Spicy',
    price: 3700,
    description: 'Intense and sophisticated. Frankincense and cardamom warm the rich patchouli and cedarwood heart.',
    label: 'MODERN MAN',
    stock: 36,
  },
];

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI missing from environment!');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB Atlas successfully!');

  // Fetch admin user or store owner
  let owner = await User.findOne({ role: 'admin' });
  if (!owner) {
    owner = await User.findOne();
  }

  // Fetch existing stores or create a premium perfume house
  let store = await Store.findOne({ name: /parfum|fragrance|aroma/i });
  if (!store) {
    store = await Store.findOne();
  }
  if (!store && owner) {
    store = await Store.create({
      name: 'Maison de Parfum',
      slug: 'maison-de-parfum',
      description: 'Curated luxury fragrances, designer perfumes, and rare artisanal scents from around the globe.',
      owner: owner._id,
      isApproved: true,
      productCount: perfumeCatalog.length,
    });
  }

  console.log(`Using Store: "${store?.name || 'Fragrance Store'}" (_id: ${store?._id})`);
  console.log(`Using Owner: "${owner?.email || 'Admin'}" (_id: ${owner?._id})`);

  // Fetch all existing products
  const existingProducts = await Product.find({}).sort({ createdAt: 1 });
  console.log(`Found ${existingProducts.length} existing products in database.`);

  let updatedCount = 0;
  let createdCount = 0;

  for (let i = 0; i < perfumeCatalog.length; i++) {
    const item = perfumeCatalog[i];
    const image = perfumeImages[i % perfumeImages.length];

    const productPayload = {
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: image,
      category: item.category,
      stock: item.stock,
      isAvailable: true,
      store: store._id,
      owner: owner._id,
    };

    if (i < existingProducts.length) {
      // Update existing document
      await Product.findByIdAndUpdate(existingProducts[i]._id, productPayload);
      updatedCount++;
    } else {
      // Create new document
      await Product.create(productPayload);
      createdCount++;
    }
  }

  // Update store productCount
  const totalCount = await Product.countDocuments({ isAvailable: true });
  if (store) {
    await Store.findByIdAndUpdate(store._id, { productCount: totalCount });
  }

  console.log(`\n======================================================`);
  console.log(`✅ PERFUMES SEED COMPLETED!`);
  console.log(`   Updated Existing: ${updatedCount} products`);
  console.log(`   Created New:      ${createdCount} products`);
  console.log(`   Total Catalogue:  ${totalCount} luxury perfume products`);
  console.log(`======================================================\n`);

  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

