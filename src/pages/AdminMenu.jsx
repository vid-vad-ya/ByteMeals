import { useEffect, useState } from "react";
import "../styles/layout.css";
import "../styles/buttons.css";
import "../styles/menuManager.css";

const MENU_KEY = "byteMeals_menu";

function loadMenu() {
  const raw = localStorage.getItem(MENU_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveMenu(list) {
  localStorage.setItem(MENU_KEY, JSON.stringify(list));
}

export default function AdminMenu() {
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("Main");
  const [veg, setVeg] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(loadMenu());
  }, []);

  function resetForm() {
    setName("");
    setPrice("");
    setImage("");
    setCategory("Main");
    setVeg(true);
    setError("");
  }

  function addItem() {
    if (!name.trim()) return setError("Dish name required.");
    if (!price.trim() || isNaN(Number(price)))
      return setError("Valid price required.");

    const newItem = {
      id: `dish_${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      category,
      veg
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveMenu(updated);
    resetForm();
  }

  function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveMenu(updated);
  }

  function editItem(id) {
    const it = items.find(i => i.id === id);
    if (!it) return;

    setName(it.name);
    setPrice(String(it.price));
    setImage(it.image);
    setCategory(it.category);
    setVeg(it.veg);

    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveMenu(updated);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page-container admin-menu-page">
      <h1>Menu Manager</h1>

      {/* Form */}
      <div className="menu-card">
        <div className="form-row">
          <input
            className="input"
            placeholder="Dish name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Price *"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Main</option>
            <option>Rice</option>
            <option>Curry</option>
            <option>Snacks</option>
            <option>Dessert</option>
          </select>
        </div>

        <input
          className="input full"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            checked={veg}
            onChange={() => setVeg(!veg)}
          />
          <span>Veg</span>
        </label>

        {error && <div className="error">{error}</div>}

        <div className="btn-row">
          <button className="active-btn" onClick={addItem}>Add Item</button>
          <button className="light-btn" onClick={resetForm}>Reset</button>
        </div>
      </div>

      {/* List */}
      <h2>Existing Items</h2>

      {items.length === 0 ? (
        <p>No menu items yet.</p>
      ) : (
        <div className="item-list">
          {items.map((dish) => (
            <div key={dish.id} className="item-card">
              <div className="item-info">
                <strong className="dish-name">{dish.name}</strong>
                <span className="price">₹{dish.price}</span>
                <div className="meta">
                  {dish.category} • {dish.veg ? "Veg" : "Non-Veg"}
                </div>
              </div>

              <div className="item-actions">
                <button className="edit-btn" onClick={() => editItem(dish.id)}>Edit</button>
                <button className="delete-btn" onClick={() => deleteItem(dish.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
