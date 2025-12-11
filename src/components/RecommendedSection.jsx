// src/components/RecommendedSection.jsx
import React from "react";
import "../styles/recommend.css";

export default function RecommendedSection({ recommendations, reason, onAdd }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="reco-section">
      <h2>🔥 Recommended for you</h2>
      {reason && <p className="reco-reason">Because you ordered {reason}</p>}

      <div className="reco-scroll">
        {recommendations.map((dish) => (
          <div key={dish.id} className="reco-card">
            <img src={dish.image} className="reco-img" />

            <div className="reco-info">
              <div className="reco-name">{dish.name}</div>
              <div className="reco-price">₹{dish.price}</div>
            </div>

            <button className="active-btn small" onClick={() => onAdd(dish)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

