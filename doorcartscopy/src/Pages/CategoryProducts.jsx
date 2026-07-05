import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import * as categoryService from '../api/categoryService';
import * as productService from '../api/productService';

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function CategoryProducts() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        // GET /api/categories/:slug
        const cat = await categoryService.getCategoryBySlug(slug);
        if (cancelled) return;
        setCategory(cat);

        // GET /api/products?category=<categoryId>
        const { products: items } = await productService.getProducts({ category: cat._id });
        if (!cancelled) setProducts(items);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.response?.data?.message || 'Could not load this category.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans pb-24">
      <header className="w-full sticky top-0 z-50 bg-[#004aad] shadow-md flex items-center gap-3 px-4 h-16">
        <button onClick={() => navigate(-1)} className="text-white p-2 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-extrabold text-white truncate">
          {category?.name || 'Category'}
        </h1>
        <button onClick={() => navigate('/cart')} className="ml-auto text-white p-2 rounded-full hover:bg-white/10">
          <ShoppingCart size={20} />
        </button>
      </header>

      <main className="px-5 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#004aad]" size={28} />
          </div>
        ) : errorMessage ? (
          <p className="text-center text-sm text-red-500 py-10">{errorMessage}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => {
              const price = product.discountPrice > 0 ? product.discountPrice : product.price;
              return (
                <button
                  key={product._id}
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow"
                >
                  <div className="h-28 bg-gray-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-extrabold text-[#004aad]">{formatINR(price)}</span>
                      {product.discountPrice > 0 && (
                        <span className="text-xs text-gray-400 line-through">{formatINR(product.price)}</span>
                      )}
                    </div>
                    {product.stock <= 0 && (
                      <span className="text-[10px] font-bold text-red-500 uppercase">Out of stock</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav active="services" />
    </div>
  );
}