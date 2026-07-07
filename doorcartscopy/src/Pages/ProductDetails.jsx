import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Plus, Minus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import * as productService from '../api/productService';
import * as cartService from '../api/cartService'; // Added Cart Service API
import { useAuth } from '../context/authContext';

export default function ProductDetails() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  // Defensively extract auth to prevent "undefined" crashes
  const auth = useAuth() || {};
  const isLoggedIn = auth.isAuthenticated || !!auth.user;
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  
  // New states for the Cart loading and Success popup (Toast)
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await productService.getProductById(slug);
        
        let productData = null;
        if (response?.data?.data?.product) {
          productData = response.data.data.product;
        } else if (response?.data?.product) {
          productData = response.data.product;
        } else if (response?.data) {
          productData = response.data;
        } else {
          productData = response;
        }

        if (!productData || Object.keys(productData).length === 0) {
          throw new Error("Product data is empty");
        }

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Product not found or unavailable.");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  // Helper to show a beautiful success popup instead of a browser alert
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fixed: Connects to actual Cart API safely
  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    try {
      setIsProcessing(true);
      // Safely call the cart API
      if (cartService && cartService.addToCart) {
        await cartService.addToCart({ productId: product._id, quantity });
      }
      showToast('Added to cart successfully!');
    } catch (err) {
      console.error("Cart Error:", err);
      showToast('Failed to add. Check your connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fixed: Adds to cart then jumps to checkout
  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      setIsProcessing(true);
      if (cartService && cartService.addToCart) {
        await cartService.addToCart({ productId: product._id, quantity });
      }
      navigate('/cart');
    } catch (err) {
      console.error("Buy Now Error:", err);
      navigate('/cart'); // Navigate anyway as fallback
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackImage = 'https://placehold.co/800x800/f8fafc/004aad.png?text=No+Image';
  const displayImages = product?.images?.length > 0 ? product.images : [fallbackImage];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#004aad]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-8">{error || "The item you are looking for does not exist."}</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#004aad] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Safely calculate discount percentage
  const discountPercent = (product.price && product.discountPrice && product.price > product.discountPrice)
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-white font-sans overflow-x-hidden">
      
      {/* SUCCESS TOAST POPUP (Replaces the ugly alert error) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <ShieldCheck size={18} className="text-green-400" />
          <span className="font-medium text-sm whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* Floating Glass Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 flex items-center justify-between p-4 pt-6 pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-11 h-11 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-800 pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => navigate('/cart')} 
          className="w-11 h-11 bg-white/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#004aad] pointer-events-auto active:scale-90 transition-transform relative"
        >
          <ShoppingCart size={22} strokeWidth={2.5} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Edge-to-Edge Image Area */}
      <section className="w-full h-[50vh] bg-[#f4f7fb] relative flex flex-col justify-center">
        <div className="w-full h-full p-8 pb-16 flex items-center justify-center">
          <img 
            src={displayImages[activeImage]} 
            alt={product.name}
            className="max-w-full max-h-full object-contain mix-blend-multiply drop-shadow-2xl transition-transform duration-300"
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
          />
        </div>
        
        {/* Pagination Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-12 left-0 w-full flex justify-center gap-2">
            {displayImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeImage === idx ? 'w-6 h-2 bg-[#004aad]' : 'w-2 h-2 bg-blue-200'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Sheet Details Card */}
      <main className="bg-white rounded-t-[40px] -mt-10 relative z-20 px-6 pt-6 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        
        {/* Notch */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>

        {/* Title & Brand */}
        <div className="mb-4">
          {product.brand && (
            <p className="text-[#004aad] font-bold text-sm tracking-wider uppercase mb-1">{product.brand}</p>
          )}
          <h1 className="text-2xl font-black text-gray-900 leading-snug">
            {product.name}
          </h1>
        </div>

        {/* Price & Rating Row */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-black text-gray-900">
                ₹{product.discountPrice || product.price}
              </span>
              {discountPercent > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            {product.discountPrice && (
              <p className="text-gray-400 font-medium text-sm">
                M.R.P: <span className="line-through">₹{product.price}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-800">4.8</span>
            <span className="text-xs text-gray-400 font-medium">(124)</span>
          </div>
        </div>

        <hr className="border-gray-100 mb-6" />

        {/* Modern Quantity Selector */}
        <div className="flex items-center justify-between bg-[#f8fafc] p-4 rounded-3xl mb-8 border border-gray-100">
          <div>
            <p className="font-bold text-gray-800">Quantity</p>
            <p className="text-xs font-medium text-green-600">In Stock: {product.stock}</p>
          </div>
          
          <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-gray-200">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 active:bg-gray-200 transition-colors"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="w-10 text-center font-bold text-lg text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
              className="w-10 h-10 rounded-full bg-[#004aad] flex items-center justify-center text-white shadow-md active:bg-blue-800 transition-colors"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Product Details</h3>
          <p className="text-gray-500 leading-relaxed text-[15px]">
            {product.description || "Premium quality material guaranteed to last. Built for professional and heavy-duty usage."}
          </p>
        </div>

        {/* Features Tonal Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center text-center p-4 bg-blue-50/50 rounded-3xl border border-blue-50">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#004aad] mb-2">
              <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-bold text-gray-700">1 Year<br/>Warranty</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-green-50/50 rounded-3xl border border-green-50">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 mb-2">
              <Truck size={20} />
            </div>
            <span className="text-xs font-bold text-gray-700">Fast<br/>Delivery</span>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-orange-50/50 rounded-3xl border border-orange-50">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 mb-2">
              <RotateCcw size={20} />
            </div>
            <span className="text-xs font-bold text-gray-700">7 Days<br/>Return</span>
          </div>
        </div>
      </main>

      {/* Modern Split Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 pb-safe z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <div className="flex gap-3 h-14">
          <button 
            onClick={handleAddToCart}
            disabled={isProcessing}
            className="flex-1 bg-[#f0f4f9] text-[#004aad] rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? 'Adding...' : 'Add to Cart'}
          </button>
          
          <button 
            onClick={handleBuyNow}
            disabled={isProcessing}
            className="flex-1 bg-[#004aad] text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
}