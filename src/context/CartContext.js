import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cart from database on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartData = await cartAPI.getCart();
        setCartItems(cartData);
      } catch (error) {
        console.error('Failed to load cart:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const addToCart = async (product, quantity = 1) => {
    try {
      const result = await cartAPI.addToCart(product.id, quantity);
      setCartItems(prev => [...prev, result]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const updatedItem = await cartAPI.updateCartItem(cartItemId, quantity);
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? updatedItem : item
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await cartAPI.removeFromCart(cartItemId);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const value = {
    cartItems,
    isCartOpen,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    toggleCart,
    closeCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};