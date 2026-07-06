import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Menu, Search, ShieldCheck, Ruler, Layers, Minus, Plus, Truck,
  ShoppingCart, Zap as Flash, Loader2, ArrowLeft
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import * as productService from '../api/productService';
import * as cartService from '../api/cartService';

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function ProductDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  // GET /api/products/:slug (or ID fallback)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        // Handle fetching by slug (or ID if your backend accepts it)
        const response = await productService.getProductBySlug(slug);
        
        // Safely unwrap Axios response
        const data = response.data?.product || response.data || response;
        
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.response?.data?.message || 'Product not found.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  const handleScroll = (e) => {
    const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
    setActiveSlide(index);
  };

  // Safe Cart Method (handles if you named it addToCart or addCartItem in your service)
  const executeAddToCart = async (prodId, qty) => {
    if (cartService.addCartItem) {
      return await cartService.addCartItem(prodId, qty);
    } else if (cartService.addToCart) {
      return await cartService.addToCart(prodId, qty);
    } else {
      throw new Error("Cart service method not found");
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsSubmitting(true);
    setFeedback('');
    try {
      await executeAddToCart(product._id, quantity);
      setFeedback('Added to cart!');
      setTimeout(() => navigate('/cart'), 600);
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not add to cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    setIsSubmitting(true);
    setFeedback('');
    try {
      await executeAddToCart(product._id, quantity);
      navigate('/cart');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Could not start checkout.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex items-center justify-center bg-[#f9f9fc]">
        <Loader2 className="animate-spin text-[#004aad]" size={28} />
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col items-center justify-center bg-[#f9f9fc] gap-4 px-6">
        <p className="text-sm text-red-500 text-center">{errorMessage || 'Product not found.'}</p>
        <button onClick={() => navigate('/')} className="text-[#004aad] font-bold text-sm">
          Back to Home
        </button>
      </div>
    );
  }

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  
  // Safely handle both product.images (array) and product.image (string) for legacy records
  const images = product.images?.length 
    ? product.images 
    : product.image 
      ? [product.image] 
      : [null];

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-40">
      {/* Top App Bar */}
      <header className="w-full sticky top-0 z-50 bg-[#004aad] shadow-md flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-white">Doorcarts</h1>
        </div>
        <button className="text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <Search size={20} />
        </button>
      </header>

      <main className="w-full">
        {/* Image Gallery */}
        <section className="relative bg-white border-b border-gray-100">
          <div
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory h-[350px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div key={i} className="flex-shrink-0 w-full snap-center bg-white p-4 flex items-center justify-center">
                {img ? (
                  <img src={img} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl" />
                )}
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    activeSlide === i ? 'bg-[#004aad]' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Product Info Canvas */}
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-white rounded-t-[32px] p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] border-t border-gray-50">
            {/* Title & Badge */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-start gap-3">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">{product.name}</h2>
                {product.discountPrice > 0 && (
                  <span className="bg-[#e5edfa] text-[#004aad] text-[10px] font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap mt-1">
                    On Sale
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#004aad]">{formatINR(price)}</span>
                {product.discountPrice > 0 && (
                  <span className="text-sm text-gray-400 line-through font-medium">{formatINR(product.price)}</span>
                )}
              </div>
              {product.brand && <p className="text-sm text-gray-500 font-medium">by {product.brand}</p>}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8 mt-6">
              {[
                { icon: ShieldCheck, label: 'Stock', value: product.stock > 0 ? `${product.stock} units` : 'Out of stock' },
                { icon: Ruler, label: 'Rating', value: product.ratingsAverage ? `${product.ratingsAverage.toFixed(1)} ★` : 'No ratings' },
                { icon: Layers, label: 'Reviews', value: `${product.ratingsCount || 0}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 border border-gray-100">
                  <Icon size={20} className="text-[#004aad]" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-5 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Select Quantity</label>
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden w-fit bg-gray-50">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-14 text-center font-bold text-lg text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
                    className="p-3 hover:bg-gray-200 text-gray-600 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Estimator */}
            <div className="p-4 bg-[#f8fbff] border border-[#e5edfa] rounded-2xl mb-8 flex items-start gap-3">
              <Truck size={20} className="text-[#004aad] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">
                  Estimated delivery within <span className="font-bold text-[#004aad]">2-4 business days</span>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">Product Details</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description || "No description available for this product."}
              </p>
            </div>

            {feedback && (
              <p className="text-sm text-center text-green-600 font-bold mt-4 p-3 bg-green-50 rounded-lg">{feedback}</p>
            )}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-[72px] left-0 w-full max-w-md mx-auto right-0 bg-white/95 backdrop-blur-md p-4 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 border-t border-gray-100">
        <button
          onClick={handleAddToCart}
          disabled={isSubmitting || product.stock <= 0}
          className="flex-[1] h-14 bg-[#e5edfa] text-[#004aad] font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#d4e2f7]"
        >
          <ShoppingCart size={20} />
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isSubmitting || product.stock <= 0}
          className="flex-[3] h-14 bg-[#004aad] text-white font-bold rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-800 shadow-lg shadow-blue-900/20"
        >
          <Flash size={18} />
          {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
        </button>
      </div>

      <BottomNav active="services" />
    </div>
  );
}