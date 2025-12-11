import { useEffect, useState, useRef } from "react";
import "../styles/layout.css";
import "../styles/buttons.css";

/* helpers */
function loadOrders() {
  try {
    const raw = localStorage.getItem("byteMeals_orders");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveOrders(list) {
  localStorage.setItem("byteMeals_orders", JSON.stringify(list));
}
function timeAgo(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* play short beep using WebAudio */
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 950;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    // ramp up
    g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    // ramp down
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // fallback: tiny alert
    // console.warn("audio failed", e);
  }
}

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // all | new | preparing | delivered
  const prevCountRef = useRef(0);

  useEffect(() => {
    const initial = loadOrders();
    setOrders(initial);
    prevCountRef.current = initial.length;

    // auto-refresh every 10s
    const id = setInterval(() => {
      const updated = loadOrders();
      // check for new orders
      if (updated.length > prevCountRef.current) {
        playDing();
      }
      prevCountRef.current = updated.length;
      setOrders(updated);
    }, 10000);

    return () => clearInterval(id);
  }, []);

  function refresh() {
    const updated = loadOrders();
    setOrders(updated);
    prevCountRef.current = updated.length;
  }

  function clearAll() {
    if (!confirm("Clear ALL saved orders?")) return;
    saveOrders([]);
    setOrders([]);
    prevCountRef.current = 0;
  }

  function markStatus(id, status) {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    saveOrders(updated);
    setOrders(updated);
  }

  const filtered = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "new") return o.status === "new";
    return o.status === filter;
  });

  return (
    <div className="page-container">
      <h1 style={{ color: "#3c2b22" }}>Admin Dashboard</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12, marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={filter === "all" ? "active-btn" : "light-btn"} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "new" ? "active-btn" : "light-btn"} onClick={() => setFilter("new")}>New</button>
          <button className={filter === "preparing" ? "active-btn" : "light-btn"} onClick={() => setFilter("preparing")}>Preparing</button>
          <button className={filter === "delivered" ? "active-btn" : "light-btn"} onClick={() => setFilter("delivered")}>Delivered</button>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={refresh}>Refresh</button>
          <button onClick={clearAll} className="light-btn">Clear all</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#777" }}>No orders found for this filter.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filtered.map(o => <OrderCard key={o.id} o={o} markStatus={markStatus} />)}
        </div>
      )}
    </div>
  );
}

function OrderCard({ o, markStatus }) {
  const [open, setOpen] = useState(false);
  const borderColor = o.status === "delivered" ? "#96e6a1" : o.status === "preparing" ? "#ffd28c" : "#ffb89a";

  return (
    <div
      onClick={() => setOpen(prev => !prev)}
      style={{
        borderRadius: 14,
        padding: 18,
        background: "#fff",
        border: `2px solid ${borderColor}`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        cursor: "pointer"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 800 }}>{o.id}</div>
          <div style={{ color: "#6b564d", fontSize: 13 }}>{timeAgo(o.createdAt)} • {o.customer?.name}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            padding: "6px 12px",
            borderRadius: 10,
            background: o.status === "delivered" ? "#d4f8dd" : o.status === "preparing" ? "#fff0d1" : "#ffefe9",
            color: o.status === "delivered" ? "#1d8f3c" : o.status === "preparing" ? "#b66a00" : "#b74227",
            fontWeight: 700
          }}>
            {o.status}
          </div>
          <div style={{ marginTop: 8, fontWeight: 700, color: "#3d2b1f" }}>₹{o.total}</div>
        </div>
      </div>

      {open && (
        <div style={{ marginTop: 14, borderTop: "1px solid #f0d8c8", paddingTop: 12 }}>
          <h4 style={{ margin: "6px 0" }}>Items</h4>
          <ul style={{ paddingLeft: 18 }}>
            {o.items.map((it, idx) => <li key={idx}>{it.name} × {it.qty} — ₹{it.price * it.qty}</li>)}
          </ul>

          <h4 style={{ marginTop: 12 }}>Customer</h4>
          <p><strong>Name:</strong> {o.customer?.name}</p>
          <p><strong>Phone:</strong> {o.customer?.phone}</p>
          <p><strong>Address:</strong> {o.customer?.address}</p>

          {o.customer?.notes && (
            <div style={{
              marginTop: 8,
              display: "inline-block",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #ffd7b3",
              background: "#fff4e8",
              color: "#5a3c28",
              fontWeight: 700
            }}>
              Note: {o.customer.notes}
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button className="light-btn" onClick={(e) => { e.stopPropagation(); markStatus(o.id, "preparing"); }}>Preparing</button>
            <button className="light-btn" onClick={(e) => { e.stopPropagation(); markStatus(o.id, "delivered"); }}>Delivered</button>
          </div>
        </div>
      )}
    </div>
  );
}
