import { Link } from "react-router-dom";
import { Sprout, ShieldCheck, MapPin, ArrowRight } from "lucide-react";
import useAuthStore from "../store/authStore.js";

export default function LandingPage() {
  const { user } = useAuthStore();

  const dashboardLink = user?.role === "admin" ? "/admin"
    : user?.role === "renter" ? "/browse" : "/farmer/map";

  return (
    <div className="min-h-screen bg-[#0a150a] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-green-900/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <span className="text-[#0a150a] font-black">A</span>
          </div>
          <span className="text-green-400 font-bold tracking-widest uppercase text-sm">AgritoAI</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to={dashboardLink}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500
                         text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              Go to Dashboard <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login"
                className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                Login
              </Link>
              <Link to="/register"
                className="bg-green-600 hover:bg-green-500 text-white text-sm
                           font-semibold px-4 py-2 rounded-xl transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-800/50
                        text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <Sprout size={12} /> India's First AI-Powered Agricultural Land Rental Platform
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
          Rent Land.<br />
          <span className="text-green-400">Grow More.</span>
        </h1>

        <p className="text-green-700 text-lg max-w-xl mb-10 leading-relaxed">
          Farmers list their land on the map. Renters find verified plots nearby.
          Admin ensures zero fraud with Khasara document matching.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400
                       text-[#0a150a] font-bold px-8 py-3.5 rounded-2xl text-sm 
                       transition-all active:scale-95">
            List Your Land <ArrowRight size={16} />
          </Link>
          <Link to="/browse"
            className="flex items-center justify-center gap-2 border border-green-700
                       hover:border-green-500 text-green-400 font-semibold px-8 py-3.5
                       rounded-2xl text-sm transition-all">
            Browse Available Land <MapPin size={16} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full max-w-3xl">
          {[
            { icon: <MapPin size={20} className="text-green-400" />, title: "Draw on Map", desc: "Mark your plot boundary directly on satellite map with polygon tool" },
            { icon: <ShieldCheck size={20} className="text-green-400" />, title: "Verified Listings", desc: "Admin cross-checks Gata number & area with Khasara document" },
            { icon: <Sprout size={20} className="text-green-400" />, title: "Color Coded", desc: "Green = Available, Orange = Booked, Grey = Pending at a glance" },
          ].map((f) => (
            <div key={f.title}
              className="bg-green-950/30 border border-green-900/40 rounded-2xl p-5 text-left">
              <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center
                              justify-center mb-3">
                {f.icon}
              </div>
              <h3 className="text-green-300 font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-green-700 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-4 text-green-800 text-xs border-t border-green-900/20">
        © 2025 AgritoAI — Empowering Indian Farmers
      </footer>
    </div>
  );
}