import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/layout.css";
import "../styles/cart.css";
import "../styles/buttons.css";
import Toast from "../components/Toast";


/* reuse saveOrders helper */
function saveOrderToStorage(order) {
  try {
    const raw = localStorage.getItem("byteMeals_orders");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(order);
    localStorage.setItem("byteMeals_orders", JSON.stringify(list));
    return true;
  } catch (err) {
    console.error("Saving order failed", err);
    return false;
  }
}

export default function CartPage() {
  const { cart, removeItem, updateQty, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  // Checkout UI state
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);


  function validateCustomer() {
    if (!name.trim()) return "Please enter your name.";
    if (!phone.trim()) return "Please enter your phone.";
    if (!/^\d{7,15}$/.test(phone.trim())) return "Phone should be digits (7–15).";
    if (!address.trim()) return "Please enter delivery address.";
    return "";
  }

  function handleCheckoutSubmit(e) {
  e.preventDefault();
  setError("");

  const v = validateCustomer();
  if (v) { setError(v); return; }

  // Create aggregated order with customer details
  const order = {
    id: `ord_${Date.now()}`,
    createdAt: new Date().toISOString(),
    items: cart.map(i => ({
      id: i.id,
      name: i.name,
      qty: i.qty,
      price: i.price
    })),
    subtotal,
    tax,
    total,
    customer: {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim()
    },
    status: "new"
  };

  const ok = saveOrderToStorage(order);
  if (!ok) {
    setError("Failed to place order. Try again.");
    return;
  }

  // Save order for OrderSuccess page
  localStorage.setItem("byteMeals_lastOrder", JSON.stringify(order));

  // Show toast FIRST
  setShowToast(true);

  // Redirect AFTER toast animation
  setTimeout(() => {
    navigate("/order-success");

    // Clear cart AFTER redirect
    clearCart();
  }, 1200);
}


  return (
    <div className="page-container">
      <h1>Your Cart</h1>

      {cart.length === 0 ? (
        <p style={{ color: "#666" }}>Your cart is empty. Add dishes from the Menu.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: 12,
                borderRadius: 10,
                background: "#fff",
                border: "1px solid #ffe8d8"
              }}>
                <img src={item.image} alt={item.name} style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ color: "#666" }}>₹{item.price} each</div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, Math.max(1, Number(e.target.value)))}
                    style={{ width: 72, padding: 8, borderRadius: 8 }}
                  />
                  <div style={{ width: 90, textAlign: "right", fontWeight: 700 }}>₹{(item.price * item.qty).toFixed(0)}</div>
                  <button onClick={() => removeItem(item.id)} style={{ marginLeft: 6 }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, textAlign: "right" }}>
            <div style={{ marginBottom: 6 }}>Subtotal: ₹{subtotal}</div>
            <div style={{ marginBottom: 6 }}>Tax (5%): ₹{tax}</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Total: ₹{total}</div>

            <div style={{ marginTop: 12 }}>
              {!showCheckoutForm ? (
                <>
                  <button className="active-btn" onClick={() => setShowCheckoutForm(true)}>Checkout</button>
                  <button onClick={() => { if (confirm("Clear cart?")) clearCart(); }} style={{ marginLeft: 10 }}>Clear Cart</button>
                </>
              ) : (
                <div style={{ marginTop: 16, textAlign: "left", maxWidth: 720, margin: "16px auto 0" }}>
                  <h3 style={{ marginBottom: 8 }}>Delivery details</h3>

                  <form onSubmit={handleCheckoutSubmit}>
                    <label>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, marginBottom: 10 }} />

                    <label>Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, marginBottom: 10 }} placeholder="Digits only" />

                    <label>Address</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, minHeight: 80, marginBottom: 10 }} />

                    <label>Notes (optional)</label>
                    <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, marginBottom: 10 }} />

                    {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" className="active-btn">Place order</button>
                      <button type="button" onClick={() => setShowCheckoutForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {showToast && (
                <Toast
                  message="Order placed successfully!"
                  onClose={() => setShowToast(false)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
