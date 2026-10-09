import React, { useState, useRef } from 'react';
import {
  X, QrCode, Camera, PenSquare, ChevronLeft, Package,
  CheckCircle, AlertCircle, Upload, RotateCcw,
} from 'lucide-react';
import { useAppStore, Product } from '../../store';
import { PRODUCT_CATEGORIES } from '../../config';
import { LoadingSpinner } from '../ui/Common';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Simple uuid replacement using crypto
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
    description: 'Use your camera to scan a barcode and prefill product info',
    color: '#0F766E',
    bg: '#CCFBF1',
  },
  {
    id: 'ocr' as AddMethod,
    icon: Camera,
    label: 'Scan Expiry Date',
    description: 'Capture the expiry label — OCR will detect the date for you',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  {
    id: 'manual' as AddMethod,
    icon: PenSquare,
    label: 'Add Manually',
    description: 'Enter all product details yourself',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
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
  reminder_intervals: number[];
}

const INITIAL_FORM: FormData = {
  product_name: '',
  category: 'Medicines',
  brand: '',
  expiry_date: '',
  purchase_date: '',
  quantity: '1',
  batch_number: '',
  notes: '',
  reminder_intervals: [30, 14, 7, 1],
};

export const AddProductPage: React.FC<AddProductPageProps> = ({ onBack, editProduct }) => {
  const { user, addProduct, updateProduct } = useAppStore();
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
          reminder_intervals: editProduct.reminder_intervals,
        }
      : INITIAL_FORM
  );
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<{ date?: string; batch?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setField = (key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.expiry_date) errs.expiry_date = 'Expiry date is required';
    if (form.expiry_date && new Date(form.expiry_date) < new Date('2000-01-01'))
      errs.expiry_date = 'Please enter a valid expiry date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate async

    const now = new Date().toISOString();
    if (editProduct) {
      updateProduct(editProduct.id, {
        ...form,
        category: form.category as any,
        quantity: Number(form.quantity) || 1,
        purchase_date: form.purchase_date || undefined,
        batch_number: form.batch_number || undefined,
        notes: form.notes || undefined,
        updated_at: now,
      });
      toast.success('Product updated successfully!');
    } else {
      const product: Product = {
        id: generateId(),
        user_id: user?.id || 'demo',
        product_name: form.product_name,
        category: form.category as any,
        brand: form.brand,
        expiry_date: form.expiry_date,
        purchase_date: form.purchase_date || undefined,
        quantity: Number(form.quantity) || 1,
        batch_number: form.batch_number || undefined,
        notes: form.notes || undefined,
        status: 'active',
        created_at: now,
        updated_at: now,
        reminder_intervals: form.reminder_intervals,
      };
      addProduct(product);
      toast.success('Product added successfully!');
    }
    setIsSaving(false);
    onBack();
  };

  const simulateBarcodeScam = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsScanning(false);
    // Simulate prefill
    setForm((f) => ({ ...f, product_name: 'Dolo 650mg', brand: 'Micro Labs', category: 'Medicines' }));
    setMethod('manual');
    toast.success('Barcode detected! Product info prefilled. Please verify and add the expiry date.');
  };

  const simulateOCR = async (file: File) => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsScanning(false);
    // Simulate OCR result
    const detectedDate = '2027-03-31';
    setOcrResult({ date: detectedDate, batch: 'MFG2024Q1' });
    toast.success('Expiry date detected! Please verify the result.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) simulateOCR(file);
  };

  const acceptOCR = () => {
    if (ocrResult?.date) setField('expiry_date', ocrResult.date);
    if (ocrResult?.batch) setField('batch_number', ocrResult.batch);
    setOcrResult(null);
    setMethod('manual');
  };

  // Method chooser
  if (method === 'choose') {
    return (
      <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }} className="animate-fade-in">
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Add New Product
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9375rem' }}>
            Choose how you'd like to add your product
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
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
                }}
                onClick={() => setMethod(card.id)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = card.color;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${card.color}20`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Icon size={26} color={card.color} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
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

  // Barcode scanner
  if (method === 'barcode') {
    return (
      <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
          onClick={() => setMethod('choose')}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: '#CCFBF1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <QrCode size={30} color="#0F766E" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Scan Barcode</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
            Point your camera at a product barcode. The app will try to detect the product name and brand automatically.
          </p>

          {isScanning ? (
            <div style={{ padding: '40px 0' }}>
              <div style={{
                width: 200,
                height: 200,
                border: '3px dashed #0F766E',
                borderRadius: 16,
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: '#0F766E',
                  animation: 'scanLine 2s ease-in-out infinite',
                }} />
                <LoadingSpinner size={32} />
              </div>
              <style>{`@keyframes scanLine { 0%, 100% { top: 0; } 50% { top: calc(100% - 3px); } }`}</style>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Scanning barcode...</p>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={simulateBarcodeScam}>
              <QrCode size={18} /> Start Barcode Scanner
            </button>
          )}

          <div style={{
            marginTop: 16,
            padding: '10px 14px',
            background: '#FEF9C3',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#A16207',
            textAlign: 'left',
          }}>
            ℹ️ Barcode scanning provides product name and brand only. You'll still need to enter the expiry date manually.
          </div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            style={{ color: '#0F766E', fontWeight: 600, fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => setMethod('manual')}
          >
            Enter manually instead →
          </button>
        </div>
      </div>
    );
  }

  // OCR scanner
  if (method === 'ocr' && !ocrResult) {
    return (
      <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
          onClick={() => setMethod('choose')}
        >
          <ChevronLeft size={16} /> Back
        </button>
        <div className="card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: '#EDE9FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Camera size={30} color="#7C3AED" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Scan Expiry Date</h3>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.6 }}>
            Take a photo of the expiry label. OCR will detect the date, manufacturing date, and batch number.
          </p>

          {isScanning ? (
            <div style={{ padding: '32px 0' }}>
              <LoadingSpinner size={36} color="#7C3AED" />
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: 16 }}>Processing image with OCR...</p>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 10, background: '#7C3AED' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={18} /> Take Photo / Upload Image
              </button>
            </>
          )}

          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: '#EDE9FE',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#6D28D9',
            textAlign: 'left',
          }}>
            💡 OCR results may not be 100% accurate. Always verify detected dates before saving.
          </div>
        </div>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            style={{ color: '#0F766E', fontWeight: 600, fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => setMethod('manual')}
          >
            Enter manually instead →
          </button>
        </div>
      </div>
    );
  }

  // OCR result review
  if (method === 'ocr' && ocrResult) {
    return (
      <div style={{ padding: '24px', maxWidth: 600, margin: '0 auto' }} className="animate-fade-in">
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={22} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>OCR Detection Result</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Please verify the detected values</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: 4 }}>DETECTED EXPIRY DATE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                {ocrResult.date ? format(new Date(ocrResult.date), 'MMMM yyyy') : 'Not detected'}
              </div>
            </div>
            {ocrResult.batch && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: 4 }}>BATCH NUMBER</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>{ocrResult.batch}</div>
              </div>
            )}
          </div>

          <div style={{
            padding: '10px 14px',
            background: '#FEF9C3',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#A16207',
            marginBottom: 20,
          }}>
            ⚠️ OCR detection may contain errors. Please verify and correct the date if needed before proceeding.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setOcrResult(null); }}>
              <RotateCcw size={14} /> Retry Scan
            </button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={acceptOCR}>
              <CheckCircle size={14} /> Use This Result
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manual form
  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }} className="animate-fade-in">
      <button
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', border: 'none', background: 'none', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}
        onClick={() => editProduct ? onBack() : setMethod('choose')}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
          {editProduct ? 'Edit Product' : 'Add Product Manually'}
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
          Fill in the product details below. Fields marked * are required.
        </p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {/* Product Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Product Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Paracetamol 500mg"
              value={form.product_name}
              onChange={(e) => setField('product_name', e.target.value)}
              style={{ borderColor: errors.product_name ? '#DC2626' : undefined }}
            />
            {errors.product_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#DC2626', fontSize: '0.75rem' }}>
                <AlertCircle size={12} /> {errors.product_name}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="form-label">Category *</label>
            <select
              className="form-input"
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="form-label">Brand</label>
            <input
              className="form-input"
              placeholder="e.g. Cipla"
              value={form.brand}
              onChange={(e) => setField('brand', e.target.value)}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="form-label">Expiry Date *</label>
            <input
              className="form-input"
              type="date"
              value={form.expiry_date}
              onChange={(e) => setField('expiry_date', e.target.value)}
              style={{ borderColor: errors.expiry_date ? '#DC2626' : undefined }}
            />
            {errors.expiry_date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#DC2626', fontSize: '0.75rem' }}>
                <AlertCircle size={12} /> {errors.expiry_date}
              </div>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="form-label">Purchase Date</label>
            <input
              className="form-input"
              type="date"
              value={form.purchase_date}
              onChange={(e) => setField('purchase_date', e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="form-label">Quantity</label>
            <input
              className="form-input"
              type="number"
              min="1"
              placeholder="1"
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="form-label">Batch Number</label>
            <input
              className="form-input"
              placeholder="Optional"
              value={form.batch_number}
              onChange={(e) => setField('batch_number', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Optional notes (e.g. storage instructions)"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Reminder Intervals */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Reminder Schedule</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {[30, 14, 7, 1, 0].map((days) => {
                const isSelected = form.reminder_intervals.includes(days);
                return (
                  <button
                    key={days}
                    type="button"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? '#0F766E' : '#E2E8F0'}`,
                      background: isSelected ? '#CCFBF1' : 'white',
                      color: isSelected ? '#0F766E' : '#64748B',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => {
                      const intervals = isSelected
                        ? form.reminder_intervals.filter((d) => d !== days)
                        : [...form.reminder_intervals, days].sort((a, b) => b - a);
                      setForm((f) => ({ ...f, reminder_intervals: intervals }));
                    }}
                  >
                    {days === 0 ? 'On expiry day' : `${days} days before`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={() => editProduct ? onBack() : setMethod('choose')}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={isSaving}
            style={{ minWidth: 140 }}
          >
            {isSaving ? (
              <><LoadingSpinner size={16} color="white" /> Saving...</>
            ) : (
              <><CheckCircle size={16} /> {editProduct ? 'Update Product' : 'Save Product'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
