import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Lock, ShoppingBag, CreditCard, Wallet, QrCode, ChevronRight,
  Landmark, Truck, ShieldCheck, ShieldAlert, Loader2, CheckCircle2,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

// Load Razorpay Script
const loadRazorpaySDK = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('saved-card');
  const [status, setStatus] = useState('idle');

  // Receive data from Cart page (Fallback values provided)
  const { totalAmount = 164374, cartItems = [], deliveryAddress = 'Site A' } = location.state || {};

  const handlePayNow = async () => {
    setStatus('processing');
    
    // 1. Load Razorpay
    const res = await loadRazorpaySDK();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setStatus('idle');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');

      // 2. Create Order on Backend
      const orderResponse = await axios.post('http://localhost:5000/api/payments/create-order', {
        amount: totalAmount,
        items: cartItems,
        deliveryAddress
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { id: order_id, amount, currency } = orderResponse.data.order;

      // 3. Open Razorpay Checkout
      const options = {
        key: "rzp_test_YOUR_KEY_HERE", // ** REPLACE WITH YOUR RAZORPAY KEY ID **
        amount: amount.toString(),
        currency: currency,
        name: "Doorcarts",
        description: "Payment for Materials",
        order_id: order_id,
        handler: async function (response) {
          try {
            // 4. Verify Payment on Backend
            const verifyRes = await axios.post('http://localhost:5000/api/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (verifyRes.data.success) {
              setStatus('success');
              setTimeout(() => navigate('/order-status'), 1500);
            }
          } catch (err) {
            alert("Payment Verification Failed");
            setStatus('idle');
          }
        },
        prefill: {
          name: "Customer", // Can fetch from localstorage
          contact: "9999999999",
        },
        theme: { color: "#004aad" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
        setStatus('idle');
      });

    } catch (error) {
      console.error(error);
      alert('Could not initiate payment. Try again.');
      setStatus('idle');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-44">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 shadow-md bg-[#004aad] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10">
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
        <section className={`rounded-xl p-6 mb-8 text-white shadow-sm transition-all ${status === 'success' ? 'bg-green-600 ring-4 ring-green-400' : 'bg-[#004aad]'}`}>
          <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Total Amount Payable</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold">₹{totalAmount.toLocaleString('en-IN')}</span>
            <span className="text-sm opacity-90">Inc. GST</span>
          </div>
        </section>

        {/* ... (Keep your Payment Methods UI HTML exactly the same here) ... */}

      </main>

      <div className="fixed bottom-20 left-0 w-full max-w-md mx-auto bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.05)] px-5 py-4 z-40">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-500 uppercase">To be paid</span>
            <span className="text-lg font-bold text-[#004aad]">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <button
            onClick={handlePayNow}
            disabled={status !== 'idle'}
            className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 text-white ${status === 'success' ? 'bg-green-600' : 'bg-[#004aad]'}`}
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