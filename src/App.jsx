import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { CartProvider } from "./context/CartContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import CustomerLayout from "./front/layouts/CustomerLayout.jsx";
import AdminLayout from "./admin/layouts/AdminLayout.jsx";

import ScrollToTop from "./front/components/ScrollToTop.jsx";
import ProtectedAdminRoute from "./admin/components/ProtectedAdminRoute.jsx";
import PlanProtectedRoute from "./admin/components/PlanProtectedRoute.jsx";

// FRONT PUBLIC PAGES
import Home from "./front/pages/public/Home.jsx";
import About from "./front/pages/public/About.jsx";
import Contact from "./front/pages/public/Contact.jsx";
import MenuPreview from "./front/pages/public/MenuPreview.jsx";
import Coupons from "./front/pages/public/Coupons.jsx";

// FRONT CUSTOMER PAGES
import Order from "./front/pages/customer/Order.jsx";
import Menu from "./front/pages/customer/Menu.jsx";
import Cart from "./front/pages/customer/Cart.jsx";
import ScanQR from "./front/pages/customer/ScanQR.jsx";
import SessionGate from "./front/pages/customer/SessionGate.jsx";
import ThankYou from "./front/pages/customer/ThankYou.jsx";
import MyOrder from "./front/pages/customer/MyOrder.jsx";

// ADMIN PAGES
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminMenu from "./admin/pages/AdminMenu.jsx";
import AdminHistory from "./admin/pages/AdminHistory.jsx";
import AddMenu from "./admin/pages/AddMenu.jsx";
import EditMenu from "./admin/pages/EditMenu.jsx";
import KitchenDisplay from "./admin/pages/KitchenDisplay.jsx";
import AdminTablesManage from "./admin/pages/AdminTablesManage.jsx";
import AdminCurrentTables from "./admin/pages/AdminCurrentTables.jsx";
import AdminAnalytics from "./admin/pages/AdminAnalytics.jsx";
import AdminStaff from "./admin/pages/AdminStaff.jsx";
import AdminEnquiries from "./admin/pages/AdminEnquiries.jsx";
import AdminFeedback from "./admin/pages/AdminFeedback.jsx";
import AdminSettings from "./admin/pages/AdminSettings.jsx";
import AdminCoupons from "./admin/pages/AdminCoupons.jsx";
import AdminWaiter from "./admin/pages/AdminWaiter.jsx";
import PreviewHome from "./admin/pages/PreviewHome";

// Website
import RestaurantRegister from "./website/front/pages/RestaurantRegister.jsx";
import Login from "./website/front/pages/Login.jsx";
import Pricing from "./website/front/pages/Pricing.jsx";
import Features from "./website/front/pages/Features.jsx";
import WebHome from "./website/front/pages/Home.jsx";
import WebsiteLayout from "./website/front/layouts/Websitelayout.jsx";
import BusinessPortal from "./website/front/pages/BusinessPortal.jsx";
import Contact1 from "./website/front/pages/Contact.jsx";
import ProtectedOwnerRoute from "./website/front/components/ProtectedOwnerRoute.jsx";

import SuperAdminLogin from "./website/superadmin/pages/SuperAdminLogin";
import SuperAdminLayout from "./website/superadmin/layouts/SuperAdminLayout";
import SuperAdminDashboard from "./website/superadmin/pages/SuperAdminDashboard";
import SuperAdminRestaurants from "./website/superadmin/pages/SuperAdminRestaurants";
import SuperAdminRestaurantDetails from "./website/superadmin/pages/SuperAdminRestaurantDetails";
import SuperAdminPlanRequests from "./website/superadmin/pages/SuperAdminPlanRequests.jsx";
import SuperAdminEnquiries from "./website/superadmin/pages/SuperAdminEnquiries.jsx";
import UpgradeRequired from "./admin/pages/UpgradeRequired.jsx";
import NotFound from "./context/NotFound.jsx";
import SubscriptionExpired from "./admin/pages/SubscriptionExpired.jsx";
import AdminBasicSettings from "./admin/pages/AdminBasicSettings";
import AdminImpersonate from "./admin/pages/AdminImpersonate";

