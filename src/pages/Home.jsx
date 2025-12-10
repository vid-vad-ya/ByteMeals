import { useNavigate } from "react-router-dom";
import "../styles/layout.css";
import "../styles/buttons.css";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-left">
          <h1 className="hero-title">
            Homemade Fresh Meals, Delivered Daily 🍱
          </h1>

          <p className="hero-subtitle">
            Enjoy warm, tasty, home‑cooked tiffin meals prepared with love.
            Healthy, affordable, and delivered right to your doorstep.
          </p>

          <button
            className="active-btn hero-btn"
            onClick={() => navigate("/menu")}
          >
            Order Now
          </button>
        </div>

        {/* RIGHT ILLUSTRATION */}
        <div className="hero-right">
          <img
            src="https://i.imgur.com/v5ZQZMe.png"
            alt="Tiffin Illustration"
            className="hero-img"
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="features">
        <div className="feature-card">
          <span className="feature-emoji">🍛</span>
          <h3>Fresh & Homemade</h3>
          <p>Prepared daily with high‑quality ingredients.</p>
        </div>

        <div className="feature-card">
          <span className="feature-emoji">🚚</span>
          <h3>Fast Delivery</h3>
          <p>Hot meals delivered safely to your doorstep.</p>
        </div>

        <div className="feature-card">
          <span className="feature-emoji">💸</span>
          <h3>Budget Friendly</h3>
          <p>Delicious meals at affordable prices.</p>
        </div>
      </div>
    </div>
  );
}
