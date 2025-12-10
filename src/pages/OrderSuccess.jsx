import "../styles/layout.css";
import "../styles/buttons.css";

export default function OrderSuccess({ order }) {
  if (!order) {
    return (
      <div className="page-container">
        <h1>Order Placed!</h1>
        <p>Your order has been placed successfully.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Order Confirmed 🎉</h1>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          border: "1px solid #ffe8d8",
          maxWidth: 600,
        }}
      >
        <h2 style={{ marginBottom: 8 }}>Order ID: {order.id}</h2>

        <h3 style={{ marginTop: 10 }}>Items</h3>
        <ul style={{ paddingLeft: 20, lineHeight: 1.6 }}>
          {order.items.map((it, i) => (
            <li key={i}>
              {it.name} × {it.qty} — ₹{it.price * it.qty}
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: 14 }}>Customer Details</h3>
        <p><strong>Name:</strong> {order.customer.name}</p>
        <p><strong>Phone:</strong> {order.customer.phone}</p>
        <p><strong>Address:</strong> {order.customer.address}</p>
        {order.customer.notes && (
          <p><strong>Notes:</strong> {order.customer.notes}</p>
        )}

        <h3 style={{ marginTop: 14 }}>Payment Summary</h3>
        <p>Subtotal: ₹{order.subtotal}</p>
        <p>Tax (5%): ₹{order.tax}</p>
        <p><strong>Total: ₹{order.total}</strong></p>
      </div>

      <button
        className="active-btn"
        style={{ marginTop: 20 }}
        onClick={() => window.location.href = "/menu"}
      >
        Back to Menu
      </button>
    </div>
  );
}
