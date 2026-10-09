import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Package } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, eachDayOfInterval, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import { useAppStore } from '../../store';
import { getExpiryStatus, STATUS_CONFIG } from '../../utils/expiry';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/Common';

interface CalendarPageProps {
  onProductSelect: (id: string) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onProductSelect }) => {
  const { products } = useAppStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const activeProducts = products.filter((p) => p.status === 'active');

  // Map expiry dates to products
  const expiryMap = useMemo(() => {
    const map = new Map<string, typeof activeProducts>();
    activeProducts.forEach((p) => {
      if (!p.expiry_date) return;
      const key = p.expiry_date.split('T')[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    return map;
  }, [activeProducts]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedProducts = selectedDate
    ? expiryMap.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status: string) => {
    if (status === 'expired') return '#DC2626';
    if (status === 'urgent') return '#F97316';
    if (status === 'expiring-soon') return '#EAB308';
    return '#16A34A';
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
          Expiry Calendar
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          View all your product expiry dates on a monthly calendar
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Calendar */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* Month navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
          }}>
            <button
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#64748B' }}
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <button
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#64748B' }}
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F1F5F9' }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{
                padding: '10px 0',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#94A3B8',
                letterSpacing: '0.05em',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayProducts = expiryMap.get(key) || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <div
                  key={key}
                  style={{
                    minHeight: 80,
                    padding: '6px 4px',
                    borderRight: '1px solid #F8FAFC',
                    borderBottom: '1px solid #F8FAFC',
                    cursor: dayProducts.length > 0 ? 'pointer' : 'default',
                    background: isSelected ? '#F0FDFA' : today ? '#F0FDF4' : 'transparent',
                    opacity: inMonth ? 1 : 0.35,
                    transition: 'background 0.15s',
                  }}
                  onClick={() => dayProducts.length > 0 && setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
                  onMouseEnter={(e) => {
                    if (dayProducts.length > 0 && !isSelected)
                      (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLElement).style.background = today ? '#F0FDF4' : 'transparent';
                  }}
                >
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: today ? 800 : 500,
                    background: today ? '#0F766E' : 'transparent',
                    color: today ? 'white' : inMonth ? '#0F172A' : '#94A3B8',
                    margin: '0 auto 4px',
                  }}>
                    {format(day, 'd')}
                  </div>

                  {/* Product dots */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayProducts.slice(0, 3).map((p) => {
                      const s = getExpiryStatus(p.expiry_date);
                      return (
                        <div key={p.id} style={{
                          padding: '1px 4px',
                          borderRadius: 4,
                          background: STATUS_CONFIG[s].bg,
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: STATUS_CONFIG[s].color,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {p.product_name}
                        </div>
                      );
                    })}
                    {dayProducts.length > 3 && (
                      <div style={{ fontSize: '0.625rem', color: '#94A3B8', paddingLeft: 4 }}>
                        +{dayProducts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Legend */}
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Legend</h4>
            {[
              { label: 'Expired', color: '#DC2626', bg: '#FEE2E2' },
              { label: 'Urgent (≤30 days)', color: '#C2410C', bg: '#FFEDD5' },
              { label: 'Expiring Soon (31–90)', color: '#A16207', bg: '#FEF9C3' },
              { label: 'Safe (>90 days)', color: '#16A34A', bg: '#DCFCE7' },
            ].map((l) => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.color}` }} />
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Selected date details */}
          <div className="card" style={{ padding: 16 }}>
            {!selectedDate ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CalendarIcon size={28} color="#CBD5E1" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                  Click on a date to see expiring products
                </p>
              </div>
            ) : (
              <>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>
                  {format(selectedDate, 'dd MMMM yyyy')}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 14 }}>
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} expire on this date
                </p>
                {selectedProducts.length === 0 ? (
                  <p style={{ color: '#94A3B8', fontSize: '0.8125rem' }}>No products expire on this date</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedProducts.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          background: '#F8FAFC',
                          cursor: 'pointer',
                          border: '1px solid #F1F5F9',
                        }}
                        onClick={() => onProductSelect(p.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      >
                        <CategoryIcon category={p.category} size={14} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.product_name}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>{p.category}</div>
                        </div>
                        <StatusBadge expiryDate={p.expiry_date} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
