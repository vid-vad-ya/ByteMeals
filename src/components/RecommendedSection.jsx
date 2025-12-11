// src/components/RecommendedSection.jsx
import React from "react";
import "../styles/recommend.css";

export default function RecommendedSection({ recommendations, onAdd }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="reco-section">
      <h2>🔥 Recommended for you</h2>

      <div className="reco-scroll">
        {recommendations.map((dish) => (
          <div key={dish.id} className="reco-card">
            {dish.image ? (
              <img src={dish.image} alt={dish.name} className="reco-img" />
            ) : (
              <div className="reco-img placeholder" />
            )}

            <div className="reco-info">
              <div className="reco-name">{dish.name}</div>
              <div className="reco-price">₹{dish.price}</div>
              <div className="reco-meta">{dish.category} • {dish.veg ? "Veg" : "Non-Veg"}</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button className="active-btn small" onClick={() => onAdd && onAdd(dish)}>
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
