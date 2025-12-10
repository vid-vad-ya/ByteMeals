import { useCart } from "../context/CartContext";
import "../styles/cartDrawer.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, updateQty, clearCart, subtotal } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  function validate() {
    if (!name.trim()) return "Please enter your name.";
    if (!phone.trim()) return "Please enter your phone.";
    if (!/^\d{7,15}$/.test(phone)) return "Phone should be digits (7–15).";
    if (!address.trim()) return "Please enter address.";
    return "";
  }

  function handlePlaceOrder() {
    const v = validate();
    if (v) { setError(v); return; }

    const order = {
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
      subtotal,
      tax,
      total,
      customer: { name, phone, address, notes },
      status: "new",
    };

    const raw = localStorage.getItem("byteMeals_orders");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(order);
    localStorage.setItem("byteMeals_orders", JSON.stringify(list));

    localStorage.setItem("byteMeals_lastOrder", JSON.stringify(order));

    clearCart();
    onClose();
    navigate("/order-success");
  }

  return (
    <>
      {/* Overlay */}
      <div className={`drawer-overlay ${open ? "show" : ""}`} onClick={onClose}></div>

      {/* Drawer */}
      <div className={`cart-drawer ${open ? "open" : ""}`}>
        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <p style={{ color: "#666" }}>Your cart is empty.</p>
        ) : (
          <>
            <div className="drawer-items">
              {cart.map(item => (
                <div key={item.id} className="drawer-item">
                  <img src={item.image} alt={item.name} />
                  <div className="drawer-info">
                    <div className="drawer-name">{item.name}</div>
                    <div className="drawer-price">₹{item.price}</div>
                  </div>

                  <div className="drawer-actions">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                    />
                    <button onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="drawer-summary">
              <div>Subtotal: ₹{subtotal}</div>
              <div>Tax (5%): ₹{tax}</div>
              <div className="drawer-total">Total: ₹{total}</div>
            </div>

            {/* Checkout form */}
            <h3>Delivery Details</h3>

            <input
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="drawer-input"
            />

            <input
                placeholder="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="drawer-input"
            />

            <textarea
                placeholder="Address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="drawer-input"
            />

            <input
                placeholder="Notes (optional)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="drawer-input"
            />

            {error && <div className="drawer-error">{error}</div>}

            <button className="active-btn drawer-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </>
        )}
      </div>
    </>
  );
}
