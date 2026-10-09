import React, { useMemo } from 'react';
import {
  Package, Clock, AlertTriangle, CheckCircle, Plus, Camera,
  QrCode, PenSquare, ArrowRight, TrendingUp, Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAppStore } from '../../store';
import { getExpiryStatus, getExpiryLabel, formatExpiryDate, getDaysRemaining } from '../../utils/expiry';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/Common';

interface DashboardProps {
  onPageChange: (page: string) => void;
  onProductSelect: (id: string) => void;
}

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  subtitle: string;
  onClick?: () => void;
}> = ({ title, value, icon: Icon, color, bg, subtitle, onClick }) => (
  <div
    className="card"
    style={{
      padding: '20px 22px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgb(0 0 0 / 0.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      {onClick && <ArrowRight size={16} color="#CBD5E1" />}
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', lineHeight: 1, marginBottom: 4 }}>
      {value}
    </div>
    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
      {title}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
      {subtitle}
    </div>
  </div>
);

const QuickActionCard: React.FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bg: string;
  onClick: () => void;
}> = ({ icon: Icon, label, description, color, bg, onClick }) => (
  <button
    className="card"
    style={{
      padding: '20px',
      cursor: 'pointer',
      border: 'none',
      textAlign: 'left',
      width: '100%',
      transition: 'all 0.2s ease',
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgb(0 0 0 / 0.1)';
      (e.currentTarget as HTMLElement).style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.boxShadow = '';
      (e.currentTarget as HTMLElement).style.borderColor = '';
    }}
  >
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5 }}>
      {description}
    </div>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange, onProductSelect }) => {
  const { user, products } = useAppStore();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const activeProducts = products.filter((p) => p.status === 'active');

  const stats = useMemo(() => {
    const total = activeProducts.length;
    const expired = activeProducts.filter((p) => getExpiryStatus(p.expiry_date) === 'expired').length;
    const urgentAndSoon = activeProducts.filter(
      (p) => ['urgent', 'expiring-soon'].includes(getExpiryStatus(p.expiry_date))
    ).length;
    const safe = activeProducts.filter((p) => getExpiryStatus(p.expiry_date) === 'safe').length;

    return { total, expired, urgentAndSoon, safe };
  }, [activeProducts]);

  const expiringSoon = useMemo(() =>
    activeProducts
      .filter((p) => {
        const s = getExpiryStatus(p.expiry_date);
        return s === 'urgent' || s === 'expiring-soon';
      })
      .sort((a, b) => getDaysRemaining(a.expiry_date) - getDaysRemaining(b.expiry_date))
      .slice(0, 4),
    [activeProducts]
  );

  const recentlyAdded = useMemo(() =>
    [...products]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [products]
  );

  if (products.length === 0) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Welcome header */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>
            Welcome to ExpiryGuard. Let's get started!
          </p>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <EmptyState
            icon={Package}
            title="No products added yet"
            description="Start tracking your products by adding your first item. You can scan a barcode, capture the expiry date, or enter details manually."
            action={{ label: '+ Add Your First Product', onClick: () => onPageChange('add-product') }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
            {greeting}, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>
            Here's your product expiry overview.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: 10,
          padding: '8px 14px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
          <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
            {format(now, 'EEEE, dd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <StatCard
          title="Total Products"
          value={stats.total}
          icon={Package}
          color="#0F766E"
          bg="#CCFBF1"
          subtitle="Products being tracked"
          onClick={() => onPageChange('products')}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.urgentAndSoon}
          icon={Clock}
          color="#F97316"
          bg="#FFEDD5"
          subtitle="Need attention soon"
          onClick={() => onPageChange('expiring')}
        />
        <StatCard
          title="Expired"
          value={stats.expired}
          icon={AlertTriangle}
          color="#DC2626"
          bg="#FEE2E2"
          subtitle="Past expiry date"
          onClick={() => onPageChange('expired')}
        />
        <StatCard
          title="Safe"
          value={stats.safe}
          icon={CheckCircle}
          color="#16A34A"
          bg="#DCFCE7"
          subtitle="More than 90 days left"
        />
      </div>

      {/* Main content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 20,
        marginBottom: 20,
      }}>
        {/* Expiring Soon Section */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#FFEDD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap size={16} color="#F97316" />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
                  Expiring Soon
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Products needing attention</p>
              </div>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8125rem',
                color: '#0F766E',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
              }}
              onClick={() => onPageChange('expiring')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {expiringSoon.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <CheckCircle size={32} color="#16A34A" style={{ marginBottom: 8 }} />
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                No products expiring soon. Great job! 🎉
              </p>
            </div>
          ) : (
            <div>
              {expiringSoon.map((product, i) => {
                const days = getDaysRemaining(product.expiry_date);
                const label = getExpiryLabel(product.expiry_date);

                return (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 20px',
                      borderBottom: i < expiringSoon.length - 1 ? '1px solid #F8FAFC' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => onProductSelect(product.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <CategoryIcon category={product.category} size={18} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0F172A',
                        marginBottom: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {product.product_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {product.category} • Expires {formatExpiryDate(product.expiry_date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <StatusBadge expiryDate={product.expiry_date} />
                      <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: 4 }}>
                        {label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <QuickActionCard
              icon={QrCode}
              label="Scan Barcode"
              description="Use your camera to scan a product barcode"
              color="#0F766E"
              bg="#CCFBF1"
              onClick={() => onPageChange('add-product')}
            />
            <QuickActionCard
              icon={Camera}
              label="Scan Expiry Date"
              description="Capture the expiry label with OCR"
              color="#7C3AED"
              bg="#EDE9FE"
              onClick={() => onPageChange('add-product')}
            />
            <QuickActionCard
              icon={PenSquare}
              label="Add Manually"
              description="Enter product details by hand"
              color="#2563EB"
              bg="#DBEAFE"
              onClick={() => onPageChange('add-product')}
            />
          </div>
        </div>
      </div>

      {/* Recently Added */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={16} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>
              Recently Added
            </h3>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.8125rem',
              color: '#0F766E',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
            }}
            onClick={() => onPageChange('products')}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {recentlyAdded.map((product) => (
                <tr
                  key={product.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onProductSelect(product.id)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CategoryIcon category={product.category} size={14} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{product.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#64748B', fontSize: '0.8125rem' }}>{product.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{formatExpiryDate(product.expiry_date)}</span>
                  </td>
                  <td>
                    <StatusBadge expiryDate={product.expiry_date} />
                  </td>
                  <td>
                    <span style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>
                      {format(new Date(product.created_at), 'dd MMM yyyy')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
