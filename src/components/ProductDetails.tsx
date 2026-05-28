import React, { useEffect, useState } from 'react';
import { Product, Review } from '../types';
import { calculatePrice } from '../utils';
import { ShoppingCart, Heart, ArrowRight, Share2, Star, Upload } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { motion } from 'motion/react';
import { store } from '../store';

export const ProductDetails = ({ 
  product, 
  allProducts,
  onBack,
  onAddToCart,
  isLiked,
  onLikeToggle,
  onProductClick,
  likedProductIds
}: { 
  product: Product, 
  allProducts: Product[],
  onBack: () => void,
  onAddToCart: (p: Product) => void,
  isLiked: boolean,
  onLikeToggle: (e: React.MouseEvent, p: Product) => void,
  onProductClick: (p: Product) => void,
  likedProductIds: string[]
}) => {
  const currentPrice = calculatePrice(product.price, product.discount);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImage, setReviewImage] = useState('');
  
  // Basic recommendation logic (same category or random)
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || true))
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح');
    }
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Review = {
      id: Date.now().toString(),
      username: 'عميل المتجر',
      rating: reviewRating,
      comment: reviewText,
      imageUrl: reviewImage,
      date: new Date().toLocaleDateString('ar-EG')
    };
    const updatedProduct = { ...product, reviews: [...(product.reviews || []), newReview] };
    store.saveProduct(updatedProduct);
    setReviewText('');
    setReviewImage('');
    setReviewRating(5);
  };

  return (
    <div className="flex-1 pb-16 bg-[#1a1a1a]">
      <div className="container mx-auto p-4 md:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowRight size={20} />
          <span>العودة للمتجر</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-[#2d2d2d] p-6 md:p-12 rounded-2xl border border-white/5">
          {/* Image */}
          <div className="relative rounded-xl overflow-hidden bg-[#3d3d3d] border border-white/5 aspect-square">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            {product.discount > 0 && (
              <div className="absolute top-[10px] right-[10px] bg-[#ff4444] text-white px-3 py-1 font-bold rounded-[4px] text-lg z-10 shadow-md">
                خصم {product.discount}%
              </div>
            )}
            <button 
              onClick={(e) => onLikeToggle(e, product)}
              className="absolute bottom-[10px] left-[10px] bg-black/40 p-3 rounded-full hover:bg-black/60 z-10 transition-colors shadow-lg"
            >
              <Heart size={28} className={isLiked ? "fill-[#ff4444] text-[#ff4444]" : "text-gray-300"} />
            </button>
            <button onClick={handleShare} className="absolute bottom-[10px] left-[60px] bg-black/40 p-3 rounded-full hover:bg-black/60 z-10 transition-colors shadow-lg text-gray-300 hover:text-white">
              <Share2 size={24} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-2 text-[#ffc107] mb-4">
              {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
              <span className="text-sm text-gray-400 mr-2">({(product.reviews?.length || 0)} تقييمات)</span>
            </div>
            
            <p className="text-gray-400 text-lg mb-8 leading-relaxed whitespace-pre-line">{product.description}</p>
            
            <div className="flex items-end gap-4 mb-8 bg-white/5 p-6 rounded-xl border border-white/10">
              <span className="text-4xl font-bold text-white">{currentPrice.toFixed(0)} ج.م</span>
              {product.discount > 0 && (
                <del className="text-xl font-medium text-gray-500 mb-1">{product.price.toFixed(0)} ج.م</del>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">الألوان المتاحة:</h3>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/5 rounded-[6px] text-sm border border-white/10">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-medium mb-3">المقاسات المتاحة:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s, i) => (
                    <span key={i} className="px-4 py-1.5 bg-white/5 rounded-[6px] text-sm font-mono border border-white/10 min-w-[40px] text-center">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => onAddToCart(product)}
              className="w-full bg-white text-black flex items-center justify-center gap-3 py-4 rounded-xl text-xl font-bold hover:bg-gray-200 transition-colors shadow-[0_10px_20px_rgba(255,255,255,0.1)] mt-auto"
            >
              <ShoppingCart size={24} />
              اضف إلى السلة
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 bg-[#2d2d2d] p-6 md:p-12 rounded-2xl border border-white/5 gap-8 grid grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4">تقييمات العملاء</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
              {(!product.reviews || product.reviews.length === 0) ? (
                <div className="text-gray-500 text-center py-8">لا توجد تقييمات بعد. كن أول من يقيّم!</div>
              ) : (
                product.reviews.map(r => (
                  <div key={r.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold">{r.username}</div>
                      <div className="text-xs text-gray-500">{r.date}</div>
                    </div>
                    <div className="flex gap-1 text-[#ffc107] mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= r.rating ? "currentColor" : "none"} className={s > r.rating ? "text-gray-600" : ""} />)}
                    </div>
                    <p className="text-sm text-gray-300">{r.comment}</p>
                    {r.imageUrl && <img src={r.imageUrl} alt="Review attachment" className="mt-4 rounded-lg w-24 h-24 object-cover border border-white/10" />}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 h-fit">
            <h4 className="font-bold mb-4">أضف تقييمك</h4>
            <form onSubmit={submitReview} className="space-y-4">
               <div>
                  <label className="text-sm text-gray-400 mb-2 block">التقييم</label>
                  <div className="flex gap-2 text-[#ffc107]">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={24} fill={s <= reviewRating ? "currentColor" : "none"} className={`cursor-pointer ${s > reviewRating ? "text-gray-600" : ""}`} onClick={() => setReviewRating(s)} />
                    ))}
                  </div>
               </div>
               <textarea required value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="اكتب رأيك في المنتج..." className="w-full bg-black/40 border border-white/10 rounded-lg p-3 min-h-[100px] focus:outline-none focus:border-white/30 text-sm" />
               <div>
                 <label className="bg-black/40 flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer hover:bg-black/60 transition-colors border border-white/10 text-sm">
                   <Upload size={18} /> {reviewImage ? 'تم اختيار الصورة' : 'إضافة صورة لتقييمك'}
                   <input type="file" accept="image/*" className="hidden" onChange={handleReviewImageUpload} />
                 </label>
                 {reviewImage && <img src={reviewImage} alt="preview" className="mt-2 h-16 rounded object-cover" />}
               </div>
               <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">إرسال التقييم</button>
            </form>
          </div>
        </div>

        {/* Similar Products Marquee */}
        {similarProducts.length > 0 && (
          <div className="mt-20 overflow-hidden relative bg-white/5 p-[10px] rounded-[10px]">
            <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">مقترحات تهمك:</h2>
            <div className="group relative flex overflow-x-hidden p-4">
              <motion.div 
                className="flex gap-6 min-w-full"
                animate={{ x: [0, 1035] }} // Simple animation moving left to right for RTL, tweak as needed
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              >
                {/* Double the array for seamless scrolling effect */}
                {[...similarProducts, ...similarProducts].map((p, i) => (
                  <div key={`${p.id}-${i}`} className="w-[280px] flex-shrink-0">
                     <ProductCard 
                        product={p} 
                        onClick={() => onProductClick(p)} 
                        isLiked={likedProductIds.includes(p.id)}
                        onLikeToggle={onLikeToggle}
                     />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
