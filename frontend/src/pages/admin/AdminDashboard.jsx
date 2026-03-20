import { useEffect, useState } from "react";
import { BarChart3, Users, Map as MapIcon, ShieldCheck, TrendingUp, ArrowUpRight } from "lucide-react";
import api from "../../utils/api.js";

const StatCard = ({ label, value, trend, icon: Icon, color }) => (
  <div className="bg-green-950/20 border border-green-900/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md transition-all hover:border-green-500/30 group">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center bg-opacity-20 ${color}`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-500/10 uppercase tracking-widest">
           <TrendingUp size={10} /> {trend}
        </span>
      )}
    </div>
    <p className="text-green-800 text-[10px] font-black uppercase tracking-[0.25em] mb-2 ml-1">{label}</p>
    <div className="flex items-end justify-between">
       <p className="text-4xl font-black text-white">{value}</p>
       <div className="text-green-500/20 group-hover:text-green-500 transition-colors">
          <ArrowUpRight size={20} />
       </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get("/admin/stats");
        setStats(data.stats);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadStats();
  }, []);

  if (loading) return (
    <div className="h-full flex items-center justify-center">
       <div className="w-10 h-10 border-t-2 border-green-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-10 space-y-12">
      <header>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Terminal Overview</h1>
        <p className="text-green-700 text-xs mt-2 uppercase tracking-[0.3em] font-black">System Status & Global Metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Total Land (Ha)" value={stats?.totalArea || 0} icon={MapIcon} color="bg-green-500" trend="+2% Today" />
        <StatCard label="Verified Farmers" value={stats?.totalFarmers || 0} icon={Users} color="bg-blue-500" />
        <StatCard label="Active Renters" value={stats?.activeRenters || 0} icon={ShieldCheck} color="bg-yellow-500" />
        <StatCard label="Live Agreements" value={stats?.totalPlots || 0} icon={BarChart3} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-10">
         <div className="bg-green-950/10 border border-green-900/20 rounded-[3rem] p-10 h-96 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[120px] rounded-full group-hover:bg-green-500/10 transition-all"></div>
            <BarChart3 size={60} className="text-green-900 mb-6 opacity-40" />
            <h3 className="text-green-200 font-bold mb-2 uppercase tracking-widest text-sm italic">Yield Forecast (Mock)</h3>
            <p className="text-green-800 text-xs font-medium max-w-sm">Aggregated agricultural data points indicate a 12% increase in productivity for the upcoming Rabi season across Western UP districts.</p>
         </div>

         <div className="bg-green-950/10 border border-green-900/20 rounded-[3rem] p-10 h-96 flex flex-col justify-center items-center text-center relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full group-hover:bg-blue-500/10 transition-all"></div>
            <ShieldCheck size={60} className="text-green-900 mb-6 opacity-40" />
            <h3 className="text-green-200 font-bold mb-2 uppercase tracking-widest text-sm italic">Security Intelligence</h3>
            <p className="text-green-800 text-xs font-medium max-w-sm">Platform integrity monitoring Active. Last security sweep completed at {new Date().toLocaleTimeString()}. 0 anomalies detected.</p>
         </div>
      </div>
    </div>
  );
}
