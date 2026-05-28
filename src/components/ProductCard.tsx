import React, { useState, useEffect } from 'react';
import { Product, AppSettings, User } from '../types';
import { calculatePrice, cn } from '../utils';
import { Heart } from 'lucide-react';
import { store } from '../store';
import { motion } from 'motion/react';

export const ProductCard = ({ 
  product, 
  onClick, 
  isLiked,
  onLikeToggle
}: { 
  product: Product; 
  onClick: () => void;
  isLiked: boolean;
  onLikeToggle: (e: React.MouseEvent, p: Product) => void;
}) => {
  const currentPrice = calculatePrice(product.price, product.discount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2d2d2d] rounded-[15px] p-[10px] border border-white/5 flex flex-col gap-2 cursor-pointer group hover:ring-1 hover:ring-white/20 transition-all relative block"
      onClick={onClick}
    >
      <div className="relative h-[180px] overflow-hidden bg-[#3d3d3d] rounded-[10px]">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1558769132-cb1fac08b045?w=500&auto=format&fit=crop'; }}
        />
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-[10px] right-[10px] bg-[#ff4444] text-white px-2.5 py-0.5 text-[12px] font-bold rounded-[4px] z-10">
            خصم {product.discount}%
          </div>
        )}
        
        {/* Like Button */}
        <button 
          onClick={(e) => onLikeToggle(e, product)}
          className="absolute bottom-[10px] left-[15px] bg-black/40 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 z-10 transition-colors"
        >
          <Heart size={16} className={cn("transition-colors", isLiked ? "fill-[#ff4444] text-[#ff4444]" : "text-gray-300")} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1 px-1 mt-1">
        <h3 className="font-semibold text-white mb-1 truncate">{product.name}</h3>
        <p className="text-[#888] text-[11px] mb-3 line-clamp-2 min-h-[32px]">{product.description}</p>
        
        <div className="flex items-center gap-2 mt-auto">
          <span className="font-bold text-white text-[1.1rem]">{currentPrice.toFixed(0)} ج.م</span>
          {product.discount > 0 && (
            <del className="text-[0.9rem] text-[#888]">{product.price.toFixed(0)} ج.م</del>
          )}
        </div>
      </div>
    </motion.div>
  );
};
