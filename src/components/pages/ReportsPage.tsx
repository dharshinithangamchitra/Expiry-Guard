import React, { useMemo, useState } from 'react';
import {
  BarChart2, Package, Clock, AlertTriangle, CheckCircle, Trash2,
  TrendingUp, PieChart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from 'recharts';
import { useAppStore } from '../../store';
import { getExpiryStatus } from '../../utils/expiry';
import { format, subDays, subMonths, isAfter } from 'date-fns';
import { PRODUCT_CATEGORIES } from '../../config';

type DateRange = '7d' | '30d' | '3m' | 'all';

export const ReportsPage: React.FC = () => {
  const { products } = useAppStore();
  const [range, setRange] = useState<DateRange>('all');

  const now = new Date();
  const cutoff = range === '7d' ? subDays(now, 7)
    : range === '30d' ? subDays(now, 30)
    : range === '3m' ? subMonths(now, 3)
    : new Date('2000-01-01');

  const filtered = products.filter((p) => isAfter(new Date(p.created_at), cutoff));

  const stats = useMemo(() => {
    const total = filtered.filter((p) => p.status === 'active').length;
    const expired = filtered.filter((p) => p.status === 'active' && getExpiryStatus(p.expiry_date) === 'expired').length;
    const expiringSoon = filtered.filter((p) => p.status === 'active' && ['urgent', 'expiring-soon'].includes(getExpiryStatus(p.expiry_date))).length;
    const safe = filtered.filter((p) => p.status === 'active' && getExpiryStatus(p.expiry_date) === 'safe').length;
    const used = filtered.filter((p) => p.status === 'used').length;
    const disposed = filtered.filter((p) => p.status === 'disposed').length;
    return { total, expired, expiringSoon, safe, used, disposed };
  }, [filtered]);

  // Category distribution
  const categoryData = useMemo(() =>
    PRODUCT_CATEGORIES.map((cat) => ({
      name: cat,
      count: filtered.filter((p) => p.category === cat && p.status === 'active').length,
    })).filter((d) => d.count > 0),
    [filtered]
  );

  // Status distribution
  const statusData = useMemo(() => {
    const active = filtered.filter((p) => p.status === 'active');
    return [
      { name: 'Safe', value: active.filter((p) => getExpiryStatus(p.expiry_date) === 'safe').length, color: '#16A34A' },
      { name: 'Expiring Soon', value: active.filter((p) => getExpiryStatus(p.expiry_date) === 'expiring-soon').length, color: '#EAB308' },
      { name: 'Urgent', value: active.filter((p) => getExpiryStatus(p.expiry_date) === 'urgent').length, color: '#F97316' },
      { name: 'Expired', value: active.filter((p) => getExpiryStatus(p.expiry_date) === 'expired').length, color: '#DC2626' },
    ].filter((d) => d.value > 0);
  }, [filtered]);

  // Monthly trends (last 6 months)
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const monthKey = format(month, 'yyyy-MM');
      const added = products.filter((p) => format(new Date(p.created_at), 'yyyy-MM') === monthKey).length;
      const expired = products.filter((p) =>
        p.expiry_date && format(new Date(p.expiry_date), 'yyyy-MM') === monthKey
      ).length;
      return { month: format(month, 'MMM yy'), added, expired };
    });
  }, [products]);

  const STAT_CARDS = [
    { label: 'Total Active', value: stats.total, icon: Package, color: '#0F766E', bg: '#CCFBF1' },
    { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: '#F97316', bg: '#FFEDD5' },
    { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Safe', value: stats.safe, icon: CheckCircle, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Marked as Used', value: stats.used, icon: CheckCircle, color: '#2563EB', bg: '#DBEAFE' },
    { label: 'Disposed', value: stats.disposed, icon: Trash2, color: '#64748B', bg: '#F1F5F9' },
  ];

  const COLORS = ['#0F766E', '#7C3AED', '#2563EB', '#E11D48', '#16A34A', '#F97316'];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Reports & Analytics</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            Insights from your product tracking data
          </p>
        </div>

        {/* Date range filter */}
        <div style={{ display: 'flex', gap: 4, background: '#F1F5F9', borderRadius: 10, padding: 4 }}>
          {[
            { id: '7d', label: 'Last 7 days' },
            { id: '30d', label: 'Last 30 days' },
            { id: '3m', label: '3 months' },
            { id: 'all', label: 'All time' },
          ].map((r) => (
            <button
              key={r.id}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: range === r.id ? 'white' : 'transparent',
                color: range === r.id ? '#0F172A' : '#64748B',
                fontWeight: range === r.id ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: range === r.id ? '0 1px 3px rgb(0 0 0 / 0.1)' : 'none',
                transition: 'all 0.15s',
              }}
              onClick={() => setRange(r.id as DateRange)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}>
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Icon size={18} color={card.color} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 4 }}>{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly trends */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>Monthly Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }}
              />
              <Bar dataKey="added" fill="#0F766E" radius={[4, 4, 0, 0]} name="Added" />
              <Bar dataKey="expired" fill="#DC2626" radius={[4, 4, 0, 0]} name="Expired" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, marginTop: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0F766E' }} /> Products Added
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748B' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#DC2626' }} /> Products Expired
            </div>
          </div>
        </div>

        {/* Status distribution */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={16} color="#7C3AED" />
            </div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>Status Distribution</h3>
          </div>
          {statusData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '0.875rem' }}>
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPie>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12, color: '#64748B' }}>{value}</span>}
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category distribution */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={16} color="#0F766E" />
          </div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>Products by Category</h3>
        </div>
        {categoryData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '0.875rem' }}>No data available</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {categoryData.sort((a, b) => b.count - a.count).map((cat, i) => {
              const maxCount = Math.max(...categoryData.map((c) => c.count));
              return (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 120, fontSize: '0.8125rem', color: '#64748B', fontWeight: 500, textAlign: 'right' }}>
                    {cat.name}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 28, borderRadius: 8, background: '#F1F5F9', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${(cat.count / maxCount) * 100}%`,
                        background: COLORS[i % COLORS.length],
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 10,
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                  <div style={{ width: 32, fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>
                    {cat.count}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
