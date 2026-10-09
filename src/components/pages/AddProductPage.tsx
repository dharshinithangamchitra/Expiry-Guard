import React, { useState, useRef } from 'react';
import {
  X, QrCode, Camera, PenSquare, ChevronLeft, Package,
  CheckCircle2, AlertCircle, Upload, RotateCcw, Sparkles,
  Calendar, Clock, Tag, MapPin, Layers, FileText
} from 'lucide-react';
import { useAppStore, Product, Notification } from '../../store';
import { PRODUCT_CATEGORIES } from '../../config';
import { CameraBarcodeScanner } from '../scanner/CameraBarcodeScanner';
import { ExpiryOcrScanner } from '../scanner/ExpiryOcrScanner';
import { searchLocalDatabase } from '../../utils/productDatabase';
import { addMonths, addDays, format, isBefore } from 'date-fns';
import toast from 'react-hot-toast';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

type AddMethod = 'choose' | 'barcode' | 'ocr' | 'manual';

interface AddProductPageProps {
  onBack: () => void;
  editProduct?: Product | null;
}

const METHOD_CARDS = [
  {
    id: 'barcode' as AddMethod,
    icon: QrCode,
    label: 'Scan Barcode',
    description: 'Use camera to scan barcode and look up product data automatically',
    color: '#0F766E',
    bg: '#CCFBF1',
    badge: 'Fastest',
  },
  {
    id: 'ocr' as AddMethod,
    icon: Camera,
    label: 'Scan Expiry Date (OCR)',
    description: 'Snap the printed expiration date stamp on packaging',
    color: '#7C3AED',
    bg: '#EDE9FE',
    badge: 'Smart OCR',
  },
  {
    id: 'manual' as AddMethod,
    icon: PenSquare,
    label: 'Manual Entry',
    description: 'Type product details directly into the form',
    color: '#2563EB',
    bg: '#DBEAFE',
    badge: 'Full Control',
  },
];

const STORAGE_LOCATIONS = [
  'Medicine Cabinet',
  'Bathroom Shelf',
  'Refrigerator',
  'Bedroom Vanity',
  'Kitchen Pantry',
  'First Aid Kit',
  'Travel Bag',
  'Other',
];

interface FormData {
  product_name: string;
  category: string;
  brand: string;
  expiry_date: string;
  purchase_date: string;
  quantity: string;
  batch_number: string;
  notes: string;
  location: string;
  barcode: string;
  reminder_intervals: number[];
}

const INITIAL_FORM: FormData = {
  product_name: '',
  category: 'Medicines',
  brand: '',
  expiry_date: '',
  purchase_date: format(new Date(), 'yyyy-MM-dd'),
  quantity: '1',
  batch_number: '',
  notes: '',
  location: 'Medicine Cabinet',
  barcode: '',
  reminder_intervals: [30, 15, 7, 3, 1],
};

