import React, { useState } from 'react';
import {
  LayoutDashboard, Package, Clock, AlertTriangle, Calendar,
  Bell, BarChart2, Settings, Plus, ChevronLeft, ChevronRight,
  Shield, LogOut, User, X,
} from 'lucide-react';
import { useAppStore } from '../../store';

interface SidebarProps {
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'My Products', icon: Package },
  { id: 'expiring', label: 'Expiring Soon', icon: Clock },
  { id: 'expired', label: 'Expired Products', icon: AlertTriangle },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ onPageChange }) => {
  const { currentPage, sidebarOpen, setSidebarOpen, user, notifications, logout } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: sidebarOpen ? 260 : 0,
        background: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{ minWidth: 260, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid #1E293B',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={20} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>
                  ExpiryGuard
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: -2 }}>
                  Stay Ahead of Expiry.
                </div>
              </div>
            </div>
          </div>

          {/* Add Product Button */}
          <div style={{ padding: '16px 16px 8px' }}>
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => onPageChange('add-product')}
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const hasNotif = item.id === 'notifications' && unreadCount > 0;

              return (
                <button
                  key={item.id}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%',
                    border: 'none',
                    textAlign: 'left',
                    position: 'relative',
                    marginBottom: 2,
                  }}
                  onClick={() => {
                    onPageChange(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {hasNotif && (
                    <span style={{
                      background: '#DC2626',
                      color: 'white',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 9999,
                      minWidth: 20,
                      textAlign: 'center',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #1E293B',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#1E293B',
              marginBottom: 8,
            }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}>
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#E2E8F0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{
                  fontSize: '0.6875rem',
                  color: '#64748B',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                color: '#64748B',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onClick={logout}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1E293B';
                e.currentTarget.style.color = '#E2E8F0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
