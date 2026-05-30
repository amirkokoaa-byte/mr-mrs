import React, { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Product, Category } from '../types';
import { Bell, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { store } from '../store';
import { calculatePrice } from '../utils';

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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'flash'>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setCategories(store.getCategories());
    const timer = setTimeout(() => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const activeProducts = products.filter(p => !p.isArchived);

  // Marquee filter:
  const specialOfferProducts = activeProducts.filter(p => p.showInSpecialOffers);

  const filteredProducts = activeProducts.filter(p => {
    if (searchQuery && !p.name.includes(searchQuery) && !p.description.includes(searchQuery)) return false;
    
    if (selectedFilter === 'flash') {
      return p.offerEndTime && new Date(p.offerEndTime).getTime() > Date.now();
    }
    
    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

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
            <span className="font-semibold text-sm">عرض خاص! منتجات حصرية تنتظرك.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      <div className="relative overflow-hidden h-[160px] m-[15px] rounded-[12px] border border-white/5 flex items-center justify-center bg-black">
        <img 
          src={bannerImage || undefined} 
          alt="Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative text-center z-20 pointer-events-none">
             <h1 className="text-[28px] md:text-[32px] font-bold m-0 text-white drop-shadow-md">أحدث صيحات الموضة</h1>
             <p className="text-[14px] opacity-90 m-0 text-white mt-1 drop-shadow-md">اكتشف التشكيلة الجديدة الآن</p>
        </div>
      </div>

      {/* Special Offers Marquee */}
      {specialOfferProducts.length > 0 && (
        <div className="mb-4">
          <div className="px-5 mb-2 flex items-center gap-2 text-[#ff4444] font-bold">
            <Flame size={18} className="animate-pulse" />
            عروض حصرية
          </div>
          <div className="overflow-hidden whitespace-nowrap py-4 bg-white/5 border-y border-white/10 relative group">
            <div className="inline-block animate-[scroll_20s_linear_infinite] px-4 group-hover:[animation-play-state:paused] group-active:[animation-play-state:paused] touch-pan-y">
              {specialOfferProducts.map(p => {
                const isFlashActive = p.offerEndTime && new Date(p.offerEndTime).getTime() > Date.now();
                return (
                  <div key={p.id} onClick={() => onProductClick(p)} className="inline-flex flex-col mx-3 w-32 cursor-pointer group">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2">
                       {p.discount > 0 && <span className="absolute top-0 right-0 bg-[#ff4444] text-white text-[10px] font-bold px-2 py-1 z-10 m-1 rounded shadow-md">-{p.discount}%</span>}
                       <img src={p.imageUrl || undefined} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => e.currentTarget.src = 'https://placehold.co/400x400?text=Facebook+Link'} />
                    </div>
                    <div className="text-center font-bold text-sm truncate w-full">{p.name}</div>
                    <div className="text-center">
                       {p.discount > 0 ? (
                         <>
                           <span className="text-[#ff4444] font-bold">{calculatePrice(p.price, p.discount)} ج.م</span>
                           <span className="text-gray-500 text-xs line-through mr-1 block">{p.price} ج.م</span>
                         </>
                       ) : (
                         <span className="font-bold">{p.price} ج.م</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex px-[15px] gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
         <button 
           onClick={() => setSelectedFilter('all')}
           className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${selectedFilter === 'all' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}
         >
           الكل
         </button>
         <button 
           onClick={() => setSelectedFilter('flash')}
           className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors flex items-center gap-1 ${selectedFilter === 'flash' ? 'bg-[#ff4444] text-white' : 'bg-white/10 hover:bg-white/20 text-[#ff4444]'}`}
         >
           <Flame size={16} /> فلاش (Flash)
         </button>
      </div>

      {/* Product Grid */}
      <div className="flex-1 px-[15px] pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold border-r-4 border-white pr-4">{searchQuery ? `نتائج البحث عن: ${searchQuery}` : selectedFilter === 'flash' ? 'عروض لفترة محدودة' : 'أحدث المنتجات'}</h2>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center text-[#888] py-20 bg-white/5 rounded-xl border border-dashed border-white/20">
             لا توجد منتجات فى هذا القسم حالياً.
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
