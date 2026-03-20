import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, Map, LayoutDashboard, Search, Bell, User, Zap, ChevronDown } from "lucide-react";
import useAuthStore from "../../store/authStore.js";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = {
    farmer: [
      { to: "/farmer/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
      { to: "/farmer/map", icon: <Map size={16} />, label: "My Land" }
    ],
    admin: [
      { to: "/admin/dashboard", icon: <Zap size={16} />, label: "Terminal" },
      { to: "/admin/plots", icon: <Map size={16} />, label: "Verifications" }
    ],
    renter: [
      { to: "/browse", icon: <Search size={16} />, label: "Browse Land" },
      { to: "/renter/dashboard", icon: <LayoutDashboard size={16} />, label: "My Rentals" }
    ],
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[2000] h-16 bg-[#050a05]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:px-10 shadow-2xl">
      
      {/* ── LOGO & BRANDING ── */}
      <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
        <div className="relative w-9 h-9 flex items-center justify-center">
            {/* Pulsing ring background */}
            <div className="absolute inset-0 bg-green-500/20 rounded-xl animate-pulse group-hover:bg-green-500/40 transition-colors" />
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <span className="text-[#050a05] font-black text-lg">A</span>
            </div>
        </div>
        <div className="flex flex-col leading-none">
            <span className="text-white font-black text-lg tracking-tighter uppercase italic">Agrito<span className="text-green-500">AI</span></span>
            <span className="text-[8px] text-green-800 font-black uppercase tracking-[0.3em] mt-0.5">Agriculture Intelligence</span>
        </div>
      </Link>

      {/* ── NAVIGATION ── */}
      <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
        {user && navLinks[user.role]?.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link 
              key={link.to} 
              to={link.to}
              className={`flex items-center gap-2.5 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300
                ${isActive 
                  ? "bg-green-500 text-black shadow-xl shadow-green-500/20" 
                  : "text-green-700 hover:text-green-300 hover:bg-white/5"}`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* ── USER ACTIONS ── */}
      <div className="flex items-center gap-4 lg:gap-6">
        {user ? (
          <>
            {/* Notification/Alerts (Visual only for now) */}
            <button className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-700 hover:text-green-500 hover:bg-white/10 transition-all border border-white/5">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050a05]" />
            </button>

            {/* Profile Dropdown Trigger Style */}
            <div className="h-10 px-4 rounded-xl bg-gradient-to-r from-green-950/40 to-black/40 border border-white/5 flex items-center gap-3">
              <div className="flex flex-col items-end leading-none hidden sm:flex">
                <span className="text-green-200 text-[10px] font-black uppercase tracking-widest">{user.name}</span>
                <span className="text-green-800 text-[8px] font-bold uppercase mt-1 tracking-tighter">{user.role} Control</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-green-900/30 border border-green-500/20 flex items-center justify-center overflow-hidden">
                <User size={16} className="text-green-500" />
              </div>
              <ChevronDown size={12} className="text-green-900" />
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="group flex flex-col items-center justify-center gap-0.5 text-red-900 hover:text-red-500 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/5 group-hover:bg-red-500/20 flex items-center justify-center border border-red-500/10 group-hover:border-red-500/30 transition-all">
                <LogOut size={16} />
              </div>
              <span className="text-[7px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Exit</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/register" className="text-green-700 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all">
                Join Network
            </Link>
            <Link to="/login"
                className="bg-green-500 hover:bg-green-400 text-black text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-green-500/20 active:scale-95">
                Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}