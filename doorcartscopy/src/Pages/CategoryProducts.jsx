import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import * as productService from '../api/productService';
import * as categoryService from '../api/categoryService';

export default function CategoryProducts() {
  // The 'slug' parameter holds the category._id
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Category Name for the Header
        const catRes = await categoryService.getCategories();
        const categories = catRes?.data?.data || catRes?.data || catRes || [];
        const currentCat = categories.find(c => c._id === slug || c.slug === slug);
        if (currentCat) {
          setCategoryName(currentCat.name);
        } else {
          setCategoryName('Products');
        }

        // 2. Fetch Products OPTIMIZED: Let the backend filter by category directly
        // productService.getProducts() returns an object: { products: [...], total, page }
        const prodRes = await productService.getProducts({ category: slug });
        
        // 3. Safely extract the products array from the response object
        let fetchedProducts = [];
        if (prodRes && Array.isArray(prodRes.products)) {
          fetchedProducts = prodRes.products; // Standard response
        } else if (Array.isArray(prodRes)) {
          fetchedProducts = prodRes; // Fallback if API changes
        }

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setCategoryName('Error loading category');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [slug]);

  return (
    <div className="relative w-full max-w-md mx-auto min-h-[100dvh] bg-[#f9f9fc] font-sans">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#004aad] shadow-md flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-extrabold text-white truncate max-w-[200px]">
            {categoryName}
          </h1>
        </div>
        <button 
          onClick={() => navigate('/cart')} 
          className="text-white p-2 rounded-full hover:bg-white/10 transition-colors relative"
        >
          <ShoppingCart size={22} />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-20">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004aad]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <ShoppingCart size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-semibold text-gray-500">No products found</p>
            <p className="text-sm">Check back later for new stock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <div 
                key={product._id} 
                onClick={() => navigate(`/product/${product._id}`)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:scale-95 transition-transform cursor-pointer flex flex-col"
              >
                {/* Product Image */}
                <div className="h-32 bg-gray-50 flex items-center justify-center p-2 relative">
                  <img 
                    src={product.images?.[0] || 'https://via.placeholder.com/150'} 
                    alt={product.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                  />
                  {product.discountPrice && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                      SALE
                    </span>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-gray-600">4.5</span>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#004aad]">
                        ₹{product.discountPrice || product.price}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through font-medium">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}