import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Package, AlertTriangle, Info } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAppStore, Notification } from '../../store';
import { EmptyState } from '../ui/Common';

interface NotificationsPageProps {
  onProductSelect: (id: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onProductSelect }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.read_at)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getNotifIcon = (type: Notification['notification_type']) => {
    if (type === 'expired') return { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' };
    if (type === 'system') return { icon: Info, color: '#2563EB', bg: '#DBEAFE' };
    return { icon: Bell, color: '#F97316', bg: '#FFEDD5' };
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Notifications</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F1F5F9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
        ].map((tab) => (
          <button
            key={tab.id}
            style={{
              padding: '7px 18px',
              borderRadius: 7,
              border: 'none',
              background: filter === tab.id ? 'white' : 'transparent',
              color: filter === tab.id ? '#0F172A' : '#64748B',
              fontWeight: filter === tab.id ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: filter === tab.id ? '0 1px 3px rgb(0 0 0 / 0.1)' : 'none',
              transition: 'all 0.15s',
            }}
            onClick={() => setFilter(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={filter === 'unread' ? 'All notifications have been read.' : 'You have no notifications yet.'}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((notif) => {
            const iconConfig = getNotifIcon(notif.notification_type);
            const Icon = iconConfig.icon;
            const isUnread = !notif.read_at;

            return (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  background: isUnread ? '#F0FDFA' : 'white',
                  borderColor: isUnread ? '#99F6E4' : '#F1F5F9',
                  transition: 'all 0.15s',
                }}
                onClick={() => {
                  if (isUnread) markNotificationRead(notif.id);
                  onProductSelect(notif.product_id);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  {/* Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: iconConfig.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={iconConfig.color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: isUnread ? 700 : 600, color: '#0F172A' }}>
                        {notif.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {isUnread && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E' }} />
                        )}
                        <span style={{ fontSize: '0.6875rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {notif.sent_at
                            ? formatDistanceToNow(new Date(notif.sent_at), { addSuffix: true })
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                      {notif.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <Package size={12} color="#94A3B8" />
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{notif.product_name}</span>
                      {!isUnread && (
                        <span style={{ fontSize: '0.6875rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                          <Check size={11} /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Browser notification info */}
      <div style={{
        marginTop: 24,
        padding: '14px 16px',
        background: '#F8FAFC',
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        fontSize: '0.8125rem',
        color: '#64748B',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#0F172A' }}>About Notifications:</strong> ExpiryGuard shows in-app notifications.
        Browser push notifications require explicit permission and only work when the app is open in a browser tab.
        For reliable background reminders, keep the app open or check back regularly.
      </div>
    </div>
  );
};
