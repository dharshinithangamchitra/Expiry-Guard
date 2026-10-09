import React, { useState } from 'react';
import {
  User, Bell, Sun, Moon, Globe, Shield, HelpCircle, LogOut,
  ChevronRight, Check, ExternalLink, Info,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { IS_DEMO_MODE } from '../../config';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, theme, language, setTheme, setLanguage, logout } = useAppStore();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [browserNotif, setBrowserNotif] = useState(false);
  const [intervals, setIntervals] = useState([30, 14, 7, 1]);
  const [name, setName] = useState(user?.full_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const requestBrowserNotif = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported in this browser.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setBrowserNotif(true);
      toast.success('Browser notifications enabled!');
    } else {
      toast.error('Notification permission denied. Please enable it in browser settings.');
    }
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSavingProfile(false);
    toast.success('Profile updated');
  };

  const SectionTitle: React.FC<{ icon: React.ElementType; title: string; subtitle?: string }> = ({
    icon: Icon, title, subtitle
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#CCFBF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="#0F766E" />
      </div>
      <div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A' }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{subtitle}</p>}
      </div>
    </div>
  );

  const Toggle: React.FC<{ enabled: boolean; onChange: (v: boolean) => void }> = ({ enabled, onChange }) => (
    <div
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: enabled ? '#0F766E' : '#E2E8F0',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
      onClick={() => onChange(!enabled)}
    >
      <div style={{
        position: 'absolute',
        top: 2,
        left: enabled ? 22 : 2,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'white',
        boxShadow: '0 1px 4px rgb(0 0 0 / 0.2)',
        transition: 'left 0.2s ease',
      }} />
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>Settings</h2>
        <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Manage your account and preferences</p>
      </div>

      {IS_DEMO_MODE && (
        <div style={{
          padding: '12px 16px',
          background: '#FEF9C3',
          border: '1px solid #FDE68A',
          borderRadius: 10,
          marginBottom: 24,
          fontSize: '0.8125rem',
          color: '#A16207',
          lineHeight: 1.6,
        }}>
          <strong>Demo Mode:</strong> Profile changes and settings won't persist to a database until you connect Supabase.
          See the <code>SUPABASE_SETUP.md</code> file for setup instructions.
        </div>
      )}

      {/* Profile */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle icon={User} title="Profile" subtitle="Update your personal information" />
        <div style={{ display: 'grid', gap: 16 }}>
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>Email cannot be changed in demo mode</p>
          </div>
          <div>
            <button
              className="btn-primary"
              onClick={saveProfile}
              disabled={isSavingProfile}
              style={{ width: 'fit-content' }}
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle icon={Bell} title="Notification Preferences" />

        {/* Enable/disable reminders */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>Enable Reminders</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Receive in-app expiry reminders</div>
          </div>
          <Toggle enabled={notifEnabled} onChange={setNotifEnabled} />
        </div>

        {/* Browser notifications */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>Browser Notifications</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Requires browser permission • Works only when tab is open</div>
          </div>
          {browserNotif ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16A34A', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Check size={14} /> Enabled
            </span>
          ) : (
            <button
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
              onClick={requestBrowserNotif}
            >
              Enable
            </button>
          )}
        </div>

        {/* Reminder intervals */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>Default Reminder Schedule</div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 12 }}>
            Reminders will be sent this many days before a product expires
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[30, 14, 7, 1, 0].map((d) => {
              const sel = intervals.includes(d);
              return (
                <button
                  key={d}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${sel ? '#0F766E' : '#E2E8F0'}`,
                    background: sel ? '#CCFBF1' : 'white',
                    color: sel ? '#0F766E' : '#64748B',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setIntervals(sel ? intervals.filter((x) => x !== d) : [...intervals, d].sort((a, b) => b - a));
                    toast.success(`${d === 0 ? 'Expiry day' : `${d}-day`} reminder ${sel ? 'removed' : 'added'}`);
                  }}
                >
                  {d === 0 ? 'Expiry day' : `${d} days`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle icon={Sun} title="Appearance" subtitle="Choose your preferred theme" />
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 10,
                border: `2px solid ${theme === id ? '#0F766E' : '#E2E8F0'}`,
                background: theme === id ? '#CCFBF1' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
              onClick={() => {
                setTheme(id as 'light' | 'dark');
                toast.success(`${label} enabled`);
              }}
            >
              <Icon size={20} color={theme === id ? '#0F766E' : '#64748B'} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: theme === id ? '#0F766E' : '#64748B' }}>
                {label}
              </span>
              {theme === id && <Check size={14} color="#0F766E" />}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle icon={Globe} title="Language" subtitle="Select your preferred language" />
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { id: 'en', label: 'English', flag: '🇬🇧' },
            { id: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
          ].map(({ id, label, flag }) => (
            <button
              key={id}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 10,
                border: `2px solid ${language === id ? '#0F766E' : '#E2E8F0'}`,
                background: language === id ? '#CCFBF1' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.15s',
              }}
              onClick={() => {
                setLanguage(id as 'en' | 'ta');
                toast.success(`Language changed to ${label}`);
              }}
            >
              <span style={{ fontSize: '1.125rem' }}>{flag}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: language === id ? '#0F766E' : '#64748B' }}>
                {label}
              </span>
              {language === id && <Check size={14} color="#0F766E" />}
            </button>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <SectionTitle icon={Shield} title="Account & Privacy" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: 'Privacy Policy', icon: ExternalLink },
            { label: 'Terms of Service', icon: ExternalLink },
            { label: 'Help & Support', icon: HelpCircle },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 8px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderRadius: 8,
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span>{label}</span>
              <Icon size={14} color="#94A3B8" />
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>Sign Out</div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Signed in as {user?.email}</div>
          </div>
          <button className="btn-danger" onClick={logout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
