import React from 'react';
import { getExpiryStatus, STATUS_CONFIG } from '../../utils/expiry';

interface StatusBadgeProps {
  expiryDate: string | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ expiryDate, className = '' }) => {
  const status = getExpiryStatus(expiryDate);
  const config = STATUS_CONFIG[status];

  return (
    <span className={`status-badge ${config.className} ${className}`}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: config.color,
        display: 'inline-block',
        flexShrink: 0,
      }} />
      {config.label}
    </span>
  );
};

interface StatusDotProps {
  status: 'safe' | 'expiring-soon' | 'urgent' | 'expired';
  size?: number;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, size = 10 }) => {
  const colors = {
    safe: '#16A34A',
    'expiring-soon': '#EAB308',
    urgent: '#F97316',
    expired: '#DC2626',
  };
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: colors[status],
      flexShrink: 0,
    }} />
  );
};
