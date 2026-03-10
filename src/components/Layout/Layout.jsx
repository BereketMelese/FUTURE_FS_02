import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    "/": "Dashboard",
    "/leads": "Leads",
    "/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "Workspace";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,transparent_32%),radial-gradient(circle_at_bottom_right,#fde68a_0%,transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_52%,#f8fafc_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar
            title={currentTitle}
            onMenuClick={() => setIsSidebarOpen(true)}
          />

          <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
              <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-4 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
                <Outlet />
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
