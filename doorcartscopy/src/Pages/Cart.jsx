import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Truck, MinusCircle, PlusCircle, ArrowRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const INITIAL_ITEMS = [
  {
    id: 1,
    name: 'TMT Steel Rebars (12mm)',
    meta: 'Grade: Fe 500D',
    unitPrice: 58400,
    unitLabel: 'ton',
    qty: 2,
    gradient: 'from-gray-400 to-gray-600',
  },
  {
    id: 2,
    name: 'Premium OPC Cement',
    meta: 'Grade 53 | 50kg Bags',
    unitPrice: 450,
    unitLabel: 'bag',
    qty: 50,
    gradient: 'from-[#004aad] to-[#00296b]',
  },
];

const formatINR = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
    [items]
  );
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-44">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-[#004aad] text-white shadow-md flex justify-between items-center px-6 h-16">
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

      <main className="w-full px-5 py-6 space-y-6">
        {/* Cart Items */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Shopping Cart ({items.length} Items)</h2>
          {items.map((item) => (
            <div key={item.id} className="bg-gray-100 rounded-xl p-4 flex gap-4">
              <div className={`w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br ${item.gradient}`} />
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="font-bold text-[#004aad] leading-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.meta}</p>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-bold text-gray-800">
                    {formatINR(item.unitPrice)}{' '}
                    <span className="text-xs font-medium text-gray-500">/ {item.unitLabel}</span>
                  </span>
                  <div className="flex items-center bg-white rounded-full px-2 py-1 gap-3 shadow-sm">
                    <button onClick={() => updateQty(item.id, -1)} className="text-[#004aad] active:scale-90 transition-transform">
                      <MinusCircle size={20} />
                    </button>
                    <span className="font-bold min-w-[20px] text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="text-[#004aad] active:scale-90 transition-transform">
                      <PlusCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Delivery Details */}
        <section className="bg-gray-100 rounded-2xl p-6 space-y-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-[#004aad]">
            <Truck size={20} />
            <h3 className="font-bold text-lg">Delivery Details</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">Estimated Delivery</p>
              <p className="font-bold text-gray-800">Tomorrow, Oct 24th (09:00 AM - 05:00 PM)</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold text-gray-500 uppercase">Delivery Location</p>
              <p className="font-bold text-gray-800">Site A: Sector 62, Noida, UP</p>
            </div>
          </div>
          <button className="w-full py-3 border border-[#004aad] text-[#004aad] rounded-xl font-bold hover:bg-[#004aad]/5 transition-colors">
            Change Address
          </button>
        </section>

        {/* Price Summary */}
        <section className="bg-white rounded-2xl p-6 space-y-3 shadow-md">
          <h3 className="font-bold text-lg border-b border-gray-100 pb-2">Price Details</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal ({items.length} items)</span>
            <span className="font-bold">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">GST (18%)</span>
            <span className="font-bold text-gray-800">{formatINR(gst)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Charges</span>
            <span className="font-bold text-green-600">FREE</span>
          </div>
          <div className="pt-4 mt-2 border-t border-dashed border-gray-300 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total Amount</span>
            <span className="text-xl font-extrabold text-[#004aad]">{formatINR(total)}</span>
          </div>
        </section>
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-20 w-full max-w-md left-1/2 -translate-x-1/2 p-4 bg-[#f9f9fc]/90 backdrop-blur-lg z-40">
        <button
          onClick={() => navigate('/payment')}
          className="w-full bg-[#004aad] text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl"
        >
          Place Order
          <ArrowRight size={20} />
        </button>
      </div>

      <BottomNav active="services" />
    </div>
  );
}