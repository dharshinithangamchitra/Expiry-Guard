import React, { useState, useMemo } from 'react';
import {
  Search, Filter, SortAsc, SortDesc, Plus, Eye, Edit2, Trash2,
  CheckCircle, Package, MoreVertical, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore, Product } from '../../store';
import { getExpiryStatus, getExpiryLabel, formatExpiryDate, getDaysRemaining } from '../../utils/expiry';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ConfirmDialog, EmptyState } from '../ui/Common';
import { PRODUCT_CATEGORIES } from '../../config';
import toast from 'react-hot-toast';

interface ProductsPageProps {
  onPageChange: (page: string) => void;
  onProductSelect: (id: string) => void;
  filterStatus?: string;
}

const PAGE_SIZE = 10;

export const ProductsPage: React.FC<ProductsPageProps> = ({
  onPageChange,
  onProductSelect,
  filterStatus,
}) => {
  const { products, updateProduct, deleteProduct } = useAppStore();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterStatus || '');
  const [sortField, setSortField] = useState<'expiry_date' | 'product_name' | 'created_at'>('expiry_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (statusFilter === 'active' && p.status !== 'active') return false;
      if (statusFilter === 'expired-products' && (getExpiryStatus(p.expiry_date) !== 'expired' || p.status !== 'active')) return false;
      if (statusFilter === 'expiring-soon' && !(['urgent', 'expiring-soon'].includes(getExpiryStatus(p.expiry_date))) ) return false;
      if (statusFilter === 'used' && p.status !== 'used') return false;
      if (statusFilter === 'disposed' && p.status !== 'disposed') return false;
      if (!statusFilter && p.status === 'used') return false;
      if (!statusFilter && p.status === 'disposed') return false;

      if (category && p.category !== category) return false;
      if (search && !p.product_name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortField === 'expiry_date') {
        valA = getDaysRemaining(a.expiry_date);
        valB = getDaysRemaining(b.expiry_date);
      } else if (sortField === 'product_name') {
        valA = a.product_name.toLowerCase();
        valB = b.product_name.toLowerCase();
      } else {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, category, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    toast.success('Product deleted');
    setConfirmDelete(null);
  };

  const handleMarkUsed = (id: string) => {
    updateProduct(id, { status: 'used' });
    toast.success('Marked as used');
    setOpenMenu(null);
  };

  const handleMarkDisposed = (id: string) => {
    updateProduct(id, { status: 'disposed' });
    toast.success('Marked as disposed');
    setOpenMenu(null);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>My Products</h2>
          <p style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="btn-primary" onClick={() => onPageChange('add-product')}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{
        padding: '14px 16px',
        marginBottom: 16,
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32 }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Category filter */}
        <select
          className="form-input"
          style={{ flex: '0 1 160px' }}
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status filter */}
        <select
          className="form-input"
          style={{ flex: '0 1 160px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Active Products</option>
          <option value="expiring-soon">Expiring Soon</option>
          <option value="expired-products">Expired</option>
          <option value="used">Marked as Used</option>
          <option value="disposed">Disposed</option>
        </select>

        {/* Sort */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-secondary"
            style={{ padding: '9px 12px', fontSize: '0.8125rem' }}
            onClick={() => toggleSort('expiry_date')}
          >
            {sortDir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
            Expiry
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '9px 12px', fontSize: '0.8125rem' }}
            onClick={() => toggleSort('product_name')}
          >
            Name
          </button>
        </div>
      </div>

      {/* Table / Cards */}
      {paginated.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title="No products found"
            description={search || category ? 'Try adjusting your search or filters.' : 'Add your first product to get started.'}
            action={!search && !category ? { label: '+ Add Product', onClick: () => onPageChange('add-product') } : undefined}
          />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="card" style={{ overflow: 'hidden', display: 'block' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: 700 }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CategoryIcon category={product.category} size={14} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{product.product_name}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: 1 }}>
                              {getExpiryLabel(product.expiry_date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ color: '#64748B' }}>{product.category}</span></td>
                      <td><span style={{ color: '#64748B' }}>{product.brand || '—'}</span></td>
                      <td><span style={{ fontWeight: 600 }}>{formatExpiryDate(product.expiry_date)}</span></td>
                      <td>
                        {product.status !== 'active' ? (
                          <span className="status-badge" style={{ background: '#F1F5F9', color: '#64748B' }}>
                            {product.status === 'used' ? 'Used' : 'Disposed'}
                          </span>
                        ) : (
                          <StatusBadge expiryDate={product.expiry_date} />
                        )}
                      </td>
                      <td><span style={{ color: '#64748B' }}>{product.quantity ?? '—'}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <button
                            style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, color: '#64748B' }}
                            onClick={() => onProductSelect(product.id)}
                            title="View details"
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B'; }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, color: '#64748B' }}
                            title="Delete"
                            onClick={() => setConfirmDelete(product.id)}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <div style={{ position: 'relative' }}>
                            <button
                              style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, color: '#64748B' }}
                              onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                              onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                            >
                              <MoreVertical size={16} />
                            </button>
                            {openMenu === product.id && (
                              <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpenMenu(null)} />
                                <div className="card animate-fade-in" style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '100%',
                                  width: 160,
                                  padding: 6,
                                  zIndex: 10,
                                }}>
                                  <button
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, fontSize: '0.8125rem', color: '#374151' }}
                                    onClick={() => handleMarkUsed(product.id)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                  >
                                    <CheckCircle size={14} color="#16A34A" /> Mark as Used
                                  </button>
                                  <button
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, fontSize: '0.8125rem', color: '#374151' }}
                                    onClick={() => handleMarkDisposed(product.id)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                                  >
                                    <Trash2 size={14} color="#F97316" /> Mark Disposed
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              padding: '0 4px',
            }}>
              <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '7px 10px' }}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    style={{
                      width: 34,
                      height: 34,
                      border: p === page ? 'none' : '1.5px solid #E2E8F0',
                      borderRadius: 8,
                      background: p === page ? '#0F766E' : 'white',
                      color: p === page ? 'white' : '#374151',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="btn-secondary"
                  style={{ padding: '7px 10px' }}
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};
