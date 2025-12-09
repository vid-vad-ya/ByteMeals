import { useState, useMemo } from "react";
import menu from "../data/menu.json";
import "../styles/layout.css";
import "../styles/buttons.css";

/**
 * Order form:
 * - choose a dish (select populated from menu.today + menu.tomorrow)
 * - quantity, name, phone, address
 * - validate required fields
 * - save to localStorage under 'byteMeals_orders'
 */

function getAllItems() {
  // flatten today + tomorrow into a single list
  const today = Array.isArray(menu.today) ? menu.today : [];
  const tomorrow = Array.isArray(menu.tomorrow) ? menu.tomorrow : [];
  return [...today, ...tomorrow];
}

function saveOrder(order) {
  try {
    const raw = localStorage.getItem("byteMeals_orders");
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(order); // newest first
    localStorage.setItem("byteMeals_orders", JSON.stringify(list));
    return true;
  } catch (err) {
    console.error("Saving order failed", err);
    return false;
  }
}

export default function Order() {
  const items = useMemo(() => getAllItems(), []);
  const [dishId, setDishId] = useState(items[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const selectedItem = items.find((i) => i.id === (typeof dishId === "string" ? Number(dishId) : dishId)) || null;

  function validate() {
    if (!dishId) return "Please choose a dish.";
    if (!name.trim()) return "Please enter your name.";
    if (!phone.trim()) return "Please enter your phone number.";
    if (!/^\d{7,15}$/.test(phone.trim())) return "Phone should be digits (7–15 chars).";
    if (!address.trim()) return "Please enter delivery address.";
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) return "Quantity must be 1 or more.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const order = {
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      dishId: Number(dishId),
      dishName: selectedItem?.name ?? "Unknown",
      price: selectedItem?.price ?? 0,
      quantity: Number(quantity),
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim()
      },
      status: "new"
    };

    const ok = saveOrder(order);
    if (!ok) {
      setError("Saving order failed. Please try again.");
      return;
    }

    setSuccess(order);
    // reset form
    setDishId(items[0]?.id ?? "");
    setQuantity(1);
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
  }

  return (
    <div className="page-container">
      <h1>Place an Order</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Choose dish</label>
        <select
          value={dishId}
          onChange={(e) => setDishId(e.target.value)}
          style={{ padding: 10, borderRadius: 8, width: "100%", marginBottom: 12 }}
        >
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.name} — ₹{it.price} {it.veg ? "(Veg)" : "(Non-Veg)"}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{ padding: 10, borderRadius: 8, width: "100%" }}
            />
          </div>
        </div>

        <label style={{ display: "block", marginTop: 8 }}>Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: 10, borderRadius: 8, width: "100%", marginBottom: 12 }}
        />

        <label>Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: 10, borderRadius: 8, width: "100%", marginBottom: 12 }}
          placeholder="Digits only"
        />

        <label>Delivery address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ padding: 10, borderRadius: 8, width: "100%", minHeight: 80, marginBottom: 12 }}
        />

        <label>Notes (optional)</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ padding: 10, borderRadius: 8, width: "100%", marginBottom: 12 }}
        />

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit">Place Order</button>
          <button type="button" onClick={() => {
            setDishId(items[0]?.id ?? "");
            setQuantity(1);
            setName("");
            setPhone("");
            setAddress("");
            setNotes("");
            setError("");
          }}>Reset</button>
        </div>
      </form>

      {success && (
        <div style={{
          marginTop: 22,
          padding: 14,
          borderRadius: 12,
          background: "#f7fff4",
          border: "1px solid #dff4e1"
        }}>
          <strong>Order placed!</strong>
          <div style={{ marginTop: 8 }}>
            Order ID: <code>{success.id}</code>
          </div>
          <div>Dish: {success.dishName} × {success.quantity}</div>
          <div>Customer: {success.customer.name} — {success.customer.phone}</div>
        </div>
      )}
    </div>
  );
}
