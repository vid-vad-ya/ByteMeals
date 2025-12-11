// src/pages/Menu.jsx
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import RecommendedSection from "../components/RecommendedSection";
import { getRecommendations } from "../ai/mlRecommender";
import "../styles/menu.css";
import "../styles/recommend.css";

function loadMenu() {
  try {
    const raw = localStorage.getItem("byteMeals_menu");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadOrders() {
  try {
    const raw = localStorage.getItem("byteMeals_orders");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Menu() {
  const { addItem } = useCart();
  const [menu, setMenu] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  // search / category / sort states (kept simple)
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const categories = ["All", "Main", "Rice", "Curry", "Snacks", "Dessert"];

  useEffect(() => {
    const m = loadMenu();
    setMenu(m);

    const orders = loadOrders();

    // compute recommendations (async-safe)
    (async () => {
      try {
        const recs = await getRecommendations(m, orders, 6);
        setRecommended(recs);
      } catch (e) {
        console.warn("recommendation failed", e);
        setRecommended([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = menu
    .filter((it) => (category === "All" ? true : it.category === category))
    .filter((it) => (search ? it.name.toLowerCase().includes(search.toLowerCase()) : true));

  const sorted = filtered.slice().sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="page-container">
      <h1>Menu (For Tomorrow)</h1>

      <div className="menu-header" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            className="menu-search"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={sort} onChange={(e) => setSort(e.target.value)} className="menu-select">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div style={{ margin: "10px 0 14px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button key={cat} className={category === cat ? "chip chip-active" : "chip"} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended section (mid-page) */}
      <RecommendedSection
        recommendations={recommended}
        onAdd={(dish) => addItem({ id: dish.id, name: dish.name, price: dish.price, image: dish.image, qty: 1 })}
      />

      {/* menu grid */}
      {loading ? (
        <div className="menu-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card skeleton">
              <div className="img-skel" />
              <div className="text-skel short" />
              <div className="text-skel long" />
              <div className="btn-skel" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p style={{ color: "#777" }}>No items found.</p>
      ) : (
        <div className="menu-grid">
          {sorted.map((dish) => (
            <div key={dish.id} className="card">
              <div className="card-media">
                <img src={dish.image || "https://via.placeholder.com/320x220?text=No+Image"} alt={dish.name} />
              </div>

              <div className="card-body">
                <div className="card-row">
                  <h3 className="card-title">{dish.name}</h3>
                  <div className={`veg-dot ${dish.veg ? "veg" : "non-veg"}`} />
                </div>

                <div className="card-sub">₹{dish.price}</div>

                <div className="card-meta">
                  <span className="tag category">{dish.category}</span>
                </div>

                <div className="card-actions">
                  <button className="active-btn" onClick={() => addItem({ id: dish.id, name: dish.name, price: Number(dish.price), image: dish.image, qty: 1 })}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
