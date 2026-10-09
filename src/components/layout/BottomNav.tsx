import React from 'react';
import { LayoutDashboard, Package, Clock, Bell, Settings } from 'lucide-react';
import { useAppStore } from '../../store';

const BOTTOM_NAV = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'expiring', label: 'Expiring', icon: Clock },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface BottomNavProps {
  onPageChange: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onPageChange }) => {
  const { currentPage, notifications } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 64,
      background: 'white',
      borderTop: '1px solid #F1F5F9',
      display: 'flex',
      alignItems: 'center',
      zIndex: 40,
      boxShadow: '0 -4px 12px rgb(0 0 0 / 0.06)',
    }}>
      {BOTTOM_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        const hasBadge = item.id === 'notifications' && unreadCount > 0;

        return (
          <button
            key={item.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              position: 'relative',
            }}
            onClick={() => onPageChange(item.id)}
          >
            <div style={{ position: 'relative' }}>
              <Icon
                size={22}
                color={isActive ? '#0F766E' : '#94A3B8'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {hasBadge && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  background: '#DC2626',
                  borderRadius: '50%',
                  border: '1.5px solid white',
                }} />
              )}
            </div>
            <span style={{
              fontSize: '0.625rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0F766E' : '#94A3B8',
              letterSpacing: '0.02em',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 24,
                height: 2,
                background: '#0F766E',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
};
