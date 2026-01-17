import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SizedStock = {
  small: number;
  medium: number;
  large: number;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  subcategory?: string;
  images: string[];
  description?: string;
  isFeatured?: boolean;
  inStock?: boolean;
  quantity?: number;
  tags?: string[];
  // Ring-specific fields
  isAdjustable?: boolean;
  sizedStock?: SizedStock;
  totalSizedStock?: number;
};

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string; // For sized rings
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "jewel_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedSize?: string) => {
    setItems((prev) => {
      // For sized rings, use both productId and size as identifier
      const itemKey = selectedSize ? `${product.id}_${selectedSize}` : product.id;
      const existing = prev.find((i) => {
        if (selectedSize) {
          return i.productId === product.id && i.selectedSize === selectedSize;
        }
        return i.productId === product.id && !i.selectedSize;
      });
      
      if (existing) {
        return prev.map((i) => {
          if (selectedSize) {
            return (i.productId === product.id && i.selectedSize === selectedSize) 
              ? { ...i, quantity: i.quantity + quantity } 
              : i;
          }
          return i.productId === product.id && !i.selectedSize 
            ? { ...i, quantity: i.quantity + quantity } 
            : i;
        });
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.images[0],
          quantity,
          selectedSize,
        },
      ];
    });
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    setItems((prev) => prev.filter((i) => {
      if (selectedSize) {
        return !(i.productId === productId && i.selectedSize === selectedSize);
      }
      return i.productId !== productId;
    }));
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    setItems((prev) => prev.map((i) => {
      if (selectedSize) {
        return (i.productId === productId && i.selectedSize === selectedSize) 
          ? { ...i, quantity } 
          : i;
      }
      return i.productId === productId ? { ...i, quantity } : i;
    }));
  };

  const clearCart = () => setItems([]);

  const { totalItems, totalPrice } = useMemo(() => {
    const totalItems = items.reduce((a, b) => a + b.quantity, 0);
    const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);
    return { totalItems, totalPrice };
  }, [items]);

  const value = { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
