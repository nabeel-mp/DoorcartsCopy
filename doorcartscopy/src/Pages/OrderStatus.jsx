import { } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, CalendarClock, Check, Truck, Clock, User, Phone, LifeBuoy,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const STEPS = [
  { title: 'Order Placed', detail: 'Oct 24, 2023 • 10:30 AM', state: 'done' },
  { title: 'Processed', detail: 'Oct 24, 2023 • 02:15 PM', state: 'done' },
  { title: 'In Transit', detail: 'En route to your location', state: 'current' },
  { title: 'Out for Delivery', detail: 'Estimated tomorrow', state: 'pending' },
];

const ITEMS = [
  { name: 'TMT Steel Rebars', meta: 'Qty: 50 Units • 12mm Grade', price: '$1,240', gradient: 'from-gray-400 to-gray-600' },
  { name: 'Premium OPC Cement', meta: 'Qty: 20 Bags • 50kg Each', price: '$320', gradient: 'from-[#004aad] to-[#00296b]' },
];

function StepDot({ state }) {
  if (state === 'done') {
    return (
      <div className="z-10 w-6 h-6 rounded-full bg-[#004aad] flex items-center justify-center flex-shrink-0">
        <Check size={14} className="text-white" strokeWidth={3} />
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div className="z-10 w-6 h-6 rounded-full bg-[#d9e2ff] ring-4 ring-[#004aad]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
        <Truck size={13} className="text-[#004aad]" />
      </div>
    );
  }
  return (
    <div className="z-10 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <Clock size={13} className="text-gray-500" />
    </div>
  );
}

export default function OrderStatus() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white shadow-sm flex justify-between items-center h-16 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 transition-colors rounded-full active:scale-95">
            <ArrowLeft size={20} className="text-[#004aad]" />
          </button>
          <h1 className="text-lg font-bold text-[#004aad]">Track Order</h1>
        </div>
        <button onClick={() => navigate('/cart')} className="p-2 hover:bg-gray-100 transition-colors rounded-full active:scale-95">
          <ShoppingCart size={20} className="text-[#004aad]" />
        </button>
      </header>

      <main className="pt-20 px-4 space-y-5">
        {/* Order Header Card */}
        <section className="bg-[#004aad] p-6 rounded-[28px] text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Order Status</p>
            <h2 className="text-2xl font-extrabold mb-4">#DC-88291-JK</h2>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
              <CalendarClock size={22} />
              <div>
                <p className="text-xs opacity-80">Estimated Delivery</p>
                <p className="font-bold">Tomorrow, 9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Tracker */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-5">Delivery Progress</h3>
          <div className="space-y-7">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative flex gap-4">
                {i < STEPS.length - 1 && (
                  <span
                    className={`absolute top-6 left-[11px] w-0.5 -bottom-7 ${
                      step.state === 'done' ? 'bg-[#004aad]' : 'bg-gray-200'
                    }`}
                  />
                )}
                <StepDot state={step.state} />
                <div>
                  <p className={`font-bold ${step.state === 'pending' ? 'text-gray-500' : 'text-[#004aad]'}`}>
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Snippet */}
        <section className="h-48 w-full rounded-[24px] overflow-hidden relative shadow-md bg-gradient-to-br from-gray-200 to-gray-300">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#d9e2ff] flex items-center justify-center">
                <User size={16} className="text-[#004aad]" />
              </div>
              <p className="text-sm font-bold text-[#004aad]">Driver: Michael R.</p>
            </div>
            <button className="bg-[#004aad] text-white px-4 py-1.5 rounded-lg text-sm font-semibold active:scale-95 transition-transform flex items-center gap-2">
              <Phone size={14} />
              Call Driver
            </button>
          </div>
        </section>

        {/* Item Summary */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800 px-1">Order Summary</h3>
          <div className="space-y-3">
            {ITEMS.map((item) => (
              <div key={item.name} className="flex items-center gap-4 bg-gray-100 p-4 rounded-2xl">
                <div className={`w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br ${item.gradient}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.meta}</p>
                </div>
                <p className="font-bold text-[#004aad]">{item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support Action */}
        <section className="pt-2 pb-6">
          <button className="w-full h-14 bg-white border-2 border-[#004aad] text-[#004aad] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#004aad]/5 transition-colors active:scale-95">
            <LifeBuoy size={20} />
            Contact Support
          </button>
        </section>
      </main>

      <BottomNav active="bookings" />
    </div>
  );
}