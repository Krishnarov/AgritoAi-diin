import { useEffect, useState } from "react";
import { ShieldCheck, User, Search, CheckCircle, XCircle, ArrowRightCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api.js";

export default function AdminKyc() {
  const [kycPending, setKycPending] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);   
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadKyc = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/kyc/pending");
      setKycPending(data.reviews || []);
    } catch { toast.error("Failed to load KYC queue"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadKyc(); }, []);

  const handleKycReview = async (status) => {
    if (status === "rejected" && !rejectReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      const endpoint = selected.type === 'renter' ? `/admin/renter-kyc/${selected._id}/review` : `/admin/kyc/${selected._id}/review`;
      await api.patch(endpoint, { status, reject_reason: rejectReason });
      toast.success(`KYC ${status} successfully`);
      loadKyc();
      setSelected(null);
      setRejectReason("");
    } catch { toast.error("Review failed"); }
    finally { setActionLoading(false); }
  };

  const filteredKyc = kycPending.filter(r => {
    const userName = r.user?.name || "";
    const docType = r.doc_type || "";
    const q = searchQuery.toLowerCase();
    return userName.toLowerCase().includes(q) || docType.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-full bg-[#050a05] text-green-100 p-8 gap-8 overflow-hidden">
      {/* Sidebar List */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-6">
        <header>
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Identity Reviews</h2>
           <p className="text-green-800 text-[10px] font-black uppercase tracking-widest mt-1">Pending Platform Proofs</p>
        </header>

        <div className="relative">
           <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800" />
           <input placeholder="Name / Document Type..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-green-950/10 border border-green-900/30 rounded-2xl h-12 pl-12 pr-4 text-xs font-medium focus:border-green-500 outline-none placeholder:text-green-900" />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
           {filteredKyc.map(kyc => (
              <button key={kyc._id} onClick={() => setSelected(kyc)}
                 className={`w-full text-left p-6 rounded-[2rem] border transition-all relative flex flex-col gap-3 group
                   ${selected?._id === kyc._id ? 'bg-green-600 border-green-500 shadow-xl shadow-green-900/20 scale-[1.02]' : 'bg-green-950/10 border-green-900/30 hover:border-green-600/40 hover:bg-green-950/20'}`}>
                 <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${selected?._id === kyc._id ? 'bg-black/10 border-black/20 text-black' : 'bg-green-950/40 border-green-500/20 text-green-500'}`}>{kyc.type}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${selected?._id === kyc._id ? 'bg-black/20 border-black/10 text-black' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>{kyc.doc_type}</span>
                 </div>
                 <div>
                    <p className={`text-lg font-black italic leading-none ${selected?._id === kyc._id ? 'text-black' : 'text-green-100'}`}>{kyc.user?.name}</p>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${selected?._id === kyc._id ? 'text-green-950/60' : 'text-green-800'}`}>Submitted {new Date(kyc.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className={`absolute right-6 bottom-6 transition-all ${selected?._id === kyc._id ? 'text-black scale-125' : 'text-green-900 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`}>
                    <ArrowRightCircle size={20} />
                 </div>
              </button>
           ))}
        </div>
      </div>

      {/* Proof Analyzer Detail View */}
      <div className="flex-1 overflow-y-auto">
         {selected ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 h-full flex flex-col">
               <div className="bg-green-950/10 border border-green-900/30 rounded-[3rem] p-12 flex flex-col lg:flex-row gap-12 flex-1 items-stretch">
                  <div className="flex-1 flex flex-col gap-6">
                     <div className="bg-[#0a150a] rounded-[2.5rem] border border-green-900/40 p-10 h-full flex items-center justify-center relative overflow-hidden group shadow-2xl">
                        <img src={selected.doc_url} alt="KYC Proof" className="max-w-full max-h-full object-contain rounded-xl relative z-10" />
                        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none"></div>
                        <div className="absolute top-10 left-10 bg-black/60 px-4 py-2 rounded-full border border-green-500/20 font-black text-green-500 text-[10px] uppercase tracking-widest leading-none z-20">ENCRYPTED IDENTITY INSPECTION</div>
                     </div>
                  </div>

                  <div className="w-full lg:w-96 space-y-8">
                     <div className="bg-[#0a150a]/60 border border-green-900/40 rounded-[2.5rem] p-10 shadow-2xl h-full flex flex-col justify-between">
                        <div>
                           <h3 className="text-green-300 font-black text-3xl italic mb-1 uppercase tracking-tighter">Review Evidence</h3>
                           <p className="text-green-700 text-[10px] font-black uppercase tracking-widest">Global Identity Verification Stack</p>
                        </div>

                        <div className="space-y-4">
                           <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-1">
                              <p className="text-green-900 text-[8px] font-black uppercase">User Full Name</p>
                              <p className="text-sm font-black text-green-100 uppercase tracking-tight">{selected.user?.name}</p>
                           </div>
                           <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-1">
                              <p className="text-green-900 text-[8px] font-black uppercase">Document ID Type</p>
                              <p className="text-sm font-black text-green-200 uppercase tracking-tight">{selected.doc_type}</p>
                           </div>
                           {selected.aadhaar_number && (
                               <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-1">
                                  <p className="text-green-900 text-[8px] font-black uppercase">Aadhaar / ID Identifier</p>
                                  <p className="text-sm font-black text-green-500 uppercase tracking-tight font-mono">{selected.aadhaar_number}</p>
                               </div>
                           )}
                           {selected.address && (
                               <div className="bg-black/20 p-5 rounded-3xl border border-white/5 space-y-1">
                                  <p className="text-green-900 text-[8px] font-black uppercase">Registered Address</p>
                                  <p className="text-xs font-medium text-green-300 leading-relaxed">{selected.address}</p>
                               </div>
                           )}
                        </div>

                        <textarea placeholder="Reason for rejection (mandatory if rejecting)..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                           className="w-full h-32 bg-black/40 border border-green-900/40 rounded-3xl px-8 py-6 text-sm text-green-100 outline-none focus:border-green-500 transition-all placeholder:text-green-900 resize-none font-medium leading-relaxed mt-6" />

                        <div className="grid grid-cols-2 gap-4 mt-8">
                           <button onClick={() => handleKycReview("rejected")} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 h-20 rounded-3xl text-[10px] font-black uppercase active:scale-95 transition-all flex items-center justify-center gap-2 flex-col leading-none">
                              <XCircle size={18} /> REJECT
                           </button>
                           <button onClick={() => handleKycReview("approved")} className="bg-green-600 hover:bg-green-500 text-black h-20 rounded-3xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-xl shadow-green-900/30 flex items-center justify-center gap-2 flex-col leading-none">
                              <CheckCircle size={18} /> APPROVE
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-green-950/10 border border-green-900/20 rounded-[3rem] border-dashed">
               <ShieldCheck size={80} className="text-green-900 mb-8 opacity-40 animate-pulse" />
               <h3 className="text-green-300 font-black text-2xl mb-2 uppercase tracking-tight italic">Proof Queue Awaiting Analysis</h3>
               <p className="text-green-800 text-sm max-w-sm font-medium">Analyze government ID scans and identity proofs submitted by users from the platform queue to verify platform integrity.</p>
            </div>
         )}
      </div>
    </div>
  );
}
