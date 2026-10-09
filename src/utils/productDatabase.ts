export interface DatabaseProduct {
  barcode: string;
  name: string;
  brand: string;
  category: 'Medicines' | 'Cosmetics' | 'Skincare' | 'Personal Care' | 'Food & Pantry' | 'Baby Care' | 'Household';
  estimatedShelfLifeMonths?: number;
  description?: string;
  storageInstructions?: string;
  defaultUnit?: string;
}

export const LOCAL_PRODUCT_DATABASE: DatabaseProduct[] = [
  // Medicines & Health
  {
    barcode: '8901117001014',
    name: 'Dolo 650mg Paracetamol Tablets',
    brand: 'Micro Labs',
    category: 'Medicines',
    estimatedShelfLifeMonths: 24,
    description: 'Paracetamol 650mg for relief of fever and mild-to-moderate pain.',
    storageInstructions: 'Store below 30°C in a dry place, protected from direct sunlight.',
    defaultUnit: '15 tablets',
  },
  {
    barcode: '8901117001021',
    name: 'Crocin 650 Advance Tablet',
    brand: 'GSK',
    category: 'Medicines',
    estimatedShelfLifeMonths: 24,
    description: 'Fast acting paracetamol for fever and body ache relief.',
    storageInstructions: 'Store in a cool and dry place away from moisture.',
    defaultUnit: '15 tablets',
  },
  {
    barcode: '8901030384112',
    name: 'Amoxicillin 500mg Capsules',
    brand: 'Cipla',
    category: 'Medicines',
    estimatedShelfLifeMonths: 18,
    description: 'Broad-spectrum antibiotic prescription medication.',
    storageInstructions: 'Keep in tightly closed container away from heat.',
    defaultUnit: '10 capsules',
  },
  {
    barcode: '8901030384228',
    name: 'Cetirizine 10mg Allergy Relief',
    brand: 'Dr. Reddy\'s',
    category: 'Medicines',
    estimatedShelfLifeMonths: 36,
    description: 'Antihistamine for seasonal allergies, hives, and runny nose.',
    storageInstructions: 'Store between 20°C to 25°C.',
    defaultUnit: '10 tablets',
  },
  {
    barcode: '8901030384334',
    name: 'Vicks VapoRub Cold Balm 50g',
    brand: 'Procter & Gamble',
    category: 'Medicines',
    estimatedShelfLifeMonths: 36,
    description: 'Topical cough suppressant and vaporizing ointment.',
    storageInstructions: 'Keep lid tightly closed when not in use.',
    defaultUnit: '50g',
  },
  {
    barcode: '8901030384440',
    name: 'Limcee Vitamin C 500mg Chewable',
    brand: 'Abbott',
    category: 'Medicines',
    estimatedShelfLifeMonths: 18,
    description: 'Chewable Vitamin C supplement for immune system support.',
    storageInstructions: 'Store protected from light and moisture.',
    defaultUnit: '15 chewable tabs',
  },
  {
    barcode: '8901030384556',
    name: 'Refresh Tears Eye Drops 10ml',
    brand: 'Allergan',
    category: 'Medicines',
    estimatedShelfLifeMonths: 12,
    description: 'Lubricant eye drops for dry eye irritation relief. Discard 30 days after opening.',
    storageInstructions: 'Store at 15°-25°C. Discard 1 month after first opening.',
    defaultUnit: '10ml bottle',
  },

  // Skincare
  {
    barcode: '3337875597357',
    name: 'CeraVe Hydrating Facial Cleanser 236ml',
    brand: 'CeraVe',
    category: 'Skincare',
    estimatedShelfLifeMonths: 12,
    description: 'Hyaluronic acid and ceramides hydrating cleanser for normal to dry skin.',
    storageInstructions: 'Store at room temperature away from freezing.',
    defaultUnit: '236ml',
  },
  {
    barcode: '3337875545778',
    name: 'La Roche-Posay Anthelios SPF 50+ Invisible Fluid',
    brand: 'La Roche-Posay',
    category: 'Skincare',
    estimatedShelfLifeMonths: 12,
    description: 'Broad-spectrum ultra-light sunscreen for sensitive skin.',
    storageInstructions: 'Do not expose to direct heat or freeze.',
    defaultUnit: '50ml',
  },
  {
    barcode: '769915190602',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Skincare',
    estimatedShelfLifeMonths: 12,
    description: 'High-strength vitamin and mineral blemish formula.',
    storageInstructions: 'Store in a cool dry place, out of direct sunlight.',
    defaultUnit: '30ml',
  },
  {
    barcode: '070501051009',
    name: 'Neutrogena Hydro Boost Water Gel 50g',
    brand: 'Neutrogena',
    category: 'Skincare',
    estimatedShelfLifeMonths: 24,
    description: 'Hyaluronic acid oil-free hydrating moisturizer.',
    storageInstructions: 'Keep lid tightly closed after every use.',
    defaultUnit: '50g',
  },
  {
    barcode: '8901030864317',
    name: 'Cetaphil Gentle Skin Cleanser 250ml',
    brand: 'Galderma',
    category: 'Skincare',
    estimatedShelfLifeMonths: 24,
    description: 'Gentle, soap-free, non-comedogenic daily facial cleanser.',
    storageInstructions: 'Store below 30°C.',
    defaultUnit: '250ml',
  },

  // Cosmetics
  {
    barcode: '041554460512',
    name: 'Maybelline Lash Sensational Mascara',
    brand: 'Maybelline New York',
    category: 'Cosmetics',
    estimatedShelfLifeMonths: 6,
    description: 'Volumizing washable mascara with fan effect brush.',
    storageInstructions: 'Do not pump wand. Discard after 6 months of first use for eye safety.',
    defaultUnit: '9.5ml',
  },
  {
    barcode: '3600523823451',
    name: 'L\'Oréal Paris Infallible 24H Matte Foundation',
    brand: 'L\'Oréal Paris',
    category: 'Cosmetics',
    estimatedShelfLifeMonths: 12,
    description: 'High coverage matte liquid foundation.',
    storageInstructions: 'Store upright at room temperature.',
    defaultUnit: '30ml',
  },
  {
    barcode: '8904245701892',
    name: 'Sugar Cosmetics Matte As Hell Crayon Lipstick',
    brand: 'SUGAR Cosmetics',
    category: 'Cosmetics',
    estimatedShelfLifeMonths: 24,
    description: 'Highly pigmented velvety matte lip crayon.',
    storageInstructions: 'Keep cap securely fastened.',
    defaultUnit: '2.8g',
  },
  {
    barcode: '8904320701113',
    name: 'Mamaearth Charcoal Face Scrub 100g',
    brand: 'Mamaearth',
    category: 'Cosmetics',
    estimatedShelfLifeMonths: 18,
    description: 'Activated charcoal and walnut beads gentle exfoliating scrub.',
    storageInstructions: 'Store in cool and dry place.',
    defaultUnit: '100g',
  },

  // Personal Care
  {
    barcode: '8901030384662',
    name: 'Colgate Total 12H Antibacterial Toothpaste',
    brand: 'Colgate-Palmolive',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 24,
    description: 'Whole mouth health antibacterial fluoride toothpaste.',
    storageInstructions: 'Store in a cool dry place.',
    defaultUnit: '150g',
  },
  {
    barcode: '8901030384779',
    name: 'Dettol Original Antiseptic Liquid 250ml',
    brand: 'Reckitt',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 36,
    description: 'Antiseptic disinfectant liquid for first aid, medical and personal hygiene.',
    storageInstructions: 'Keep out of reach of children. Store below 30°C.',
    defaultUnit: '250ml',
  },
  {
    barcode: '4005808801046',
    name: 'Nivea Soft Light Moisturizing Cream 200ml',
    brand: 'Nivea',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 12,
    description: 'Enriched with Jojoba oil and Vitamin E for face, body, and hands.',
    storageInstructions: 'Store below 25°C.',
    defaultUnit: '200ml',
  },
  {
    barcode: '8901030384886',
    name: 'Dove Deeply Nourishing Body Wash 250ml',
    brand: 'Unilever',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 24,
    description: 'Moisturizing sulfate-free gentle body cleanser.',
    storageInstructions: 'For external use only.',
    defaultUnit: '250ml',
  },
  {
    barcode: '8901030384993',
    name: 'Head & Shoulders Cool Menthol Anti-Dandruff Shampoo',
    brand: 'Procter & Gamble',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 36,
    description: 'Anti-dandruff daily shampoo with refreshing menthol.',
    storageInstructions: 'Rinse thoroughly with water if contact with eyes occurs.',
    defaultUnit: '340ml',
  },
  {
    barcode: '8901030385006',
    name: 'Oral-B Pro-Health Soft Toothbrush Pack of 4',
    brand: 'Oral-B',
    category: 'Personal Care',
    estimatedShelfLifeMonths: 36,
    description: 'Soft cross-action bristles for gentle plaque removal.',
    storageInstructions: 'Replace brush every 3 months for optimal oral hygiene.',
    defaultUnit: '4 units',
  },

  // Food & Pantry
  {
    barcode: '8901058852300',
    name: 'Maggi 2-Minute Masala Noodles 70g',
    brand: 'Nestlé',
    category: 'Food & Pantry',
    estimatedShelfLifeMonths: 9,
    description: 'Instant fortified noodles with authentic Indian spice blend.',
    storageInstructions: 'Store in a cool, dry and hygienic place to protect from insects.',
    defaultUnit: '70g pack',
  },
  {
    barcode: '8901725181222',
    name: 'Amul Butter Pasteurised 100g',
    brand: 'Amul',
    category: 'Food & Pantry',
    estimatedShelfLifeMonths: 12,
    description: 'Pure salted dairy butter made from fresh cream.',
    storageInstructions: 'Keep refrigerated below 4°C.',
    defaultUnit: '100g',
  },
  {
    barcode: '8901725181339',
    name: 'Amul Taaza Homogenised Toned Milk 1L',
    brand: 'Amul',
    category: 'Food & Pantry',
    estimatedShelfLifeMonths: 6,
    description: 'UHT treated long life toned milk.',
    storageInstructions: 'Store in cool dry place. Once opened, refrigerate and consume within 2 days.',
    defaultUnit: '1 Litre',
  },
  {
    barcode: '8901063012214',
    name: 'Britannia Good Day Butter Cookies 200g',
    brand: 'Britannia',
    category: 'Food & Pantry',
    estimatedShelfLifeMonths: 6,
    description: 'Crunchy sweet butter cookies with rich aroma.',
    storageInstructions: 'Transfer to an airtight container after opening.',
    defaultUnit: '200g',
  },
];

export function searchLocalDatabase(query: string): DatabaseProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LOCAL_PRODUCT_DATABASE.filter(
    (p) =>
      p.barcode.includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export function findLocalByBarcode(barcode: string): DatabaseProduct | undefined {
  const clean = barcode.trim();
  return LOCAL_PRODUCT_DATABASE.find((p) => p.barcode === clean);
}
