import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, User, History, Wallet, Settings, LogOut, X,
  Layers, Grid3x3, Zap, HardHat, Box,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/authContext';
import * as categoryService from '../api/categoryService';

const SLIDES = [
  { title: '10% Off TMT Steel', subtitle: 'Bulk orders only', gradient: 'from-[#004aad] to-[#00296b]' },
  { title: 'Bulk Cement Deals', subtitle: 'Free site delivery', gradient: 'from-[#5d5f5f] to-[#2f3133]' },
];

const CATEGORY_ICONS = [Layers, HardHat, Grid3x3, Zap, Box];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        const categoryData = response.data?.data || response.data || response || [];
        if (!cancelled) setCategories(categoryData);
      } catch (err) {
        if (!cancelled) setCategoryError(err.response?.data?.message || 'Could not load categories.');
      } finally {
        if (!cancelled) setIsLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24 overflow-x-hidden">
      
      {/* SAFE DRAWER RENDERING: 
        Hidden via CSS opacity/visibility instead of unmounting. 
        This prevents the "removeChild" crash caused by browser extensions.
      */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-300 ${
          drawerOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        
        {/* Sidebar */}
        <div 
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl rounded-r-3xl flex flex-col py-6 transition-transform duration-300 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#004aad] text-white flex items-center justify-center font-bold text-lg shadow-inner">
                {(user?.name || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#004aad]">{user?.name || 'Welcome'}</h2>
                <p className="text-sm text-gray-500">{user?.phone || 'Guest User'}</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {[
                { label: 'My Account', icon: User, path: '/account' },
                { label: 'Order History', icon: History, path: '/order-history' },
                { label: 'Wallet & Commissions', icon: Wallet, path: '/wallet' },
                { label: 'Settings', icon: Settings, path: '#' },
              ].map(({ label, icon: Icon, path }) => (
                <li key={label}>
                  <button
                    onClick={() => { 
                      setDrawerOpen(false); 
                      if (path !== '#') navigate(path); 
                    }}
                    className="w-full flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#004aad] mx-2 my-1 rounded-full transition-all"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-auto px-6">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 mx-2 my-1 rounded-full transition-all">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <header className="bg-[#004aad] w-full sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center px-6 h-16">
          <button onClick={() => setDrawerOpen(true)} className="text-white p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">Doorcarts</h1>
          <button className="text-white p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors">
            <Search size={24} />
          </button>
        </div>
      </header>

      <main className="w-full flex flex-col gap-6 pt-6 pb-4">
        <section className="px-6">
          <div className="relative shadow-sm group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
            <input type="text" placeholder="Search materials..." className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all outline-none" />
          </div>
        </section>

        <section className="px-6 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SLIDES.map((slide) => (
              <div key={slide.title} className="snap-center shrink-0 w-[85%] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`h-36 relative bg-gradient-to-br ${slide.gradient} p-5 flex flex-col justify-end`}>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-1">{slide.title}</h3>
                    <p className="text-sm text-white/90 font-medium">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-gray-800">Categories</h2>
            <button className="text-sm font-semibold text-[#004aad] hover:underline">See All</button>
          </div>
          
          {/* SAFE RENDERING: Grouped in a stable min-height div to stop React diffing issues */}
          <div className="min-h-[150px]">
            {isLoadingCategories && (
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={`skeleton-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-100 aspect-square animate-pulse" />
                ))}
              </div>
            )}

            {!isLoadingCategories && categoryError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">
                {categoryError}
              </div>
            )}

            {!isLoadingCategories && !categoryError && categories.length === 0 && (
              <div className="bg-gray-50 text-gray-500 p-6 rounded-xl text-sm font-medium border border-gray-200 text-center">
                No categories available yet.
              </div>
            )}

            {!isLoadingCategories && !categoryError && categories.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category, i) => {
                  const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
                  return (
                    <button
                      key={category._id}
                      onClick={() => navigate(`/category/${category._id}`)} 
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:bg-[#f0f5ff] hover:border-[#004aad]/30 transition-all aspect-square group"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#e5edfa] flex items-center justify-center text-[#004aad] group-hover:scale-110 transition-transform">
                        <Icon size={26} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 text-center line-clamp-2">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}