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
    const next = orders.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    setOrders(next);
    saveOrders(next);
  }

  function clearAll() {
    if (!confirm("Clear ALL saved orders?")) return;
    saveOrders([]);
    setOrders([]);
  }

  return (
    <div className="page-container">
      <h1>Orders (Admin)</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setOrders(loadOrders())}>Refresh</button>
        <button onClick={clearAll} style={{ marginLeft: 12 }}>
          Clear all
        </button>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: "#666" }}>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {orders.map((o) => {
            const isCartOrder = Array.isArray(o.items);

            return (
              <div
                key={o.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "#fff",
                  border: "1px solid #ffe8d8",
                  boxShadow: "0 4px 10px rgba(255,140,66,0.12)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  {/* LEFT SIDE */}
                  <div style={{ flex: 1 }}>
                    {/* CART CHECKOUT ORDER */}
                    {isCartOrder && (
                      <>
                        <strong style={{ fontSize: 16 }}>
                          Order Items:
                        </strong>
                        <ul
                          style={{
                            marginTop: 6,
                            paddingLeft: 20,
                            lineHeight: "1.6",
                          }}
                        >
                          {o.items.map((it, i) => (
                            <li key={i}>
                              {it.name} × {it.qty} — ₹
                              {it.price * it.qty}
                            </li>
                          ))}
                        </ul>

                        <div
                          style={{
                            marginTop: 10,
                            fontWeight: 700,
                            fontSize: 17,
                            color: "#3d2b1f",
                          }}
                        >
                          Total: ₹{o.total}
                        </div>
                      </>
                    )}

                    {/* SINGLE ITEM ORDER (OLD FORM) */}
                    {!isCartOrder && (
                      <>
                        <strong style={{ fontSize: 16 }}>
                          {o.dishName}
                        </strong>{" "}
                        × {o.quantity} — ₹
                        {(o.price || 0) * (o.quantity || 1)}

                        <div
                          style={{
                            color: "#666",
                            marginTop: 6,
                          }}
                        >
                          {o.customer?.name} • {o.customer?.phone}
                        </div>

                        <div
                          style={{
                            color: "#666",
                            marginTop: 6,
                          }}
                        >
                          {o.customer?.address}
                        </div>
                      </>
                    )}
                  </div>

                  {/* RIGHT SIDE */}
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        marginBottom: 8,
                        fontSize: 13,
                        color: "#5a4a42",
                      }}
                    >
                      {new Date(o.createdAt).toLocaleString()}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => markStatus(o.id, "preparing")}
                      >
                        Preparing
                      </button>
                      <button
                        onClick={() => markStatus(o.id, "delivered")}
                      >
                        Delivered
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontWeight: 700,
                        color:
                          o.status === "delivered"
                            ? "#1da150"
                            : o.status === "preparing"
                            ? "#ff8b42"
                            : "#3d2b1f",
                      }}
                    >
                      {o.status}
                    </div>
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
