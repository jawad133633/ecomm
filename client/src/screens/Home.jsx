'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/navigation';
import api from '../api/axios';

export const demoProducts = [
  {
    "_id": "perfume-1",
    "name": "Dior Sauvage Eau de Parfum",
    "category": "Woody & Fresh",
    "price": 4850,
    "store": {
      "name": "Dior Official",
      "slug": "dior"
    },
    "imageUrl": "https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An iconic raw and noble composition. Radiant top notes burst with the juicy freshness of Reggio di Calabria Bergamot, enveloped in warm smoky accents of Papua New Guinean vanilla absolute."
  },
  {
    "_id": "perfume-2",
    "name": "Bleu de Chanel Parfum",
    "category": "Woody & Aromatic",
    "price": 5600,
    "store": {
      "name": "Bleu Official",
      "slug": "bleu"
    },
    "imageUrl": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An intensely aromatic, woody fragrance for the man who defies convention. A timeless scent housed in an enigmatic blue bottle with cedar and sandalwood accords."
  },
  {
    "_id": "perfume-3",
    "name": "Tom Ford Oud Wood",
    "category": "Luxury Oud",
    "price": 6800,
    "store": {
      "name": "Tom Official",
      "slug": "tom"
    },
    "imageUrl": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "Rare exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood, and vetiver. Tonka bean and amber add warmth and sensuality."
  },
  {
    "_id": "perfume-4",
    "name": "Creed Aventus Millésime",
    "category": "Fruity & Smoky",
    "price": 7200,
    "store": {
      "name": "Creed Official",
      "slug": "creed"
    },
    "imageUrl": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "A sensual, audacious, and contemporary scent combining opening notes of blackcurrant and Italian bergamot with a smoky birch, patchouli, and Moroccan jasmine base."
  },
  {
    "_id": "perfume-5",
    "name": "Baccarat Rouge 540 Extrait",
    "category": "Amber Floral",
    "price": 7500,
    "store": {
      "name": "Baccarat Official",
      "slug": "baccarat"
    },
    "imageUrl": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "Luminous and sophisticated, with breezy jasmine petals and radiant saffron that carry mineral facets of ambergris and woody tones of freshly cut cedar."
  },
  {
    "_id": "perfume-6",
    "name": "YSL Libre Eau de Parfum",
    "category": "Floral & Sweet",
    "price": 4950,
    "store": {
      "name": "YSL Official",
      "slug": "ysl"
    },
    "imageUrl": "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The perfume of a strong, bold woman living her roaring freedom. French lavender essence combines with the sensuality of Moroccan orange blossom and daring musk."
  },
  {
    "_id": "perfume-7",
    "name": "Giorgio Armani Acqua Di Giò Profondo",
    "category": "Aquatic & Fresh",
    "price": 4500,
    "store": {
      "name": "Giorgio Official",
      "slug": "giorgio"
    },
    "imageUrl": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A captivating dive into the profoundness of the ocean. Marine notes awaken the senses alongside green mandarin, rosemary, lavender, and woody patchouli."
  },
  {
    "_id": "perfume-8",
    "name": "Versace Eros Flame Eau de Parfum",
    "category": "Spicy & Woody",
    "price": 3850,
    "store": {
      "name": "Versace Official",
      "slug": "versace"
    },
    "imageUrl": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A fragrance for a passionate, confident man. Olfactory notes of Italian lemon, pepperwood, rosemary, cedarwood, and vetiver create an unforgettable trail."
  },
  {
    "_id": "perfume-9",
    "name": "Tom Ford Black Orchid",
    "category": "Dark & Sensual",
    "price": 6200,
    "store": {
      "name": "Tom Official",
      "slug": "tom"
    },
    "imageUrl": "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "A luxurious and sensual fragrance of rich dark accords and an alluring potion of black orchids, spice, ylang-ylang, and golden amber."
  },
  {
    "_id": "perfume-10",
    "name": "Maison Margiela Replica Jazz Club",
    "category": "Warm & Spicy",
    "price": 5400,
    "store": {
      "name": "Maison Official",
      "slug": "maison"
    },
    "imageUrl": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Heady cocktails and rich cigar smoke in a cozy Brooklyn jazz club. Notes of pink pepper, rum absolute, tobacco leaf, and bourbon vanilla."
  },
  {
    "_id": "perfume-11",
    "name": "Chanel Coco Mademoiselle Intense",
    "category": "Floral & Sweet",
    "price": 5800,
    "store": {
      "name": "Chanel Official",
      "slug": "chanel"
    },
    "imageUrl": "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The essence of a bold, free woman. An amber woody fragrance with an extreme character centered around an overdose of patchouli warmed by amber, vanilla, and tonka bean."
  },
  {
    "_id": "perfume-12",
    "name": "Dior J’adore L’Or Essence",
    "category": "Floral & Sweet",
    "price": 4600,
    "store": {
      "name": "Dior Official",
      "slug": "dior"
    },
    "imageUrl": "https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An ode to women and their audacity. Grandiflorum jasmine and Centifolia rose from Grasse mingle with exotic Tahitian vanilla and creamy tonka bean."
  },
  {
    "_id": "perfume-13",
    "name": "Gucci Bloom Ambrosia di Fiori",
    "category": "Floral & Sweet",
    "price": 4200,
    "store": {
      "name": "Gucci Official",
      "slug": "gucci"
    },
    "imageUrl": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An intense vibrant bouquet featuring precious velvety orris root and Damascena rose alongside jasmine bud extract and tuberose."
  },
  {
    "_id": "perfume-14",
    "name": "YSL Y Eau de Parfum Intense",
    "category": "Woody & Fresh",
    "price": 4700,
    "store": {
      "name": "YSL Official",
      "slug": "ysl"
    },
    "imageUrl": "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Deeply fresh and intensely powerful. Sage and juniper from Provence are amplified by an elegant cedarwood base and rich Indonesian patchouli."
  },
  {
    "_id": "perfume-15",
    "name": "Dolce & Gabbana Light Blue Intense",
    "category": "Aquatic & Fresh",
    "price": 3600,
    "store": {
      "name": "Dolce Official",
      "slug": "dolce"
    },
    "imageUrl": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Sun-drenched Mediterranean escape. Crisp Granny Smith apple and zesty Calabrian lemon meet marigold and luminous amber woods."
  },
  {
    "_id": "perfume-16",
    "name": "Jo Malone Wood Sage & Sea Salt",
    "category": "Aquatic & Fresh",
    "price": 3900,
    "store": {
      "name": "Jo Official",
      "slug": "jo"
    },
    "imageUrl": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Escape the everyday along the windswept shore. Waves breaking white, air fresh with sea salt and spray, alive with the mineral scent of the rugged cliffs."
  },
  {
    "_id": "perfume-17",
    "name": "Byredo Gypsy Water",
    "category": "Woody & Fresh",
    "price": 6500,
    "store": {
      "name": "Byredo Official",
      "slug": "byredo"
    },
    "imageUrl": "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "An ode to the beauty of Romany culture, free-spirited and connected to the earth. Bergamot, juniper berries, incense, pine needles, and amber."
  },
  {
    "_id": "perfume-18",
    "name": "Prada Paradoxe Intense",
    "category": "Floral & Amber",
    "price": 4850,
    "store": {
      "name": "Prada Official",
      "slug": "prada"
    },
    "imageUrl": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An augmentation of floral power with an infusion of jasmine superessence and warm Ambrofix, grounded by a bold moss accord."
  },
  {
    "_id": "perfume-19",
    "name": "Paco Rabanne 1 Million Elixir",
    "category": "Warm & Spicy",
    "price": 3950,
    "store": {
      "name": "Paco Official",
      "slug": "paco"
    },
    "imageUrl": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Peak intensity in a solid gold bar. Rich Turkish damascena rose, osmanthus, wild tonka beans, and precious davana liqueur."
  },
  {
    "_id": "perfume-20",
    "name": "Carolina Herrera Good Girl Velvet Fatale",
    "category": "Floral & Sweet",
    "price": 4300,
    "store": {
      "name": "Carolina Official",
      "slug": "carolina"
    },
    "imageUrl": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "It’s so good to be bad. The iconic stiletto bottle filled with almond, coffee, tuberose, tonka bean, and cacao."
  },
  {
    "_id": "perfume-21",
    "name": "Valentino Born In Roma Donna Intense",
    "category": "Floral & Amber",
    "price": 5100,
    "store": {
      "name": "Valentino Official",
      "slug": "valentino"
    },
    "imageUrl": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An magnetic ambery floral pushing vanilla bourbon and luminous jasmine into modern haute couture extravagance."
  },
  {
    "_id": "perfume-22",
    "name": "Lancôme La Vie Est Belle Iris Absolu",
    "category": "Floral & Sweet",
    "price": 4400,
    "store": {
      "name": "Lancôme Official",
      "slug": "lancôme"
    },
    "imageUrl": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Life is beautiful. A concentrated tribute to the iconic Iris Pallida flower, spun with gourmand spun sugar and warm patchouli."
  },
  {
    "_id": "perfume-23",
    "name": "Viktor & Rolf Flowerbomb Ruby Orchid",
    "category": "Floral & Sweet",
    "price": 4600,
    "store": {
      "name": "Viktor Official",
      "slug": "viktor"
    },
    "imageUrl": "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A sensual, magnetic floral explosion inspired by the theatrical world of burlesque with ruby orchid and red vanilla bean."
  },
  {
    "_id": "perfume-24",
    "name": "Kilian Angels’ Share",
    "category": "Gourmand & Warm",
    "price": 7400,
    "store": {
      "name": "Kilian Official",
      "slug": "kilian"
    },
    "imageUrl": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "Heritage cognac essence distilled from actual liquor, infused with cinnamon bark, oak absolute, tonka bean, and praline."
  },
  {
    "_id": "perfume-25",
    "name": "Hermès Terre d’Hermès Parfum",
    "category": "Woody & Mineral",
    "price": 4900,
    "store": {
      "name": "Hermès Official",
      "slug": "hermès"
    },
    "imageUrl": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Narrating the relationship between man and earth, an alliance of citrus and flint with cedar, benzoin, and shiso."
  },
  {
    "_id": "perfume-26",
    "name": "Armani Si Passione Éclat",
    "category": "Floral & Fruity",
    "price": 4500,
    "store": {
      "name": "Armani Official",
      "slug": "armani"
    },
    "imageUrl": "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A sparkling and modern feminine rose bouquet electrified with juicy blackcurrant and Centifolia rose from Grasse."
  },
  {
    "_id": "perfume-27",
    "name": "Jean Paul Gaultier Le Male Elixir",
    "category": "Warm & Spicy",
    "price": 4200,
    "store": {
      "name": "Jean Official",
      "slug": "jean"
    },
    "imageUrl": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A burning glow of lavender, mint, honey-sweet benzoin, and rich tonka bean on a sailor’s gilded torso."
  },
  {
    "_id": "perfume-28",
    "name": "Burberry Goddess Eau de Parfum",
    "category": "Gourmand Vanilla",
    "price": 4100,
    "store": {
      "name": "Burberry Official",
      "slug": "burberry"
    },
    "imageUrl": "https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A unique aromatic gourmand led by a powerful trio of distinct vanillas enriched with luminous lavender."
  },
  {
    "_id": "perfume-29",
    "name": "Roja Parfums Elysium Pour Homme",
    "category": "Ultra Luxury Citrus",
    "price": 7600,
    "store": {
      "name": "Roja Official",
      "slug": "roja"
    },
    "imageUrl": "https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "An ultra-rare elixir of pure elegance. Zesty grapefruit and lime meet pink pepper, vetiver, and rich ambergris."
  },
  {
    "_id": "perfume-30",
    "name": "Amouage Interlude Man (The Blue Beast)",
    "category": "Luxury Oud",
    "price": 7800,
    "store": {
      "name": "Amouage Official",
      "slug": "amouage"
    },
    "imageUrl": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "Frankincense and myrrh in a harmonious storm of oregano, pimento berry, leather, oud, and sandalwood."
  },
  {
    "_id": "perfume-31",
    "name": "Parfums de Marly Layton Royal Essence",
    "category": "Warm & Spicy",
    "price": 7200,
    "store": {
      "name": "Parfums Official",
      "slug": "parfums"
    },
    "imageUrl": "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "The grandeur of the Versailles court. Bergamot, apple, lavender, geranium, violet, and caramelized vanilla."
  },
  {
    "_id": "perfume-32",
    "name": "Xerjoff Naxos 1861",
    "category": "Warm & Spicy",
    "price": 7500,
    "store": {
      "name": "Xerjoff Official",
      "slug": "xerjoff"
    },
    "imageUrl": "https://images.unsplash.com/photo-1582211594533-268f4f1edcb9?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "A celebration of Mediterranean Sicily. Honeyed tobacco leaf, vibrant citrus, cinnamon, cashmere, and rich vanilla."
  },
  {
    "_id": "perfume-33",
    "name": "Le Labo Santal 33",
    "category": "Woody & Smoky",
    "price": 6900,
    "store": {
      "name": "Le Official",
      "slug": "le"
    },
    "imageUrl": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "An intoxicating spirit of the American West. Australian sandalwood, cedarwood, cardamom, iris, and leather."
  },
  {
    "_id": "perfume-34",
    "name": "Diptyque Philosykos Eau de Parfum",
    "category": "Green & Woody",
    "price": 5200,
    "store": {
      "name": "Diptyque Official",
      "slug": "diptyque"
    },
    "imageUrl": "https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An ode to the whole fig tree: green freshness of leaves, milky flavor of ripe figs, and density of white cedar wood."
  },
  {
    "_id": "perfume-35",
    "name": "Tom Ford Lost Cherry",
    "category": "Fruity & Gourmand",
    "price": 7300,
    "store": {
      "name": "Tom Official",
      "slug": "tom"
    },
    "imageUrl": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": "A full-bodied journey into the once-forbidden. Black cherry infused with bitter almond, Turkish rose, and roasted tonka."
  },
  {
    "_id": "perfume-36",
    "name": "Chanel Allure Homme Sport Eau Extrême",
    "category": "Fresh & Woody",
    "price": 4900,
    "store": {
      "name": "Chanel Official",
      "slug": "chanel"
    },
    "imageUrl": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "An intense rush of adrenaline. Sparkling Sicilian mandarin pairs with spicy Moroccan cypress and sensual white musk."
  },
  {
    "_id": "perfume-37",
    "name": "Dior Homme Intense Eau de Parfum",
    "category": "Iris & Woody",
    "price": 4750,
    "store": {
      "name": "Dior Official",
      "slug": "dior"
    },
    "imageUrl": "https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The pinnacle of masculine sophistication. Tuscan iris enhanced by ambrette seed, Virginia cedar, and vetiver."
  },
  {
    "_id": "perfume-38",
    "name": "Acqua di Parma Colonia Essenza",
    "category": "Aquatic & Fresh",
    "price": 4300,
    "store": {
      "name": "Acqua Official",
      "slug": "acqua"
    },
    "imageUrl": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Italian sunshine bottled. Classic Golden Fruits citrus balanced by rosemary, delicate floral heart, and woody vetiver."
  },
  {
    "_id": "perfume-39",
    "name": "Guerlain Shalimar Millésime Iris",
    "category": "Amber & Powder",
    "price": 4600,
    "store": {
      "name": "Guerlain Official",
      "slug": "guerlain"
    },
    "imageUrl": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The legendary temple of love. Radiant bergamot, powdery iris, and an intoxicating overdose of pure Guerlinade vanilla."
  },
  {
    "_id": "perfume-40",
    "name": "Montblanc Explorer Platinum",
    "category": "Woody & Aromatic",
    "price": 2900,
    "store": {
      "name": "Montblanc Official",
      "slug": "montblanc"
    },
    "imageUrl": "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A tribute to the majestic mountains. Crispy violet leaves, herbaceous clary sage, and intense Alaskan cedarwood."
  },
  {
    "_id": "perfume-41",
    "name": "Club de Nuit Intense Man Pure Parfum",
    "category": "Fruity & Smoky",
    "price": 2450,
    "store": {
      "name": "Club Official",
      "slug": "club"
    },
    "imageUrl": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Legendary powerhouse fragrance. Fresh lemon, blackcurrant, pineapple, birch, jasmine, and rich ambergris base."
  },
  {
    "_id": "perfume-42",
    "name": "Lattafa Khamrah Qahwa",
    "category": "Warm & Spicy",
    "price": 2800,
    "store": {
      "name": "Lattafa Official",
      "slug": "lattafa"
    },
    "imageUrl": "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Arabian hospitality in a crystal flask. Spiced coffee, dates, praline, cinnamon, tonka bean, and bourbon vanilla."
  },
  {
    "_id": "perfume-43",
    "name": "Rasasi Hawas for Him",
    "category": "Aquatic & Fresh",
    "price": 3400,
    "store": {
      "name": "Rasasi Official",
      "slug": "rasasi"
    },
    "imageUrl": "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Adventurous aquatic blend. Italian citrus, crisp green apple, plum, cardamom, marine accord, and driftwood."
  },
  {
    "_id": "perfume-44",
    "name": "Afnan 9 PM Elixir",
    "category": "Sweet & Warm",
    "price": 2600,
    "store": {
      "name": "Afnan Official",
      "slug": "afnan"
    },
    "imageUrl": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The ultimate party fragrance. Sweet apple, wild cinnamon, wild lavender, orange blossom, amber, and patchouli."
  },
  {
    "_id": "perfume-45",
    "name": "Mancera Cedrat Boise Intense",
    "category": "Citrus & Woody",
    "price": 5100,
    "store": {
      "name": "Mancera Official",
      "slug": "mancera"
    },
    "imageUrl": "https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Vibrant Sicilian citrus burst with blackcurrant, spices, leather, patchouli, Cambodian oud, and white musk."
  },
  {
    "_id": "perfume-46",
    "name": "Montale Chocolate Greedy",
    "category": "Gourmand & Warm",
    "price": 4900,
    "store": {
      "name": "Montale Official",
      "slug": "montale"
    },
    "imageUrl": "https://images.unsplash.com/photo-1572533177115-5bea803c0f49?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Decadent mouth-watering dark chocolate truffle, rich cocoa butter, roasted tonka bean, and orange zest."
  },
  {
    "_id": "perfume-47",
    "name": "Calvin Klein CK One Gold Collector",
    "category": "Fresh & Woody",
    "price": 2200,
    "store": {
      "name": "Calvin Official",
      "slug": "calvin"
    },
    "imageUrl": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "A seasonal golden tribute. Juicy fig, neroli, luminous jasmine, sage, and radiant vetiver woods."
  },
  {
    "_id": "perfume-48",
    "name": "Davidoff Cool Water Reborn",
    "category": "Aquatic & Fresh",
    "price": 1950,
    "store": {
      "name": "Davidoff Official",
      "slug": "davidoff"
    },
    "imageUrl": "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "The timeless oceanic icon reinvented with upcycled rosemary, green galbanum, and sustainable Haitian vetiver."
  },
  {
    "_id": "perfume-49",
    "name": "Hugo Boss Boss Bottled Elixir",
    "category": "Woody & Spicy",
    "price": 3700,
    "store": {
      "name": "Hugo Official",
      "slug": "hugo"
    },
    "imageUrl": "https://images.unsplash.com/photo-1512777576244-b846ac3d816f?auto=format&fit=crop&w=900&q=85",
    "label": "BESTSELLER",
    "description": "Intense and sophisticated. Frankincense and cardamom warm the rich patchouli and cedarwood heart."
  },
  {
    "_id": "perfume-50",
    "name": "Tom Ford Oud Wood",
    "category": "Luxury Oud",
    "price": 6800,
    "store": {
      "name": "Tom Official",
      "slug": "tom"
    },
    "imageUrl": "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?auto=format&fit=crop&w=900&q=85",
    "label": "EXCLUSIVE",
    "description": ""
  }
];
const categories = ["Everything","Woody & Fresh","Luxury Oud","Floral & Sweet","Warm & Spicy","Aquatic & Fresh","Amber Floral"];
const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

