import { Outlet } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import WebsiteFooter from "../components/WebsiteFooter";

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7efe4] font-body">
      <WebsiteNavbar className="fixed top-0 left-0 right-0 z-[100]" />

      <main className="flex-1">
        <Outlet />
      </main>
      <WebsiteFooter />
    </div>
  );
};

export default WebsiteLayout;
