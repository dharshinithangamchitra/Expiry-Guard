import React, { useState } from 'react';
import {
  Shield, CheckCircle2, Lock, Mail, User as UserIcon,
  ArrowRight, KeyRound, Sparkles, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { useAppStore, User } from '../../store';
import { MOCK_PRODUCTS, MOCK_NOTIFICATIONS } from '../../data/mockData';
import toast from 'react-hot-toast';

interface DemoAccount {
  name: string;
  email: string;
  role: string;
  avatar: string;
  categoryHighlight: string;
  itemCount: number;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Dharshini (Family Care)',
    email: 'demo@expiryguard.com',
    role: 'Household Manager',
    avatar: '👩🏻‍💼',
    categoryHighlight: 'Medicines & Family First Aid',
    itemCount: 12,
  },
  {
    name: 'Sarah Chen',
    email: 'sarah.beauty@example.com',
    role: 'Skincare Specialist',
    avatar: '✨',
    categoryHighlight: 'Cosmetics & Skincare Routine',
    itemCount: 8,
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.clinic@example.com',
    role: 'Healthcare Professional',
    avatar: '🩺',
    categoryHighlight: 'Prescriptions & Clinical Stock',
    itemCount: 15,
  },
];

export const AuthPage: React.FC = () => {
  const { setUser, setProducts, setNotifications, setCurrentPage } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('demo@expiryguard.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Dharshini');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const loggedUser: User = {
      id: 'user-' + Date.now().toString(36),
      email: email.trim().toLowerCase(),
      full_name: isRegister ? (fullName || 'New User') : (email.includes('sarah') ? 'Sarah Chen' : email.includes('rajesh') ? 'Dr. Rajesh Kumar' : 'Dharshini'),
      created_at: new Date().toISOString(),
    };

    setUser(loggedUser);
    setProducts(MOCK_PRODUCTS);
    setNotifications(MOCK_NOTIFICATIONS);
    setCurrentPage('dashboard');
    setIsLoading(false);

    toast.success(`Welcome to ExpiryGuard, ${loggedUser.full_name}! 👋`, {
      icon: '🛡️',
      duration: 4000,
    });
  };

  const handleQuickDemoLogin = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword('password123');
    setFullName(acc.name);
    setFormError(null);

    const loggedUser: User = {
      id: 'demo-' + acc.email.split('@')[0],
      email: acc.email,
      full_name: acc.name,
      created_at: new Date().toISOString(),
    };

    setIsLoading(true);
    setTimeout(() => {
      setUser(loggedUser);
      setProducts(MOCK_PRODUCTS);
      setNotifications(MOCK_NOTIFICATIONS);
      setCurrentPage('dashboard');
      setIsLoading(false);
      toast.success(`Signed in as ${acc.name}!`, { icon: '✨' });
    }, 400);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0F172A 0%, #0F766E 50%, #042F2E 100%)',
      color: '#FFFFFF',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient blur circles */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '15%',
        width: 450,
        height: 450,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, rgba(15, 118, 110, 0) 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '10%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(4, 47, 46, 0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Top Header */}
      <header style={{
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        background: 'rgba(15, 23, 42, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(20, 184, 166, 0.35)',
          }}>
            <Shield size={26} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              ExpiryGuard
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#99F6E4', fontWeight: 600 }}>
              Smart Expiry Management System
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '6px 14px',
            borderRadius: 9999,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#CCFBF1',
          }}>
            <Sparkles size={14} color="#5EEAD4" /> Live Demo Mode Ready
          </span>
        </div>
      </header>

      {/* Main Grid Content */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        maxWidth: 1240,
        width: '100%',
        margin: '0 auto',
        padding: '36px 20px',
        gap: 36,
        alignItems: 'center',
        zIndex: 10,
      }}>
        {/* Left Column: Product Value & Hero */}
        <div style={{ paddingRight: 12 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(20, 184, 166, 0.2)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            padding: '6px 16px',
            borderRadius: 9999,
            color: '#5EEAD4',
            fontSize: '0.8125rem',
            fontWeight: 700,
            marginBottom: 20,
          }}>
            <span>✨</span> STAY AHEAD OF EXPIRY
          </div>

          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
          }}>
            Protect Your Health & Pocket from Expired Products.
          </h2>

          <p style={{
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: '#CBD5E1',
            marginBottom: 28,
            maxWidth: 520,
          }}>
            Intelligent tracking for medicines, cosmetics, skincare, and household essentials. Featuring live barcode scanning, OCR expiry-date capture, and proactive countdown reminders.
          </p>

          {/* Value Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
            {[
              { icon: '📷', title: 'Live Camera Barcode Scanner', desc: 'Instant product detection with Open Food & Beauty Facts catalog' },
              { icon: '🔍', title: 'Smart Expiry OCR Scanner', desc: 'Scan date labels directly from medicine and cosmetic packages' },
              { icon: '⏰', title: 'Scheduled Reminders', desc: 'Safe, Expiring Soon, Urgent, and Expired visual status alerts' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: 'rgba(15, 23, 42, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 16px',
                borderRadius: 14,
                backdropFilter: 'blur(8px)',
              }}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F1F5F9' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Credentials Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 18,
            padding: '20px',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', fontWeight: 700, color: '#5EEAD4' }}>
                <KeyRound size={16} /> 1-Click Demo Profiles (For Testing)
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Click to sign in instantly</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(45, 212, 191, 0.2)',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#14B8A6';
                    e.currentTarget.style.background = 'rgba(20, 184, 166, 0.2)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.2)';
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.6)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.25rem' }}>{acc.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {acc.email} • <span style={{ color: '#5EEAD4' }}>{acc.categoryHighlight}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#0F766E',
                    color: '#CCFBF1',
                    padding: '4px 10px',
                    borderRadius: 8,
                  }}>
                    Log in &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          color: '#0F172A',
        }} className="animate-fade-in">
          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: 4,
            borderRadius: 14,
            marginBottom: 24,
          }}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setFormError(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: !isRegister ? '#FFFFFF' : 'transparent',
                color: !isRegister ? '#0F766E' : '#64748B',
                boxShadow: !isRegister ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setFormError(null); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isRegister ? '#FFFFFF' : 'transparent',
                color: isRegister ? '#0F766E' : '#64748B',
                boxShadow: isRegister ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              {isRegister ? 'Start Managing Expiries' : 'Welcome Back'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              {isRegister
                ? 'Create your free account to track medicines and skincare.'
                : 'Enter your credentials or use the demo buttons to test.'}
            </p>
          </div>

          {formError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: 16,
            }}>
              <AlertTriangle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isRegister && (
              <div>
                <label className="form-label" style={{ color: '#334155' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dharshini T."
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: 42 }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label" style={{ color: '#334155' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0, color: '#334155' }}>Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => toast('For demo mode, password is: password123', { icon: '🔑' })}
                    style={{ background: 'none', border: 'none', color: '#0F766E', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', color: '#64748B' }}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={{ accentColor: '#0F766E' }}
                />
                I agree to the privacy policy & notifications terms
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #0F766E 0%, #0D5F58 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 8px 20px rgba(15, 118, 110, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: 6,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create My Account' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#64748B',
          }}>
            🛡️ Your data is stored safely on your device with localStorage encryption.
          </div>
        </div>
      </main>
    </div>
  );
};