function AdminRoutes() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/impersonate" element={<AdminImpersonate />} />

      <Route element={<AdminLayout />}>
        <Route path="/admin/upgrade-required" element={<UpgradeRequired />} />
        <Route
          path="/admin/subscription-expired"
          element={<SubscriptionExpired />}
        />

        <Route
          path="/admin/basic-settings"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="basicSettings">
                <AdminBasicSettings />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier"]}>
              <PlanProtectedRoute feature="dashboard">
                <AdminDashboard />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/menu"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="menu">
                <AdminMenu />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/history"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier"]}>
              <PlanProtectedRoute feature="history">
                <AdminHistory />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/kitchen"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "kitchen"]}>
              <PlanProtectedRoute feature="kitchen">
                <KitchenDisplay />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/tables/manage"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="qrTables">
                <AdminTablesManage />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/tables/current"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier"]}>
              <PlanProtectedRoute feature="currentTables">
                <AdminCurrentTables />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="analytics">
                <AdminAnalytics />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/staff"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="staff">
                <AdminStaff />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/menu/add"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="menu">
                <AddMenu />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/menu/edit/:id"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="menu">
                <EditMenu />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/enquiries"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier"]}>
              <PlanProtectedRoute feature="enquiries">
                <AdminEnquiries />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/feedback"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier"]}>
              <PlanProtectedRoute feature="feedback">
                <AdminFeedback />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="settings">
                <AdminSettings />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/coupons"
          element={
            <ProtectedAdminRoute allowedRoles={["admin"]}>
              <PlanProtectedRoute feature="coupons">
                <AdminCoupons />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />

        <Route
          path="/admin/waiter"
          element={
            <ProtectedAdminRoute allowedRoles={["admin", "cashier", "waiter"]}>
              <PlanProtectedRoute feature="waiter">
                <AdminWaiter />
              </PlanProtectedRoute>
            </ProtectedAdminRoute>
          }
        />
      </Route>
    </>
  );
}

function RestaurantRoutes() {
  return (
    <>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/menu-preview" element={<MenuPreview />} />
        <Route path="/coupons" element={<Coupons />} />

        <Route path="/scan" element={<ScanQR />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order/:token" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/session-required" element={<SessionGate />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/my-order" element={<MyOrder />} />

        <Route path="/preview/home" element={<PreviewHome />} />
      </Route>

      {AdminRoutes()}
    </>
  );
}

function LegacyRestaurantRoutes() {
  return (
    <Route element={<CustomerLayout />}>
      <Route path="/r/:restaurantSlug" element={<Home />} />
      <Route path="/r/:restaurantSlug/about" element={<About />} />
      <Route path="/r/:restaurantSlug/contact" element={<Contact />} />
      <Route path="/r/:restaurantSlug/menu-preview" element={<MenuPreview />} />
      <Route path="/r/:restaurantSlug/coupons" element={<Coupons />} />
      <Route path="/r/:restaurantSlug/scan" element={<ScanQR />} />
      <Route path="/r/:restaurantSlug/order" element={<Order />} />
      <Route path="/r/:restaurantSlug/order/:token" element={<Menu />} />
      <Route path="/r/:restaurantSlug/cart" element={<Cart />} />
      <Route
        path="/r/:restaurantSlug/session-required"
        element={<SessionGate />}
      />
      <Route path="/r/:restaurantSlug/thank-you" element={<ThankYou />} />
      <Route path="/r/:restaurantSlug/my-order" element={<MyOrder />} />
    </Route>
  );
}

function WebsiteRoutes() {
  return (
    <>
      {LegacyRestaurantRoutes()}

      <Route path="/superadmin/login" element={<SuperAdminLogin />} />

      <Route path="/superadmin" element={<SuperAdminLayout />}>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="restaurants" element={<SuperAdminRestaurants />} />
        <Route path="enquiries" element={<SuperAdminEnquiries />} />
        <Route
          path="restaurants/:id"
          element={<SuperAdminRestaurantDetails />}
        />
        <Route path="plan-requests" element={<SuperAdminPlanRequests />} />
      </Route>

      <Route element={<WebsiteLayout />}>
        <Route path="/" element={<WebHome />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RestaurantRegister />} />
        <Route path="/contact" element={<Contact1 />} />
        <Route
          path="/business"
          element={
            <ProtectedOwnerRoute>
              <BusinessPortal />
            </ProtectedOwnerRoute>
          }
        />
      </Route>
    </>
  );
}

function App() {
  const host = window.location.hostname;

  const isLocalhostSubdomain =
    host.endsWith(".localhost") && host !== "localhost";

  const isRestaurantSite =
    isLocalhostSubdomain ||
    (host.endsWith(".foodash.com") &&
      host !== "foodash.com" &&
      host !== "www.foodash.com");

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: "rgba(30, 41, 59, 0.95)",
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

      <ScrollToTop />

      <ThemeProvider>
        <CartProvider>
          <Routes>
            {isRestaurantSite ? RestaurantRoutes() : WebsiteRoutes()}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
