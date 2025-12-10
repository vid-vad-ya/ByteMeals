import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import CartPage from "./pages/Cart";
import Admin from "./pages/Admin";
import CartButton from "./components/CartButton";
import OrderSuccess from "./pages/OrderSuccess";
import CartDrawer from "./components/CartDrawer";
import { useState } from "react";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Navbar />

      {/* IMPORTANT: Pass openDrawer prop to CartButton */}
      <CartButton openDrawer={() => setDrawerOpen(true)} />

      {/* Cart Drawer */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<Admin />} />
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
