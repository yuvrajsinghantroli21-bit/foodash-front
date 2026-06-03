import { Navigate } from "react-router-dom";
import { hasFeature } from "../../config/planFeatures";

export default function PlanProtectedRoute({ feature, children }) {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  if (adminUser?.isImpersonating) {
    return children;
  }
  const plan = adminUser.plan || "website";
  const status = adminUser.subscriptionStatus;

  if (status === "expired" || status === "cancelled") {
    return <Navigate to="/admin/subscription-expired" replace />;
  }

  if (!hasFeature(plan, feature)) {
    return <Navigate to="/admin/upgrade-required" replace />;
  }

  return children;
}
