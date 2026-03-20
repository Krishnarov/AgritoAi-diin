import { useEffect, useState } from "react";
import api from "../utils/api.js";
import { Loader2, User, MessageSquare, Check, X, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function FarmerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/plots/my");
      const flattened = data.plots.reduce((acc, plot) => {
        plot.rentalRequests.forEach(req => {
          acc.push({ ...req, plotId: plot._id, gataNo: plot.gataNo });
        });
        return acc;
      }, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(flattened);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (plotId, requestId, action) => {
    try {
      await api.patch(`/plots/${plotId}/request/${requestId}`, { action });
      toast.success(`Request ${action === "accept" ? "accepted" : "rejected"}!`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col gap-2 border-b border-green-950 pb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Rental Requests</h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Management Terminal • Incoming Inquiries • Node Sync</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-green-500" size={32} />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-green-950/20 border border-green-900/10 rounded-[3rem] p-24 text-center group shadow-2xl backdrop-blur-md">
           <MessageSquare size={64} className="mx-auto text-green-900 mb-6 opacity-30 group-hover:scale-110 transition-transform" />
           <p className="text-green-700 text-[10px] uppercase font-black tracking-[0.4em] leading-relaxed italic">System awaiting inbound rental signals from renter nodes</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req._id} className="bg-green-950/20 border border-green-900/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 transition-all hover:bg-green-600/5 hover:border-green-500/30 group shadow-2xl backdrop-blur-sm relative overflow-hidden">
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 border border-green-900/30 flex items-center justify-center shrink-0 shadow-inner group-hover:text-green-500 transition-colors">
                     <User className="text-green-700 group-hover:text-green-400" size={28} />
                  </div>
                  <div>
                     <h3 className="text-white font-black text-xl italic uppercase tracking-tight">Node: {req.renter?.name || "Renter"}</h3>
                     <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-2 text-green-800 text-[9px] font-black uppercase tracking-widest border border-green-900/20 px-3 py-1 rounded-full">
                           <Phone size={10} /> {req.renter?.phone || "Private"}
                        </span>
                        <span className="text-green-100 font-black text-[10px] uppercase tracking-tighter italic">Gata #{req.gataNo}</span>
                     </div>
                  </div>
               </div>

               <div className="flex-1 bg-black/40 border border-green-900/20 rounded-2xl p-6 relative z-10 group-hover:border-green-500/20 transition-all">
                  <p className="text-green-300 text-sm font-medium italic leading-relaxed text-[11px] uppercase tracking-tighter">"{req.message || "I'm interested in renting your land."}"</p>
               </div>

               <div className="flex items-center gap-4 relative z-10">
                 {req.status === "pending" ? (
                   <>
                     <button onClick={() => handleAction(req.plotId, req._id, "reject")} className="h-14 px-6 border-2 border-red-900/20 text-red-900 hover:bg-red-500 hover:text-white hover:border-red-500 font-black rounded-xl transition-all text-[9px] uppercase tracking-widest active:scale-95 shadow-xl shadow-red-900/5">
                       Reject
                     </button>
                     <button onClick={() => handleAction(req.plotId, req._id, "accept")} className="h-14 px-8 bg-green-600 text-black hover:bg-green-500 font-black rounded-xl transition-all text-[9px] uppercase tracking-widest active:scale-95 shadow-2xl shadow-green-600/20">
                       Authorize Access
                     </button>
                   </>
                 ) : (
                   <span className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current shadow-xl ${req.status === "accepted" ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-red-500 bg-red-500/10 border-red-500/20 font-bold"}`}>
                     {req.status}
                   </span>
                 )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
