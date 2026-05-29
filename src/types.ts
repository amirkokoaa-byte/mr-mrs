export interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number; // Percentage 0-100
  colors: string[];
  sizes: string[];
  category: string;
  imageUrl: string;
  reviews?: Review[];
  isArchived?: boolean;
  isAvailable?: boolean;
  offerEndTime?: string;
  showInSpecialOffers?: boolean;
  isPinned?: boolean;
  views?: number;
  shippingCost?: number;
}

export interface User {
  username: string;
  password?: string; // Stored in plain text for this local demo as requested
  wishlist: string[]; // Product IDs
  cart?: CartItem[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface AppSettings {
  appName: string;
  bannerImage: string;
  whatsappNumber: string;
  walletNumber: string;
  instapayHandle: string;
  fawryNumber: string;
  socialLinks?: {
    phone?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
  };
}

export interface AiOrder {
  id: string;
  date: string;
  time: string;
  phone: string;
  messages: { sender: 'bot' | 'user'; text: string }[];
  summary: {
    name: string;
    product: string;
    phone: string;
    address: string;
    locationText: string;
  };
}

export interface Category {
  id: string;
  name: string;
}
