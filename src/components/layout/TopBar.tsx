import React, { useState } from 'react';
import { Bell, Menu, X, Plus, Search, Settings, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store';
import { IS_DEMO_MODE } from '../../config';

interface TopBarProps {
  onPageChange: (page: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onPageChange }) => {
  const { user, notifications, sidebarOpen, setSidebarOpen, markAllNotificationsRead } = useAppStore();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const recentNotifs = notifications.slice(0, 5);

  const PAGE_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'My Products',
    expiring: 'Expiring Soon',
    expired: 'Expired Products',
    calendar: 'Expiry Calendar',
    notifications: 'Notifications',
    reports: 'Reports & Analytics',
    settings: 'Settings',
    'add-product': 'Add New Product',
    'product-detail': 'Product Details',
  };

  const { currentPage, logout } = useAppStore();

  return (
    <header style={{
      height: 64,
      background: 'white',
      borderBottom: '1px solid #F1F5F9',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px rgb(0 0 0 / 0.05)',
    }}>
      {/* Menu toggle */}
      <button
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: '#F8FAFC',
          borderRadius: 8,
          cursor: 'pointer',
          color: '#64748B',
          flexShrink: 0,
        }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontSize: '1.0625rem',
          fontWeight: 700,
          color: '#0F172A',
          margin: 0,
        }}>
          {PAGE_TITLES[currentPage] || 'ExpiryGuard'}
        </h1>
        {IS_DEMO_MODE && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: '#FEF9C3',
            color: '#A16207',
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '1px 8px',
            borderRadius: 9999,
          }}>
            Demo Mode — Connect Supabase to save data
          </div>
        )}
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Add Product */}
        <button
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          onClick={() => onPageChange('add-product')}
        >
          <Plus size={15} />
          <span style={{ display: 'none' }} className="sm:inline">Add Product</span>
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #E2E8F0',
              background: 'white',
              borderRadius: 10,
              cursor: 'pointer',
              color: '#64748B',
              position: 'relative',
            }}
            onClick={() => { setShowNotifPanel(!showNotifPanel); setShowUserMenu(false); }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 5,
                right: 5,
                width: 8,
                height: 8,
                background: '#DC2626',
                borderRadius: '50%',
                border: '1.5px solid white',
              }} />
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifPanel && (
            <div
              className="card animate-fade-in"
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 340,
                maxHeight: 420,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid #F1F5F9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{
                      background: '#DC2626',
                      color: 'white',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: 9999,
                    }}>{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
                    onClick={markAllNotificationsRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {recentNotifs.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                    No notifications
                  </div>
                ) : (
                  recentNotifs.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F8FAFC',
                        background: n.read_at ? 'transparent' : '#F0FDFA',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: n.read_at ? '#CBD5E1' : '#0F766E',
                          flexShrink: 0,
                          marginTop: 5,
                        }} />
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {n.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: '#F8FAFC',
                    borderRadius: 8,
                    fontSize: '0.8125rem',
                    color: '#0F766E',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => { onPageChange('notifications'); setShowNotifPanel(false); }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div style={{ position: 'relative' }}>
          <button
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0F766E, #14B8A6)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifPanel(false); }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </button>
          {showUserMenu && (
            <div
              className="card animate-fade-in"
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 200,
                padding: 8,
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 12px', marginBottom: 4 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A' }}>{user?.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user?.email}</div>
              </div>
              <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: '0.8125rem', color: '#374151' }}
                onClick={() => { onPageChange('settings'); setShowUserMenu(false); }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <Settings size={15} />
                Settings
              </button>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, fontSize: '0.8125rem', color: '#DC2626' }}
                onClick={logout}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click-away handler */}
      {(showNotifPanel || showUserMenu) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => { setShowNotifPanel(false); setShowUserMenu(false); }}
        />
      )}
    </header>
  );
};
