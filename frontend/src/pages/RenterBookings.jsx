import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Map as MapIcon,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Eye,
  FileText,
  ArrowRight
} from "lucide-react";
import api from "../utils/api.js";

const STATUS_MAP = {
  active: { color: "#22c55e", bg: "bg-green-500/10", border: "border-green-500/30", icon: <CheckCircle size={14} /> },
  pending: { color: "#f59e0b", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: <Clock size={14} /> },
  expired: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/30", icon: <XCircle size={14} /> },
};

export default function RenterBookings() {
  const [plots, setPlots] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await api.get("/renter/my-rentals");
        setPlots(data.rentals || []);
        setRequests(data.requests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayList = tab === "active" ? plots : requests;

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-green-950 pb-12">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Geo-Assets</h1>
          <p className="text-green-800 text-[10px] uppercase font-black mt-4 tracking-[0.4em]">Portfolio Oversight • Tactical Deployment History</p>
        </div>
        <div className="flex bg-green-950/20 p-2 rounded-[2rem] border border-green-900/40 backdrop-blur-md shadow-2xl">
          <button onClick={() => setTab("active")}
            className={`px-10 py-3 rounded-full text-[10px] font-black tracking-widest transition-all ${tab === "active" ? "bg-green-600 text-black shadow-xl shadow-green-600/20" : "text-green-700 hover:text-green-400"}`}>
            ACTIVE RECON
          </button>
          <button onClick={() => setTab("requests")}
            className={`px-10 py-3 rounded-full text-[10px] font-black tracking-widest transition-all ${tab === "requests" ? "bg-green-600 text-black shadow-xl shadow-green-600/20" : "text-green-700 hover:text-green-400"}`}>
            INBOUND INTEL
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-32 animate-pulse">
            <div className="w-16 h-16 bg-green-900/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.05)]">
               <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-green-800 text-[10px] font-black tracking-[0.4em] uppercase">Decrypting Portfolio Data...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="py-32 text-center bg-green-950/5 border border-dashed border-green-900/20 rounded-[4rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-24 h-24 bg-green-900/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-900/20 shadow-inner">
              <FileText size={40} className="text-green-900 group-hover:text-green-500 transition-colors" />
            </div>
            <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">Zero Data Points Found</h4>
            <p className="text-green-800 text-xs mt-2 max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-tight opacity-60">
              Your operational database shows no records for this quadrant. 
              Initialize new asset acquisition via the discovery terminal.
            </p>
            <Link to="/browse" className="inline-flex items-center gap-4 mt-12 bg-green-600 text-black px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-green-600/20">
              DISCOVERY TERMINAL <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayList.map(item => (
              <div key={item._id} className="group relative bg-[#0a150a]/40 border border-green-900/10 hover:border-green-500/30 rounded-[3rem] transition-all p-8 flex flex-wrap lg:flex-nowrap items-center gap-10 overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="absolute bottom-0 right-0 w-80 h-full bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="w-24 h-24 bg-green-950/40 rounded-[2rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-green-900/20 relative">
                   <div className="absolute inset-0 bg-green-500/5 rounded-[2rem] animate-pulse"></div>
                   <MapIcon size={36} className="text-green-600 relative z-10" />
                </div>

                <div className="flex-1 min-w-[240px] relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <h4 className="font-black text-2xl italic text-white uppercase tracking-tight">Gata #{item.gataNo}</h4>
                    <span className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase border backdrop-blur-md shadow-xl ${STATUS_MAP[tab === "active" ? "active" : "pending"].bg} ${STATUS_MAP[tab === "active" ? "active" : "pending"].border}`} style={{ color: STATUS_MAP[tab === "active" ? "active" : "pending"].color }}>
                      {STATUS_MAP[tab === "active" ? "active" : "pending"].icon}
                      {tab === "active" ? "Operational asset" : "Priority Review"}
                    </span>
                  </div>
                  <p className="text-green-800 text-[10px] font-black uppercase tracking-[0.25em]">{item.village} • {item.district}</p>
                </div>

                <div className="flex items-center gap-8 xl:gap-14 w-full lg:w-auto relative z-10">
                  <div className="relative">
                    <p className="text-[10px] font-black text-green-900 uppercase tracking-[0.3em] mb-2 leading-none">Net Surface</p>
                    <p className="font-black text-white text-3xl italic tracking-tighter leading-none">{item.area_ha} <span className="text-xs font-normal opacity-30 not-italic">Ha</span></p>
                  </div>

                  <div className="relative border-l border-green-900/20 pl-8 lg:pl-14">
                    <p className="text-[10px] font-black text-green-900 uppercase tracking-[0.3em] mb-2 leading-none">Seasonal Payout</p>
                    <p className="font-black text-green-500 text-3xl italic tracking-tighter leading-none">₹{item.pricePerSeason || item.plot?.pricePerSeason}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="w-14 h-14 bg-green-950/60 border border-green-900/20 hover:bg-green-500 hover:text-black hover:border-green-400 rounded-2xl flex items-center justify-center text-green-600 transition-all shadow-xl shadow-black/20 group/btn active:scale-95">
                      <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button className="w-14 h-14 bg-green-950/60 border border-green-900/20 hover:bg-red-500/10 hover:border-red-500/30 rounded-2xl flex items-center justify-center text-green-800 transition-all shadow-xl shadow-black/20 group/dots active:scale-95 hover:text-red-500">
                      <MoreVertical size={20} className="group-hover/dots:rotate-90 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
