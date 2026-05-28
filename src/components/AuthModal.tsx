import React, { useState } from 'react';
import { User } from '../types';
import { store } from '../store';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean, onClose: () => void, onLogin: (u: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    const users = store.getUsers();

    if (isRegister) {
      if (users.find(u => u.username === username)) {
        setError('اسم المستخدم موجود بالفعل');
        return;
      }
      const newUser: User = { username, password, wishlist: [] };
      store.saveUser(newUser);
      onLogin(newUser);
      onClose();
    } else {
      // Special admin case requested by user
      if (username === 'admin' && password === 'admin') {
         const adminUser: User = { username: 'admin', wishlist: [] };
         // Ensure admin is in store
         if (!users.find(u => u.username === 'admin')) store.saveUser(adminUser);
         onLogin(adminUser);
         onClose();
         return;
      }

      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
        onClose();
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#2d2d2d] rounded-[20px] shadow-[0_30px_60px_rgba(0,0,0,0.5)] w-full max-w-sm border border-white/10 overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"><X size={20} /></button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8">{isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
          
          {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-6 text-sm text-center border border-red-800/50">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">اسم المستخدم</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">كلمة المرور</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                dir="ltr"
              />
            </div>
            
            <button type="submit" className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors mt-4">
              {isRegister ? 'تسجيلساب' : 'دخول'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            {isRegister ? 'لديك حساب بالفعل؟ ' : 'ليس لديك حساب؟ '}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-white font-medium hover:underline">
              {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </button>
          </div>
          
          <div className="mt-8 text-center">
             <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-300 underline">المتابعة كضيف</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
