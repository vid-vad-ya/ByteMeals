import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/navbar.css";

export default function Navbar() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    function readPending() {
      try {
        const raw = localStorage.getItem("byteMeals_orders");
        const list = raw ? JSON.parse(raw) : [];
        const p = list.filter(o => o.status === "new").length;
        setPending(p);
      } catch {
        setPending(0);
      }
    }

    readPending();
    const id = setInterval(readPending, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand">ByteMeals 🍱</div>

        {/* Home = Menu */}
        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/menu">Menu</Link>
        <Link className="nav-link" to="/cart">Cart</Link>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <Link className="nav-link" to="/admin">
            Admin
            {pending > 0 && (
              <span style={{
                marginLeft: 8,
                background: "#e94b35",
                color: "#fff",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 700
              }}>{pending}</span>
            )}
          </Link>

          {/* FIXED: must match App.jsx */}
          <Link className="nav-link" to="/admin/menu">Menu Manager</Link>
        </div>
      </div>
    </nav>
  );
}
