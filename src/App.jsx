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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
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

              <Route path="/thank-you" element={<ThankYou />} />
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
