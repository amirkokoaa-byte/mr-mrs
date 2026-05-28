import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StoreFront = ({ 
  bannerImage, 
  products, 
  onProductClick,
  likedProductIds,
  onLikeToggle,
  searchQuery
}: { 
  bannerImage: string, 
  products: Product[],
  onProductClick: (p: Product) => void,
  likedProductIds: string[],
  onLikeToggle: (e: React.MouseEvent, p: Product) => void,
  searchQuery: string
}) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Smart notifications simulation
    const timer = setTimeout(() => {
       setShowNotification(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(p => p.name.includes(searchQuery) || p.description.includes(searchQuery));

  return (
    <div className="flex flex-col flex-1 pb-16 relative">
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-[#ff4444] text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-3 cursor-pointer"
            onClick={() => setShowNotification(false)}
          >
            <Bell size={20} className="animate-bounce" />
            <span className="font-semibold text-sm">عرض خاص! خصم إضافي 10% اليوم فقط.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative overflow-hidden h-[160px] m-[15px] rounded-[12px] border border-white/5 flex items-center justify-center bg-black">
        <img 
          src={bannerImage} 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative text-center z-20 pointer-events-none">
             <h1 className="text-[28px] md:text-[32px] font-bold m-0 text-white drop-shadow-md">أحدث صيحات الموضة</h1>
             <p className="text-[14px] opacity-90 m-0 text-white mt-1 drop-shadow-md">خصومات تصل إلى 50% على المجموعة الشتوية</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 p-[15px]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold border-r-4 border-white pr-4">{searchQuery ? `نتائج البحث عن: ${searchQuery}` : 'أحدث المنتجات'}</h2>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center text-[#888] py-20 bg-white/5 rounded-xl border border-dashed border-white/20">
             لا توجد منتجات حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onClick={() => onProductClick(p)} 
                isLiked={likedProductIds.includes(p.id)}
                onLikeToggle={onLikeToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
