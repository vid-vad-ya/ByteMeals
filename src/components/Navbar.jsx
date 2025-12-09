import { Link } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="brand">ByteMeals 🍱</div>

        <Link className="nav-link" to="/">Home</Link>
        <Link className="nav-link" to="/menu">Menu</Link>
        <Link className="nav-link" to="/admin">Admin</Link>
      </div>
    </nav>
  );
}
