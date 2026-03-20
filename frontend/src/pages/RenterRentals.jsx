import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Leaf, DollarSign, Info, Calendar, MoreHorizontal, ChevronRight, Target, Plus, Shield } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

const CROP_STATUS = {
  sowing:    { label: "Sowing Stage",    color: "#fbbf24", icon: <Calendar size={14} /> },
  growing:   { label: "Growth Stage",    color: "#22c55e", icon: <Leaf size={14} /> },
  harvesting:{ label: "Harvesting Phase",color: "#f59e0b", icon: <Target size={14} /> },
  completed: { label: "Completed",       color: "#10b981", icon: <CheckCircle size={14} /> },
  failed:    { label: "Crop Failed",     color: "#ef4444", icon: <Info size={14} /> }
};

export default function RenterRentals() {
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: rentalData }, { data: pmtData }] = await Promise.all([
        api.get("/renter/rentals/active"),
        api.get("/renter/payments")
      ]);
      setRentals(rentalData.rentals || []);
      setPayments(pmtData.payments || []);
    } catch { toast.error("Failed to load rental data"); }
    finally { setLoading(false); }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/renter/rentals/track/${selectedRental._id}`, { crop_status: status });
      toast.success("Status updated successfully");
      loadData();
    } catch { toast.error("Update failed"); }
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
          Operational Management
        </h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.4em]">Asset Deployment • Crop Lifecycle Tracking • Ledger Reconciliation</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pt-10">
        <div className="xl:col-span-2 space-y-12">
          {rentals.length === 0 ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] p-32 gap-10 opacity-20 shadow-inner group">
                <Calendar size={80} className="text-green-900 group-hover:scale-110 transition-transform" />
                <p className="text-green-700 font-black text-xs uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed italic">Zero operationalAgreement signals found in this quadrant</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {rentals.map(r => (
                 <div key={r._id} onClick={() => setSelectedRental(r)}
                   className={`relative group cursor-pointer bg-green-950/20 border border-green-900/10 rounded-[3rem] p-10 transition-all hover:border-green-500/30 shadow-2xl backdrop-blur-xl
                     ${selectedRental?._id === r._id ? "ring-2 ring-green-600 border-green-600 shadow-green-600/10" : "hover:scale-[1.01]"}`}>
                    
                    <div className="flex items-center justify-between mb-10">
                       <span className="text-white font-black text-3xl italic uppercase leading-none tracking-tighter group-hover:text-green-300">Gata #{r.plot?.gataNo}</span>
                       <div className="flex items-center gap-3 px-5 py-2 rounded-full border shadow-xl backdrop-blur-md" 
                         style={{ background: `${CROP_STATUS[r.crop_status]?.color}15`, color: CROP_STATUS[r.crop_status]?.color, borderColor: `${CROP_STATUS[r.crop_status]?.color}30` }}>
                          {CROP_STATUS[r.crop_status]?.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{CROP_STATUS[r.crop_status]?.label}</span>
                       </div>
                    </div>

                    <div className="mb-12 space-y-3">
                       <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Crop Identifier</p>
                       <h3 className="text-white text-2xl font-black italic uppercase leading-tight tracking-tight uppercase">{r.current_crop || "Unknown"} Cultivation</h3>
                       <p className="text-green-900 text-[10px] font-black uppercase tracking-widest border-l-2 border-green-900/30 pl-4">{r.plot?.district}, UP • Live Asset</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-green-900/10 pt-8 mt-10">
                       <div className="flex flex-col">
                          <span className="text-green-900 text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Start Date</span>
                          <span className="text-green-100 font-black text-sm italic tracking-tighter">{new Date(r.season_start).toLocaleDateString()}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-green-900 text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12} /> Net area</span>
                          <span className="text-green-400 font-black text-xl italic tracking-tighter">{r.plot?.area_ha} Ha</span>
                       </div>
                    </div>

                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                       <ChevronRight size={24} className="text-green-600" />
                    </div>
                 </div>
               ))}
            </div>
          )}

          {selectedRental && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 bg-green-950/20 border border-green-500/20 rounded-[3.5rem] p-12 space-y-12 shadow-2xl backdrop-blur-xl relative overflow-hidden group/mng">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none opacity-0 group-hover/mng:opacity-100 transition-opacity"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
                  <div className="flex items-center gap-10">
                     <div className="w-20 h-20 bg-green-600 rounded-[2rem] flex items-center justify-center text-black shadow-2xl shadow-green-600/40 border border-green-400/40 animate-in zoom-in duration-500">
                        <MoreHorizontal size={36} />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Lifecycle Sync: Gata #{selectedRental.plot?.gataNo}</h2>
                        <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-60">Status Override Node • Operational Intelligence</p>
                     </div>
                  </div>
                  <div className="flex gap-4 p-4 bg-black/40 rounded-[2.5rem] border border-green-900/40 shadow-xl backdrop-blur-md">
                     {Object.entries(CROP_STATUS).map(([key, cfg]) => (
                        <button key={key} onClick={() => updateStatus(key)}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border group/btn
                            ${selectedRental.crop_status === key ? 'bg-green-600 text-black border-green-500 shadow-2xl shadow-green-600/20 scale-105' : 'bg-green-950/40 text-green-900 border-green-900/40 hover:text-green-500 hover:border-green-600/30 hover:scale-105'}`}>
                           <div className="group-hover/btn:scale-110 transition-transform">{cfg.icon}</div>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                     <p className="text-green-900 text-[10px] font-black uppercase tracking-[0.4em] ml-2 leading-none mb-4">Soil Observation Ledger (Public Loop)</p>
                     <textarea placeholder="Log seasonal progress, irrigation metrics, or soil variations..."
                       className="w-full h-48 bg-black/40 border border-green-900/40 rounded-[2.5rem] px-10 py-8 text-sm text-green-100 outline-none focus:border-green-500 transition-all font-medium resize-none leading-relaxed shadow-inner" />
                  </div>
                  <div className="bg-black/20 rounded-[3rem] p-10 border border-green-900/20 flex flex-col justify-between shadow-2xl backdrop-blur-md">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black uppercase text-green-800 tracking-widest ml-1 leading-none border-b border-green-950 pb-4 block">Agreement Actions</label>
                        {selectedRental.crop_status === 'completed' ? (
                          <div className="bg-green-600/10 border border-green-500/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                             <p className="text-xs text-green-400 font-black uppercase tracking-widest leading-loose text-center">Protocol Complete. Initiate Peer Node Audit.</p>
                             <button className="w-full h-16 bg-green-600 text-black font-black text-[10px] uppercase rounded-2xl shadow-xl shadow-green-600/20 active:scale-95 transition-all">Submit operational review</button>
                          </div>
                        ) : (
                          <div className="relative group/terms">
                            <span className="absolute -top-4 -left-2 text-[8px] font-bold text-green-950 uppercase tracking-widest px-2 py-1 bg-[#0a150a] rounded-full border border-green-900/20">Signatory Terms</span>
                            <p className="text-green-300 text-sm font-black italic tracking-tight leading-relaxed p-6 border border-green-900/20 rounded-2xl bg-green-900/5 group-hover/terms:border-green-600/30 transition-all uppercase leading-none">"{selectedRental.agreement?.terms || 'Platform Standard Operational Terms Node — active agreement status.'}"</p>
                          </div>
                        )}
                     </div>
                     <Link to={`/disputes/new?plotId=${selectedRental.plot?._id}`} className="flex items-center gap-4 text-red-500/60 font-black text-[10px] uppercase tracking-[0.3em] hover:text-red-500 transition-all mt-10 group/err">
                        <Info size={16} className="group-hover/err:rotate-12 transition-transform" /> Initialize Operational Dispute
                     </Link>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-12">
           <div className="flex items-center justify-between border-b border-green-950 pb-8 uppercase font-black text-[10px] tracking-[0.4em] ml-2">
              <h2 className="text-green-500">Financial Ledger</h2>
              <DollarSign size={20} className="text-green-950" />
           </div>

           <div className="space-y-10 relative">
              {payments.length === 0 ? (
                <div className="py-24 text-center">
                   <div className="w-16 h-16 bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-950">
                      <DollarSign size={24} className="text-green-950" />
                   </div>
                   <p className="text-green-950 text-center font-black text-[10px] tracking-[0.3em] uppercase italic leading-loose">No transaction signals<br/>propagated to node</p>
                </div>
              ) : (
                <div className="space-y-8 pl-4 border-l-2 border-green-950/40">
                  {payments.map(p => (
                    <div key={p._id} className="relative pl-10 group pb-4 last:pb-0">
                       <div className="absolute left-[-11px] top-1 w-5 h-5 bg-[#0a150a] border-2 border-green-600 rounded-full shadow-2xl group-hover:scale-125 transition-transform group-hover:bg-green-600"></div>
                       <div className="flex flex-col gap-3 group-hover:translate-x-3 transition-transform">
                          <div className="flex items-center justify-between">
                             <span className="text-white font-black text-2xl italic tracking-tighter leading-none group-hover:text-green-300">₹{p.amount}</span>
                             <span className="text-[8px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 shadow-xl">SETTLED</span>
                          </div>
                          <p className="text-green-800 text-[9px] font-black uppercase tracking-widest">{p.season || "Active Cycle"}</p>
                          <div className="flex items-center gap-3 mt-1 text-green-900 text-[8px] font-black uppercase tracking-widest italic opacity-40">
                             <Calendar size={12} /> {new Date(p.paid_at).toLocaleDateString()} • {p.payment_mode}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
           </div>

           <Link to="/renter/payments/new" className="bg-green-600 text-black w-full h-20 rounded-[2rem] flex items-center justify-center gap-4 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-green-600/20 hover:bg-green-500 transition-all active:scale-95 group/pay">
              <Plus size={20} className="group-hover/pay:rotate-90 transition-transform" /> Record Settlement Signal
           </Link>

           <div className="bg-green-900/5 border border-green-900/20 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-inner">
              <Shield className="text-green-900 mt-1" size={24} />
              <p className="text-[9px] text-green-900/60 font-black uppercase tracking-widest leading-loose">Automated Escrow Protocol active. all transaction signals are documented on the platform ledger for dispute reference.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
