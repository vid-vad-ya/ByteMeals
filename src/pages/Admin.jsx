import { useEffect, useState } from "react";
import InsightsPanel from "../components/InsightsPanel";
import "../styles/admin.css";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("byteMeals_orders");
    setOrders(raw ? JSON.parse(raw) : []);
  }, []);

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>

      <h2 style={{ marginTop: 20 }}>📊 Sales Insights</h2>
      <InsightsPanel orders={orders} />

      <h2 style={{ marginTop: 30 }}>📦 Orders</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="admin-list">
          {orders.map((o) => (
            <div key={o.id} className="admin-card">
              <div className="row">
                <div className="order-id">{o.id}</div>
                <div>{new Date(o.createdAt).toLocaleString()}</div>
              </div>

              <div className="items">
                {o.items.map((i) => (
                  <div className="item" key={i.id}>
                    {i.qty}× {i.name}
                  </div>
                ))}
              </div>

              <div className="total">Total: ₹{o.total}</div>

              <div className="customer">
                <strong>{o.customer.name}</strong>
                <div>{o.customer.phone}</div>
                <div>{o.customer.address}</div>
                {o.customer.notes && (
                  <div className="notes">📝 {o.customer.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
