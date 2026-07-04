import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, CheckCircle2, XCircle, Repeat, ChevronRight, LifeBuoy } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const ORDERS = [
  {
    id: '#DC-8829', date: 'Oct 24, 2023', status: 'Ongoing', amount: '$124.50',
    note: 'Arriving in 12 mins', itemCount: 4,
  },
  {
    id: '#DC-7741', date: 'Oct 20, 2023', status: 'Completed', amount: '$89.20',
    note: 'Great experience!', itemCount: 1,
  },
  {
    id: '#DC-6522', date: 'Oct 15, 2023', status: 'Completed', amount: '$215.10',
    note: '7 items delivered', itemCount: 7,
  },
  {
    id: '#DC-5411', date: 'Oct 02, 2023', status: 'Cancelled', amount: '$42.00',
    note: 'Refund processed', itemCount: 1,
  },
];

const FILTERS = ['All', 'Ongoing', 'Completed', 'Cancelled'];

const STATUS_META = {
  Ongoing: { color: 'text-[#004aad]', dot: true },
  Completed: { color: 'text-emerald-600', icon: CheckCircle2 },
  Cancelled: { color: 'text-red-500', icon: XCircle },
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [reordering, setReordering] = useState(null);

  const visibleOrders = useMemo(
    () => (filter === 'All' ? ORDERS : ORDERS.filter((o) => o.status === filter)),
    [filter]
  );

  const handleReorder = (id) => {
    setReordering(id);
    setTimeout(() => setReordering(null), 1800);
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-white font-sans pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white shadow-sm flex justify-between items-center h-16 px-5">
        <div className="flex items-center gap-3">
          <button className="text-[#004aad] p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-[#004aad]">My Orders</h1>
        </div>
        <button onClick={() => navigate('/cart')} className="text-[#004aad] p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart size={20} />
        </button>
      </header>

      <main className="pt-20 px-5 pb-6 space-y-6">
        {/* Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                filter === f ? 'bg-[#004aad] text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const meta = STATUS_META[order.status];
            const StatusIcon = meta.icon;
            return (
              <div
                key={order.id}
                className={`bg-white p-5 rounded-[24px] shadow-[0_4px_20px_-2px_rgba(0,53,127,0.08)] border ${
                  order.status === 'Cancelled' ? 'border-transparent opacity-80' : 'border-[#004aad]/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{order.date} • {order.id}</p>
                    <div className={`flex items-center gap-2 ${meta.color}`}>
                      {meta.dot && <span className="w-2 h-2 rounded-full bg-[#004aad] animate-pulse" />}
                      {StatusIcon && <StatusIcon size={16} />}
                      <span className="text-sm font-bold">{order.status}</span>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${order.status === 'Cancelled' ? 'text-gray-500' : 'text-[#004aad]'}`}>
                    {order.amount}
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-3">
                    {Array.from({ length: Math.min(2, order.itemCount) }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 w-12 rounded-xl ring-4 ring-white bg-gradient-to-br from-gray-300 to-gray-400"
                      />
                    ))}
                    {order.itemCount > 2 && (
                      <div className="flex items-center justify-center h-12 w-12 rounded-xl ring-4 ring-white bg-gray-200 text-gray-600 text-xs font-bold">
                        +{order.itemCount - 2}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 italic">{order.note}</p>
                </div>

                {order.status === 'Cancelled' ? (
                  <button className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95">
                    View Cancellation Details
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate('/order-status')}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      View Details
                    </button>
                    {order.status === 'Ongoing' ? (
                      <button
                        onClick={() => navigate('/order-status')}
                        className="w-full py-3 px-4 rounded-xl bg-[#004aad] text-white text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                      >
                        Track Order
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReorder(order.id)}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                          reordering === order.id ? 'bg-emerald-600 text-white' : 'bg-[#e5edfa] text-[#004aad] hover:opacity-90'
                        }`}
                      >
                        <Repeat size={16} className={reordering === order.id ? 'animate-spin' : ''} />
                        {reordering === order.id ? 'Added!' : 'Reorder'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {visibleOrders.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No orders in this category.</p>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-[#d9e2ff] p-5 rounded-[24px] flex items-center gap-4">
          <div className="bg-[#004aad] p-3 rounded-2xl flex-shrink-0">
            <LifeBuoy size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[#001945] mb-0.5">Need help?</p>
            <p className="text-sm text-[#454747]">Our support team is available 24/7</p>
          </div>
          <ChevronRight size={20} className="ml-auto text-[#001945] flex-shrink-0" />
        </div>
      </main>

      <BottomNav active="bookings" />
    </div>
  );
}