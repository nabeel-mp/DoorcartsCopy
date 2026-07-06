import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle2, Truck, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import * as orderService from '../api/orderService';

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        // FIX: Specifically call getMyOrders() so we hit /api/orders/my (Avoids the 403 Admin error)
        const response = await orderService.getMyOrders();
        
        // Safely unwrap data depending on how Axios/Backend is structured
        const data = response.data?.orders || response.data || response || [];
        
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setErrorMessage(error.response?.data?.message || 'Could not load your orders.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusUI = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': 
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', icon: CheckCircle2, label: 'Delivered' };
      case 'shipped':
      case 'out for delivery': 
        return { color: 'text-[#004aad]', bg: 'bg-[#f8fbff]', border: 'border-[#e5edfa]', icon: Truck, label: 'In Transit' };
      default: 
        return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', icon: Clock, label: 'Processing' };
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      {/* Top App Bar */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-[#004aad] shadow-md flex justify-between items-center h-16 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/10 transition-colors rounded-full active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">My Orders</h1>
        </div>
      </header>

      <main className="pt-20 px-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#004aad]" size={32} />
            <p className="text-gray-500 font-medium">Fetching your orders...</p>
          </div>
        ) : errorMessage ? (
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center mt-4">
            <p className="text-red-500 font-bold mb-3">{errorMessage}</p>
            <button onClick={() => window.location.reload()} className="text-[#004aad] font-bold underline">Try Again</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              📦
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders. Start browsing our catalog to find what you need!</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-[#004aad] text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {orders.map((order) => {
              const statusUI = getStatusUI(order.status);
              const StatusIcon = statusUI.icon;
              const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const displayId = order._id ? order._id.substring(order._id.length - 6).toUpperCase() : 'UNKNOWN';

              return (
                <button
                  key={order._id}
                  onClick={() => navigate(`/order-status`, { state: { orderId: order._id } })}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col gap-4 relative overflow-hidden"
                >
                  {/* Status Banner */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${statusUI.bg} border-l-[6px] ${statusUI.border}`} />
                  
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg mb-0.5">Order #DC-{displayId}</h3>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{date}</p>
                    </div>
                    <div className="font-extrabold text-[#004aad] text-lg">
                      {formatINR(order.totalAmount || 0)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 pl-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${statusUI.bg} ${statusUI.color}`}>
                      <StatusIcon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${statusUI.color}`}>{statusUI.label}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {order.items?.length || 0} Item(s)
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav active="bookings" />
    </div>
  );
}