import { useEffect, useState } from "react";
import { MessageSquare, Gavel, DollarSign, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle, FileText, Calendar, MapPin, Shield } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function RenterInterests() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeg, setSelectedNeg] = useState(null);
  const [offerVal, setOfferVal] = useState("");
  const [offerMsg, setOfferMsg] = useState("");

  useEffect(() => {
    loadMyRentals();
  }, []);

  const loadMyRentals = async () => {
    try {
      const { data } = await api.get("/renter/interests");
      setRentals(data.interests || []);
    } catch { toast.error("Failed to load interests"); }
    finally { setLoading(false); }
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    if (!offerVal || isNaN(offerVal)) return toast.error("Valid amount required");
    try {
      await api.post("/renter/negotiations/offer", { negotiationId: selectedNeg._id, amount: offerVal, message: offerMsg });
      toast.success("Offer submitted successfully");
      setSelectedNeg(null);
      loadMyRentals();
    } catch { toast.error("Failed to submit counter-offer"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-40">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto flex flex-col xl:flex-row gap-12 pb-20">
      <div className="w-full xl:w-[450px] space-y-10">
        <header className="border-b border-green-950 pb-8 flex items-center justify-between">
           <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">My Interests</h2>
              <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-1">Sent Requests</p>
           </div>
           <span className="text-green-100 text-[10px] font-black uppercase tracking-[0.2em] bg-green-600 px-5 py-2 rounded-full shadow-2xl shadow-green-600/20">{rentals.length} ACTIVE</span>
        </header>

        <div className="space-y-6">
           {rentals.length === 0 ? (
             <div className="py-32 text-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[3rem] opacity-30">
                <Gavel size={48} className="text-green-900 mx-auto mb-6" />
                <p className="text-green-700 text-[10px] font-black uppercase tracking-[0.4em]">No interests sent yet</p>
             </div>
           ) : (
             rentals.map(r => (
               <button key={r._id} onClick={() => setSelectedNeg(r)}
                 className={`w-full text-left p-8 rounded-[3rem] border transition-all flex flex-col gap-6 group relative overflow-hidden backdrop-blur-xl
                   ${selectedNeg?._id === r._id ? "bg-green-600/10 border-green-500/40 shadow-2xl" : "bg-green-950/20 border-green-900/10 hover:border-green-600/30"}`}>
                  {selectedNeg?._id === r._id && <div className="absolute top-0 left-0 w-2 h-full bg-green-500 animate-pulse" />}
                  <div className="flex items-center justify-between">
                     <span className="text-white font-black text-xl italic uppercase tracking-tight group-hover:text-green-300">Gata #{r.plot?.gata_number || r.plot?.gataNo}</span>
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-current flex items-center gap-2 ${
                       r.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' :
                       r.status === 'accepted' ? 'text-green-500 bg-green-500/10' :
                       r.status === 'rejected' ? 'text-red-500 bg-red-500/10' :
                       r.status === 'countered' ? 'text-orange-500 bg-orange-500/10' :
                       'text-gray-500 bg-gray-500/10'
                     }`}>
                        {r.status} <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                     </span>
                  </div>
                  <div className="flex items-center gap-10 border-t border-green-900/10 pt-6">
                     <div className="flex flex-col">
                        <span className="text-green-900 text-[9px] font-black uppercase tracking-widest mb-1">Your Offer</span>
                        <span className="text-green-400 font-black text-lg italic tracking-tighter">₹{r.offered_price || r.plot?.price_per_season || r.plot?.pricePerSeason || 0}</span>
                     </div>
                     <div className="flex flex-col ml-auto text-right">
                        <span className="text-green-900 text-[9px] font-black uppercase tracking-widest mb-1">Sent</span>
                        <span className="text-green-100 font-bold text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                     </div>
                  </div>
               </button>
             ))
           )}
        </div>
      </div>

      <div className="flex-1 space-y-12">
         {!selectedNeg ? (
           <div className="h-full flex flex-col items-center justify-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] p-32 gap-10 opacity-20 shadow-inner group">
              <Gavel size={80} className="text-green-900 group-hover:scale-110 transition-transform" />
              <p className="text-green-700 font-black text-xs uppercase tracking-[0.4em] text-center max-w-sm leading-relaxed">Select an interest from the list to view details</p>
           </div>
         ) : (
           <div className="animate-in fade-in slide-in-from-right-12 duration-500 space-y-12">
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-green-950 pb-12">
                 <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Interest Details</h1>
                    <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2 leading-relaxed">Gata: {selectedNeg.plot?.gata_number || selectedNeg.plot?.gataNo} • Farmer: {selectedNeg.farmer?.name}</p>
                 </div>
                 <div className="flex items-center gap-6 p-6 bg-yellow-500/10 rounded-[2rem] border border-yellow-500/20 shadow-xl backdrop-blur-md">
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 block mb-1">Status</span>
                       <span className="text-white font-black text-xl italic tracking-tighter flex items-center gap-3">
                         {selectedNeg.status === 'pending' ? <><Clock size={20} className="text-yellow-500 animate-pulse" /> Waiting</> : selectedNeg.status}
                       </span>
                    </div>
                 </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                 <div className="bg-green-950/20 border border-green-900/10 rounded-[3.5rem] p-12 space-y-12 flex flex-col shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 relative z-10">
                       <MessageSquare size={14} /> Your Message
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-10 max-h-[500px] scrollbar-thin scrollbar-thumb-green-900 pr-6 relative z-10">
                       <div className="bg-green-600/10 border border-green-500/20 rounded-3xl rounded-tl-none p-6 ml-6 self-start relative shadow-2xl">
                          <p className="text-sm text-green-100 italic font-medium leading-relaxed">{selectedNeg.message || "No message provided"}</p>
                          <span className="absolute -left-12 top-0 text-[10px] font-black text-green-900 uppercase tracking-widest leading-none">You</span>
                       </div>
                       {selectedNeg.counter_message && (
                         <div className="bg-green-900/10 border border-green-700/20 rounded-3xl rounded-tr-none p-6 mr-6 self-end relative shadow-2xl">
                            <p className="text-sm text-green-300 font-black italic uppercase tracking-tight leading-relaxed">{selectedNeg.counter_message}</p>
                            <span className="absolute -right-16 top-0 text-[10px] font-black text-green-900 uppercase tracking-widest leading-none">Farmer</span>
                         </div>
                       )}
                    </div>

                    {selectedNeg.status === 'pending' && (
                      <form onSubmit={submitOffer} className="space-y-6 pt-10 border-t border-green-900/10 relative z-10">
                         <div className="relative group/field">
                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-green-900 group-focus-within/field:text-green-500 transition-all" size={18} />
                            <input type="number" placeholder="New Counter Offer" value={offerVal} onChange={e => setOfferVal(e.target.value)}
                              className="w-full bg-black/40 border border-green-900/40 rounded-2xl pl-16 pr-8 py-6 text-sm font-black text-green-100 outline-none focus:border-green-500 transition-all font-mono shadow-inner" />
                         </div>
                         <textarea placeholder="Message for Farmer..." value={offerMsg} onChange={e => setOfferMsg(e.target.value)}
                           className="w-full h-32 bg-black/40 border border-green-900/40 rounded-[2.5rem] px-8 py-6 text-xs font-medium text-green-100 outline-none focus:border-green-500 transition-all font-medium resize-none leading-relaxed shadow-inner" />
                         <button type="submit" className="w-full h-18 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-4">Send Counter Offer</button>
                      </form>
                    )}
                 </div>

                 <div className="space-y-10">
                    <div className="bg-green-950/20 border border-green-900/10 rounded-[3.5rem] p-12 space-y-12 shadow-2xl backdrop-blur-xl">
                       <h3 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                          <FileText size={14} /> Request Details
                       </h3>
                       <div className="space-y-8">
                          {[
                            ["Proposed Start", selectedNeg.start_date ? new Date(selectedNeg.start_date).toLocaleDateString() : "To be decided", <Clock key="clock" size={12} />],
                            ["Duration", selectedNeg.duration?.replace("_", " ") || "1 Year", <Calendar key="cal" size={12} />],
                            ["Area", `${selectedNeg.plot?.area_ha || 0} Ha`, <MapPin key="map" size={12} />],
                            ["Your Offer", `₹${offerVal || selectedNeg.offered_price || selectedNeg.plot?.price_per_season || 0}`, <DollarSign key="dollar" size={12} />],
                          ].map(([lbl, val, icon]) => (
                            <div key={lbl} className="flex flex-col border-b border-green-900/10 pb-6 group">
                               <span className="text-green-900 text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">{icon} {lbl}</span>
                               <span className="text-white font-black text-xl italic tracking-tighter uppercase group-hover:text-green-400 transition-colors">{val}</span>
                            </div>
                          ))}
                       </div>
                       {selectedNeg.crop_planned && (
                         <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl">
                            <p className="text-green-700 text-[9px] font-black uppercase tracking-widest mb-2">Crop Planned</p>
                            <p className="text-green-300 font-bold text-sm">{selectedNeg.crop_planned}</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
