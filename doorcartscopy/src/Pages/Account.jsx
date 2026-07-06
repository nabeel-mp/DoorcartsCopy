import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Building, Edit3, LogOut } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/authContext';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#004aad] shadow-md flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-extrabold text-white">My Account</h1>
        </div>
        <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => navigate('/register')}>
          <Edit3 size={20} />
        </button>
      </header>

      <main className="pt-20 px-5 space-y-6">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-[#e5edfa] to-white" />
          <div className="w-24 h-24 bg-[#004aad] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg relative z-10 border-4 border-white mb-3">
            {(user?.name || 'U').slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 relative z-10">{user?.name || 'Guest User'}</h2>
          <p className="text-gray-500 font-medium relative z-10">{user?.phone}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">Personal Details</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="flex items-center gap-4 p-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#004aad]">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-bold text-gray-800">{user?.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="font-bold text-gray-800">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Building size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Company / Shop Name</p>
                <p className="font-bold text-gray-800">
                  {user?.name ? `${user.name} Electronics & Plumbing` : 'Doorcarts Partner'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location / Address</p>
                <p className="font-bold text-gray-800">
                  {defaultAddress?.line1 || 'No address set. Please update your profile.'}
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </section>
      </main>

      <BottomNav active="account" />
    </div>
  );
}