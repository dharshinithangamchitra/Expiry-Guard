import { findLocalByBarcode, DatabaseProduct } from './productDatabase';
import { addMonths, format } from 'date-fns';

export interface BarcodeLookupResult {
  found: boolean;
  barcode: string;
  source?: 'open-food-facts' | 'open-beauty-facts' | 'local-catalog';
  product_name?: string;
  brand?: string;
  category?: 'Medicines' | 'Cosmetics' | 'Skincare' | 'Personal Care' | 'Food & Pantry' | 'Baby Care' | 'Household';
  image_url?: string;
  suggested_expiry?: string;
  notes?: string;
  message?: string;
}

/**
 * Searches Open Food Facts, Open Beauty Facts, and the local catalog.
 * STRICT POLICY: If no matching product is found, it returns found: false.
 * It will NEVER fabricate or pretend a product was found.
 */
export async function lookupBarcodeOnlineOrLocal(barcode: string): Promise<BarcodeLookupResult> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode) {
    return {
      found: false,
      barcode: '',
      message: 'Barcode cannot be empty.',
    };
  }

  // 1. Check local catalog first (instant & reliable)
  const localMatch = findLocalByBarcode(cleanBarcode);
  if (localMatch) {
    const suggestedExpiry = localMatch.estimatedShelfLifeMonths
      ? format(addMonths(new Date(), localMatch.estimatedShelfLifeMonths), 'yyyy-MM-dd')
      : undefined;

    return {
      found: true,
      barcode: cleanBarcode,
      source: 'local-catalog',
      product_name: localMatch.name,
      brand: localMatch.brand,
      category: localMatch.category,
      suggested_expiry: suggestedExpiry,
      notes: [localMatch.description, localMatch.storageInstructions].filter(Boolean).join(' • '),
      message: `Verified match from offline verified catalog (${localMatch.category})`,
    };
  }

  // 2. Try Open Beauty Facts (for cosmetics, skincare, personal care)
  try {
    const obfUrl = `https://world.openbeautyfacts.org/api/v2/product/${cleanBarcode}.json`;
    const obfRes = await fetch(obfUrl, { headers: { 'User-Agent': 'ExpiryGuard - Web - Version 1.0' } });
    if (obfRes.ok) {
      const data = await obfRes.json();
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const name = prod.product_name || prod.product_name_en || prod.generic_name || '';
        const brand = prod.brands || prod.brand_owner || '';
        const image = prod.image_url || prod.image_front_url || undefined;
        
        let cat: BarcodeLookupResult['category'] = 'Cosmetics';
        const rawCats = (prod.categories || '').toLowerCase();
        if (rawCats.includes('skin') || rawCats.includes('face') || rawCats.includes('cream')) {
          cat = 'Skincare';
        } else if (rawCats.includes('hygiene') || rawCats.includes('body') || rawCats.includes('hair') || rawCats.includes('soap')) {
          cat = 'Personal Care';
        }

        if (name || brand) {
          return {
            found: true,
            barcode: cleanBarcode,
            source: 'open-beauty-facts',
            product_name: name || 'Cosmetic Product',
            brand: brand || 'Generic Brand',
            category: cat,
            image_url: image,
            suggested_expiry: format(addMonths(new Date(), 12), 'yyyy-MM-dd'),
            notes: prod.categories ? `Categories: ${prod.categories.slice(0, 100)}` : undefined,
            message: 'Product retrieved from Open Beauty Facts Database.',
          };
        }
      }
    }
  } catch (err) {
    // Network failure, continue to Open Food Facts
    console.debug('OpenBeautyFacts lookup skipped:', err);
  }

  // 3. Try Open Food Facts (for pantry, food, drinks, supplements)
  try {
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
    const offRes = await fetch(offUrl, { headers: { 'User-Agent': 'ExpiryGuard - Web - Version 1.0' } });
    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product) {
        const prod = data.product;
        const name = prod.product_name || prod.product_name_en || prod.generic_name || '';
        const brand = prod.brands || prod.brand_owner || '';
        const image = prod.image_url || prod.image_front_url || undefined;

        let cat: BarcodeLookupResult['category'] = 'Food & Pantry';
        const rawCats = (prod.categories || '').toLowerCase();
        if (rawCats.includes('supplement') || rawCats.includes('vitamin') || rawCats.includes('medicine')) {
          cat = 'Medicines';
        } else if (rawCats.includes('baby')) {
          cat = 'Baby Care';
        }

        if (name || brand) {
          return {
            found: true,
            barcode: cleanBarcode,
            source: 'open-food-facts',
            product_name: name || 'Packaged Product',
            brand: brand || 'Generic Brand',
            category: cat,
            image_url: image,
            suggested_expiry: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
            notes: prod.quantity ? `Net Weight/Vol: ${prod.quantity}` : undefined,
            message: 'Product retrieved from Open Food Facts Database.',
          };
        }
      }
    }
  } catch (err) {
    console.debug('OpenFoodFacts lookup skipped:', err);
  }

  // 4. Return explicit "NOT FOUND" result (Do not fake data)
  return {
    found: false,
    barcode: cleanBarcode,
    message: `No matching product found for barcode "${cleanBarcode}". You can enter product details manually or select from suggestions.`,
  };
}
