import { useEffect, useState } from "react";
import { MessageSquare, Search, Info, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api.js";

export default function AdminDisputes() {
  const [disputes, setDisputes]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);   
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/disputes");
      setDisputes(data.disputes || []);
    } catch { toast.error("Failed to load disputes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadDisputes(); }, []);

  const handleResolveDispute = async (outcome) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter resolution summary");
      return;
    }
    setActionLoading(true);
    try {
      await api.post(`/api/disputes/${selected._id}/resolve`, { outcome, summary: rejectReason });
      toast.success(`Dispute resolved as ${outcome}`);
      loadDisputes();
      setSelected(null);
      setRejectReason("");
    } catch { toast.error("Resolution failed"); }
    finally { setActionLoading(false); }
  };

  const filteredDisputes = disputes.filter(d => 
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.raised_by?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#050a05] text-green-100 p-8 gap-8 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-6">
        <header>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Dispute Terminal</h2>
           <p className="text-green-800 text-[10px] font-black uppercase tracking-widest mt-1">Operational Conflict Mediation</p>
        </header>

        <div className="relative">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800" />
           <input placeholder="Title / Type / User..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-green-950/10 border border-green-900/30 rounded-2xl h-12 pl-12 pr-4 text-xs font-medium focus:border-green-500 outline-none placeholder:text-green-900" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
           {filteredDisputes.map(dispute => (
              <button key={dispute._id} onClick={() => setSelected(dispute)}
                 className={`w-full text-left p-6 rounded-[2.5rem] border transition-all flex flex-col gap-4 relative overflow-hidden group
                   ${selected?._id === dispute._id ? 'bg-green-600 border-green-500 shadow-xl shadow-green-900/20 scale-[1.02]' : 'bg-green-950/10 border-green-900/30 hover:border-green-600/40 hover:bg-green-950/20'}`}>
                 <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${selected?._id === dispute._id ? 'bg-black/10 border-black/20 text-black' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>{dispute.type}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${selected?._id === dispute._id ? 'bg-black/20 border-black/10 text-black' : 'bg-green-950/40 border-green-500/20 text-green-500'}`}>{dispute.status}</span>
                 </div>
                 <div className="space-y-1">
                    <p className={`text-lg font-black italic leading-tight uppercase tracking-tighter ${selected?._id === dispute._id ? 'text-black' : 'text-green-100'}`}>{dispute.title}</p>
                    <p className={`text-[10px] font-bold uppercase ${selected?._id === dispute._id ? 'text-green-950/60' : 'text-green-700'}`}>Raised by {dispute.raised_by?.name}</p>
                 </div>
              </button>
           ))}
        </div>
      </div>

      {/* Mediation Workspace Detail View */}
      <div className="flex-1 overflow-y-auto">
         {selected ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 h-full flex flex-col">
               <div className="bg-green-950/10 border border-green-900/30 rounded-[3rem] p-12 flex flex-col items-stretch space-y-10">
                  <header className="flex justify-between items-start">
                     <div className="space-y-2">
                        <p className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                           <AlertTriangle size={12} /> Conflict ID: #{selected._id.slice(-8).toUpperCase()}
                        </p>
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">{selected.title}</h2>
                     </div>
                     <div className="text-right">
                        <p className="text-green-900 text-[10px] font-black uppercase">Report Timestamp</p>
                        <p className="text-sm font-black text-green-500">{new Date(selected.createdAt).toLocaleString()}</p>
                     </div>
                  </header>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                     <div className="bg-black/20 border border-green-900/20 rounded-[2.5rem] p-10 space-y-6">
                        <h4 className="text-green-300 font-black text-sm uppercase tracking-widest italic">Conflict Brief</h4>
                        <p className="text-green-100 text-sm leading-relaxed font-medium bg-green-950/10 p-6 rounded-3xl border border-white/5">{selected.description}</p>
                        <div className="flex items-center gap-4 pt-4">
                           <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex-1">
                              <p className="text-green-900 text-[8px] font-black uppercase mb-1">Complainant</p>
                              <p className="text-sm font-black text-green-100 uppercase">{selected.raised_by?.name}</p>
                           </div>
                           <div className="bg-black/40 p-5 rounded-3xl border border-white/5 flex-1">
                              <p className="text-green-900 text-[8px] font-black uppercase mb-1">Against User</p>
                              <p className="text-sm font-black text-green-200 uppercase">{selected.against_user?.name}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-[#0a150a]/60 border border-green-900/40 rounded-[2.5rem] p-10 shadow-2xl space-y-8 flex flex-col justify-between">
                        <div>
                           <h3 className="text-green-300 font-black text-2xl italic mb-1 uppercase tracking-tighter">Mediation Decision</h3>
                           <p className="text-green-700 text-[10px] font-black uppercase tracking-widest leading-none">Final Resolution Authorization</p>
                        </div>

                        <textarea placeholder="Summarize your final decision and reasoning..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                           className="w-full flex-1 min-h-[140px] bg-black/40 border border-green-900/40 rounded-3xl px-8 py-6 text-sm text-green-100 outline-none focus:border-green-500 transition-all placeholder:text-green-900 resize-none font-medium leading-relaxed" />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                           <button onClick={() => handleResolveDispute("dismissed")} className="bg-black/40 hover:bg-black/60 border border-white/10 text-white h-20 rounded-3xl text-[10px] font-black uppercase active:scale-95 transition-all flex items-center justify-center gap-2 flex-col leading-none">
                              <XCircle size={18} /> DISMISS CASE
                           </button>
                           <button onClick={() => handleResolveDispute("resolved")} className="bg-green-600 hover:bg-green-500 text-black h-20 rounded-3xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-xl shadow-green-900/30 flex items-center justify-center gap-2 flex-col leading-none">
                              <CheckCircle size={18} /> RESOLVE DISPUTE
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-green-950/10 border border-green-900/20 rounded-[3rem] border-dashed">
               <MessageSquare size={80} className="text-green-900 mb-8 opacity-40 animate-pulse" />
               <h3 className="text-green-300 font-black text-2xl mb-2 uppercase tracking-tight italic">Conflict Mediation Terminal</h3>
               <p className="text-green-800 text-sm max-w-sm font-medium">Select an active dispute to initiate conflict resolution protocols, analyze statements, and finalize settlement outcomes.</p>
            </div>
         )}
      </div>
    </div>
  );
}
