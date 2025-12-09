import { useCart } from "../context/CartContext";

export default function MenuCard({ item, onClick }) {
  const { addItem } = useCart();

  return (
    <div className="menu-card" onClick={onClick} role="button" tabIndex={0}>
      <img src={item.image} alt={item.name} />
      <h3>{item.name}</h3>
      <p className="price">₹{item.price}</p>
      <p className={`veg ${item.veg ? "green" : "red"}`}>{item.veg ? "Veg" : "Non‑Veg"}</p>

      <div style={{ padding: 12, display: "flex", gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); addItem(item, 1); }}
          aria-label={`Add ${item.name} to cart`}
        >
          Add to cart
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); /* optional: open preview */ onClick && onClick(); }}
          style={{ background: "transparent", border: "1px solid #ffd8b3" }}
        >
          View
        </button>
      </div>
    </div>
  );
}
