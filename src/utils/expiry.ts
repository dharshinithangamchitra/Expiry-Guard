import { differenceInDays, format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import { EXPIRY_THRESHOLDS } from '../config';

export type ExpiryStatus = 'safe' | 'expiring-soon' | 'urgent' | 'expired';

export function getExpiryStatus(expiryDate: string | Date | null): ExpiryStatus {
  if (!expiryDate) return 'expired';

  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const daysRemaining = differenceInDays(expiry, today);

  if (daysRemaining < 0) return 'expired';
  if (daysRemaining === 0) return 'urgent';
  if (daysRemaining <= 30) return 'urgent';
  if (daysRemaining <= 90) return 'expiring-soon';
  return 'safe';
}

export function getDaysRemaining(expiryDate: string | Date | null): number {
  if (!expiryDate) return -999;
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return differenceInDays(expiry, today);
}

export function getExpiryLabel(expiryDate: string | Date | null): string {
  if (!expiryDate) return 'No expiry date';
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const days = getDaysRemaining(expiry);

  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return 'Expired yesterday';
    if (absDays < 7) return `Expired ${absDays} days ago`;
    if (absDays < 30) return `Expired ${Math.floor(absDays / 7)} week${Math.floor(absDays / 7) > 1 ? 's' : ''} ago`;
    if (absDays < 365) return `Expired ${Math.floor(absDays / 30)} month${Math.floor(absDays / 30) > 1 ? 's' : ''} ago`;
    return `Expired ${Math.floor(absDays / 365)} year${Math.floor(absDays / 365) > 1 ? 's' : ''} ago`;
  }

  if (days === 0) return 'Expires today!';
  if (days === 1) return 'Expires tomorrow';
  if (days < 7) return `Expires in ${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    if (remDays === 0) return `Expires in ${weeks} week${weeks > 1 ? 's' : ''}`;
    return `Expires in ${weeks} week${weeks > 1 ? 's' : ''} and ${remDays} day${remDays > 1 ? 's' : ''}`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    const remWeeks = Math.floor(remDays / 7);
    if (remWeeks === 0) return `Expires in ${months} month${months > 1 ? 's' : ''}`;
    return `Expires in ${months} month${months > 1 ? 's' : ''} and ${remWeeks} week${remWeeks > 1 ? 's' : ''}`;
  }
  const years = Math.floor(days / 365);
  return `Expires in ${years} year${years > 1 ? 's' : ''}`;
}

export function formatExpiryDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export function formatDate(date: string | Date | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

export const STATUS_CONFIG: Record<ExpiryStatus, {
  label: string;
  className: string;
  color: string;
  bg: string;
}> = {
  'safe': { label: 'Safe', className: 'status-safe', color: '#16A34A', bg: '#DCFCE7' },
  'expiring-soon': { label: 'Expiring Soon', className: 'status-soon', color: '#A16207', bg: '#FEF9C3' },
  'urgent': { label: 'Urgent', className: 'status-urgent', color: '#C2410C', bg: '#FFEDD5' },
  'expired': { label: 'Expired', className: 'status-expired', color: '#DC2626', bg: '#FEE2E2' },
};
