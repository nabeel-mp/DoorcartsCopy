import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, CalendarClock, Check, Truck, Clock, User, Phone, LifeBuoy, Loader2
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import * as orderService from '../api/orderService'; // Adjust path if needed

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Helper for dynamic steps based on backend status
const generateSteps = (currentStatus, dateString) => {
  const baseDate = dateString 
    ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'Recently';

  const allSteps = [
    { title: 'Order Placed', detail: `${baseDate} • Confirmed`, key: 'pending' },
    { title: 'Processed', detail: 'Order is ready for dispatch', key: 'processing' },
    { title: 'In Transit', detail: 'En route to your location', key: 'shipped' },
    { title: 'Out for Delivery', detail: 'Arriving soon', key: 'out_for_delivery' },
  ];

  // Map typical backend statuses to an index
  const statusMap = {
    'pending': 0,
    'processing': 1,
    'shipped': 2,
    'out for delivery': 3,
    'delivered': 4
  };

  const currentIdx = statusMap[(currentStatus || 'pending').toLowerCase()] || 0;

  return allSteps.map((step, i) => {
    // If order is delivered, all are done. Otherwise, calculate relative to current step.
    if (currentStatus?.toLowerCase() === 'delivered' || i < currentIdx) return { ...step, state: 'done' };
    if (i === currentIdx) return { ...step, state: 'current' };
    return { ...step, state: 'pending' };
  });
};

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
  const { id } = useParams(); 
  const location = useLocation();
  
  // Try to get order ID from URL params, or from navigation state
  const orderId = id || location.state?.orderId;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        let targetOrder = null;

        if (orderId) {
          // Fetch specific order
          const res = await orderService.getOrderById(orderId);
          targetOrder = res.data?.order || res.data || res;
        } else {
          // Fallback: Fetch user's latest order if no ID was provided
          const res = await orderService.getMyOrders();
          const orders = res.data?.orders || res.data || res;
          if (orders && orders.length > 0) {
            targetOrder = orders[0]; // Assume the first is the most recent
          }
        }

        if (targetOrder) {
          setOrder(targetOrder);
        } else {
          setErrorMessage('No order details found.');
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setErrorMessage(error.response?.data?.message || 'Could not load order tracking details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex items-center justify-center bg-[#f9f9fc]">
        <Loader2 className="animate-spin text-[#004aad]" size={32} />
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col items-center justify-center bg-[#f9f9fc] p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <p className="text-red-500 font-bold mb-4">{errorMessage || 'Order not found'}</p>
        <button onClick={() => navigate('/order-history')} className="text-[#004aad] font-bold underline">
          View All Orders
        </button>
      </div>
    );
  }

  // Generate dynamic data mapping based on backend order object
  const steps = generateSteps(order.status, order.createdAt);
  const displayId = order._id ? `#DC-${order._id.substring(order._id.length - 6).toUpperCase()}` : '#DC-UNKNOWN';

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
            <div className="flex justify-between items-center mb-1">
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Order Status</p>
               {order.status === 'Delivered' && (
                 <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Delivered</span>
               )}
            </div>
            <h2 className="text-2xl font-extrabold mb-4">{displayId}</h2>
            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
              <CalendarClock size={22} />
              <div>
                <p className="text-xs opacity-80">Estimated Delivery</p>
                <p className="font-bold">2-4 Business Days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Progress Tracker */}
        <section className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-5">Delivery Progress</h3>
          <div className="space-y-7">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex gap-4">
                {i < steps.length - 1 && (
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

        {/* Map Snippet (Only show if not delivered yet) */}
        {order.status !== 'Delivered' && (
          <section className="h-48 w-full rounded-[24px] overflow-hidden relative shadow-md bg-gradient-to-br from-gray-200 to-gray-300">
            {/* Visual map placeholder */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#004aad 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/95 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#d9e2ff] flex items-center justify-center">
                  <User size={16} className="text-[#004aad]" />
                </div>
                <p className="text-sm font-bold text-[#004aad]">Driver Assigned Soon</p>
              </div>
              <button className="bg-[#004aad] text-white px-4 py-1.5 rounded-lg text-sm font-semibold active:scale-95 transition-transform flex items-center gap-2 opacity-50 cursor-not-allowed">
                <Phone size={14} />
                Call
              </button>
            </div>
          </section>
        )}

        {/* Item Summary */}
        <section className="space-y-3">
          <div className="flex justify-between items-end px-1">
             <h3 className="text-lg font-bold text-gray-800">Order Summary</h3>
             <span className="font-extrabold text-[#004aad]">{formatINR(order.totalAmount || 0)}</span>
          </div>
          <div className="space-y-3">
            {(order.items || []).map((item, index) => {
              const product = item.product || {};
              const price = product.discountPrice > 0 ? product.discountPrice : product.price;
              
              // Fallback gradients
              const fallbackGradients = ['from-gray-400 to-gray-600', 'from-[#004aad] to-[#00296b]'];
              const gradient = fallbackGradients[index % fallbackGradients.length];

              return (
                <div key={product._id || index} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                  <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ${product.image || product.images?.[0] ? 'bg-gray-50' : `bg-gradient-to-br ${gradient}`}`}>
                     {(product.image || product.images?.[0]) && (
                       <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{product.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#004aad]">{formatINR((price || 0) * item.quantity)}</p>
                </div>
              );
            })}
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