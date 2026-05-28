import { AppSettings, CartItem, Category, Product, User, AiOrder } from './types';

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
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setLocal = <T>(key: string, value: T): void => {
  const serialized = JSON.stringify(value);
  if (localStorage.getItem(key) === serialized) return;
  localStorage.setItem(key, serialized);
  window.dispatchEvent(new Event('local-storage-sync'));
};

// --- Store API ---
export const store = {
  getSettings: () => getLocal<AppSettings>('settings', defaultSettings),
  saveSettings: (settings: AppSettings) => setLocal('settings', settings),

  getProducts: () => getLocal<Product[]>('products', []),
  saveProduct: (product: Product) => {
    const products = store.getProducts();
    const existing = products.findIndex((p) => p.id === product.id);
    if (existing >= 0) {
      products[existing] = product;
    } else {
      products.push(product);
    }
    setLocal('products', products);
  },
  deleteProduct: (id: string) => {
    setLocal('products', store.getProducts().filter((p) => p.id !== id));
  },
  incrementProductView: (id: string) => {
    const products = store.getProducts();
    const existing = products.findIndex((p) => p.id === id);
    if (existing >= 0) {
      products[existing] = {
        ...products[existing],
        views: (products[existing].views || 0) + 1
      };
      setLocal('products', products);
    }
  },

  getCategories: () => getLocal<Category[]>('categories', []),
  saveCategory: (category: Category) => {
    const cats = store.getCategories();
    cats.push(category);
    setLocal('categories', cats);
  },

  getUsers: () => getLocal<User[]>('users', []),
  saveUser: (user: User) => {
    const users = store.getUsers();
    const existing = users.findIndex((u) => u.username === user.username);
    if (existing >= 0) {
      users[existing] = user;
    } else {
      users.push(user);
    }
    setLocal('users', users);
  },
  deleteUser: (username: string) => {
    setLocal('users', store.getUsers().filter((u) => u.username !== username));
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
