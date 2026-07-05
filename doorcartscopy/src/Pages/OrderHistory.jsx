import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Menu, ShoppingCart, CheckCircle2, XCircle, Repeat, ChevronRight, LifeBuoy, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const FILTERS = ['All', 'Ongoing', 'Completed', 'Cancelled'];
const STATUS_META = {
  Ongoing: { color: 'text-[#004aad]', dot: true },
  Completed: { color: 'text-emerald-600', icon: CheckCircle2 },
  Cancelled: { color: 'text-red-500', icon: XCircle },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- API: FETCH ORDERS ---
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        // Replace with your actual orders GET route
        const res = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data.orders);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const visibleOrders = useMemo(
    () => (filter === 'All' ? orders : orders.filter((o) => o.status === filter)),
    [filter, orders]
  );

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-white font-sans pb-24">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white shadow-sm flex justify-between items-center h-16 px-5">
        <div className="flex items-center gap-3">
          <button className="text-[#004aad] p-2"><Menu size={20} /></button>
          <h1 className="text-xl font-extrabold text-[#004aad]">My Orders</h1>
        </div>
        <button onClick={() => navigate('/cart')} className="text-[#004aad] p-2"><ShoppingCart size={20} /></button>
      </header>

      <main className="pt-20 px-5 pb-6 space-y-6">
        <div className="flex items-center gap-3 overflow-x-auto py-1 [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${filter === f ? 'bg-[#004aad] text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#004aad]" /></div>
          ) : visibleOrders.length > 0 ? (
            visibleOrders.map((order) => {
              const meta = STATUS_META[order.status] || STATUS_META['Ongoing'];
              const StatusIcon = meta.icon;
              return (
                <div key={order._id} className="bg-white p-5 rounded-[24px] shadow-sm border border-[#004aad]/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className={`flex items-center gap-2 ${meta.color}`}>
                        {meta.dot && <span className="w-2 h-2 rounded-full bg-[#004aad] animate-pulse" />}
                        {StatusIcon && <StatusIcon size={16} />}
                        <span className="text-sm font-bold">{order.status}</span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-[#004aad]">₹{order.totalAmount}</p>
                  </div>
                  <button onClick={() => navigate('/order-status')} className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              );
            })
          ) : (
             <p className="text-center text-gray-400 py-10 text-sm">No orders in this category.</p>
          )}
        </div>
      </main>
      <BottomNav active="bookings" />
    </div>
  );
}