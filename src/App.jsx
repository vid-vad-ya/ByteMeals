import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";
import CartPage from "./pages/Cart";
import Admin from "./pages/Admin";
import AdminMenu from "./pages/AdminMenu";
import OrderSuccess from "./pages/OrderSuccess";
import CartButton from "./components/CartButton";

export default function App() {
  return (
    <>
      <Navbar />
      <CartButton />

      <Routes>
        {/* Home → Menu */}
        <Route path="/" element={<Menu />} />

        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<Admin />} />

        {/* FIXED: matches Navbar */}
        <Route path="/admin/menu" element={<AdminMenu />} />

        <Route path="/order-success" element={<OrderSuccessWrapper />} />
      </Routes>
    </>
  );
}

function OrderSuccessWrapper() {
  const raw = localStorage.getItem("byteMeals_lastOrder");
  const order = raw ? JSON.parse(raw) : null;
  return <OrderSuccess order={order} />;
}
