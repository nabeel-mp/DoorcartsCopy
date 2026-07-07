import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import * as cartService from '../api/cartService';
import { useAuth } from '../context/authContext';

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Define Cart Math Constants
  const DELIVERY_FEE = 150;
  const TAX_PERCENTAGE = 0.18; // 18% GST

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fallback response wrapper handling
      const response = await cartService.getCart();
      const items = response.data?.items || response.data?.cart?.items || response.data || [];
      setCartItems(items);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Could not load your cart.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setIsUpdating(true);
      // Assuming your cart API requires the product ID and the absolute new quantity
      await cartService.updateCartItem(productId, newQuantity);
      
      // Update local state instantly for snappy UI
      setCartItems(prev => prev.map(item => 
        (item.product?._id === productId || item.product === productId) 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    } catch (err) {
      console.error("Failed to update quantity", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setIsUpdating(true);
      await cartService.removeFromCart(productId);
      
      // Update local state to remove the item
      setCartItems(prev => prev.filter(item => 
        (item.product?._id !== productId && item.product !== productId)
      ));
    } catch (err) {
      console.error("Failed to remove item", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = () => {
    // Pass the calculated total to the payment screen via router state
    navigate('/payment', { state: { total: grandTotal } });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#f9f9fc] p-6 text-center pb-24">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-[#004aad]" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Please Login</h2>
        <p className="text-gray-500 mb-8">You need an account to view and manage your cart.</p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-[#004aad] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
        >
          Login to Continue
        </button>
        <BottomNav active="services" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-[#f9f9fc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004aad]"></div>
      </div>
    );
  }

  // --- CART MATH ---
  const subtotal = cartItems.reduce((acc, item) => {
    // Handle nested product objects securely
    const price = item.product?.discountPrice > 0 ? item.product.discountPrice : (item.product?.price || 0);
    return acc + (price * item.quantity);
  }, 0);

  const taxes = Math.round(subtotal * TAX_PERCENTAGE);
  const grandTotal = subtotal + taxes + (subtotal > 0 ? DELIVERY_FEE : 0);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-32">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#004aad] shadow-md flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-extrabold text-white">Your Cart</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 text-center">
            {error}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 opacity-60">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-[250px]">Looks like you haven't added any items to your cart yet.</p>
            <button 
              onClick={() => navigate('/home')}
              className="bg-[#004aad] text-white px-8 py-3.5 rounded-xl font-bold active:scale-95 transition-transform"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const prod = item.product || {};
                const currentPrice = prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                const prodId = prod._id || prod;

                return (
                  <div key={item._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden">
                    {/* Image Area */}
                    <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 p-2 relative">
                      <img 
                        src={prod.images?.[0] || prod.image || 'https://placehold.co/150x150/f8fafc/004aad.png?text=Item'} 
                        alt={prod.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Details Area */}
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex justify-between items-start pr-6 mb-1">
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">
                          {prod.name || 'Unknown Product'}
                        </h3>
                      </div>
                      
                      <div className="text-[#004aad] font-black mt-auto text-base">
                        {formatINR(currentPrice)}
                      </div>

                      {/* Controls Area */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 h-8 w-24">
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleUpdateQuantity(prodId, item.quantity - 1)}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="flex-1 text-center font-bold text-sm text-gray-800">
                            {item.quantity}
                          </span>
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleUpdateQuantity(prodId, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button (Absolute top right) */}
                    <button 
                      onClick={() => handleRemoveItem(prodId)}
                      disabled={isUpdating}
                      className="absolute top-3 right-3 p-2 bg-red-50 text-red-500 rounded-full active:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white p-5 rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8">
              <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Order Summary</h3>
              
              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-gray-800">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-800">{formatINR(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax (18% GST)</span>
                  <span className="font-medium text-gray-800">{formatINR(taxes)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 border-dashed flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total</p>
                  <p className="text-2xl font-black text-[#004aad]">{formatINR(grandTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Checkout Bar */}
      {cartItems.length > 0 && !error && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4 pb-safe z-50 shadow-[0_-15px_30px_rgba(0,0,0,0.08)] border-t border-gray-100 rounded-t-3xl">
          <button 
            onClick={handleCheckout}
            className="w-full bg-[#004aad] text-white h-14 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/30"
          >
            Checkout Securely
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}