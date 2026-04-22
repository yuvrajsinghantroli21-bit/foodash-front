import { BrowserRouter, Routes, Route } from "react-router-dom";

import { CartProvider } from "./context/CartContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Order from "./pages/Order";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Menu from "./pages/Menu";
import Cart from "./pages/Cart";

import ScanQR from "./pages/ScanQR";
import { Toaster } from "react-hot-toast";

import AdminDashboard from "./pages/AdminDashboard";
import AdminMenu from "./pages/AdminMenu";
import AdminHistory from "./pages/AdminHistory";
import AddMenu from "./pages/AddMenu";
import EditMenu from "./pages/EditMenu";
import ThankYou from "./pages/ThankYou";
import SessionGate from "./pages/SessionGate.jsx";
import MenuPreview from "./pages/MenuPreview.jsx";
import MyOrder from "./pages/MyOrder.jsx";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(30, 41, 59, 0.95)", // dark glass
            color: "#fff",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <ThemeProvider>
        <CartProvider>
          <Routes>
            {/* CUSTOMER ROUTES */}
            <Route element={<CustomerLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/order" element={<Order />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/order/:token" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/session-required" element={<SessionGate />} />
              <Route path="/menu-preview" element={<MenuPreview />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/my-order" element={<MyOrder />} />
            </Route>

            {/* ADMIN ROUTES */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/history" element={<AdminHistory />} />
              <Route path="/admin/menu/add" element={<AddMenu />} />
              <Route path="/admin/menu/edit/:id" element={<EditMenu />} />
            </Route>
          </Routes>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
