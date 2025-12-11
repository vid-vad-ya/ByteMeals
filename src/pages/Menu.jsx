import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import "../styles/layout.css";
import "../styles/menu.css";
import "../styles/buttons.css";

function loadMenu() {
  try {
    const raw = localStorage.getItem("byteMeals_menu");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function Menu() {
  const { addItem } = useCart();

  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Main", "Rice", "Curry", "Snacks", "Dessert"];

  useEffect(() => {
    setMenu(loadMenu());
    setTimeout(() => setLoading(false), 200);
  }, []);

  const filtered = menu
    .filter((it) => (category === "All" ? true : it.category === category))
    .filter((it) =>
      search ? it.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  const sorted = filtered.slice().sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="page-container">
      <h1>Menu (For Tomorrow)</h1>

      <div className="menu-header">
        <input
          className="menu-search"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="menu-select"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="chip-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={category === cat ? "chip chip-active" : "chip"}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skeleton loader */}
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
      ) : (
        <div className="menu-grid">
          {sorted.map((dish) => (
            <div key={dish.id} className="card">
              <div className="card-media">
                <img
                  src={
                    dish.image ||
                    "https://via.placeholder.com/300x220?text=No+Image"
                  }
                  alt={dish.name}
                />
              </div>

              <div className="card-body">
                <div className="card-row">
                  <h3 className="card-title">{dish.name}</h3>
                  <span className={`veg-dot ${dish.veg ? "veg" : "non-veg"}`} />
                </div>

                <div className="card-sub">₹{dish.price}</div>

                <div className="card-meta">
                  <span className="tag category">{dish.category}</span>
                </div>

                <button
                  className="active-btn"
                  onClick={() =>
                    addItem({
                      id: dish.id,
                      name: dish.name,
                      price: dish.price,
                      image: dish.image,
                      qty: 1,
                    })
                  }
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
