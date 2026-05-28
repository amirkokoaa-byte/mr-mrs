import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User as UserIcon, Settings, LogOut, Trash2, Plus, Minus, X, Mic, Search, MapPin, MessageCircle } from 'lucide-react';
import { cn, calculatePrice } from '../utils';
import { store } from '../store';
import { Product, User, CartItem, AppSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

// --- Shared Components: Header ---
export const Header = ({ 
  settings, 
  user, 
  cartItemCount,
  onOpenCart, 
  onOpenAuth, 
  onLogout,
  onGoHome,
  onOpenAdmin,
  isAdmin,
  onSearch
}: any) => {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  };
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.onresult = (event: any) => {
        const query = event.results[0][0].transcript;
        setSearchQuery(query);
        onSearch?.(query);
      };
      recognition.start();
    } else {
      alert('البحث الصوتي غير مدعوم في هذا المتصفح');
    }
  };

  return (
    <header className="bg-black/20 backdrop-blur-[10px] border-b border-white/5 text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Date and Time */}
        <div className="text-sm font-light text-gray-400 text-center md:text-right hidden md:block">
          <div>{formatDate(time)}</div>
          <div className="font-mono">{formatTime(time)}</div>
        </div>

        {/* Logo / App Name */}
        <div className="text-2xl md:text-[24px] font-serif cursor-pointer text-center" onClick={onGoHome}>
           {settings.appName}
        </div>
        
        <div className="flex-1 max-w-sm mx-4 relative hidden lg:block">
          <input 
            type="text" 
            placeholder="ابحث عن منتج..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); onSearch?.(e.target.value); }}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-white/30"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button onClick={startVoiceSearch} className="text-gray-400 hover:text-white"><Mic size={18} /></button>
            <Search size={18} className="text-gray-400" />
          </div>
        </div>

        {/* Actions Navigation */}
        <div className="flex items-center gap-4 md:gap-6">
          <button className="hover:text-gray-300 relative group hidden sm:block" onClick={() => alert('سيتم عرض فروعنا على الخريطة هنا')}>
             <MapPin size={24} />
             <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#2d2d2d] border border-white/5 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">فروعنا</span>
          </button>
          
          <button onClick={onOpenCart} className="relative hover:text-gray-300 group">
            <ShoppingCart size={24} />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#2d2d2d] border border-white/5 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">السلة</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#ff4444] text-white text-[12px] rounded-[4px] w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
          
          <button onClick={onGoHome} className="hover:text-gray-300 relative group">
             <Heart size={24} />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#2d2d2d] border border-white/5 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">المفضلة</span>
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm border border-gray-600 px-3 py-1 rounded-full">{user.username}</span>
              {isAdmin && (
                <button onClick={onOpenAdmin} className="hover:text-gray-300">
                  <Settings size={24} />
                </button>
              )}
              <button onClick={onLogout} className="hover:text-[#ff4444]">
                <LogOut size={24} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="hover:text-gray-300 flex flex-col items-center">
              <UserIcon size={24} />
              <span className="text-[10px] mt-1 opacity-70">تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// --- Add to main component collection export ---
export const Footer = () => (
  <footer className="w-full text-center p-2.5 pb-0 text-[10px] opacity-50 absolute bottom-0 pointer-events-none">
    <p>مع تحيات المطور Amir Lamay © {new Date().getFullYear()}</p>
  </footer>
);

export const WhatsAppButton = ({ number }: { number: string }) => {
  if (!number) return null;
  const url = `https://wa.me/${number.replace(/\D/g, '')}`;
  return (
    <>
      <a href={url} target="_blank" rel="noopener noreferrer" className="fixed bottom-5 left-5 bg-[#25d366] text-white w-[50px] h-[50px] flex items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform z-[100]">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
      </a>
      <button onClick={() => alert('خدمة العملاء عبر الدردشة المباشرة متوفرة قريباً')} className="fixed bottom-24 left-5 bg-[#2d2d2d] border border-white/10 text-white w-[50px] h-[50px] flex items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform z-[100] group">
        <MessageCircle size={24} />
      </button>
    </>
  );
}
