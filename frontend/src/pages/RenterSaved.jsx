import { useEffect, useState } from "react";
import { Bookmark, Map, Eye, History, Trash2, Tag, Calendar, ChevronRight } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function RenterSaved() {
  const [saved, setSaved] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: savedData }, { data: historyData }] = await Promise.all([
        api.get("/renter/saved"),
        api.get("/renter/view-history")
      ]);
      setSaved(savedData.saved || []);
      setHistory(historyData.history || []);
    } catch { toast.error("Failed to load saved items"); }
    finally { setLoading(false); }
  };

  const handleRemove = async (id) => {
    try {
      await api.post(`/renter/saved/${id}`);
      setSaved(saved.filter(s => s.plot._id !== id));
      toast.success("Removed from wishlist");
    } catch { toast.error("Failed to remove"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-40">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-green-950 pb-12">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Resource Bookmark</h1>
          <p className="max-w-xl text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2 leading-relaxed">Asset Wishlist • Visual Recon History • Priority Markers</p>
        </div>
        <Link to="/browse" className="bg-green-600/10 border border-green-500/20 px-10 py-5 rounded-[2rem] flex items-center gap-4 text-green-500 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-green-600 hover:text-black shadow-2xl backdrop-blur-md">
          <Map size={18} /> Resume Market Recon
        </Link>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pt-10">
        <div className="xl:col-span-2 space-y-10">
          <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2">High-Priority Queue</h2>
          {saved.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] opacity-20 gap-10 group">
               <Bookmark size={64} className="text-green-900 group-hover:scale-110 transition-transform" />
               <p className="text-green-700 font-black text-xs uppercase tracking-widest text-center italic">Zero markers placed in this quadrant</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {saved.map(s => (
                 <div key={s._id} className="relative group bg-green-950/20 border border-green-900/10 rounded-[3rem] overflow-hidden transition-all hover:border-green-600/30 shadow-2xl backdrop-blur-md">
                    <div className="h-56 bg-gradient-to-br from-green-950/80 to-black relative p-10 group-hover:from-green-900/40 transition-all flex flex-col justify-end">
                       <span className="absolute top-10 left-10 text-[10px] font-black uppercase tracking-[0.3em] bg-green-600 text-black px-6 py-2 rounded-full shadow-2xl shadow-green-600/20">Gata #{s.plot.gataNo}</span>
                       <button onClick={() => handleRemove(s.plot._id)} className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-black/40 border border-red-900/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100 shadow-2xl opacity-0 group-hover:opacity-100 backdrop-blur-md">
                          <Trash2 size={20} />
                       </button>
                       <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{s.plot.district}</h3>
                       <p className="text-green-800 text-[10px] font-black uppercase tracking-widest mt-2">{s.plot.village || 'Traditional Farmland'}</p>
                    </div>

                    <div className="p-10 space-y-8">
                       <div className="grid grid-cols-2 gap-6">
                          <div className="p-5 bg-black/40 border border-green-900/20 rounded-2xl flex flex-col gap-1 shadow-inner group-hover:border-green-500/20">
                             <span className="text-green-900 text-[9px] font-black uppercase tracking-widest">Net area</span>
                             <span className="text-green-100 font-black text-xl italic tracking-tighter">{s.plot.area_ha} Ha</span>
                          </div>
                          <div className="p-5 bg-black/40 border border-green-900/20 rounded-2xl flex flex-col gap-1 shadow-inner group-hover:border-green-500/20">
                             <span className="text-green-900 text-[9px] font-black uppercase">Season rate</span>
                             <span className="text-green-500 font-black text-xl italic tracking-tighter">₹{s.plot.pricePerSeason}</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-3">
                          <span className="text-yellow-500 text-[9px] font-black uppercase border border-yellow-500/20 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-lg bg-yellow-500/5">
                             <Tag size={12} className="animate-pulse" /> {s.priority} status lock
                          </span>
                       </div>

                       <Link to={`/plot/${s.plot._id}`} className="w-full h-18 bg-green-600 hover:bg-green-500 transition-all text-black border border-green-600 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-2xl shadow-green-600/20 group/btn">
                          Audit & Signal <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="space-y-10">
           <div className="flex items-center justify-between border-b border-green-900/10 pb-4 ml-2">
              <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em]">Visual History</h2>
              <History size={16} className="text-green-900" />
           </div>

           <div className="space-y-6">
              {history.length === 0 ? (
                <p className="text-green-900 text-[10px] font-black uppercase text-center py-20 opacity-30 tracking-widest italic">No footprints detected</p>
              ) : (
                history.slice(0, 8).map(h => (
                  <Link to={`/plot/${h.plot._id}`} key={h._id} className="flex items-center gap-6 group hover:translate-x-3 transition-all p-4 rounded-3xl hover:bg-green-600/5 hover:shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-green-950/40 border border-green-900/20 flex flex-col items-center justify-center text-green-800 group-hover:text-green-400 group-hover:border-green-600/30 transition-all shrink-0 relative">
                        <Eye size={18} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-xs leading-none">{h.view_count}<span className="text-[8px] opacity-40">x</span></span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-green-100 font-black text-sm uppercase italic truncate group-hover:text-white transition-colors">Gata {h.plot.gataNo} — {h.plot.district}</h4>
                        <div className="flex items-center gap-3 mt-2">
                          <Calendar size={12} className="text-green-900" />
                          <p className="text-green-900 text-[9px] font-black uppercase tracking-widest">Last seen {new Date(h.last_viewed_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                  </Link>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
