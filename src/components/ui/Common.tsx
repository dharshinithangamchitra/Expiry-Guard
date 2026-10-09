import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { eachDayOfInterval } from 'date-fns';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    danger: { icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2', btnClass: 'btn-danger' },
    warning: { icon: AlertTriangle, color: '#F97316', bg: '#FFEDD5', btnClass: '' },
    info: { icon: Info, color: '#0F766E', bg: '#CCFBF1', btnClass: 'btn-primary' },
  };
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="card animate-fade-in"
        style={{ width: '100%', maxWidth: 440, padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={24} color={config.color} />
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
          {variant === 'danger' ? (
            <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          ) : (
            <button className="btn-primary" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 24px',
    textAlign: 'center',
  }}>
    {Icon && (
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 20,
        background: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon size={32} color="#94A3B8" />
      </div>
    )}
    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: 24, maxWidth: 320, lineHeight: 1.6 }}>
        {description}
      </p>
    )}
    {action && (
      <button className="btn-primary" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 24, color = '#0F766E' }) => (
  <div style={{
    width: size,
    height: size,
    border: `3px solid ${color}20`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }} />
);

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 16,
    padding: 40,
  }}>
    <LoadingSpinner size={36} />
    <p style={{ color: '#64748B', fontSize: '0.875rem' }}>{message}</p>
  </div>
);
