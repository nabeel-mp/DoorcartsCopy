import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, ShoppingBag, CreditCard, Wallet, QrCode, ChevronRight,
  Landmark, Truck, ShieldCheck, ShieldAlert, Loader2, CheckCircle2,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const UPI_APPS = [
  { label: 'Google Pay', icon: Wallet, color: '#4285F4' },
  { label: 'PhonePe', icon: Wallet, color: '#6739B7' },
  { label: 'Paytm', icon: QrCode, color: '#00BAF2' },
];

const OTHER_METHODS = [
  { label: 'Credit / Debit Cards', icon: CreditCard },
  { label: 'Net Banking', icon: Landmark },
];

export default function Payment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('saved-card');
  const [status, setStatus] = useState('idle'); // idle | processing | success

  const handlePayNow = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => navigate('/order-status'), 1200);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-44">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 shadow-md bg-[#004aad] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-white">Doorcarts</h1>
        </div>
        <div className="flex items-center gap-1 text-white">
          <Lock size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Secure</span>
        </div>
      </header>

      <main className="w-full px-5 mt-6">
        {/* Order Summary */}
        <section
          className={`rounded-xl p-6 mb-8 text-white shadow-sm transition-all ${
            status === 'success' ? 'ring-4 ring-green-400 scale-[1.02] bg-green-700' : 'bg-[#004aad]'
          }`}
        >
          <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Amount Payable</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">₹1,64,374</span>
            <span className="text-sm opacity-90">Inc. GST</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} />
              <span className="text-sm">Order ID: #DC-88291-JK</span>
            </div>
            <button className="text-sm underline underline-offset-4">View Details</button>
          </div>
        </section>

        <div className="space-y-6">
          {/* Saved Methods */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Saved Methods</h2>
            <button
              onClick={() => setSelectedMethod('saved-card')}
              className={`w-full bg-white rounded-xl border p-4 flex items-center justify-between active:scale-[0.98] transition-transform ${
                selectedMethod === 'saved-card' ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gray-100 flex items-center justify-center rounded">
                  <CreditCard size={18} className="text-[#004aad]" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">HDFC Bank •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/26</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === 'saved-card' ? 'border-[#004aad]' : 'border-gray-300'
              }`}>
                {selectedMethod === 'saved-card' && <div className="w-3 h-3 bg-[#004aad] rounded-full" />}
              </div>
            </button>
          </div>

          {/* UPI */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">UPI Payments</h2>
            <div className="grid grid-cols-3 gap-3">
              {UPI_APPS.map(({ label, icon: Icon, color }) => (
                <button
                  key={label}
                  onClick={() => setSelectedMethod(label)}
                  className={`bg-white border rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-colors ${
                    selectedMethod === label ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-gray-200 hover:border-[#004aad]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}1A` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Enter UPI ID (e.g. user@bank)"
              className="mt-4 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#004aad] focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Other Methods */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Other Methods</h2>
            {OTHER_METHODS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setSelectedMethod(label)}
                className={`w-full bg-white border rounded-xl p-4 flex items-center justify-between transition-colors ${
                  selectedMethod === label ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon size={20} className="text-gray-500" />
                  <span className="text-gray-800">{label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            ))}
            <button
              onClick={() => setSelectedMethod('cod')}
              className={`w-full bg-white border rounded-xl p-4 flex items-center justify-between transition-colors ${
                selectedMethod === 'cod' ? 'border-[#004aad] ring-2 ring-[#004aad]/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <Truck size={20} className="text-gray-500" />
                <div className="flex flex-col text-left">
                  <span className="text-gray-800">Cash on Delivery</span>
                  <span className="text-[10px] text-red-500 font-bold uppercase">Verified Construction Site Only</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <section className="mt-10 mb-10 grid grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
            <ShieldCheck size={22} className="text-[#004aad]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">PCI-DSS</span>
              <span className="text-[10px] leading-tight text-gray-500">Compliant Gateway</span>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
            <ShieldAlert size={22} className="text-[#004aad]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">256-BIT SSL</span>
              <span className="text-[10px] leading-tight text-gray-500">Secure Encryption</span>
            </div>
          </div>
        </section>
      </main>

      {/* Fixed Pay Bar */}
      <div className="fixed bottom-20 left-0 w-full max-w-md mx-auto right-0 bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.05)] px-5 py-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">To be paid</span>
            <span className="text-lg font-bold text-[#004aad]">₹1,64,374</span>
          </div>
          <button
            onClick={handlePayNow}
            disabled={status !== 'idle'}
            className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-md text-white ${
              status === 'success' ? 'bg-green-600' : 'bg-[#004aad]'
            }`}
          >
            {status === 'idle' && (<><Lock size={18} /> Pay Now</>)}
            {status === 'processing' && (<><Loader2 size={18} className="animate-spin" /> Processing...</>)}
            {status === 'success' && (<><CheckCircle2 size={18} /> Success!</>)}
          </button>
        </div>
      </div>

      <BottomNav active="bookings" />
    </div>
  );
}