export default function Home() {
  const [products, setProducts] = useState(demoProducts);
  const [category, setCategory] = useState('Everything');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState(0);
  const [notice, setNotice] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [bag, setBag] = useState([]);
  const [checkout, setCheckout] = useState({ customerName: '', phone: '', address: '' });
  const [ordering, setOrdering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.assign('/'); };

  useEffect(() => {
    api.get('/products?page=1&limit=48').then(({ data }) => { if (data.products?.length) { setProducts(data.products); if (data.total) setTotalCount(data.total); } }).catch(() => {});
  }, []);

  useEffect(() => {
    const syncCart = () => {
      try { const items = JSON.parse(localStorage.getItem('markethub-cart-items') || '[]'); setBag(items); setCart(items.length); } catch { setBag([]); setCart(0); }
    };
    syncCart();
    setIsLoggedIn(Boolean(localStorage.getItem('token')));
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setCurrentUser(user);
      setCustomerName(user?.name?.trim().split(/\s+/)[0] || '');
    } catch {
      setCurrentUser(null);
      setCustomerName('');
    }
    window.addEventListener('market-cart-updated', syncCart);
    return () => window.removeEventListener('market-cart-updated', syncCart);
  }, []);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Everything' || product.category?.toLowerCase() === category.toLowerCase();
    const matchesSearch = `${product.name} ${product.category} ${product.store?.name}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, category, search]);
  const featuredProducts = visibleProducts.slice(0, visibleCount);

  const loadMoreHome = async () => {
    const nextCount = visibleCount + 12;
    setVisibleCount(nextCount);
    if (nextCount >= products.length && products.length < totalCount) {
      setLoadingMore(true);
      try {
        const nextPage = homePage + 1;
        const { data } = await api.get(`/products?page=${nextPage}&limit=48`);
        if (data.products?.length) {
          setProducts((prev) => [...prev, ...data.products]);
          setHomePage(nextPage);
          if (data.total) setTotalCount(data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const addToBag = (product) => {
    if (String(product._id).startsWith('p')) { setNotice('These are sample items. Create a store and add a real product to try checkout.'); window.setTimeout(() => setNotice(''), 2800); return; }
    const nextBag = [...bag, { productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl || demoProducts[0].imageUrl, storeName: product.store?.name || 'Independent shop' }];
    const next = nextBag.length;
    setBag(nextBag); setCart(next);
    localStorage.setItem('markethub-cart-items', JSON.stringify(nextBag));
    localStorage.setItem('markethub-cart', String(next));
    setNotice(`${product.name} added to your bag`);
    window.setTimeout(() => setNotice(''), 2400);
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!localStorage.getItem('token')) {
      setNotice('Log in to place your order. Your bag will be here when you return.');
      window.setTimeout(() => { window.location.href = '/login?next=%2Fcart'; }, 900);
      return;
    }
    setOrdering(true);
    try {
      const { data } = await api.post('/orders', { ...checkout, items: bag.map((item) => ({ productId: item.productId, quantity: 1 })) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setBag([]); setCart(0); localStorage.removeItem('markethub-cart-items'); localStorage.setItem('markethub-cart', '0');
      setNotice(`${data.message} Order #${data.order.id.slice(-6)}`); setCartOpen(false);
    } catch (error) { setNotice(error.response?.data?.message || 'Order could not be placed. Please try again.'); }
    finally { setOrdering(false); }
  };

  return <div className="marketplace">
    <div className="announcement">A little more you. A little less ordinary. <span>Discover independent shops <span aria-hidden="true">↗</span></span></div>
    <header className="site-header">
      <Link className="brand" to="/" aria-label="MarketHub home">market<span>hub</span><i>®</i></Link>
      <nav className="main-nav" aria-label="Main navigation"><Link to="/discover">Discover</Link><Link to="/shops">Shops</Link><a href="#our-story">Our story</a></nav>
      <div className="header-actions">
        <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the marketplace" aria-label="Search products" /></label>
        {isLoggedIn && currentUser?.role === 'admin' ? (
          <Link className="header-admin-pill" to="/admin">⚙ Admin Panel</Link>
        ) : (
          <Link className="header-login" to={isLoggedIn ? '/dashboard' : '/login'}>{isLoggedIn ? 'My account' : 'Log in'}</Link>
        )}
        {isLoggedIn && <><Link className="header-login" to="/orders">My orders</Link><button className="logout-button" type="button" onClick={logout}>Log out</button></>}
        <Link className="bag-button" to="/cart" aria-label={`Shopping bag, ${cart} items`}>Bag <span>{cart}</span></Link>
      </div>
    </header>

    {isLoggedIn && <section className="customer-welcome" aria-label="Your marketplace welcome">
      <div className="customer-welcome-info">
        <span className="eyebrow">{currentUser?.role === 'admin' ? '🛡️ STORE ADMINISTRATOR' : 'YOUR MARKETPLACE, YOUR WAY'}</span>
        <h1>Welcome back{customerName ? `, ${customerName}` : ''}<span>.</span></h1>
        <p>{currentUser?.role === 'admin' ? 'You have full administrative access over store orders, catalogue, sales reports, and settings.' : 'Your next favourite find is waiting somewhere in the market.'}</p>
      </div>
      <div className="customer-welcome-actions">
        {currentUser?.role === 'admin' ? (
          <>
            <Link className="welcome-primary-btn" to="/admin">Go to Admin Panel ⚙</Link>
            <Link className="welcome-secondary-btn" to="/admin/orders">Manage Orders ↗</Link>
            <Link className="welcome-secondary-btn" to="/discover">Explore Market →</Link>
          </>
        ) : (
          <>
            <Link className="welcome-primary-btn" to="/orders">Track your orders ↗</Link>
            <Link className="welcome-secondary-btn" to="/discover">Explore the market →</Link>
          </>
        )}
      </div>
    </section>}

    <main>
      <section className="hero-banner">
        <div className="hero-copy"><span className="eyebrow">A MARKETPLACE WITH A LITTLE MORE MEANING</span><h1>Good things.<br /><em>Good people.</em></h1><p>Thoughtful finds from independent shops, makers, and the people behind them.</p><Link className="button button-dark" to="/discover">Find your next favourite <span>→</span></Link><div className="hero-footnote"><span className="tiny-stars">★ ★ ★</span> Small shops. Big heart.</div></div>
        <div className="hero-art" aria-label="A collection of independent market finds"><div className="art-note">Crafted with passion,<br />scented with luxury.</div><img className="hero-main-image" src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=90" alt="Luxury designer perfume collection and flacons" /><div className="hero-stamp">SHOP<br />SMALL<br /><span>♥</span></div><div className="photo-caption">Haute Parfumerie & Rare Scents · Est. 2026</div></div>
      </section>

      <section className="category-strip" aria-label="Shop by category">{categories.slice(1).map((item, index) => <Link key={item} className="category-pill" to={`/category/${encodeURIComponent(item.toLowerCase().replaceAll(' ','-'))}`}><span className={`category-dot dot-${index}`} aria-hidden="true">{['🌲', '✨', '🌸', '🔥', '🌊', '💎'][index]}</span>{item}<span className="category-arrow">→</span></Link>)}</section>

      <section className="product-section" id="discover">
        <div className="section-heading"><div><span className="eyebrow">THE MARKET, RIGHT NOW</span><h2>Picked with <em>purpose.</em></h2></div><Link className="text-link" to="/discover">Browse all finds <span>↗</span></Link></div>
        <div className="filters" role="group" aria-label="Filter products by category">{categories.map((item) => <button key={item} className={category === item ? 'filter-chip active' : 'filter-chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {featuredProducts.length ? (
          <>
            <div className="product-grid" id="product-grid">
              {featuredProducts.map((product, index) => (
                <article className="product-card" key={product._id}>
                  <Link className="product-image" to={String(product._id).startsWith('p') ? '/shops' : `/product/${product._id}`}>
                    <img
                      src={product.imageUrl || demoProducts[index % demoProducts.length].imageUrl}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = demoProducts[index % demoProducts.length]?.imageUrl || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85";
                      }}
                    />
                    {product.label && <span className="product-label">{product.label}</span>}
                    <span className="product-heart" aria-hidden="true">♡</span>
                  </Link>
                  <div className="product-info">
                    <div className="product-meta">
                      <Link to={product.store?.slug ? `/store/${product.store.slug}` : '/shops'}>
                        {product.store?.name || 'Luxury Boutique'}
                      </Link>
                      <span>★ 4.9</span>
                    </div>
                    <h3>{product.name}</h3>
                    <div className="product-bottom">
                      <strong>{formatPrice(product.price)}</strong>
                      <button onClick={() => addToBag(product)} aria-label={`Add ${product.name} to bag`}>
                        Add to bag <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {visibleProducts.length > visibleCount && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0 1rem' }}>
                <button
                  type="button"
                  className="button button-dark"
                  onClick={loadMoreHome}
                  disabled={loadingMore}
                  style={{
                    padding: '0.95rem 2.6rem',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  {loadingMore ? 'Loading more perfumes…' : <>Load More Perfumes ✦ ({Math.min(visibleCount, visibleProducts.length)} of {totalCount.toLocaleString('en-PK')})</>}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-products">
            <span>✳</span>
            <p>No finds in that corner yet.</p>
            <button onClick={() => { setCategory('Everything'); setSearch(''); }}>See everything</button>
          </div>
        )}
      </section>

      <section className="maker-banner"><div className="maker-photo"><img src="https://images.unsplash.com/photo-1623072042391-46d461773e03?auto=format&fit=crop&w=1200&q=85" alt="Artisanal luxury perfumer blending rare fragrance notes" loading="lazy" /></div><div className="maker-copy"><span className="eyebrow">A GOOD PLACE TO BEGIN</span><h2>Made by people.<br /><em>Not algorithms.</em></h2><p>Meet the makers, small businesses, and big ideas turning everyday shopping into something personal.</p><Link className="button button-light" to="/shops">Meet the shops <span>→</span></Link><span className="maker-aside">YOUR NEXT FAVOURITE THING IS AROUND HERE SOMEWHERE</span></div><span className="banner-sparkle" aria-hidden="true">✨</span></section>

      <section className="seller-cta" id="our-story"><div className="seller-icon" aria-hidden="true">🏪</div><div><span className="eyebrow">YOUR IDEA DESERVES A WINDOW</span><h2>Have something good to share?</h2><p>Open your own little corner of the marketplace. Your store is yours to make.</p></div><Link className="button button-dark" to="/create-store">Open your shop <span>→</span></Link></section>
    </main>

    <footer className="site-footer"><Link className="brand" to="/">market<span>hub</span><i>®</i></Link><span>A marketplace made for the makers, the finders, and the good stuff in between.</span><div><Link to="/login">Log in</Link><Link to="/signup">Join the market</Link><Link to="/dashboard">Seller space</Link></div><small>© 2026 MarketHub. Made for good things.</small></footer>
    {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
    {cartOpen && <div className="cart-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><section className="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title"><div className="cart-heading"><div><span className="eyebrow">A FEW GOOD FINDS</span><h2 id="cart-title">Your bag <span>({bag.length})</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close bag">×</button></div>{bag.length ? <><div className="cart-items">{bag.map((item, index) => <div className="cart-item" key={`${item.productId}-${index}`}><img src={item.imageUrl} alt="" /><div><strong>{item.name}</strong><span>{item.storeName}</span><b>{formatPrice(item.price)}</b></div><button onClick={() => { const next = bag.filter((_, itemIndex) => itemIndex !== index); setBag(next); setCart(next.length); localStorage.setItem('markethub-cart-items', JSON.stringify(next)); localStorage.setItem('markethub-cart', String(next.length)); }} aria-label={`Remove ${item.name}`}>×</button></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>{formatPrice(bag.reduce((sum, item) => sum + Number(item.price), 0))}</strong></div><form className="checkout-form" onSubmit={placeOrder}><p>Delivery details</p><label>Your name<input required value={checkout.customerName} onChange={(event) => setCheckout({ ...checkout, customerName: event.target.value })} autoComplete="name" /></label><label>Phone number<input required value={checkout.phone} onChange={(event) => setCheckout({ ...checkout, phone: event.target.value })} autoComplete="tel" /></label><label>Delivery address<textarea required value={checkout.address} onChange={(event) => setCheckout({ ...checkout, address: event.target.value })} autoComplete="street-address" rows={2} /></label><span className="payment-label">Payment method</span><div className="payment-choice">Cash on delivery</div><button className="create-submit" disabled={ordering}>{ordering ? 'Continuing…' : isLoggedIn ? 'Place cash-on-delivery order' : 'Log in to place your order'}</button>{!isLoggedIn && <p className="checkout-login">Already have an account? <Link to="/login">Log in</Link> or <Link to="/signup">sign up</Link> — we'll keep your bag.</p>}</form></> : <div className="cart-empty"><span>✳</span><p>Your bag is waiting for something lovely.</p><button onClick={() => setCartOpen(false)}>Keep browsing</button></div>}</section></div>}
  </div>;
}
