import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";
import CartPage from "./pages/Cart";
import Admin from "./pages/Admin";
import AdminMenu from "./pages/AdminMenu";
import OrderSuccess from "./pages/OrderSuccess";
import CartButton from "./components/CartButton";
import CartDrawer from "./components/CartDrawer";
import { useState } from "react";

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Navbar />

      {/* IMPORTANT: pass openDrawer */}
      <CartButton openDrawer={() => setDrawerOpen(true)} />

      {/* IMPORTANT: Drawer must be rendered */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/admin" element={<Admin />} />

        {/* Fixed path */}
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
