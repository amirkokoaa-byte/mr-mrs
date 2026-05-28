import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { store } from '../store';
import { AiOrder } from '../types';

export const AiChatBot = ({ appName }: { appName: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  
  // State machine for order:
  // 0: greeting / request name
  // 1: request product
  // 2: request phone
  // 3: request address
  // 4: request location
  // 5: done
  const [step, setStep] = useState(0);
  
  // Order data collector
  const [orderData, setOrderData] = useState({
    name: '',
    product: '',
    phone: '',
    address: '',
    locationText: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start flow
      addBotMessage(`أهلاً بك في ${appName}! 🌸 يسعدنا جداً خدمتك. عشان نسجل طلبك فوراً، ممكن تقولي اسمك الكريم؟`);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: 'bot', text }]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const val = inputText.trim();
    setMessages(prev => [...prev, { sender: 'user', text: val }]);
    setInputText('');

    setTimeout(() => {
      processStep(val);
    }, 600);
  };

  const processStep = (val: string) => {
    let nextStep = step;
    let newData = { ...orderData };

    if (step === 0) {
      newData.name = val;
      nextStep = 1;
      addBotMessage("تشرفنا يا فندم. إيه المنتج أو الموديل اللي حابب تطلبه النهاردة؟");
    } else if (step === 1) {
      newData.product = val;
      nextStep = 2;
      addBotMessage("اختيار رائع! 👌 عشان نتابع معاك الشحن، ممكن رقم تليفون متاح؟");
    } else if (step === 2) {
      if (!/^\d+$/.test(val.replace(/\s/g, ''))) {
        addBotMessage("الرجاء إدخال رقم هاتف صحيح مكون من أرقام فقط.");
        return;
      }
      newData.phone = val;
      nextStep = 3;
      addBotMessage("تمام جداً. ممكن عنوان الشحن بالتفصيل (المحافظة - المنطقة - اسم الشارع - رقم العمارة)؟ لمعرفة قيمة التوصيل، هتكون حسب المنطقة وهيتم التواصل لتوضيح ذلك.");
    } else if (step === 3) {
      newData.address = val;
      nextStep = 4;
      addBotMessage("تسلم. عشان المندوب يوصلك أسرع ومن غير تأخير، ياريت تبعتلي اللوكيشن (Location) المتاح لك أو عنوان مفصل أكثر هنا.");
    } else if (step === 4) {
      newData.locationText = val;
      nextStep = 5;
      
      const summaryMsg = `شكراً ليك يا فندم! دي تفاصيل طلبك لتأكيدها:
👤 الاسم: ${newData.name}
🛍️ المنتج: ${newData.product}
📱 رقم الهاتف: ${newData.phone}
📍 العنوان: ${newData.address}
🗺️ اللوكيشن: تم الاستلام

تم تسجيل طلبك بنجاح، وفريق المبيعات هيتواصل معاك لتأكيد الشحن خلال ساعات. يومك سعيد! ✨`;
      addBotMessage(summaryMsg);
      
      // Save order
      const d = new Date();
      const newOrder: AiOrder = {
        id: Date.now().toString(),
        date: d.toLocaleDateString('ar-EG'),
        time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        phone: newData.phone,
        messages: [...messages, { sender: 'user', text: val }, { sender: 'bot', text: summaryMsg }],
        summary: newData
      };
      store.saveAiOrder(newOrder);
    }

    setOrderData(newData);
    setStep(nextStep);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 left-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-[50px] h-[50px] flex items-center justify-center rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:scale-110 transition-transform z-[100] group"
      >
        <Bot size={24} />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#2d2d2d] border border-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">الطلب الآلي</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-5 left-5 md:left-20 w-[350px] max-w-[calc(100vw-40px)] h-[500px] max-h-[80vh] bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 flex flex-col z-[105] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#2d2d2d] p-4 flex justify-between items-center border-b border-white/5 shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-full text-indigo-400">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">مساعد الطلبات الذكي</h3>
                  <p className="text-[10px] text-green-400">✅ متصل</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-[#2d2d2d] text-gray-200 border border-white/5 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {step === 5 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => {
                      setStep(0);
                      setMessages([]);
                      setOrderData({ name: '', product: '', phone: '', address: '', locationText: '' });
                      addBotMessage(`أهلاً بك في ${appName}! 🌸 يسعدنا جداً خدمتك. عشان نسجل طلبك فوراً، ممكن تقولي اسمك الكريم؟`);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                  >
                    بدء محادثة جديدة
                  </button>
                </div>
              )}
            </div>

            {/* Input Form */}
            {step < 5 && (
              <form onSubmit={handleSend} className="p-3 bg-[#2d2d2d] border-t border-white/5 flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="اكتب هنا..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500/50 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
