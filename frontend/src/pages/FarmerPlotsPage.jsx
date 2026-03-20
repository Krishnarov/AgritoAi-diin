import { useEffect, useState } from "react";
import api from "../utils/api.js";
import { Loader2, ExternalLink, MapPin } from "lucide-react";
import { STATUS } from "../components/map/FarmerMap.jsx";

export default function FarmerPlotsPage() {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        const { data } = await api.get("/plots/my");
        setPlots(data.plots);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlots();
  }, []);

  return (
    <div className="p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex items-end justify-between border-b border-green-950 pb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Land Workspace</h1>
            <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Inventory Management Terminal</p>
          </div>
          <a href="/farmer/map" className="text-[10px] font-black uppercase text-green-500 border border-green-500/20 px-8 py-3 rounded-2xl hover:bg-green-500 hover:text-black transition-all active:scale-95 shadow-lg shadow-green-500/5">
              Register New Land
          </a>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="animate-spin text-green-500" size={40} />
        </div>
      ) : plots.length === 0 ? (
        <div className="py-32 text-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] flex flex-col items-center justify-center">
            <p className="text-green-800 text-xs font-black uppercase tracking-widest">No Active Inventory</p>
            <p className="text-green-900 text-[10px] mt-2 max-w-xs font-medium uppercase tracking-tight mb-8">You haven't added any land yet. Register your plots to start receiving rental requests.</p>
            <a href="/farmer/map" className="bg-green-600 text-black font-black uppercase text-[10px] px-8 py-3 rounded-2xl transition-all hover:bg-green-500 shadow-xl shadow-green-600/10 active:scale-95">
              Start Mapping
            </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {plots.map((plot) => (
            <div key={plot._id} className="bg-green-950/20 border border-green-900/10 rounded-[3rem] overflow-hidden flex flex-col transition-all hover:border-green-500/30 group shadow-2xl backdrop-blur-md">
              <div className="p-10 flex-1 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700 mb-1">Gata Identifier</p>
                    <h3 className="text-white font-black text-2xl italic uppercase tracking-tighter leading-none">#{plot.gataNo}</h3>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner"
                        style={{ background: (STATUS[plot.status]?.color || "#64748b") + "15", color: STATUS[plot.status]?.color || "#64748b", border: `1px solid ${STATUS[plot.status]?.color || "#64748b"}33` }}>
                    {STATUS[plot.status]?.label || plot.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-green-800 text-[10px] font-black uppercase tracking-widest border-l-2 border-green-900/30 pl-4 py-1">
                  <MapPin size={12} className="text-green-700" />
                  <span>{plot.village}, {plot.district}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5 shadow-inner">
                    <p className="text-green-900 text-[8px] font-black uppercase mb-1.5">Surface Area</p>
                    <p className="text-green-100 font-black text-lg italic">{plot.area_ha} Ha</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5 shadow-inner">
                    <p className="text-green-900 text-[8px] font-black uppercase mb-1.5">Rental Yield</p>
                    <p className="text-green-100 font-black text-lg italic">₹{plot.pricePerSeason || 0}</p>
                  </div>
                </div>

                {plot.khasaraDoc && (
                  <a href={plot.khasaraDoc} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-4 bg-green-950/40 border border-green-900/40 rounded-2xl text-green-500 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all hover:bg-green-900 hover:text-green-300">
                    Audit Khasara <ExternalLink size={14} />
                  </a>
                )}
              </div>
              <div className="p-4 bg-black/40 border-t border-green-900/10 flex gap-4">
                <a href={`/farmer/map`} className="flex-1 text-center py-3 text-[10px] font-black uppercase tracking-widest text-green-900 hover:text-green-500 transition-all">
                  Synchronize Map
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
