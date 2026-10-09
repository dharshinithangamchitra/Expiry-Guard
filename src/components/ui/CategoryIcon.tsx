import React from 'react';
import {
  Pill, Sparkles, Heart, User, Package, Droplets, ShoppingBag,
  Leaf, FlaskConical, Wind,
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  size?: number;
  className?: string;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Medicines': { icon: Pill, color: '#0F766E', bg: '#CCFBF1' },
  'Cosmetics': { icon: Sparkles, color: '#9333EA', bg: '#F3E8FF' },
  'Skincare': { icon: Droplets, color: '#2563EB', bg: '#DBEAFE' },
  'Personal Care': { icon: Heart, color: '#E11D48', bg: '#FFE4E6' },
  'Food & Supplements': { icon: Leaf, color: '#16A34A', bg: '#DCFCE7' },
  'Other': { icon: Package, color: '#64748B', bg: '#F1F5F9' },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 20, className = '' }) => {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['Other'];
  const Icon = config.icon;

  return (
    <div
      className={className}
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: 10,
        background: config.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={config.color} />
    </div>
  );
};

export const getCategoryColor = (category: string) =>
  CATEGORY_CONFIG[category]?.color || '#64748B';

export const getCategoryBg = (category: string) =>
  CATEGORY_CONFIG[category]?.bg || '#F1F5F9';
