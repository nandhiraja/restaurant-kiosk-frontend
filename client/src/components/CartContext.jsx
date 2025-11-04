import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => cartItem.itemId === item.itemId && 
        JSON.stringify(cartItem.selectedCustomizations) === JSON.stringify(item.selectedCustomizations)
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity
        };
        return { items: updatedItems };
      } else {
        // New item, add to cart
        return { items: [...prevCart.items, { ...item, cartId: Date.now() }] };
      }
    });
  };

  const removeItem = (index) => {
    setCart(prevCart => ({
      items: prevCart.items.filter((_, i) => i !== index)
    }));
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => {
      const updatedItems = [...prevCart.items];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: newQuantity
      };
      return { items: updatedItems };
    });
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      const basePrice = item.price || 0;
      const taxAmount = item.taxAmount || 0;
      const itemTotal = (basePrice + taxAmount) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart,
        getCartTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
