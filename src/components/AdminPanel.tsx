import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { Product, AppSettings, User, Category, AiOrder } from '../types';
import { X, Trash2, Plus, ArrowRight, Eye, EyeOff, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../utils';

export const AdminPanel = ({ onGoBack }: { onGoBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'users' | 'orders'>('orders');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onGoBack} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
          <ArrowRight size={24} />
        </button>
        <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {[
          { id: 'orders', label: 'الطلبات' },
          { id: 'products', label: 'المنتجات والأقسام' },
          { id: 'settings', label: 'إعدادات المتجر' },
          { id: 'users', label: 'الحسابات المسجلة' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-colors border border-transparent",
              activeTab === t.id ? "bg-white text-black" : "bg-white/5 text-gray-300 hover:bg-white/10 border-white/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white/5 p-[15px] rounded-[10px] border border-dashed border-white/20 text-[13px]">
        {activeTab === 'orders' && <ManageOrders />}
        {activeTab === 'products' && <ManageProducts />}
        {activeTab === 'settings' && <ManageSettings />}
        {activeTab === 'users' && <ManageUsers />}
      </div>
    </div>
  );
};

const ManageOrders = () => {
  const [orders, setOrders] = useState<AiOrder[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(store.getAiOrders());
  }, []);

  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">سجل الطلبات ({orders.length})</h2>
      {orders.length === 0 && <div className="text-center py-10 text-gray-500">لا توجد طلبات مسجلة بعد.</div>}
      
      {orders.slice().reverse().map(order => (
        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all">
          <button 
            onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/40 transition-colors"
          >
            <div className="flex flex-wrap gap-x-8 gap-y-2 items-center flex-1 text-right">
              <div>
                <span className="text-gray-400 text-xs block mb-1">رقم الهاتف</span>
                <span className="font-mono text-sm tracking-wider" dir="ltr">{order.phone || 'غير مسجل'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-1">التاريخ</span>
                <span className="text-sm">{order.date}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-1">الوقت</span>
                <span className="text-sm" dir="ltr">{order.time}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-1">اسم العميل</span>
                <span className="text-sm font-medium">{order.summary.name || 'غير مسجل'}</span>
              </div>
            </div>
            
            <div className="bg-white/10 p-2 rounded-full ml-4">
              {expandedId === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
          
          {expandedId === order.id && (
            <div className="p-6 border-t border-white/10 bg-black/40">
              
              <div className="mb-8 bg-[#1a1a1a] rounded-xl p-4 border border-white/5 h-80 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-400 mb-4 sticky top-0 bg-[#1a1a1a] py-2 border-b border-white/5 uppercase">مراسلات البوت</h3>
                <div className="space-y-4">
                  {order.messages.map((m, idx) => (
                    <div key={idx} className={cn("flex", m.sender === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                        m.sender === 'user' 
                          ? "bg-purple-600 text-white rounded-br-none" 
                          : "bg-[#2d2d2d] text-gray-200 border border-white/5 rounded-bl-none"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2d2d2d] rounded-xl p-6 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-indigo-500"></div>
                <h3 className="text-lg font-bold mb-4 pr-4">تفاصيل الطلب النهائي</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pr-4">
                  <div><span className="text-gray-400 block mb-1 text-xs">الاسم</span> <div className="font-medium">{order.summary.name || '---'}</div></div>
                  <div><span className="text-gray-400 block mb-1 text-xs">المنتج المجلف</span> <div className="font-medium text-indigo-300">{order.summary.product || '---'}</div></div>
                  <div><span className="text-gray-400 block mb-1 text-xs">رقم الهاتف</span> <div className="font-mono" dir="ltr">{order.summary.phone || '---'}</div></div>
                  <div><span className="text-gray-400 block mb-1 text-xs">العنوان المكتوب</span> <div className="font-medium">{order.summary.address || '---'}</div></div>
                  <div className="sm:col-span-2"><span className="text-gray-400 block mb-1 text-xs">اللوكيشن</span> <div className="font-medium break-words text-blue-300">{order.summary.locationText || '---'}</div></div>
                </div>
              </div>
              
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // New Product State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [colors, setColors] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [newCat, setNewCat] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];

  useEffect(() => {
    setProducts(store.getProducts());
    setCategories(store.getCategories());
  }, []);

  const handleAddCat = () => {
    if (newCat.trim()) {
      const cat = { id: Date.now().toString(), name: newCat.trim() };
      store.saveCategory(cat);
      setCategories([...categories, cat]);
      setCategory(cat.id);
      setNewCat('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const p: Product = {
      id: Date.now().toString(),
      name,
      description: desc,
      price: parseFloat(price) || 0,
      discount: parseFloat(discount) || 0,
      colors: colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: selectedSizes,
      category,
      imageUrl
    };
    store.saveProduct(p);
    setProducts([...products, p]);
    // Reset
    setName(''); setDesc(''); setPrice(''); setDiscount(''); setColors(''); setSelectedSizes([]); setImageUrl('');
  };

  const handleDelete = (id: string) => {
    store.deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">إضافة صنف جديد</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input required placeholder="اسم الصنف" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" />
          <textarea required placeholder="وصف الصنف" value={desc} onChange={e=>setDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 min-h-[100px] focus:outline-none focus:border-white/30" />
          <div className="flex gap-4">
            <input required type="number" step="0.01" placeholder="السعر الأساسي (ج.م)" value={price} onChange={e=>setPrice(e.target.value)} className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
            <input type="number" placeholder="نسبة الخصم % (اختياري)" value={discount} onChange={e=>setDiscount(e.target.value)} className="w-1/2 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
          </div>
          <input placeholder="الألوان المتاحة (افصل بينها بفاصلة , )" value={colors} onChange={e=>setColors(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" />
          
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <label className="block text-sm text-gray-400 mb-3">المقاسات المتاحة</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer bg-black/20 px-3 py-2 rounded-md hover:bg-black/40 transition-colors border border-white/5">
                  <input 
                    type="checkbox" 
                    checked={selectedSizes.includes(s)} 
                    onChange={() => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} 
                    className="rounded border-white/20 bg-black/50 w-4 h-4 accent-[#ff4444]" 
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4 items-end bg-white/5 p-4 rounded-lg border border-white/10">
             <div className="flex-1">
               <label className="block text-sm text-gray-400 mb-2">القسم</label>
               <select required value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30">
                 <option value="">اختر القسم</option>
                 {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
             </div>
             <div className="flex-1">
               <label className="block text-sm text-gray-400 mb-2">أو إنشاء قسم جديد</label>
               <div className="flex gap-2">
                 <input placeholder="اسم القسم الجديد" value={newCat} onChange={e=>setNewCat(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" />
                 <button type="button" onClick={handleAddCat} className="bg-white/10 p-3 rounded-lg hover:bg-white/20 transition-colors"><Plus size={20}/></button>
               </div>
             </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">صورة المنتج (رابط أو رفع من الجهاز)</label>
            <div className="flex gap-2">
              <input required placeholder="رابط صورة الصنف (URL)" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
              <label className="bg-white/10 flex items-center justify-center gap-2 px-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors font-medium">
                <Upload size={18} />
                رفع
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, setImageUrl)} />
              </label>
            </div>
            {imageUrl && <img src={imageUrl} alt="preview" className="mt-3 h-24 rounded-lg object-cover border border-white/10" />}
          </div>
          
          <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 mt-4 transition-colors">إضافة الصنف</button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6 border-b border-white/10 pb-2">الأصناف الحالية ({products.length})</h2>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
           {products.map(p => (
             <div key={p.id} className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5 items-center">
               <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
               <div className="flex-1">
                 <h4 className="font-bold truncate text-base">{p.name}</h4>
                 <div className="text-sm text-gray-400">{p.price} ج.م {p.discount > 0 && <span className="text-[#ff4444] mr-2">(-{p.discount}%)</span>}</div>
               </div>
               <button onClick={() => handleDelete(p.id)} className="p-3 bg-white/5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={20}/></button>
             </div>
           ))}
           {products.length === 0 && <div className="text-gray-500 text-center py-8">لا توجد أصناف</div>}
        </div>
      </div>
    </div>
  );
};

const ManageSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(store.getSettings());

  const handleChange = (k: keyof AppSettings, v: string) => {
    const s = { ...settings, [k]: v };
    setSettings(s);
  };

  const handleSave = () => {
    store.saveSettings(settings);
    alert('تم حفظ الإعدادات بنجاح. قد تحتاج لإعادة تحميل الصفحة لرؤية بعض التغييرات.');
    window.location.reload();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm text-gray-400 mb-2">اسم البرنامج / المتجر</label>
        <input value={settings.appName} onChange={e=>handleChange('appName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-2">صورة الشاشة الرئيسية (رابط أو رفع من الجهاز)</label>
        <div className="flex gap-2">
          <input value={settings.bannerImage} onChange={e=>handleChange('bannerImage', e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
          <label className="bg-white/10 flex items-center justify-center gap-2 px-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors font-medium">
            <Upload size={18} />
            رفع
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (url) => handleChange('bannerImage', url))} />
          </label>
        </div>
        {settings.bannerImage && <img src={settings.bannerImage} alt="Preview" className="mt-4 h-40 w-full object-cover rounded-xl border border-white/10 opacity-80" />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">رقم واتساب للتواصل</label>
          <input value={settings.whatsappNumber} onChange={e=>handleChange('whatsappNumber', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">رقم المحفظة الإلكترونية</label>
          <input value={settings.walletNumber} onChange={e=>handleChange('walletNumber', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">عنوان إنستا باي (InstaPay)</label>
          <input value={settings.instapayHandle} onChange={e=>handleChange('instapayHandle', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">رقم حساب فوري</label>
          <input value={settings.fawryNumber} onChange={e=>handleChange('fawryNumber', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-white/30" dir="ltr" />
        </div>
      </div>
      <button onClick={handleSave} className="bg-white text-black font-bold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors mt-6">حفظ الإعدادات</button>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setUsers(store.getUsers().filter(u => u.username !== 'admin'));
  }, []);

  const handleDelete = (username: string) => {
    store.deleteUser(username);
    setUsers(users.filter(u => u.username !== username));
  };

  const togglePass = (username: string) => {
    setShowPass(prev => ({ ...prev, [username]: !prev[username] }));
  };

  return (
    <div className="max-w-4xl max-h-[70vh] overflow-y-auto">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-gray-400">
            <th className="py-4 px-4 font-normal text-right">اسم المستخدم</th>
            <th className="py-4 px-4 font-normal text-right">كلمة المرور</th>
            <th className="py-4 px-4 font-normal text-center">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="py-4 px-4">{u.username}</td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono bg-black/30 px-3 py-1.5 rounded-md text-sm w-32 truncate inline-block text-left" dir="ltr">
                    {showPass[u.username] ? u.password : '••••••••'}
                  </span>
                  <button onClick={() => togglePass(u.username)} className="text-gray-400 hover:text-white bg-white/5 p-1.5 rounded-md transition-colors">
                    {showPass[u.username] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <button onClick={() => handleDelete(u.username)} className="bg-red-500/10 text-red-400 p-2 rounded-lg hover:bg-red-500/20 transition-colors inline-block">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={3} className="py-12 text-center text-gray-500">لا يوجد مستخدمين مسجلين</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
