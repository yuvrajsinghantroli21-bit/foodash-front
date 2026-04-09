import AdminNavbar from "../components/AdminNavbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNavbar />

      <div className="p-0">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
