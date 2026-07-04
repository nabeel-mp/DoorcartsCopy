import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, ShieldCheck, Ruler, Layers, Minus, Plus, Truck,
  Shield, Zap, ShoppingCart, Zap as Flash,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

const DIAMETERS = ['8mm', '10mm', '12mm', '16mm', '20mm'];

export default function ProductDetails() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [diameter, setDiameter] = useState('8mm');
  const [bulkInquiry, setBulkInquiry] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
    setActiveSlide(index);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-40">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-[#004aad] shadow-md flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-white">Doorcarts</h1>
        </div>
        <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <Search size={20} />
        </button>
      </header>

      <main className="w-full">
        {/* Image Gallery */}
        <section className="relative bg-gray-100">
          <div
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory h-[300px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-full snap-center bg-gradient-to-br ${
                  i === 0 ? 'from-gray-400 to-gray-600' : 'from-[#004aad] to-[#00296b]'
                }`}
              />
            ))}
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeSlide === i ? 'bg-[#004aad]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Product Info Canvas */}
        <div className="px-5 -mt-8 relative z-10">
          <div className="bg-white rounded-t-[32px] p-6 shadow-sm">
            {/* Title & Badge */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-start gap-3">
                <h2 className="text-xl font-bold text-gray-800">Premium TMT Steel Rebars</h2>
                <span className="bg-[#e5edfa] text-[#004aad] text-[10px] font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap">
                  Bulk Savings
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#004aad]">₹58,450</span>
                <span className="text-sm text-gray-500">/ ton (incl. GST)</span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: ShieldCheck, label: 'Grade', value: 'Fe 500D' },
                { icon: Ruler, label: 'Diameter', value: '8-32mm' },
                { icon: Layers, label: 'Length', value: '12m' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                  <Icon size={20} className="text-[#004aad]" />
                  <span className="text-[10px] font-semibold text-gray-500">{label}</span>
                  <span className="text-sm font-bold text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Selectors */}
            <div className="space-y-5 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Select Diameter</label>
                <div className="flex flex-wrap gap-2">
                  {DIAMETERS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiameter(d)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                        diameter === d
                          ? 'border-2 border-[#004aad] bg-[#e5edfa] text-[#004aad]'
                          : 'border border-gray-200 text-gray-600 hover:border-[#004aad]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">Bulk Inquiry</span>
                  <span className="text-sm text-gray-500">Need more than 10 tons?</span>
                </div>
                <button
                  onClick={() => setBulkInquiry(!bulkInquiry)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${bulkInquiry ? 'bg-[#004aad]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      bulkInquiry ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Quantity (Tons)</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-50 text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="flex-1 text-center font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 hover:bg-gray-50 text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Estimator */}
            <div className="p-4 bg-gray-50 rounded-2xl mb-8 flex items-start gap-3">
              <Truck size={20} className="text-[#004aad] mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">Delivering to</span>
                  <span className="text-sm font-bold text-[#004aad]">Mumbai, 400001</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Estimated delivery by <span className="font-bold text-gray-800">Tomorrow, 2:00 PM</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Product Details</h3>
              <div className="space-y-4 text-gray-600 text-sm">
                <p>
                  Our Premium Fe 500D TMT Steel Rebars are manufactured using the latest
                  Thermo-Mechanical Treatment technology, ensuring superior structural strength and ductility.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-3">
                    <Shield size={20} className="text-[#004aad] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Corrosion Resistant</h4>
                      <p className="text-sm">Specialized coating and chemistry to prevent rust in humid climates.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Zap size={20} className="text-[#004aad] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-800">Earthquake Proof</h4>
                      <p className="text-sm">High elongation properties (14.5%+) for seismic safety.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-20 left-0 w-full max-w-md mx-auto right-0 bg-white/90 backdrop-blur-md p-4 flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <button
          onClick={() => navigate('/cart')}
          className="flex-1 h-14 border-2 border-[#004aad] text-[#004aad] font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Add to Cart
        </button>
        <button
          onClick={() => navigate('/payment')}
          className="flex-[1.5] h-14 bg-[#004aad] text-white font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Flash size={18} />
          Buy Now
        </button>
      </div>

      <BottomNav active="services" />
    </div>
  );
}