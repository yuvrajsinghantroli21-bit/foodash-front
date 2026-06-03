import { Outlet } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";
import WebsiteFooter from "../components/WebsiteFooter";

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7efe4] font-body">
      <WebsiteNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
      <WebsiteFooter />
    </div>
  );
};

export default WebsiteLayout;
