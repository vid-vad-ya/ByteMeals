import "../styles/layout.css";

export default function OrderSuccess({ order }) {
  if (!order) {
    return (
      <div className="page-container">
        <h2>Order Not Found</h2>
        <p>No order data available.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "32px", color: "#3c2b22", marginBottom: "20px" }}>
        Order Confirmed 🎉
      </h1>

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 18,
          boxShadow: "0 4px 20px rgba(255,140,70,0.15)",
          border: "1px solid #ffe4cc",
          textAlign: "left"
        }}
      >
        <h2 style={{ color: "#3c2b22", marginBottom: 12 }}>
          Order ID: {order.id}
        </h2>

        <h3>Items</h3>
        <ul style={{ lineHeight: 1.6 }}>
          {order.items.map((it, idx) => (
            <li key={idx}>
              {it.name} × {it.qty} — ₹{it.qty * it.price}
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: 18 }}>Customer Details</h3>
        <p><strong>Name:</strong> {order.customer.name}</p>
        <p><strong>Phone:</strong> {order.customer.phone}</p>
        <p><strong>Address:</strong> {order.customer.address}</p>

        {order.customer.notes && (
          <p><strong>Notes:</strong> {order.customer.notes}</p>
        )}

        <h3 style={{ marginTop: 18 }}>Payment Summary</h3>
        <p>Subtotal: ₹{order.subtotal}</p>
        <p>Tax (5%): ₹{order.tax}</p>
        <p style={{ fontWeight: 800, fontSize: 18 }}>
          Total: ₹{order.total}
        </p>
      </div>

      <button
        onClick={() => (window.location.href = "/menu")}
        style={{
          marginTop: 30,
          background: "linear-gradient(135deg, #ff8b42, #ff6a3d)",
          padding: "14px 24px",
          borderRadius: 12,
          color: "#fff",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Back to Menu
      </button>
    </div>
  );
}