export const AddProductPage: React.FC<AddProductPageProps> = ({ onBack, editProduct }) => {
  const { user, addProduct, updateProduct, notifications, setNotifications } = useAppStore();
  const [method, setMethod] = useState<AddMethod>(editProduct ? 'manual' : 'choose');
  
  const [form, setForm] = useState<FormData>(
    editProduct
      ? {
          product_name: editProduct.product_name,
          category: editProduct.category,
          brand: editProduct.brand,
          expiry_date: editProduct.expiry_date,
          purchase_date: editProduct.purchase_date || '',
          quantity: String(editProduct.quantity ?? 1),
          batch_number: editProduct.batch_number || '',
          notes: editProduct.notes || '',
          location: 'Medicine Cabinet',
          barcode: '',
          reminder_intervals: editProduct.reminder_intervals || [30, 15, 7, 3, 1],
        }
      : INITIAL_FORM
  );

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<any[]>([]);

  const setField = (key: keyof FormData, val: any) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));

    if (key === 'product_name' && typeof val === 'string' && val.length >= 2) {
      const results = searchLocalDatabase(val);
      setNameSuggestions(results.slice(0, 4));
    } else if (key === 'product_name') {
      setNameSuggestions([]);
    }
  };

  const selectSuggestion = (s: any) => {
    setForm((f) => ({
      ...f,
      product_name: s.name,
      brand: s.brand,
      category: s.category,
      barcode: s.barcode,
      notes: [s.description, s.storageInstructions].filter(Boolean).join(' • '),
      expiry_date: s.estimatedShelfLifeMonths
        ? format(addMonths(new Date(), s.estimatedShelfLifeMonths), 'yyyy-MM-dd')
        : f.expiry_date,
    }));
    setNameSuggestions([]);
    toast.success(`Selected "${s.name}" from catalog!`, { icon: '✨' });
  };

  const handleQuickExpiryAdd = (months: number) => {
    const d = addMonths(new Date(), months);
    setField('expiry_date', format(d, 'yyyy-MM-dd'));
  };

  const toggleReminderInterval = (days: number) => {
    const current = form.reminder_intervals;
    if (current.includes(days)) {
      setField('reminder_intervals', current.filter((d) => d !== days));
    } else {
      setField('reminder_intervals', [...current, days].sort((a, b) => b - a));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.expiry_date) errs.expiry_date = 'Expiry date is required';
    
    if (form.expiry_date) {
      const exp = new Date(form.expiry_date);
      if (isNaN(exp.getTime()) || exp.getFullYear() < 2000) {
        errs.expiry_date = 'Please select a valid expiry date.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the highlighted errors.');
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const now = new Date().toISOString();
    const productId = editProduct ? editProduct.id : generateId();

    if (editProduct) {
      updateProduct(editProduct.id, {
        product_name: form.product_name.trim(),
        category: form.category as any,
        brand: form.brand.trim(),
        expiry_date: form.expiry_date,
        purchase_date: form.purchase_date || undefined,
        quantity: Number(form.quantity) || 1,
        batch_number: form.batch_number.trim() || undefined,
        notes: [form.location ? `Location: ${form.location}` : '', form.notes].filter(Boolean).join('\n'),
        reminder_intervals: form.reminder_intervals,
        updated_at: now,
      });
      toast.success('Product updated successfully!');
    } else {
      const product: Product = {
        id: productId,
        user_id: user?.id || 'demo-user-001',
        product_name: form.product_name.trim(),
        category: form.category as any,
        brand: form.brand.trim(),
        expiry_date: form.expiry_date,
        purchase_date: form.purchase_date || undefined,
        quantity: Number(form.quantity) || 1,
        batch_number: form.batch_number.trim() || undefined,
        notes: [form.location ? `Location: ${form.location}` : '', form.notes].filter(Boolean).join('\n'),
        status: 'active',
        created_at: now,
        updated_at: now,
        reminder_intervals: form.reminder_intervals,
      };

      addProduct(product);

      // Create initial scheduled notification if expiry is within 30 days
      const expDate = new Date(form.expiry_date);
      const isPastDate = isBefore(expDate, new Date());

      const newNotif: Notification = {
        id: 'notif-' + generateId(),
        user_id: user?.id || 'demo-user-001',
        product_id: productId,
        product_name: product.product_name,
        title: isPastDate ? `Alert: ${product.product_name} is already expired!` : `Scheduled: ${product.product_name} tracking active`,
        message: isPastDate
          ? `Product expired on ${format(expDate, 'dd MMM yyyy')}. Please review safe disposal.`
          : `Reminders set for ${form.reminder_intervals.join(', ')} days before expiry.`,
        scheduled_at: now,
        notification_type: isPastDate ? 'expired' : 'reminder',
      };

      setNotifications([newNotif, ...notifications]);
      toast.success('Product and reminders added successfully! 🛡️');
    }

    setIsSaving(false);
    onBack();
  };

  // Method Chooser Screen
  if (method === 'choose') {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }} className="animate-fade-in">
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748B',
            fontSize: '0.875rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            marginBottom: 24,
            fontWeight: 600,
          }}
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Back to Products
        </button>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Add New Product
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>
            Choose your preferred method to quickly register items into ExpiryGuard
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {METHOD_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                className="card"
                style={{
                  padding: 28,
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  background: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => setMethod(card.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 28px ${card.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={26} color={card.color} />
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: card.bg,
                    color: card.color,
                    padding: '3px 10px',
                    borderRadius: 9999,
                  }}>
                    {card.badge}
                  </span>
                </div>

                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6 }}>
                  {card.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Camera Barcode Scanner View
  if (method === 'barcode') {
    return (
      <CameraBarcodeScanner
        onProductIdentified={(data) => {
          setForm((f) => ({
            ...f,
            product_name: data.product_name,
            brand: data.brand,
            category: data.category,
            barcode: data.barcode,
            expiry_date: data.expiry_date || f.expiry_date,
            notes: data.notes || f.notes,
          }));
          setMethod('manual');
          toast.success('Product details loaded! Please verify the expiry date.', { duration: 5000 });
        }}
        onFallbackToManual={(code) => {
          if (code) setField('barcode', code);
          setMethod('manual');
        }}
        onCancel={() => setMethod('choose')}
      />
    );
  }

  // OCR Expiry Date Scanner View
  if (method === 'ocr') {
    return (
      <ExpiryOcrScanner
        onDateDetected={(date, batch) => {
          setForm((f) => ({
            ...f,
            expiry_date: date,
            batch_number: batch || f.batch_number,
          }));
          setMethod('manual');
          toast.success('Expiry date applied! Please complete product details.');
        }}
        onCancel={() => setMethod('choose')}
      />
    );
  }

  // Manual Form Entry / Review View
  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748B',
            fontSize: '0.875rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Back to Products
        </button>

        {!editProduct && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMethod('barcode')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px', gap: 6 }}
            >
              <QrCode size={14} color="#0F766E" /> Scan Barcode
            </button>
            <button
              onClick={() => setMethod('ocr')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px', gap: 6 }}
            >
              <Camera size={14} color="#7C3AED" /> OCR Date
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '32px 28px' }}>
        <div style={{ marginBottom: 24, borderBottom: '1px solid #F1F5F9', paddingBottom: 16 }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {editProduct ? 'Edit Product Details' : 'Product Information'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '4px 0 0' }}>
            Ensure the expiry date matches the physical packaging.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Row 1: Product Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <label className="form-label">
                Product Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Paracetamol 500mg, CeraVe Cleanser"
                value={form.product_name}
                onChange={(e) => setField('product_name', e.target.value)}
                style={{ borderColor: errors.product_name ? '#EF4444' : undefined }}
              />
              {errors.product_name && (
                <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4, display: 'block' }}>
                  {errors.product_name}
                </span>
              )}

              {/* Suggestions Dropdown */}
              {nameSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #E2E8F0',
                  marginTop: 4,
                  zIndex: 50,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', background: '#F8FAFC' }}>
                    Catalog Suggestions:
                  </div>
                  {nameSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        borderBottom: '1px solid #F1F5F9',
                        background: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDFA'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{s.brand} • {s.category}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 700 }}>Select &rarr;</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">
                Category <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
                style={{ borderColor: errors.category ? '#EF4444' : undefined }}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Brand & Storage Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            <div>
              <label className="form-label">Brand / Manufacturer</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Cipla, The Ordinary, Colgate"
                value={form.brand}
                onChange={(e) => setField('brand', e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Storage Location</label>
              <select
                className="form-input"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
              >
                {STORAGE_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Expiry Date (Highlighted) */}
          <div style={{
            background: '#F0FDFA',
            border: '1.5px solid #99F6E4',
            borderRadius: 16,
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="form-label" style={{ color: '#0F766E', fontWeight: 700, margin: 0 }}>
                Expiry Date <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 600 }}>
                Quick Shelf-life Presets:
              </span>
            </div>

            <input
              type="date"
              className="form-input"
              value={form.expiry_date}
              onChange={(e) => setField('expiry_date', e.target.value)}
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0F172A',
                background: '#FFFFFF',
                borderColor: errors.expiry_date ? '#EF4444' : '#14B8A6',
                marginBottom: 12,
              }}
            />
            {errors.expiry_date && (
              <span style={{ fontSize: '0.75rem', color: '#EF4444', marginBottom: 10, display: 'block' }}>
                {errors.expiry_date}
              </span>
            )}

            {/* Quick date pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: '+1 Month', months: 1 },
                { label: '+3 Months', months: 3 },
                { label: '+6 Months', months: 6 },
                { label: '+1 Year', months: 12 },
                { label: '+2 Years', months: 24 },
                { label: '+3 Years', months: 36 },
              ].map((pill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickExpiryAdd(pill.months)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CCFBF1',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0F766E',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0F766E'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#CCFBF1'}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Purchase Date, Quantity, Batch */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-input"
                value={form.purchase_date}
                onChange={(e) => setField('purchase_date', e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={form.quantity}
                onChange={(e) => setField('quantity', e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Batch / Lot # (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B2409A"
                value={form.batch_number}
                onChange={(e) => setField('batch_number', e.target.value)}
              />
            </div>
          </div>

          {/* Row 5: Reminder Intervals */}
          <div>
            <label className="form-label">
              Scheduled Expiry Reminders (Days before expiry):
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
              {[
                { days: 60, label: '60 Days' },
                { days: 30, label: '30 Days' },
                { days: 15, label: '15 Days' },
                { days: 7, label: '7 Days (Urgent)' },
                { days: 3, label: '3 Days' },
                { days: 1, label: '1 Day Before' },
              ].map((int) => {
                const isSelected = form.reminder_intervals.includes(int.days);
                return (
                  <button
                    key={int.days}
                    type="button"
                    onClick={() => toggleReminderInterval(int.days)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #0F766E' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#CCFBF1' : '#FFFFFF',
                      color: isSelected ? '#0F766E' : '#64748B',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{int.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 6: Notes */}
          <div>
            <label className="form-label">Storage Notes & Instructions</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Keep refrigerated after opening. Take 1 tablet after meals."
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
              style={{ flex: 2 }}
            >
              {isSaving ? 'Saving Product...' : editProduct ? 'Update Product' : 'Save & Start Tracking 🛡️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
