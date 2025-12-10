import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

export default function CartButton({ openDrawer }) {
  const { cart } = useCart();
  const qty = cart.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <button
      className="cart-fab"
      onClick={openDrawer}
      aria-label="Open cart"
      title="Open cart"
    >
      🧺
      <span className="cart-count">{qty}</span>
    </button>
  );
}
