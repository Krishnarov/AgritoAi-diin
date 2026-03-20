import { useEffect, useState } from "react";
import api from "../utils/api.js";
import { Loader2, XCircle } from "lucide-react";

// Reuse StatCard logic for visual consistency if needed, but defining it here properly.
const StatCard = ({ label, value, color }) => (
  <div className="bg-green-950/30 border border-green-900/40 rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-all hover:border-green-500/30">
    <p className="text-green-700 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
    <p className="font-black text-4xl" style={{ color }}>{value}</p>
  </div>
);

export default function FarmerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/plots/farmer/stats");
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Farmer Overview</h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Manage your land listings and rental requests</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard label="Total Land Parcels" value={stats.totalPlots} color="#86efac" />
          <StatCard label="Under Review"       value={stats.pending}    color="#94a3b8" />
          <StatCard label="Approved / Active"  value={stats.approved}   color="#22c55e" />
          <StatCard label="Currently Rented"   value={stats.booked}     color="#f97316" />
        </div>
      ) : (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 text-red-400 font-bold flex items-center gap-4">
          <XCircle /> Failed to load statistics. Please try again later.
        </div>
      )}
    </div>
  );
}
