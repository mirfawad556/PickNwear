"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, removeFromCart, updateCartQuantity, clearCart } from '@/app/actions/cart';

export type CartItem = {
  id: string; // unique ID in cart
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      getCart().then(res => {
        if (res.success && res.cart) {
          setCart(res.cart);
        }
      });
    } else {
      setCart([]);
    }
  }, [user]);

  const handleAddToCart = async (product: any) => {
    if (!user) return;
    
    // Optimistic UI Update
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        id: Date.now().toString(), 
        productId: product.id, 
        name: product.name, 
        price: Number(product.price), 
        image: product.image, 
        quantity: 1 
      }]);
    }
    
    // Backend sync
    await addToCart(product);
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    if (!user) return;
    setCart(cart.filter(item => item.id !== cartItemId));
    await removeFromCart(cartItemId);
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await handleRemoveFromCart(cartItemId);
      return;
    }
    setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity } : item));
    await updateCartQuantity(cartItemId, quantity);
  };

  const handleClearCart = async () => {
    if (!user) return;
    setCart([]);
    await clearCart();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!mounted) return null;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart: handleAddToCart, 
      removeFromCart: handleRemoveFromCart, 
      updateQuantity: handleUpdateQuantity, 
      clearCart: handleClearCart,
      totalItems, 
      totalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
