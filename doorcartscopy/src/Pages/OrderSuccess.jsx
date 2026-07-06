import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#004aad] text-white p-6 text-center font-sans">
      <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce shadow-xl">
        <CheckCircle size={70} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-extrabold mb-4">Payment Successful!</h1>
      <p className="text-lg opacity-90 mb-10 max-w-sm">
        Thank you for your order. Your payment has been secured and the order is being processed.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/order-status', { state: { orderId } })}
          className="w-full bg-white text-[#004aad] font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          Track Order
        </button>
        <button
          onClick={() => navigate('/home')}
          className="w-full bg-transparent border-2 border-white text-white font-bold py-4 rounded-xl active:scale-95 transition-transform"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}