import { Navigate } from "react-router-dom";

export default function ProtectedAdminRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("adminToken");
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "null");

  if (!token || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    if (adminUser.role === "kitchen") {
      return <Navigate to="/admin/kitchen" replace />;
    }

    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
    