import { format, parse, isValid } from 'date-fns';

export interface OcrDetectionResult {
  rawText: string;
  detectedExpiryDate?: string; // YYYY-MM-DD
  formattedDisplayDate?: string;
  detectedBatch?: string;
  confidence: number; // 0 to 100
  matchedPattern?: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Intelligent date and batch extractor that checks for all common pharmaceutical,
 * cosmetic, food, and skincare expiry formats:
 * - EXP: 12/2026 or EXP: 12/26
 * - BB: 28-MAR-2027
 * - BEST BEFORE: 15/08/2025
 * - USE BY: 04/2028
 * - MFG: 01/2024 EXP: 01/2027
 * - 2026-11-30, 30.11.2026, 11/2026
 * - LOT / BATCH: B24091A
 */
export function extractExpiryAndBatchFromText(text: string): OcrDetectionResult {
  const clean = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  const lower = clean.toLowerCase();

  let detectedExpiry: string | undefined;
  let detectedBatch: string | undefined;
  let confidence = 0;
  let matchedPattern: string | undefined;

  // Pattern 1: Explicit "EXP / EXPIRY / BEST BEFORE / USE BY / BB" with MM/YYYY or DD/MM/YYYY
  const expKeywordsRegex = /(?:exp(?:iry)?\.?|use\s*by|best\s*before|b\.?b\.?|expires?)\s*[:\-.]?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i;
  const match1 = clean.match(expKeywordsRegex);
  if (match1) {
    const p1 = parseInt(match1[1], 10);
    const p2 = parseInt(match1[2], 10);
    let year = parseInt(match1[3], 10);
    if (year < 100) year += 2000;

    // DD/MM/YYYY or MM/DD/YYYY
    let month = p2;
    let day = p1;
    if (p1 > 12 && p2 <= 12) {
      day = p1;
      month = p2;
    } else if (p2 > 12 && p1 <= 12) {
      day = p2;
      month = p1;
    }

    if (month >= 1 && month <= 12 && year >= 2020 && year <= 2040) {
      const validDay = Math.min(day, 28);
      const d = new Date(year, month - 1, validDay > 0 ? validDay : 1);
      detectedExpiry = format(d, 'yyyy-MM-dd');
      confidence = 95;
      matchedPattern = 'Standard EXP DD/MM/YYYY';
    }
  }

  // Pattern 2: EXP with Month Name (e.g. "EXP 15-NOV-2027" or "BB DEC 2026")
  if (!detectedExpiry) {
    const monthNameRegex = /(?:exp(?:iry)?\.?|use\s*by|best\s*before|b\.?b\.?|mfg[^\n]+exp)\s*[:\-.]?\s*(?:(\d{1,2})[\/\-\.\s]+)?([a-z]{3,9})[\/\-\.\s]+(\d{2,4})/i;
    const match2 = lower.match(monthNameRegex);
    if (match2) {
      const day = match2[1] ? parseInt(match2[1], 10) : 28;
      const monthStr = match2[2];
      let year = parseInt(match2[3], 10);
      if (year < 100) year += 2000;

      const month = MONTH_MAP[monthStr];
      if (month && year >= 2020 && year <= 2040) {
        const d = new Date(year, month - 1, Math.min(day, 28));
        detectedExpiry = format(d, 'yyyy-MM-dd');
        confidence = 92;
        matchedPattern = 'Month Name EXP (e.g., EXP 15-NOV-2027)';
      }
    }
  }

  // Pattern 3: Short MM/YYYY or MM/YY (e.g. "EXP 08/26" or "EXP 10/2028")
  if (!detectedExpiry) {
    const shortExpRegex = /(?:exp(?:iry)?\.?|use\s*by|best\s*before|b\.?b\.?)\s*[:\-.]?\s*(\d{1,2})[\/\-\.](\d{2,4})/i;
    const match3 = clean.match(shortExpRegex);
    if (match3) {
      const month = parseInt(match3[1], 10);
      let year = parseInt(match3[2], 10);
      if (year < 100) year += 2000;

      if (month >= 1 && month <= 12 && year >= 2020 && year <= 2040) {
        // Last day of that month
        const d = new Date(year, month, 0);
        detectedExpiry = format(d, 'yyyy-MM-dd');
        confidence = 88;
        matchedPattern = 'Short EXP MM/YY';
      }
    }
  }

  // Pattern 4: ISO-like or dotted date (e.g. "2027.05.15" or "2026-12-31")
  if (!detectedExpiry) {
    const isoRegex = /(?:20[2-4]\d)[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/;
    const match4 = clean.match(isoRegex);
    if (match4) {
      try {
        const parsed = new Date(match4[0].replace(/\./g, '-').replace(/\//g, '-'));
        if (isValid(parsed)) {
          detectedExpiry = format(parsed, 'yyyy-MM-dd');
          confidence = 80;
          matchedPattern = 'ISO Date Format';
        }
      } catch {
        // skip
      }
    }
  }

  // Extract Batch / Lot number: "LOT 48291A" or "B.NO. 2024-X"
  const batchRegex = /(?:b\.?no\.?|batch(?:\s*no\.?)?|lot(?:\s*no\.?)?)\s*[:\-.]?\s*([a-z0-9\-\/]{4,15})/i;
  const matchBatch = clean.match(batchRegex);
  if (matchBatch) {
    detectedBatch = matchBatch[1].toUpperCase();
  }

  return {
    rawText: clean,
    detectedExpiryDate: detectedExpiry,
    formattedDisplayDate: detectedExpiry ? format(new Date(detectedExpiry), 'dd MMMM yyyy') : undefined,
    detectedBatch,
    confidence: detectedExpiry ? confidence : 0,
    matchedPattern,
  };
}
