import React, { useState } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem, Product } from '../types';
import { calculatePrice } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export const CartModal = ({ isOpen, onClose, cart, products, onUpdateQuantity, onRemoveItem, onContinueShopping, onCheckout }: CartModalProps) => {
  if (!isOpen) return null;

  const items = products;
  const getProduct = (id: string) => items.find(p => p.id === id);
  
  const totalShipping = cart.reduce((sum, item) => sum + (getProduct(item.productId)?.shippingCost || 0) * item.quantity, 0);

  const total = cart.reduce((sum, item) => {
    const p = getProduct(item.productId);
    if (!p) return sum;
    return sum + (calculatePrice(p.price, p.discount) * item.quantity);
  }, 0) + totalShipping;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#2d2d2d] rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10"
      >
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">سلة المشتريات</h2>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">السلة فارغة</div>
          ) : (
            cart.map(item => {
              const p = getProduct(item.productId);
              if (!p) return null;
              return (
                <div key={item.productId} className="flex flex-col sm:flex-row gap-4 bg-white/5 p-4 rounded-[10px] items-center border border-white/5">
                  <img src={p.imageUrl} alt={p.name} className="w-24 h-24 object-cover rounded-md" onError={e => e.currentTarget.src = 'https://placehold.co/200x200?text=Facebook+Link'} />
                  <div className="flex-1 text-center sm:text-right">
                    <h3 className="font-medium text-lg">{p.name}</h3>
                    <p className="text-lg font-bold mt-2">{(calculatePrice(p.price, p.discount) * item.quantity).toFixed(2)} ج.م</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                    <button onClick={() => onUpdateQuantity(item.productId, -1)} className="p-2 hover:bg-gray-700 rounded-md"><Minus size={16} /></button>
                    <span className="w-8 text-center font-bold font-mono">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.productId, 1)} className="p-2 hover:bg-gray-700 rounded-md"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => onRemoveItem(item.productId)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-gray-800 rounded-lg transition-colors ml-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          {(() => {
            return totalShipping > 0 ? (
              <p className="mt-4 mb-4 text-sm text-[#ff4444] text-center font-bold">مصاريف الشحن: {totalShipping} ج.م</p>
            ) : (
              <p className="mt-4 mb-4 text-sm text-gray-400 text-center">+ مصاريف الشحن حسب المحافظة في حال عدم تحديدها</p>
            );
          })()}
          <div className="flex justify-between items-center mb-6 text-xl">
            <span className="text-gray-300">الإجمالي:</span>
            <span className="font-bold">{total.toFixed(2)} ج.م</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={onContinueShopping} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors">
               متابعة الشراء
             </button>
             <button onClick={onCheckout} disabled={cart.length === 0} className="flex-1 bg-white hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               إتمام الطلب
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const CheckoutModal = ({ isOpen, onClose, settings }: { isOpen: boolean, onClose: () => void, settings: any }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2d2d2d] rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-md border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold">إتمام الدفع</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-gray-300 text-center mb-4 leading-relaxed">
            يرجى تحويل قيمة الطلب عبر إحدى الطرق التالية ثم التواصل معنا لتأكيد الطلب<br/>
            <span className="text-white font-bold block mt-2 text-sm bg-purple-500/20 p-2 rounded-lg">واحتفظ ب اسكرين شوت للتحويل  لتقديمه عند الطلب</span>
          </p>
          
          <div className="space-y-4">
            {settings.walletNumber && (
              <div className="bg-white/5 p-[15px] rounded-[10px] flex justify-between items-center border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="font-medium text-gray-400">المحفظة الإلكترونية</span>
                <span className="font-mono text-lg font-bold tracking-widest">{settings.walletNumber}</span>
              </div>
            )}
            {settings.instapayHandle && (
              <div className="bg-white/5 p-[15px] rounded-[10px] flex justify-between items-center border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="font-medium text-gray-400">إنستا باي (InstaPay)</span>
                <span className="font-mono text-lg font-bold tracking-wider text-purple-400">{settings.instapayHandle}</span>
              </div>
            )}
            {settings.fawryNumber && (
              <div className="bg-white/5 p-[15px] rounded-[10px] flex justify-between items-center border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <span className="font-medium text-gray-400">رقم فوري</span>
                <span className="font-mono text-lg font-bold tracking-wider text-yellow-400">{settings.fawryNumber}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 text-center mt-4">سيتم مراجعة الطلب بعد التأكد من وصول التحويل.</p>
        </div>
      </motion.div>
    </div>
  );
}
