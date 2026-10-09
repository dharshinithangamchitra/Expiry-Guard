import React, { useState } from 'react';
import {
  ArrowLeft, Edit2, Trash2, CheckCircle, Package, Calendar,
  Tag, Hash, ShoppingBag, FileText, Bell, Clock, AlertTriangle,
} from 'lucide-react';
import { useAppStore, Product } from '../../store';
import { getExpiryStatus, getExpiryLabel, formatExpiryDate, formatDate, getDaysRemaining, STATUS_CONFIG } from '../../utils/expiry';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ConfirmDialog } from '../ui/Common';
import toast from 'react-hot-toast';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onEdit }) => {
  const { products, updateProduct, deleteProduct } = useAppStore();
  const product = products.find((p) => p.id === productId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!product) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn-secondary" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <p style={{ marginTop: 24, color: '#64748B' }}>Product not found.</p>
      </div>
    );
  }

  const status = getExpiryStatus(product.expiry_date);
  const days = getDaysRemaining(product.expiry_date);
  const config = STATUS_CONFIG[status];

  const handleDelete = () => {
    deleteProduct(product.id);
    toast.success('Product deleted');
    onBack();
  };

  const handleMarkUsed = () => {
    updateProduct(product.id, { status: 'used' });
    toast.success('Marked as used');
    onBack();
  };

  const handleMarkDisposed = () => {
    updateProduct(product.id, { status: 'disposed' });
    toast.success('Marked as disposed');
    onBack();
  };

  // Progress bar (days remaining as % of 365)
  const progressPct = Math.max(0, Math.min(100, (days / 365) * 100));

  const DetailRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | undefined | null }> = ({
    icon: Icon, label, value,
  }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #F8FAFC' }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} color="#64748B" />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{value || '—'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }} className="animate-fade-in">
      {/* Back */}
      <button
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
        onClick={onBack}
      >
        <ArrowLeft size={16} /> Back to Products
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <CategoryIcon category={product.category} size={28} />
            <div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                {product.product_name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>{product.brand}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
                <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{product.category}</span>
                {product.status !== 'active' && (
                  <span className="status-badge" style={{ background: '#F1F5F9', color: '#64748B' }}>
                    {product.status === 'used' ? 'Used' : 'Disposed'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {product.status === 'active' && (
              <>
                <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.8125rem' }} onClick={() => onEdit(product)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#DCFCE7', color: '#16A34A', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={handleMarkUsed}
                >
                  <CheckCircle size={14} /> Mark as Used
                </button>
              </>
            )}
            <button className="btn-danger" style={{ padding: '8px 14px', fontSize: '0.8125rem' }} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>

        {/* Expiry status banner */}
        <div style={{
          marginTop: 24,
          padding: '16px 20px',
          borderRadius: 12,
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: config.color, marginBottom: 4, letterSpacing: '0.05em' }}>
              EXPIRY STATUS
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: config.color }}>
              {getExpiryLabel(product.expiry_date)}
            </div>
          </div>
          <StatusBadge expiryDate={product.expiry_date} />
        </div>

        {/* Progress bar */}
        {days > 0 && days <= 365 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {days} days remaining
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Expires {formatExpiryDate(product.expiry_date)}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${progressPct}%`,
                  background: config.color,
                }}
              />
            </div>
          </div>
        )}

        {product.category === 'Medicines' && (
          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            background: '#FEF9C3',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#A16207',
          }}>
            ⚕️ <strong>Important:</strong> This is a medicine. ExpiryGuard does not provide medical advice. Consult your doctor or pharmacist before using any medication.
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="card" style={{ padding: '0 24px 8px', marginBottom: 20 }}>
        <div style={{ padding: '16px 0', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>Product Details</h3>
        </div>
        <DetailRow icon={Calendar} label="EXPIRY DATE" value={formatExpiryDate(product.expiry_date)} />
        <DetailRow icon={Calendar} label="PURCHASE DATE" value={formatDate(product.purchase_date ?? null)} />
        <DetailRow icon={Tag} label="CATEGORY" value={product.category} />
        <DetailRow icon={ShoppingBag} label="BRAND" value={product.brand} />
        <DetailRow icon={Hash} label="QUANTITY" value={product.quantity} />
        <DetailRow icon={Hash} label="BATCH NUMBER" value={product.batch_number} />
        {product.notes && (
          <DetailRow icon={FileText} label="NOTES" value={product.notes} />
        )}
        <DetailRow icon={Clock} label="DATE ADDED" value={formatDate(product.created_at)} />
      </div>

      {/* Reminder Settings */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={16} color="#0F766E" />
          </div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>Reminder Schedule</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {product.reminder_intervals.length === 0 ? (
            <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>No reminders configured</span>
          ) : (
            product.reminder_intervals.map((days) => (
              <span key={days} style={{
                padding: '5px 12px',
                borderRadius: 8,
                background: '#CCFBF1',
                color: '#0F766E',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}>
                {days === 0 ? 'On expiry day' : `${days} days before`}
              </span>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.product_name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
