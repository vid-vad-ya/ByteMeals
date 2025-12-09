import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import CartPage from "./pages/Cart";
import Admin from "./pages/Admin";
import CartButton from "./components/CartButton";

export default function App() {
  return (
    <>
      <Navbar />
      <CartButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  );
}
