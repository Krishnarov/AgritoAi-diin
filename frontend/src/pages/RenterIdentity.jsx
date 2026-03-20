import { useEffect, useState } from "react";
import { Shield, FileText, Upload, CheckCircle, Clock, XCircle, Trash2 } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

const DOC_TYPES = [
  { id: 'aadhaar',            label: 'Aadhaar Card',      icon: <FileText size={16} /> },
  { id: 'pan',                label: 'PAN Card',          icon: <FileText size={16} /> },
  { id: 'farmer_certificate', label: 'Farmer Certificate', icon: <FileText size={16} /> },
  { id: 'soil_health_card',   label: 'Soil Health Card',   icon: <FileText size={16} /> },
  { id: 'kisan_credit_card',  label: 'Kisan Credit Card',  icon: <FileText size={16} /> }
];

export default function RenterIdentity() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newDoc, setNewDoc] = useState({ doc_type: 'aadhaar', file_url: '' });

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const { data } = await api.get("/renter/documents");
      setDocs(data.docs || []);
    } catch { toast.error("Failed to load documents"); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newDoc.file_url) return toast.error("Please provide a valid document URL or upload a file");
    setUploading(true);
    try {
      await api.post("/renter/documents", newDoc);
      toast.success("Document submitted for review");
      loadDocs();
      setNewDoc({ ...newDoc, file_url: '' });
    } catch { toast.error("Submission failed"); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-40">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-b border-green-950 pb-12">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-green-950/40 border-2 border-green-600/30 rounded-[2.5rem] flex items-center justify-center text-green-500 shadow-2xl relative">
             <div className="absolute inset-0 bg-green-500/5 rounded-[2.5rem] animate-pulse"></div>
             <Shield size={48} strokeWidth={1.5} className="relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Trust Credentials</h1>
            <p className="max-w-xl text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2 leading-relaxed">Identity Audit • Verification Vault • Security Clearance</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-green-900/10 rounded-[2rem] border border-green-500/20 shadow-xl backdrop-blur-md">
           <span className="text-[10px] font-black uppercase text-green-800 tracking-widest leading-none">Global Profile Integrity</span>
           <span className="text-green-500 font-black text-[10px] uppercase flex items-center gap-2 tracking-[0.2em] mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/40"></div> Active Review Cycle
           </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
        <section className="space-y-10 order-2 lg:order-1">
           <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2">Verification Vault</h2>
           <div className="space-y-6">
              {docs.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] opacity-20 gap-8 group">
                   <FileText size={64} className="text-green-900 group-hover:scale-110 transition-transform" />
                   <p className="text-green-700 font-black text-xs uppercase tracking-widest text-center italic">No encrypted identity markers found</p>
                </div>
              ) : (
                docs.map((d, idx) => (
                  <div key={d._id} className="bg-green-950/20 border border-green-900/10 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-green-600/30 transition-all shadow-2xl backdrop-blur-md">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-green-900/30 flex items-center justify-center text-green-800 group-hover:bg-green-900/20 group-hover:text-green-400 transition-all shadow-inner">
                           <FileText size={28} />
                        </div>
                        <div>
                           <h4 className="text-white font-black text-sm uppercase tracking-widest leading-none">{d.doc_type} MARKER</h4>
                           <div className="flex items-center gap-4 mt-3">
                              {d.is_verified ? (
                                <span className="flex items-center gap-2 text-green-500 font-black text-[9px] uppercase tracking-widest bg-green-500/10 px-3 py-1.5 rounded-full shadow-lg shadow-green-500/10 border border-green-500/20">
                                   <CheckCircle size={10} /> Authenticated
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-yellow-500 font-black text-[9px] uppercase tracking-widest bg-yellow-500/10 px-3 py-1.5 rounded-full shadow-lg shadow-yellow-500/10 border border-yellow-500/20">
                                   <Clock size={10} className="animate-spin-slow" /> In-Audit
                                </span>
                              )}
                              <span className="text-green-900 text-[8px] font-black uppercase tracking-widest border-l border-green-900/30 pl-4 italic">Ref: #{d._id.slice(-6).toUpperCase()}</span>
                           </div>
                        </div>
                     </div>
                     <button className="w-12 h-12 rounded-xl bg-red-900/10 text-red-900 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 flex items-center justify-center shadow-xl shadow-red-900/10 active:scale-90">
                        <Trash2 size={18} />
                     </button>
                  </div>
                ))
              )}
           </div>
        </section>

        <section className="space-y-10 order-1 lg:order-2">
           <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] ml-2">Upload Terminal</h2>
           <form onSubmit={handleUpload} className="bg-green-950/20 border border-green-900/10 rounded-[3.5rem] p-12 space-y-10 shadow-2xl relative overflow-hidden group backdrop-blur-md">
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="space-y-10">
                 <div>
                    <label className="text-[10px] font-black uppercase text-green-800 tracking-widest mb-4 block ml-1">Asset Verification Class</label>
                    <div className="grid grid-cols-2 gap-4">
                       {DOC_TYPES.map(dt => (
                         <button key={dt.id} type="button" onClick={() => setNewDoc({...newDoc, doc_type: dt.id})}
                           className={`flex items-center justify-center gap-3 px-6 py-5 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all border shadow-lg
                             ${newDoc.doc_type === dt.id ? 'bg-green-600 text-black border-green-600 shadow-green-600/20' : 'bg-black/40 text-green-900 border-green-900/20 hover:text-green-500 hover:border-green-600/30'}`}>
                            {dt.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-green-800 tracking-widest ml-1 leading-none">Secure Document Link (Cloudinary Source)</label>
                    <div className="relative group/input">
                       <Upload className="absolute left-6 top-1/2 -translate-y-1/2 text-green-900 group-focus-within/input:text-green-500 transition-colors" size={18} />
                       <input type="text" placeholder="https://res.cloudinary.com/..." value={newDoc.file_url} onChange={e => setNewDoc({...newDoc, file_url: e.target.value})}
                         className="w-full bg-black/60 border border-green-900/40 rounded-2xl pl-16 pr-8 py-6 text-xs font-black text-green-100 outline-none focus:border-green-600 transition-all font-mono shadow-inner tracking-wider" />
                    </div>
                 </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl flex items-start gap-6 border-l-4 border-l-red-500/40">
                 <XCircle className="text-red-500/60 mt-0.5" size={24} />
                 <p className="text-[10px] text-red-500/80 font-black uppercase tracking-widest leading-relaxed">Warning: Providing fraudulent or illegible data will result in immediate renter node termination. Final review required before land lock-in.</p>
              </div>

              <button type="submit" disabled={uploading}
                className="w-full h-20 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] tracking-widest rounded-[2rem] transition-all shadow-2xl shadow-green-600/20 active:scale-[0.98] flex items-center justify-center gap-4">
                 {uploading ? <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" /> : <Shield size={20} />}
                 Sync Encrypted Credential
              </button>
           </form>
        </section>
      </div>
    </div>
  );
}
