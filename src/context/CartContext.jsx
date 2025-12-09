import React, { createContext, useContext, useEffect, useState } from "react";

const CART_KEY = "byteMeals_cart";
const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  function addItem(item, qty = 1) {
    setCart(prev => {
      const found = prev.find(p => p.id === item.id);
      if (found) {
        return prev.map(p => p.id === item.id ? { ...p, qty: p.qty + qty } : p);
      }
      return [{ ...item, qty }, ...prev];
    });
  }

  function removeItem(id) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function updateQty(id, qty) {
    setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Number(qty) } : p));
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0);

  const value = {
    cart,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    subtotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
