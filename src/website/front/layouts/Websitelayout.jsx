import { Outlet } from "react-router-dom";
import WebsiteNavbar from "../components/WebsiteNavbar";

const WebsiteLayout = () => {
  return (
    <div className="min-h-screen bg-[#f7efe4] font-body">
      <WebsiteNavbar />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default WebsiteLayout;
