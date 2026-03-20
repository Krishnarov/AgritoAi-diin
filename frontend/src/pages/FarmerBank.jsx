import { useState, useEffect } from "react";
import { CreditCard, IndianRupee, MoreVertical, Wallet, CheckCircle, Loader2 } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

export default function FarmerBank() {
  const [bank, setBank] = useState({
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch: "",
    upi_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBank = async () => {
      try {
        const { data } = await api.get("/farmer/bank");
        if (data.bank) setBank(data.bank);
      } catch (err) {
        toast.error("Failed to load bank details");
      } finally {
        setLoading(false);
      }
    };
    loadBank();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/farmer/bank", bank);
      toast.success("Bank details updated!");
    } catch (err) {
      toast.error("Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-green-950/20 border border-green-900/30 rounded-2xl px-5 py-4 text-green-100 text-sm outline-none focus:border-green-500 transition-all placeholder:text-green-900";

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col gap-2 border-b border-green-950 pb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
          <CreditCard size={40} className="text-green-500" />
          Payout & Accounts
        </h1>
        <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em]">Financial Matrix • Secure Settlement Stack</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-green-800 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Visual Bank Card */}
          <div className="space-y-8">
            <div className="relative group overflow-hidden bg-gradient-to-br from-green-600 to-green-900 rounded-[3rem] p-10 h-72 shadow-2xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="flex items-center justify-between">
                <div className="w-14 h-10 bg-yellow-400/20 border border-white/20 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-6 bg-yellow-400/30 rounded-md" />
                </div>
                <IndianRupee size={24} className="text-white/60" />
              </div>
              <div>
                <p className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase mb-1">Account Number</p>
                <h4 className="text-2xl text-white font-black tracking-widest leading-none">
                  {bank.account_number ? `XXXX XXXX XXXX ${bank.account_number.slice(-4)}` : "NOT CONFIGURED"}
                </h4>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-white/40 text-[9px] font-black tracking-widest uppercase mb-1">Holder</p>
                  <p className="text-white font-bold text-sm">SECURE ACCOUNT HOLDER</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[9px] font-black tracking-widest uppercase mb-1">Status</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${bank.is_verified ? 'text-white' : 'text-white/50 animate-pulse'}`}>
                    {bank.is_verified ? 'Verified Active' : 'Under Validation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0a150a]/40 border border-green-900/20 rounded-3xl p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-900/20 flex items-center justify-center">
                  <Wallet size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-green-400 font-black text-sm">UPI ID Linked</p>
                  <p className="text-green-800 text-xs font-medium">{bank.upi_id || 'Not linked'}</p>
                </div>
              </div>
              <button className="text-green-800 group-hover:text-green-400">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Bank Update Form */}
          <div className="space-y-6">
            <div className="bg-[#0a150a]/60 border border-green-900/40 rounded-[2.5rem] p-10 shadow-2xl">
              <h4 className="text-green-300 font-bold mb-8 underline underline-offset-8 decoration-green-900">Update Records</h4>
              <div className="space-y-5">
                <div><input placeholder="A/C Number" value={bank.account_number} onChange={e => setBank({...bank, account_number: e.target.value})} className={inputCls} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="IFSC Code" value={bank.ifsc_code} onChange={e => setBank({...bank, ifsc_code: e.target.value})} className={inputCls} />
                  <input placeholder="Bank Name" value={bank.bank_name} onChange={e => setBank({...bank, bank_name: e.target.value})} className={inputCls} />
                </div>
                <div><input placeholder="Branch Location" value={bank.branch} onChange={e => setBank({...bank, branch: e.target.value})} className={inputCls} /></div>
                <div><input placeholder="UPI ID (e.g. user@bank)" value={bank.upi_id} onChange={e => setBank({...bank, upi_id: e.target.value})} className={inputCls} /></div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full h-16 bg-white text-[#050a05] text-xs font-black uppercase tracking-widest rounded-2xl mt-10 hover:shadow-2xl hover:shadow-white/5 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin mx-auto text-green-900" /> : "SECURE BANK DATA SYNC"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
