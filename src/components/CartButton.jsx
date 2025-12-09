import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/cart.css";

export default function CartButton() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const qty = cart.reduce((s, i) => s + (i.qty || 0), 0);

  return (
    <button
      className="cart-fab"
      onClick={() => navigate("/cart")}
      aria-label="Open cart"
      title="Open cart"
    >
      🧺
      <span className="cart-count">{qty}</span>
    </button>
  );
}
