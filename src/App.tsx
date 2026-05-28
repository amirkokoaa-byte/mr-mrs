import React, { useState, useEffect } from 'react';
import { store } from './store';
import { User, Product, CartItem, AppSettings } from './types';
import { Header, Footer, WhatsAppButton } from './components/Shared';
import { StoreFront } from './components/StoreFront';
import { ProductDetails } from './components/ProductDetails';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { CartModal, CheckoutModal } from './components/Modals';
import { AiChatBot } from './components/AiChatBot';

export default function App() {
  const [view, setView] = useState<'home' | 'product' | 'admin'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [user, setUser] = useState<User | null>(() => store.getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(() => store.getSettings());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts());
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const u = store.getCurrentUser();
    return u?.cart ? u.cart : store.getGuestCart();
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const u = store.getCurrentUser();
    return u?.wishlist ? u.wishlist : store.getGuestWishlist();
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cross-tab auto sync for real-time appearance of changes
  useEffect(() => {
    const handleStorage = () => {
      setProducts(store.getProducts());
      setSettings(store.getSettings());
      if (user) {
         const currentUsers = store.getUsers();
         const updatedMe = currentUsers.find(u => u.username === user.username);
         if (updatedMe) {
           setUser(updatedMe);
           // Avoid overriding local changes during storage sync, or check if it actually changed
         }
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('local-storage-sync', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('local-storage-sync', handleStorage);
    };
  }, [user?.username]);

  // Sync products if they change (e.g., deleted in admin)
  useEffect(() => {
    setProducts(store.getProducts());
    setSettings(store.getSettings());
  }, [view]);

  // Persist cart and wishlist
  useEffect(() => {
    if (user) {
      const currentUsers = store.getUsers();
      const dbUser = currentUsers.find(u => u.username === user.username) || user;
      const updatedUser = { ...dbUser, cart, wishlist };
      store.saveUser(updatedUser);
      store.setCurrentUser(updatedUser);
    } else {
      store.saveGuestCart(cart);
      store.saveGuestWishlist(wishlist);
    }
  }, [cart, wishlist, user?.username]);

  const handleLogin = (u: User) => {
    let mergedCart = u.cart || [];
    let mergedWishlist = u.wishlist || [];
    if (!u.cart && cart.length > 0) mergedCart = cart;
    if (!u.wishlist && wishlist.length > 0) mergedWishlist = wishlist;
    u.cart = mergedCart;
    u.wishlist = mergedWishlist;
    setUser(u);
    store.setCurrentUser(u);
    setCart(mergedCart);
    setWishlist(mergedWishlist);
  };

  const handleLogout = () => {
    setUser(null);
    store.setCurrentUser(null);
    setCart([]);
    setWishlist([]);
    if (view === 'admin') setView('home');
  };

  const navigateToHome = () => {
    setView('home');
    setSelectedProduct(null);
  };

  const navigateToProduct = (p: Product) => {
    store.incrementProductView(p.id);
    const updatedProducts = store.getProducts();
    setProducts(updatedProducts);
    const updatedProduct = updatedProducts.find(x => x.id === p.id) || p;
    setSelectedProduct(updatedProduct);
    setView('product');
  };

  const handleLikeToggle = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (wishlist.includes(p.id)) {
      setWishlist(wishlist.filter(id => id !== p.id));
    } else {
      setWishlist([...wishlist, p.id]);
    }
  };

  const handleAddToCart = (p: Product) => {
    const existing = cart.find(i => i.productId === p.id);
    if (existing) {
      setCart(cart.map(i => i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: p.id, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(cart.map(i => {
      if (i.productId === id) {
        const newQ = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQ };
      }
      return i;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.productId !== id));
  };
  
  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    // Real app would clear cart after successful payment tracking
    // setCart([]); 
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--color-bg-gray)] text-[var(--color-text-white,white)] font-sans selection:bg-white/10 overflow-x-hidden relative">
      <Header 
        settings={settings}
        user={user}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onGoHome={navigateToHome}
        onOpenAdmin={() => setView('admin')}
        isAdmin={user?.username === 'admin'}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 flex flex-col pt-0 z-10">
        {view === 'admin' && user?.username === 'admin' && (
          <AdminPanel onGoBack={navigateToHome} />
        )}
        
        {view === 'home' && (
          <StoreFront 
            bannerImage={settings.bannerImage}
            products={products}
            onProductClick={navigateToProduct}
            likedProductIds={wishlist}
            onLikeToggle={handleLikeToggle}
            searchQuery={searchQuery}
          />
        )}
        
        {view === 'product' && selectedProduct && (
          <ProductDetails 
            product={selectedProduct}
            allProducts={products}
            onBack={navigateToHome}
            onAddToCart={handleAddToCart}
            isLiked={wishlist.includes(selectedProduct.id)}
            onLikeToggle={handleLikeToggle}
            onProductClick={navigateToProduct}
            likedProductIds={wishlist}
          />
        )}
      </main>

      <Footer />
      <WhatsAppButton number={settings.whatsappNumber} />

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin} 
      />
      
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onContinueShopping={() => setIsCartOpen(false)}
        onCheckout={handleCheckoutClick}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
      />

      <AiChatBot appName={settings.appName} />
    </div>
  );
}
