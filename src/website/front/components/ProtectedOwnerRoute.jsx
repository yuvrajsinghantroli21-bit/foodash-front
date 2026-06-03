import { Navigate } from "react-router-dom";

function ProtectedOwnerRoute({ children }) {
  const ownerToken = localStorage.getItem("ownerToken");

  if (!ownerToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedOwnerRoute;
