import { useNavigate, Link } from "react-router-dom";
import { LogOut, Map, LayoutDashboard, Search } from "lucide-react";
import useAuthStore from "../../store/authStore.js";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  const navLinks = {
    farmer: [
      { to: "/farmer/dashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard" },
      { to: "/farmer/map", icon: <Map size={15} />, label: "My Land" }
    ],
    admin:  [{ to: "/admin",      icon: <LayoutDashboard size={15} />, label: "Admin Panel" }],
    renter: [{ to: "/browse",     icon: <Search size={15} />, label: "Browse Land" }],
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[2000] flex items-center justify-between
                    px-4 h-14 bg-[#0a150a]/95 backdrop-blur-md
                    border-b border-green-900/40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
          <span className="text-[#0a150a] font-black text-sm">A</span>
        </div>
        <span className="text-green-400 font-bold text-sm tracking-widest uppercase">AgritoAI</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {user && navLinks[user.role]?.map((link) => (
          <Link key={link.to} to={link.to}
            className="flex items-center gap-1.5 text-green-600 hover:text-green-400
                       hover:bg-green-900/30 px-3 py-1.5 rounded-lg text-xs
                       font-medium transition-all">
            {link.icon}{link.label}
          </Link>
        ))}
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-green-300 text-xs font-semibold">{user.name}</p>
              <p className="text-green-700 text-[10px] capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-green-700 hover:text-red-400
                         hover:bg-red-900/20 px-2.5 py-1.5 rounded-lg text-xs
                         transition-all">
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login"
            className="bg-green-600 hover:bg-green-500 text-white text-xs
                       font-semibold px-3 py-1.5 rounded-lg transition-all">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}