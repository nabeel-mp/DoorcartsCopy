import { useState } from 'react';
import {
  Menu, Search, Banknote, PlusCircle, Star, Clock, CheckCircle2, Copy,
  Wallet as WalletIcon, ArrowDownToLine, ShoppingCart,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const TRANSACTIONS = [
  { title: 'Referral Commission', meta: 'Jun 12, 2024 • Project #8821', amount: '+$124.50', positive: true, status: 'Completed', icon: WalletIcon, iconBg: '#d9e2ff', iconColor: '#004aad' },
  { title: 'Withdrawal', meta: 'Jun 10, 2024 • Bank Transfer', amount: '-$2,000.00', positive: false, status: 'Pending', icon: ArrowDownToLine, iconBg: '#ffdad6', iconColor: '#ba1a1a' },
  { title: 'Materials Purchase', meta: 'Jun 08, 2024 • Cement Bulk', amount: '-$840.20', positive: false, status: 'Completed', icon: ShoppingCart, iconBg: '#dfe0e0', iconColor: '#5d5f5f' },
  { title: 'Referral Commission', meta: 'Jun 05, 2024 • Project #7992', amount: '+$45.00', positive: true, status: 'Completed', icon: WalletIcon, iconBg: '#d9e2ff', iconColor: '#004aad' },
];

const STATUS_STYLE = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-orange-100 text-orange-700',
};

export default function Wallet() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText('DC-BUILD2024').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-28">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 bg-[#004aad] text-white shadow-md flex justify-between items-center px-6 h-16 z-50">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-extrabold">Doorcarts</h1>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Search size={20} />
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 relative">
        {/* Hero Balance */}
        <section className="mt-5 bg-[#004aad] rounded-3xl p-6 text-white shadow-xl overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <p className="text-xs opacity-80 mb-1">Total Available Balance</p>
            <h2 className="text-3xl font-extrabold mb-6">$12,450.80</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-[10px] opacity-70 mb-1">Wallet Balance</p>
                <p className="text-lg font-bold">$8,120.30</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <p className="text-[10px] opacity-70 mb-1">Commissions</p>
                <p className="text-lg font-bold">$4,330.50</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-white text-[#004aad] font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Banknote size={18} />
                Withdraw
              </button>
              <button className="flex-1 bg-white/10 border border-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <PlusCircle size={18} />
                Add Money
              </button>
            </div>
          </div>
        </section>

        {/* Commission Insights */}
        <section className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">Commission Insights</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="row-span-2 bg-gray-100 rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <Star size={20} className="text-[#004aad] mb-2" fill="#004aad" />
                <p className="text-xs font-semibold text-gray-500">Total Earned</p>
              </div>
              <p className="text-xl font-bold text-[#004aad]">$18,240</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-[#dfe0e0] rounded-3xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 flex-shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] opacity-70">Pending</p>
                  <p className="font-bold text-sm">$940.00</p>
                </div>
              </div>
              <div className="bg-[#d9e2ff] rounded-3xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#004aad] flex-shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-[10px] opacity-70">Paid Out</p>
                  <p className="font-bold text-sm">$17,300</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Referral Card */}
        <section className="mt-8">
          <div className="bg-gray-200/60 rounded-3xl p-6 flex items-center justify-between overflow-hidden relative">
            <div className="relative z-10 w-full">
              <h4 className="text-lg font-bold text-gray-800 mb-2">Build Together</h4>
              <p className="text-sm text-gray-500 mb-4">Refer a fellow contractor and earn 5% on their first bulk order.</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full w-fit border border-gray-200"
              >
                <span className="text-sm font-bold tracking-widest text-[#004aad]">DC-BUILD2024</span>
                <Copy size={14} className="text-gray-400" />
              </button>
              {copied && <p className="text-xs text-emerald-600 font-semibold mt-2">Referral code copied!</p>}
            </div>
          </div>
        </section>

        {/* Transactions */}
        <section className="mt-8 pb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-lg font-bold text-gray-800">Transactions</h3>
            <button className="text-[#004aad] text-sm font-semibold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {TRANSACTIONS.map((tx, i) => {
              const Icon = tx.icon;
              return (
                <div key={i} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{tx.title}</p>
                      <p className="text-xs text-gray-500 truncate">{tx.meta}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`font-bold ${tx.positive ? 'text-[#004aad]' : 'text-gray-800'}`}>{tx.amount}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${STATUS_STYLE[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav active="account" />
    </div>
  );
}