import { AppSettings, CartItem, Category, Product, User, AiOrder } from './types';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

const defaultSettings: AppSettings = {
  appName: 'Mr & Mrs Fashion',
  bannerImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
  whatsappNumber: '+201000000000',
  walletNumber: '01000000000',
  instapayHandle: 'user@instapay',
  fawryNumber: '123456789',
  socialLinks: { phone: '', instagram: '', facebook: '', telegram: '' }
};

// --- Helper Functions ---
const getLocal = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  const serialized = JSON.stringify(value);
  if (localStorage.getItem(key) === serialized) return;
  localStorage.setItem(key, serialized);
  window.dispatchEvent(new Event('local-storage-sync'));
};

const FIREBASE_SYNC_KEY = 'firebase-sync-initialized';

// Sync Firebase with LocalStorage
export const initFirebaseSync = () => {
   if (window[FIREBASE_SYNC_KEY as any]) return; // prevent dual init
   (window as any)[FIREBASE_SYNC_KEY] = true;

   onSnapshot(collection(db, 'products'), (snapshot) => {
       const products = snapshot.docs.map(d => d.data() as Product);
       if (products.length > 0) {
           setLocal('products', products);
       }
   });

   onSnapshot(doc(db, 'config', 'settings'), (docSnap) => {
       if (docSnap.exists()) {
           setLocal('settings', docSnap.data() as AppSettings);
       }
   });

   onSnapshot(collection(db, 'categories'), (snapshot) => {
       const categories = snapshot.docs.map(d => d.data() as Category);
       if (categories.length > 0) {
           setLocal('categories', categories);
       }
   });
};

// --- Store API ---
export const store = {
  getSettings: () => getLocal<AppSettings>('settings', defaultSettings),
  saveSettings: async (settings: AppSettings) => {
    setLocal('settings', settings);
    try { await setDoc(doc(db, 'config', 'settings'), settings); } catch(e) {}
  },

  getProducts: () => getLocal<Product[]>('products', []),
  saveProduct: async (product: Product) => {
    const products = store.getProducts();
    const existing = products.findIndex((p) => p.id === product.id);
    if (existing >= 0) {
      products[existing] = product;
    } else {
      products.push(product);
    }
    setLocal('products', products);
    try { await setDoc(doc(db, 'products', product.id), product); } catch(e) {}
  },
  deleteProduct: async (id: string) => {
    setLocal('products', store.getProducts().filter((p) => p.id !== id));
    try { await deleteDoc(doc(db, 'products', id)); } catch(e) {}
  },
  incrementProductView: async (id: string) => {
    const products = store.getProducts();
    const existing = products.findIndex((p) => p.id === id);
    if (existing >= 0) {
      const p = {
        ...products[existing],
        views: (products[existing].views || 0) + 1
      };
      products[existing] = p;
      setLocal('products', products);
      try { await setDoc(doc(db, 'products', p.id), p); } catch(e) {}
    }
  },

  getCategories: () => getLocal<Category[]>('categories', []),
  saveCategory: async (category: Category) => {
    const cats = store.getCategories();
    cats.push(category);
    setLocal('categories', cats);
    try { await setDoc(doc(db, 'categories', category.id), category); } catch(e) {}
  },

  getUsers: () => getLocal<User[]>('users', []),
  saveUser: async (user: User) => {
    const users = store.getUsers();
    const existing = users.findIndex((u) => u.username === user.username);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    setLocal('users', users);
    try { await setDoc(doc(db, 'users', user.username), user); } catch(e) {}
  },
  deleteUser: async (username: string) => {
    setLocal('users', store.getUsers().filter((u) => u.username !== username));
    try { await deleteDoc(doc(db, 'users', username)); } catch(e) {}
  },

  getCurrentUser: () => getLocal<User | null>('currentUser', null),
  setCurrentUser: (user: User | null) => setLocal('currentUser', user),

  getGuestCart: () => getLocal<CartItem[]>('guestCart', []),
  saveGuestCart: (cart: CartItem[]) => setLocal('guestCart', cart),
  
  getGuestWishlist: () => getLocal<string[]>('guestWishlist', []),
  saveGuestWishlist: (wishlist: string[]) => setLocal('guestWishlist', wishlist),

  getAiOrders: () => getLocal<AiOrder[]>('aiOrders', []),
  saveAiOrder: (order: AiOrder) => {
    const orders = store.getAiOrders();
    orders.push(order);
    setLocal('aiOrders', orders);
  },
};
