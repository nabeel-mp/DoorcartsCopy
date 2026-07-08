import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Bell, Globe, Shield, Moon, ShieldCheck, LogOut, ChevronRight, ExternalLink,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/authContext';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 shrink-0 ${
        checked ? 'bg-primary-container' : 'bg-outline-variant'
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SettingsRow({ icon: Icon, title, subtitle, right, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-surface rounded-xl transition-colors duration-200 group ${
        onClick ? 'cursor-pointer hover:bg-surface-container-low' : ''
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0 group-hover:scale-110 transition-transform">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-on-surface text-[15px] leading-tight">{title}</p>
          <p className="text-sm text-on-surface-variant truncate">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-background font-sans pb-28 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-primary-container shadow-md flex items-center gap-3 px-4 h-16">
        <button onClick={() => navigate(-1)} className="text-white p-2 -ml-1 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-white">Doorcarts</h1>
      </header>

      <main className="flex-1 pt-16">
        {/* Brand hero */}
        <section className="bg-primary-container pt-8 pb-16 px-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-[32px] font-extrabold leading-tight tracking-tight">Settings</h2>
            <p className="opacity-80 mt-1">Manage your preferences and security</p>
          </div>
        </section>

        {/* Settings card */}
        <div className="px-6 -mt-10 relative z-20">
          <div className="bg-surface-container-lowest rounded-[40px] shadow-xl overflow-hidden p-5 flex flex-col gap-4 border border-outline-variant/30">
            <SettingsRow
              icon={Bell}
              title="Notifications"
              subtitle="Get real-time order updates"
              right={<Toggle checked={notifications} onChange={setNotifications} />}
            />
            <SettingsRow
              icon={Globe}
              title="App Language"
              subtitle="English (US)"
              right={<ChevronRight size={20} className="text-outline shrink-0" />}
              onClick={() => {}}
            />
            <SettingsRow
              icon={Shield}
              title="Security"
              subtitle="Change PIN or Password"
              right={<ChevronRight size={20} className="text-outline shrink-0" />}
              onClick={() => {}}
            />
            <SettingsRow
              icon={Moon}
              title="Dark Mode"
              subtitle="Toggle visual theme"
              right={<Toggle checked={darkMode} onChange={setDarkMode} />}
            />
            <SettingsRow
              icon={ShieldCheck}
              title="Privacy Policy"
              subtitle="Data usage and legal terms"
              right={<ExternalLink size={18} className="text-outline shrink-0" />}
              onClick={() => {}}
            />

            <div className="mt-2 pt-4 border-t border-outline-variant/30 text-center">
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-error/10 text-error font-bold rounded-full active:scale-95 transition-transform inline-flex items-center gap-2"
              >
                <LogOut size={18} />
                Log Out
              </button>
              <p className="mt-4 text-[10px] font-semibold tracking-wide text-on-surface-variant opacity-60 uppercase">
                App Version 2.4.1
              </p>
            </div>
          </div>
        </div>

        {/* Help banner */}
        <section className="mt-5 px-6">
          <div className="relative rounded-3xl overflow-hidden min-h-[10rem] flex items-center p-8 text-white bg-gradient-to-br from-primary-container to-[#00296b]">
            <div className="relative z-10 flex flex-col items-start">
              <h3 className="text-xl font-bold mb-1">Need help?</h3>
              <p className="text-sm opacity-80 mb-3">Our masters are ready to assist you.</p>
              <button
                onClick={() => navigate('/support')}
                className="bg-white text-primary-container px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </main>

      <BottomNav active="account" />
    </div>
  );
}