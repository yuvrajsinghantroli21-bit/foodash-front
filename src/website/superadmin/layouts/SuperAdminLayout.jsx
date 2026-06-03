import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SuperAdminSidebar from "../components/SuperAdminSidebar";
import SuperAdminNavbar from "../components/SuperAdminNavbar";

function SuperAdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("superAdminToken");
    if (!token) {
      navigate("/superadmin/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f0f5ff]">
      {/* Desktop sidebar — fixed, only visible lg+ */}
      <SuperAdminSidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        {/* Sticky top navbar (also handles mobile drawer) */}
        <SuperAdminNavbar />

        {/* Page content */}
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
