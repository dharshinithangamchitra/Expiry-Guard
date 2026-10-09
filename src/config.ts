// ============================================================
// Supabase Configuration
// ============================================================
// To connect to Supabase, create a .env file in the project root:
//
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_ANON_KEY=your-anon-key
//
// Until then, the app runs in DEMO MODE with mock data.
// ============================================================

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const IS_DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

// Expiry status thresholds (configurable)
export const EXPIRY_THRESHOLDS = {
  SAFE: 90,       // > 90 days = Safe
  EXPIRING_SOON: 31, // 31–90 days = Expiring Soon
  URGENT: 1,      // 1–30 days = Urgent
  // ≤ 0 = Expired
} as const;

// Default reminder intervals (in days before expiry)
export const DEFAULT_REMINDER_INTERVALS = [30, 14, 7, 1, 0] as const;

export const PRODUCT_CATEGORIES = [
  'Medicines',
  'Cosmetics',
  'Skincare',
  'Personal Care',
  'Food & Supplements',
  'Other',
] as const;

export const APP_NAME = 'ExpiryGuard';
export const APP_TAGLINE = 'Stay Ahead of Expiry.';
