import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

function CustomerLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-black dark:text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default CustomerLayout;
