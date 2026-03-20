import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Map as MapIcon, 
  Clock, 
  CheckCircle, 
  Wallet,
  TrendingUp,
  Landmark,
  ArrowRight
} from "lucide-react";
import api from "../utils/api.js";

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-green-950/20 border border-green-900/10 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-sm transition-all hover:border-green-500/30 group">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-opacity-20 ${color} border border-white/5 shadow-inner`}>
        <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <p className="text-green-800 text-[10px] font-black uppercase tracking-[0.25em] mb-1.5">{label}</p>
    <p className="text-4xl font-black text-white italic tracking-tighter">{value}</p>
  </div>
);

export default function RenterDashboard() {
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalArea: 0,
    pendingRequests: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/renter/dashboard-stats");
        setStats(data.stats);
        setRecentBookings(data.recentBookings || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex items-end justify-between border-b border-green-950 pb-12">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Command Center</h1>
          <p className="text-green-800 text-[10px] uppercase font-black mt-4 tracking-[0.4em]">Agricultural Portfolio Oversight & Operational Intel</p>
        </div>
        <Link to="/browse" className="bg-green-600 text-black h-16 px-12 rounded-[2rem] font-black uppercase text-xs flex items-center gap-3 transition-all hover:bg-green-500 shadow-2xl shadow-green-600/20 active:scale-95 leading-none">
          <Plus size={18} /> Discover New Assets
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Active Fleet" value={stats.activeBookings} icon={MapIcon}  color="bg-green-500" trend="+1 Increase" />
        <StatCard label="Total Land Yield" value={`${stats.totalArea} Ha`} icon={Landmark} color="bg-blue-500" />
        <StatCard label="Conflict Queue"   value={stats.pendingRequests}icon={Clock}    color="bg-yellow-500" />
        <StatCard label="Capital Deployment"    value={`₹${stats.totalSpent}`} icon={Wallet}   color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-black/20 border border-green-900/10 rounded-[4rem] p-12 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-12">
            <h3 className="font-black text-2xl italic flex items-center gap-4 text-white uppercase tracking-tighter">
              <div className="w-2 h-10 bg-green-500 rounded-full shadow-[0_0_20px_#22c55e]"></div>
              Operational Land Log
            </h3>
            <Link to="/renter/my-plots" className="text-green-700 text-[10px] font-black tracking-[0.2em] hover:text-green-500 flex items-center gap-2 transition-all">
              EXPAND LOG <ArrowRight size={14} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="py-24 text-center bg-green-950/5 rounded-[3.5rem] border border-dashed border-green-900/10">
              <MapIcon size={64} className="mx-auto text-green-950 mb-6 opacity-30" />
              <p className="text-green-800 text-xs font-black uppercase tracking-widest leading-none mb-3">No Active Deployments</p>
              <p className="text-green-900 text-[10px] mx-auto max-w-xs font-medium uppercase tracking-tight opacity-50">Initialize your first agricultural venture by scouting high-yield regions in the discovery terminal.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentBookings.map(plot => (
                <div key={plot._id} className="flex items-center gap-8 p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-green-500/30 transition-all group relative overflow-hidden">
                   <div className="w-24 h-24 rounded-[2rem] bg-green-950/30 flex items-center justify-center flex-shrink-0 border border-green-900/20">
                      <MapIcon size={32} className="text-green-600 group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="flex-1">
                      <p className="text-green-800 text-[9px] font-black uppercase tracking-widest mb-1.5">Asset Gata</p>
                      <h4 className="font-black text-xl italic text-white uppercase tracking-tight leading-none">#{plot.gataNo}</h4>
                      <div className="flex items-center gap-2 mt-2 text-green-900 text-[10px] font-bold uppercase">
                          <CheckCircle size={10} className="text-green-500" />
                          <span>{plot.village}, {plot.district}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-green-500 text-2xl italic leading-none">{plot.area_ha}</p>
                      <span className="text-[10px] font-black uppercase text-green-900 tracking-tighter">Surface Ha</span>
                   </div>
                   <div className="pl-10 border-l border-white/5">
                      <p className="font-black text-white text-xl leading-none">₹{plot.pricePerSeason}</p>
                      <span className="text-[10px] font-black uppercase text-green-900 tracking-tighter">Seasonal Cost</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-green-600 to-green-400 rounded-[3.5rem] p-12 text-black shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/40 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
            <h4 className="font-black text-3xl leading-[0.9] italic uppercase tracking-tighter mb-4">Precision<br/>Agriculture</h4>
            <p className="text-sm font-bold text-black/60 mb-10 leading-relaxed max-w-[200px]">Leverage satellite data and local soil reports to maximize seasonal yield.</p>
            <button className="bg-black text-white h-16 w-full rounded-[1.5rem] text-[10px] font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95">
                SCENE INTEL <Plus size={14} />
            </button>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-12 shadow-2xl backdrop-blur-md">
            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-green-600 mb-10">Capital Pulsing</h4>
            <div className="space-y-10">
               <div className="flex gap-8">
                  <div className="flex flex-col items-center pt-2">
                     <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_20px_#22c55e]"></div>
                     <div className="w-1 flex-1 bg-green-900/20 my-2 rounded-full"></div>
                  </div>
                  <div className="space-y-1.5">
                     <p className="text-lg font-black text-white italic leading-none">April Installment</p>
                     <p className="text-[10px] text-green-800 font-black uppercase tracking-widest">Target Date: 15.04.2026</p>
                     <p className="text-[9px] text-green-600 font-black uppercase mt-3 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20 w-fit">Pending Auth</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
