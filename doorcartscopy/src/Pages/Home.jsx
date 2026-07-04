import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, User, History, Wallet, Settings, LogOut, X,
  Layers, Grid3x3, Zap, HardHat,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const CATEGORIES = [
  { label: 'Cement', icon: Layers, path: '/product' },
  { label: 'Steel & Rebars', icon: HardHat, path: '/product' },
  { label: 'Bricks & Blocks', icon: Grid3x3, path: '/product' },
  { label: 'Electricals', icon: Zap, path: '/product' },
];

const SLIDES = [
  { title: '10% Off TMT Steel', subtitle: 'Bulk orders only', gradient: 'from-[#004aad] to-[#00296b]' },
  { title: 'Bulk Cement Deals', subtitle: 'Free site delivery', gradient: 'from-[#5d5f5f] to-[#2f3133]' },
];

export default function Home() {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      {/* Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl rounded-r-3xl flex flex-col py-6">
            <div className="px-6 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#004aad] text-white flex items-center justify-center font-bold text-lg">
                  BM
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#004aad]">Build Master</h2>
                  <p className="text-sm text-gray-500">Pro Member</p>
                  <p className="text-[10px] text-gray-400">ID: 88291</p>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {[
                  { label: 'My Profile', icon: User, path: '/register' },
                  { label: 'Order History', icon: History, path: '/orders' },
                  { label: 'Wallet & Commissions', icon: Wallet, path: '/wallet' },
                  { label: 'Settings', icon: Settings, path: '#' },
                ].map(({ label, icon: Icon, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => { setDrawerOpen(false); if (path !== '#') navigate(path); }}
                      className="w-full flex items-center gap-4 px-6 py-3 text-gray-600 hover:bg-gray-50 mx-2 my-1 rounded-full transition-colors"
                    >
                      <Icon size={20} />
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto px-6">
              <button
                onClick={() => { setDrawerOpen(false); navigate('/login'); }}
                className="w-full flex items-center gap-4 py-3 text-red-600 hover:bg-gray-50 mx-2 my-1 rounded-full transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top App Bar */}
      <header className="bg-[#004aad] w-full sticky top-0 z-40 shadow-md">
        <div className="flex justify-between items-center px-6 h-16">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-2xl font-extrabold text-white">Doorcarts</h1>
          <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <Search size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full flex flex-col gap-5 pt-4 pb-4">
        {/* Search */}
        <section className="px-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search construction materials..."
              className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#004aad] focus:border-[#004aad] transition-all shadow-sm outline-none"
            />
          </div>
        </section>

        {/* Hero Slider */}
        <section className="px-6 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SLIDES.map((slide) => (
              <div
                key={slide.title}
                className="snap-center shrink-0 w-[85%] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className={`h-32 relative bg-gradient-to-br ${slide.gradient}`}>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-lg font-bold">{slide.title}</h3>
                    <p className="text-sm opacity-90">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="px-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors aspect-square"
              >
                <div className="w-12 h-12 rounded-full bg-[#e5edfa] flex items-center justify-center text-[#004aad]">
                  <Icon size={22} />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="services" />
    </div>
  );
}