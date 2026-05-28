import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User as UserIcon, Settings, LogOut, Trash2, Plus, Minus, X, Mic, Search, MapPin, MessageCircle, Phone } from 'lucide-react';
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
export const Footer = ({ settings }: { settings?: AppSettings }) => (
  <footer className="w-full text-center p-6 border-t border-white/5 bg-black/20 mt-12 relative z-10">
    <div className="container mx-auto flex flex-col items-center gap-4">
      <h3 className="font-bold text-lg mb-2">تواصل معنا</h3>
      <div className="flex gap-4">
        {settings?.socialLinks?.phone && (
          <a href={`tel:${settings.socialLinks.phone}`} className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500/40 transition-colors">
             <Phone size={20} />
          </a>
        )}
        {settings?.socialLinks?.instagram && (
          <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center hover:opacity-80 transition-opacity text-white">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
          </a>
        )}
        {settings?.socialLinks?.facebook && (
          <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity text-white font-bold relative overflow-hidden group">
            <svg className="w-5 h-5 absolute z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> 
          </a>
        )}
        {settings?.socialLinks?.telegram && (
          <a href={settings.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center hover:opacity-80 transition-opacity text-white font-bold relative overflow-hidden group">
            <svg className="w-5 h-5 absolute z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          </a>
        )}
      </div>
      <p className="text-[10px] opacity-30 mt-4">مع تحيات المطور Amir Lamay © {new Date().getFullYear()}</p>
    </div>
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
