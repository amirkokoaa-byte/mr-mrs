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
      addBotMessage(`أهلاً بك في ${appName}! 🌸 أنا المساعد الذكي، وتقدر تسألني عن أي منتجات، تفاصيل الشراء، أو عروضنا!`);
    }
  }, [isOpen, appName, messages.length]);

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

  const processStep = async (val: string) => {
    // Collect context data
    const products = store.getProducts().map(p => ({
        name: p.name,
        price: p.price,
        shipping: p.shippingCost,
        colors: p.colors,
        sizes: p.sizes,
        description: p.description
    }));
    const settings = store.getSettings();

    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: val,
                history: messages,
                storeData: { products, settings }
            }),
        });
        
        if (!res.ok) {
            handleClientFallbackChat(val, products, settings);
            return;
        }

        const data = await res.json();
        addBotMessage(data.reply);
    } catch (err) {
        handleClientFallbackChat(val, products, settings);
    }
  };

  const handleClientFallbackChat = (msg: string, products: any[], settings: any) => {
    const text = msg.toLowerCase().trim();
    
    // Check for passwords explicitly
    if (text.includes("باسورد") || text.includes("سر") || text.includes("حساب") || text.includes("password")) {
        addBotMessage("عفواً، لا يُسمح لي بطلب أو التعامل مع أي كلمات مرور أو تفاصيل حسابات حفاظاً على خصوصيتك وأمان بياناتك.");
        return;
    }

    if (text.includes("رخيص") || text.includes("ارخص")) {
        const sorted = [...products].filter(p => !p.isArchived).sort((a,b) => a.price - b.price);
        if (sorted.length > 0) {
            addBotMessage(`أرخص منتج لدينا هو "${sorted[0].name}" بسعر ${sorted[0].price} ج.م. هل تود شراءه؟`);
        } else {
            addBotMessage("عفواً لا توجد منتجات حالياً.");
        }
        return;
    }

    if (text.includes("غالي") || text.includes("اغلى")) {
        const sorted = [...products].filter(p => !p.isArchived).sort((a,b) => b.price - a.price);
        if (sorted.length > 0) {
            addBotMessage(`حصرياً، أعلى منتجاتنا هو "${sorted[0].name}" بسعر ${sorted[0].price} ج.م. هل يعجبك وتريد تسجيل بياناتك لطلبه؟`);
        } else {
            addBotMessage("عفواً لا توجد منتجات حالياً.");
        }
        return;
    }

    if (text.includes("خصم") || text.includes("عروض") || text.includes("خصومات")) {
        const discounted = products.filter(p => !p.isArchived && p.discount > 0);
        if (discounted.length > 0) {
            const names = discounted.slice(0, 3).map(p => `"${p.name}" (خصم ${p.discount}%)`).join(' و ');
            addBotMessage(`نعم بالطبع! لدينا خصومات هائلة على منتجات مثل: ${names}. هل تود طلب أي منها الآن؟`);
        } else {
            addBotMessage("حالياً لا توجد خصومات فعالة، لكن أسعارنا 항상 مميزة جداً! هل تبحث عن منتج معين؟");
        }
        return;
    }

    if (text.includes("تواصل") || text.includes("رقم") || text.includes("خدمة عملاء") || text.includes("واتس")) {
        addBotMessage(`بالتأكيد، رقم التواصل الخاص بنا (واتساب/اتصال) هو: ${settings.whatsappNumber || "غير متوفر"}`);
        return;
    }

    if (text.includes("شراء") || text.includes("اشتري") || text.includes("عايز") || text.includes("اطلب")) {
        addBotMessage("لإتمام الطلب، يرجى تزويدي بالبيانات التالية: \n1. الاسم الثلاثي\n2. رقم الهاتف\n3. العنوان بالتفصيل\n4. اسم المنتج أو الصنف الذي تود شراءه.");
        return;
    }

    if (text.includes("شحن") || text.includes("توصيل")) {
        addBotMessage("بالتأكيد! متوفر شحن وتوصيل لجميع المحافظات. يتم احتساب التكلفة أثناء الدفع.");
        return;
    }

    // Try finding a direct product match
    const match = products.find(p => text.includes(p.name.toLowerCase()));
    if (match) {
        addBotMessage(`المنتج "${match.name}" متاح لدينا بسعر ${match.price} ج.م. إذا أردت إتمام الشراء، من فضلك أرسل لي اسمك وعنوانك ورقم هاتفك.`);
        return;
    }

    addBotMessage("مرحباً بك! أنا مساعدك الذكي للمبيعات. يمكنني إخبارك بأقوى الخصومات، أرخص منتجاتنا، ومساعدتك في تسجيل طلبك بكل سهولة (الاسم، العنوان، التليفون، الصنف). كيف يمكنني مساعدتك اليوم؟");
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
            </div>

            {/* Input Form */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
