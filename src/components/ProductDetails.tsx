import React, { useEffect, useState } from 'react';
import { Product, Review } from '../types';
import { calculatePrice } from '../utils';
import { ShoppingCart, Heart, ArrowRight, Share2, Star, Upload, Eye, Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { store } from '../store';
import { cn } from '../utils';

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
  
  const [timeLeft, setTimeLeft] = useState<{ hours: number, mins: number, secs: number } | null>(null);

  const PREDEFINED_COLORS = [
    { name: 'أحمر', hex: '#ef4444' },
    { name: 'أزرق', hex: '#3b82f6' },
    { name: 'أخضر', hex: '#22c55e' },
    { name: 'أسود', hex: '#000000' },
    { name: 'أبيض', hex: '#ffffff' },
    { name: 'رمادي', hex: '#6b7280' },
    { name: 'أصفر', hex: '#eab308' },
    { name: 'وردي', hex: '#ec4899' },
    { name: 'بنفسجي', hex: '#a855f7' },
    { name: 'بني', hex: '#92400e' },
    { name: 'برتقالي', hex: '#f97316' },
  ];
  
  // Basic recommendation logic (same category or random)
  const similarProducts = allProducts
    .filter(p => p.id !== product.id && !p.isArchived)
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  useEffect(() => {
    if (!product.offerEndTime) {
      setTimeLeft(null);
      return;
    }
    const endTime = new Date(product.offerEndTime).getTime();
    
    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, mins: 0, secs: 0 });
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours: h, mins: m, secs: s });
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [product.offerEndTime]);

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

  const isOfferEnded = timeLeft && timeLeft.hours === 0 && timeLeft.mins === 0 && timeLeft.secs === 0;

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
            
            <div className="absolute top-[10px] left-[10px] bg-black/60 rounded-lg p-2 z-10 shadow-md flex flex-col items-center justify-center min-w-[50px] backdrop-blur-sm border border-white/10">
              <Eye size={18} className="text-gray-300 mb-1" />
              <span className="text-white text-xs font-bold font-mono">{product.views || 0}</span>
            </div>

            {product.discount > 0 && !isOfferEnded && (
              <div className="absolute top-[10px] right-[10px] bg-[#ff4444] text-white px-3 py-1 font-bold rounded-[4px] text-lg z-10 shadow-md">
                خصم {product.discount}%
              </div>
            )}
            
            <button 
              onClick={(e) => onLikeToggle(e, product)}
              className="absolute bottom-[10px] right-[10px] bg-black/40 p-3 rounded-full hover:bg-black/60 z-10 transition-colors shadow-lg border border-white/10"
            >
              <Heart size={28} className={isLiked ? "fill-[#ff4444] text-[#ff4444]" : "text-gray-300"} />
            </button>
            <button onClick={handleShare} className="absolute bottom-[10px] right-[60px] bg-black/40 p-3 rounded-full hover:bg-black/60 z-10 transition-colors shadow-lg text-gray-300 hover:text-white border border-white/10">
              <Share2 size={24} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{product.name}</h1>
            
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-[#ffc107]">
                 {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
                 <span className="text-sm text-gray-400 mr-2">({(product.reviews?.length || 0)} تقييمات)</span>
               </div>
               {product.isAvailable === false && (
                  <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">نفذت الكمية</span>
               )}
            </div>
            
            <p className="text-gray-400 text-lg mb-8 leading-relaxed whitespace-pre-line">{product.description}</p>
            
            {timeLeft && (
              <div className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                 <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
                   <Clock size={20} />
                   <span>عرض لفترة محدودة</span>
                 </div>
                 {isOfferEnded ? (
                   <span className="text-[#ff4444] font-bold">تم انتهاء العرض</span>
                 ) : (
                   <div className="flex gap-4 font-mono text-xl text-white">
                     <div className="flex flex-col items-center"><span className="bg-purple-500/20 px-3 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span><span className="text-xs text-purple-300 mt-1">ساعة</span></div>:
                     <div className="flex flex-col items-center"><span className="bg-purple-500/20 px-3 py-1 rounded">{String(timeLeft.mins).padStart(2, '0')}</span><span className="text-xs text-purple-300 mt-1">دقيقة</span></div>:
                     <div className="flex flex-col items-center"><span className="bg-purple-500/20 px-3 py-1 rounded">{String(timeLeft.secs).padStart(2, '0')}</span><span className="text-xs text-purple-300 mt-1">ثانية</span></div>
                   </div>
                 )}
              </div>
            )}
            
            <div className="flex items-end gap-4 mb-8 bg-white/5 p-6 rounded-xl border border-white/10">
              <span className="text-4xl font-bold text-white">{(isOfferEnded ? product.price : currentPrice).toFixed(0)} ج.م</span>
              {product.discount > 0 && !isOfferEnded && (
                <del className="text-xl font-medium text-gray-500 mb-1">{product.price.toFixed(0)} ج.م</del>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">الألوان المتاحة: (اختر العدد عند الإضافة للسلة)</h3>
                <div className="flex gap-2">
                  {product.colors.map((c, i) => {
                     const colorDef = PREDEFINED_COLORS.find(x => x.name === c);
                     if (colorDef) {
                        return (
                          <div key={i} className="group relative w-8 h-8 rounded-full border border-white/20 shadow-md cursor-help" style={{ backgroundColor: colorDef.hex }}>
                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-20 border border-white/10">{c}</span>
                          </div>
                        );
                     }
                     return <span key={i} className="px-4 py-1.5 bg-white/5 rounded-[6px] text-sm border border-white/10">{c}</span>;
                  })}
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
              disabled={product.isAvailable === false}
              className="w-full bg-white text-black flex items-center justify-center gap-3 py-4 rounded-xl text-xl font-bold hover:bg-gray-200 transition-colors shadow-[0_10px_20px_rgba(255,255,255,0.1)] mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={24} />
              {product.isAvailable === false ? 'نفذت الكمية' : 'اضف إلى السلة'}
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

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-xl font-bold mb-6 border-l-4 border-[#ff4444] pl-3 py-1">منتجات ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarProducts.map((p) => (
                  <div key={p.id} onClick={() => onProductClick(p)} className="bg-[#2d2d2d] rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform border border-white/5 relative group">
                     <div className="aspect-[4/5] relative w-full overflow-hidden bg-[#1a1a1a]">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        {p.discount > 0 && <span className="absolute top-2 right-2 bg-[#ff4444] text-white text-[10px] font-bold px-2 py-1 z-10 rounded shadow-md">-{p.discount}%</span>}
                     </div>
                     <div className="p-3">
                        <h4 className="font-bold text-sm truncate">{p.name}</h4>
                        <div className="mt-1 flex items-center gap-2">
                           <span className="font-bold text-[#ff4444]">{calculatePrice(p.price, p.discount)} ج.م</span>
                           {p.discount > 0 && <span className="text-gray-500 text-xs line-through">{p.price}</span>}
                        </div>
                     </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
