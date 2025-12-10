import { useEffect, useState } from "react";
import "../styles/layout.css";
import "../styles/buttons.css";

/* -------- Storage Helpers -------- */
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

/* -------- Time Ago Helper -------- */
function timeAgo(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  function refresh() {
    setOrders(loadOrders());
  }

  function clearAll() {
    if (!confirm("Clear ALL saved orders?")) return;
    saveOrders([]);
    setOrders([]);
  }

  function markStatus(id, status) {
    const updated = orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    saveOrders(updated);
    setOrders(updated);
  }

  return (
    <div className="page-container">
      <h1 style={{ color: "#3c2b22", marginBottom: "12px" }}>
        Orders (Admin)
      </h1>

      {/* Admin Controls */}
      <div style={{ marginBottom: 18, display: "flex", gap: 12 }}>
        <button onClick={refresh} className="active-btn">
          Refresh
        </button>
        <button onClick={clearAll} className="light-btn">
          Clear all
        </button>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: "#666" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {orders.map((o) => {
            const isCartOrder = Array.isArray(o.items);

            return (
              <div
                key={o.id}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: "#fffaf6",
                  border: "1px solid #ffe4cc",
                  boxShadow: "0 4px 14px rgba(255,140,66,0.15)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                {/* LEFT SECTION */}
                <div style={{ flex: 1 }}>
                  {/* Order ID and time */}
                  <div
                    style={{
                      fontSize: 14,
                      color: "#6b564d",
                      marginBottom: 6,
                    }}
                  >
                    <strong>{o.id}</strong> • {timeAgo(o.createdAt)}
                  </div>

                  {/* CART ORDER (new system) */}
                  {isCartOrder && (
                    <>
                      <h3 style={{ marginBottom: 6 }}>Items</h3>
                      <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
                        {o.items.map((it, i) => (
                          <li key={i}>
                            {it.name} × {it.qty} — ₹{it.qty * it.price}
                          </li>
                        ))}
                      </ul>

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 17,
                          marginTop: 10,
                          color: "#3d2b1f",
                        }}
                      >
                        Total: ₹{o.total}
                      </div>

                      {/* CUSTOMER DETAILS */}
                      <div style={{ marginTop: 14 }}>
                        <h3 style={{ marginBottom: 4 }}>Customer Details</h3>
                        <p><strong>Name:</strong> {o.customer?.name}</p>
                        <p><strong>Phone:</strong> {o.customer?.phone}</p>
                        <p><strong>Address:</strong> {o.customer?.address}</p>

                        {o.customer?.notes && (
                          <p
                            style={{
                              marginTop: 6,
                              padding: "6px 10px",
                              background: "#fff2e8",
                              borderRadius: 8,
                              border: "1px solid #ffd5bf",
                              color: "#5a3c28",
                              display: "inline-block",
                            }}
                          >
                            <strong>Note:</strong> {o.customer.notes}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* LEGACY ORDERS (old single-dish format) */}
                  {!isCartOrder && (
                    <>
                      <h3>{o.dishName}</h3>
                      <p>
                        Qty: {o.quantity} — ₹{(o.price || 0) * o.quantity}
                      </p>
                      <div style={{ marginTop: 12 }}>
                        <p><strong>Name:</strong> {o.customer?.name}</p>
                        <p><strong>Phone:</strong> {o.customer?.phone}</p>
                        <p><strong>Address:</strong> {o.customer?.address}</p>

                        {o.customer?.notes && (
                          <p><strong>Notes:</strong> {o.customer.notes}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* RIGHT SECTION — Status Controls */}
                <div style={{ minWidth: 160, textAlign: "right" }}>
                  {/* Status Buttons */}
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      className="light-btn"
                      onClick={() => markStatus(o.id, "preparing")}
                    >
                      Preparing
                    </button>
                    <button
                      className="light-btn"
                      onClick={() => markStatus(o.id, "delivered")}
                    >
                      Delivered
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      marginTop: 12,
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "6px 12px",
                      borderRadius: 10,
                      display: "inline-block",
                      background:
                        o.status === "delivered"
                          ? "#d4f8dd"
                          : o.status === "preparing"
                          ? "#ffe7c2"
                          : "#eee",
                      color:
                        o.status === "delivered"
                          ? "#1d8f3c"
                          : o.status === "preparing"
                          ? "#b66a00"
                          : "#555",
                    }}
                  >
                    {o.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
