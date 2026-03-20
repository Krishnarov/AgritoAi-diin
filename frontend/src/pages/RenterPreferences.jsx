import { useEffect, useState } from "react";
import { Target, Leaf, History, Plus, X, Search, Bell, MapPin } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

export default function RenterPreferences() {
  const [crops, setCrops] = useState([]);
  const [searches, setSearches] = useState([]);
  const [newCrop, setNewCrop] = useState({ crop_name: "", season: "kharif", area_required_ha: 0, notes: "" });
  const [loading, setLoading] = useState(true);
  const [addingCrop, setAddingCrop] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: cropData }, { data: searchData }] = await Promise.all([
        api.get("/renter/crop-preferences"),
        api.get("/renter/searches")
      ]);
      setCrops(cropData.preferences || []);
      setSearches(searchData.searches || []);
    } catch { toast.error("Failed to load preferences"); }
    finally { setLoading(false); }
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!newCrop.crop_name) return toast.error("Crop name is required");
    setAddingCrop(true);
    try {
      const { data } = await api.post("/renter/crop-preferences", newCrop);
      setCrops([...crops, data.preference]);
      setNewCrop({ crop_name: "", season: "kharif", area_required_ha: 0, notes: "" });
      toast.success("Crop plan added");
    } catch { toast.error("Failed to add crop"); }
    finally { setAddingCrop(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-40">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col gap-2 border-b border-green-950 pb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <Leaf className="text-green-500" size={40} />
          Crop Strategy & Planning
        </h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em]">Season Logic • Area Requirements • Dynamic Matching Terminal</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-10">
          <form onSubmit={handleAddCrop} className="bg-green-950/20 border border-green-900/10 rounded-[3rem] p-10 space-y-8 shadow-2xl backdrop-blur-md">
            <h3 className="text-green-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Plus size={14} /> Add tactical plan
            </h3>
            <div className="space-y-6">
               <div>
                 <label className="text-[9px] font-black uppercase text-green-800 tracking-widest mb-2 block ml-1">Crop Identifier</label>
                 <input type="text" placeholder="e.g. Sugarcane" value={newCrop.crop_name}
                   onChange={e => setNewCrop({...newCrop, crop_name: e.target.value})}
                   className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-xs font-black text-green-100 outline-none focus:border-green-500 transition-all uppercase" />
               </div>
               <div>
                 <label className="text-[9px] font-black uppercase text-green-800 tracking-widest mb-2 block ml-1">Planned Season</label>
                 <select value={newCrop.season} onChange={e => setNewCrop({...newCrop, season: e.target.value})}
                   className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-xs font-black text-green-100 outline-none focus:border-green-500 transition-all uppercase">
                   <option value="kharif">Kharif (Monsoon)</option>
                   <option value="rabi">Rabi (Winter)</option>
                   <option value="zaid">Zaid (Summer)</option>
                   <option value="annual">Annual (Full Year)</option>
                 </select>
               </div>
               <div>
                 <label className="text-[9px] font-black uppercase text-green-800 tracking-widest mb-2 block ml-1">Minimum Surface (Ha)</label>
                 <input type="number" step="0.1" value={newCrop.area_required_ha}
                   onChange={e => setNewCrop({...newCrop, area_required_ha: e.target.value})}
                   className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-sm font-black text-green-100 outline-none focus:border-green-500 transition-all" />
               </div>
               <button type="submit" disabled={addingCrop}
                 className="w-full bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] tracking-widest py-6 rounded-2xl transition-all shadow-2xl shadow-green-600/10 active:scale-95 flex items-center justify-center gap-3">
                 Initialize Planning
               </button>
            </div>
          </form>

          <div className="bg-green-950/10 border border-green-900/10 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
             <div className="flex items-center justify-between">
                <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-3"><Bell size={14} className="text-green-500" /> Auto-Alerts</h3>
             </div>
             {searches.length === 0 ? (
               <p className="text-green-900 text-[10px] font-bold uppercase tracking-tight text-center opacity-40">No active search signals</p>
             ) : (
               <div className="space-y-4">
                  {searches.map(s => (
                    <div key={s._id} className="bg-black/20 border border-green-900/20 rounded-2xl p-4 flex flex-col gap-3 group hover:border-green-500/30 transition-all">
                       <span className="text-green-300 font-bold text-xs">{s.label}</span>
                       <div className="flex items-center gap-3 text-green-900 text-[9px] font-black uppercase">
                          <MapPin size={10} /> {s.filters.district || 'All districts'} 
                          {s.new_results_count > 0 && <span className="text-green-400 ml-auto">{s.new_results_count} NEW</span>}
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
           {crops.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] p-32 gap-10 opacity-20 group">
                <Target size={80} className="text-green-900 group-hover:scale-110 transition-transform" />
                <p className="text-green-700 font-black text-xs uppercase tracking-[0.4em] text-center leading-relaxed">System awaiting crop strategy data from renter node</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {crops.map(c => (
                  <div key={c._id} className="relative group overflow-hidden bg-green-950/20 border border-green-900/10 rounded-[3rem] p-10 transition-all hover:bg-green-600/5 hover:border-green-500/30 shadow-2xl backdrop-blur-xl group">
                    <div className="absolute top-10 right-10 text-green-900 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all">
                       <History size={24} />
                    </div>
                    <div className="mb-10">
                       <div className="flex items-center gap-3 mb-2">
                          <span className="w-3 h-3 rounded-full bg-green-500 shadow-xl shadow-green-500/40 animate-pulse" />
                          <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational Logic</span>
                       </div>
                       <h4 className="text-3xl font-black italic text-white uppercase tracking-tight group-hover:text-green-300 transition-colors uppercase leading-none">{c.crop_name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-8 border-t border-green-900/10 pt-8 mt-10">
                       <div>
                          <p className="text-green-900 text-[10px] font-black uppercase tracking-widest mb-1">Season</p>
                          <p className="text-green-100 font-black text-sm uppercase italic tracking-tighter">{c.season}</p>
                       </div>
                       <div>
                          <p className="text-green-900 text-[10px] font-black uppercase tracking-widest mb-1">Min Area</p>
                          <p className="text-green-100 font-black text-xl italic tracking-tighter">{c.area_required_ha} <span className="text-[10px] opacity-30 not-italic">Ha</span></p>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
