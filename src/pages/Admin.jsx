import { useEffect, useState } from "react";
import "../styles/layout.css";
import "../styles/buttons.css";

function loadOrders() {
  try {
    const raw = localStorage.getItem("byteMeals_orders");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

function saveOrders(list) {
  localStorage.setItem("byteMeals_orders", JSON.stringify(list));
}

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  function markStatus(id, status) {
    const next = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(next);
    saveOrders(next);
  }

  function clearAll() {
    if (!confirm("Clear all saved orders?")) return;
    saveOrders([]);
    setOrders([]);
  }

  return (
    <div className="page-container">
      <h1>Orders (Admin)</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { setOrders(loadOrders()); }}>Refresh</button>
        <button onClick={clearAll} style={{ marginLeft: 12 }}>Clear all</button>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: "#666" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #eee",
              background: "#fff"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div>
                  <strong>{o.dishName}</strong> × {o.quantity} — ₹{(o.price || 0) * (o.quantity || 1)}
                  <div style={{ color: "#666", marginTop: 6 }}>
                    {o.customer?.name} • {o.customer?.phone}
                  </div>
                  <div style={{ color: "#666", marginTop: 6 }}>{o.customer?.address}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: 8 }}>{new Date(o.createdAt).toLocaleString()}</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => markStatus(o.id, "preparing")}>Preparing</button>
                    <button onClick={() => markStatus(o.id, "delivered")}>Delivered</button>
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{o.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
