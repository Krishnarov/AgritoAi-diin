import Navbar from "../components/shared/Navbar.jsx";
import Sidebar from "../components/shared/Sidebar.jsx";
import { Outlet } from "react-router-dom";

export default function FarmerPage() {
  return (
    <div className="flex flex-col h-screen bg-[#050a05]">
      <Navbar />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
