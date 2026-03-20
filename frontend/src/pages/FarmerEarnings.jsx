import { useState, useEffect } from "react";
import { Wallet, IndianRupee, TrendingUp, Search, Loader2, FileText, ChevronRight } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

export default function FarmerEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const { data } = await api.get("/farmer/earnings");
        if (data.earnings) setEarnings(data.earnings);
        if (data.total) setTotal(data.total);
      } catch (err) {
        toast.error("Failed to load earnings");
      } finally {
        setLoading(false);
      }
    };
    loadEarnings();
  }, []);

  const stats = [
    { label: "Total Revenue", value: `₹${total}`, icon: <TrendingUp size={16} /> },
    { label: "Active Agreements", value: "3", icon: <TrendingUp size={16} /> },
    { label: "Disputed Income", value: "₹0", icon: <TrendingUp size={16} />, color: "text-red-500" },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col gap-2 border-b border-green-950 pb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <Wallet size={40} className="text-green-500" />
          Financial Ledger
        </h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em]">Revenue Analytics • Seasonal Yield Matrix</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 animate-pulse">
          <Loader2 size={32} className="text-green-800 animate-spin" />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#0a150a]/40 border border-green-900/20 rounded-3xl p-8 group hover:border-green-600/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">{s.label}</p>
                  <div className="w-8 h-8 rounded-xl bg-green-900/20 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                </div>
                <h4 className={`text-4xl font-black tracking-tight ${s.color || 'text-white'}`}>{s.value}</h4>
              </div>
            ))}
          </div>

          {/* Earnings List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-green-300">Transaction History</h3>
              <div className="flex items-center gap-3">
                <div className="relative h-11">
                  <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" />
                  <input placeholder="Filter season..." className="h-full bg-green-950/20 border border-green-900/30 rounded-full pl-10 pr-6 text-xs text-green-200 outline-none focus:border-green-500" />
                </div>
              </div>
            </div>

            {earnings.length === 0 ? (
              <div className="py-24 text-center bg-green-950/5 border border-dashed border-green-900/20 rounded-[3rem]">
                <FileText size={32} className="text-green-900 mx-auto mb-4" />
                <p className="text-green-800 text-sm font-bold uppercase tracking-widest">No transaction records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.map((e, idx) => (
                  <div key={idx} className="group relative bg-[#0a150a]/40 border border-green-900/10 hover:border-green-600/20 rounded-3xl p-6 transition-all flex flex-wrap lg:flex-nowrap items-center gap-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-green-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="w-16 h-16 rounded-2xl bg-green-900/20 flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-black transition-all">
                      <IndianRupee size={24} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-xl text-white">₹{e.amount}</h4>
                        <span className="text-xs font-black px-3 py-1 bg-green-600/10 text-green-500 rounded-full border border-green-500/10 uppercase tracking-widest">
                          Received
                        </span>
                      </div>
                      <p className="text-green-700 text-xs font-bold uppercase tracking-widest">{e.season || "Kharif 2026"} • via {e.payment_mode}</p>
                    </div>
                    <div className="flex items-center gap-12 w-full lg:w-auto">
                      <div>
                        <p className="text-green-800 text-[10px] font-black uppercase mb-1">Date</p>
                        <p className="text-green-400 font-bold text-sm tracking-tight">{new Date(e.paid_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-green-800 text-[10px] font-black uppercase mb-1">Transaction ID</p>
                        <p className="text-green-400 font-bold text-xs font-mono tracking-widest">{e.txn_id || "TRX-N/A"}</p>
                      </div>
                      <button className="w-12 h-12 bg-green-900/20 text-green-800 hover:text-green-400 rounded-2xl flex items-center justify-center transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
