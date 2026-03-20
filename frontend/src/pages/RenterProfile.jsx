import { useEffect, useState } from "react";
import { User, Briefcase, Target, Wallet, Shield, Info } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

export default function RenterProfile() {
  const [profile, setProfile] = useState({
    aadhaar_number: "",
    experience_years: 0,
    farming_type: "tenant_farmer",
    preferred_districts: [],
    min_area_needed: 0,
    max_area_needed: 0,
    max_budget_per_season: 0,
    needs_irrigation: false,
    about: "",
    is_verified: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/renter/profile");
      if (data.profile) setProfile(data.profile);
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/renter/profile", profile);
      toast.success("Profile updated successfully");
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-40">
      <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-green-950 pb-10">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Professional Persona</h1>
          <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Credentials • Operational Capacity • Risk Profile</p>
        </div>
        {profile.is_verified ? (
          <div className="bg-green-600/10 border border-green-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-green-400 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-500/5">
            <Shield size={18} /> Verified operator
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-yellow-500 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-yellow-500/5">
            <Info size={18} /> Credentials Pending
          </div>
        )}
      </header>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="bg-green-950/20 border border-green-900/10 rounded-[3rem] p-10 space-y-10 shadow-2xl backdrop-blur-md">
          <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
            <Briefcase size={14} /> Domain Expertise
          </h2>
          <div className="space-y-8">
            <div>
              <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Occupational Role</label>
              <select 
                value={profile.farming_type}
                onChange={(e) => setProfile({ ...profile, farming_type: e.target.value })}
                className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-xs text-green-100 outline-none focus:border-green-500 transition-all font-bold tracking-wide uppercase"
              >
                <option value="owner_farmer">Owner Farmer</option>
                <option value="tenant_farmer">Tenant Farmer</option>
                <option value="agricultural_labourer">Agricultural Labourer</option>
                <option value="agri_entrepreneur">Agri-Entrepreneur</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Operational Tenure (Years)</label>
              <input type="number" value={profile.experience_years} onChange={(e) => setProfile({ ...profile, experience_years: e.target.value })}
                className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-sm text-green-100 outline-none focus:border-green-500 transition-all font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">ID Reference (Aadhaar Last 4)</label>
              <input type="text" maxLength={4} placeholder="XXXX" value={profile.aadhaar_number} onChange={(e) => setProfile({ ...profile, aadhaar_number: e.target.value })}
                className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-sm text-green-100 outline-none focus:border-green-500 transition-all font-bold tracking-widest" />
            </div>
          </div>
        </section>

        <section className="bg-green-950/20 border border-green-900/10 rounded-[3rem] p-10 space-y-10 shadow-2xl backdrop-blur-md">
          <h2 className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
            <Target size={14} /> Scale Requirements
          </h2>
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Min Area (Ha)</label>
                <input type="number" step="0.1" value={profile.min_area_needed} onChange={(e) => setProfile({ ...profile, min_area_needed: e.target.value })}
                  className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-xs text-green-100 outline-none focus:border-green-500 transition-all font-black" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Max Area (Ha)</label>
                <input type="number" step="0.1" value={profile.max_area_needed} onChange={(e) => setProfile({ ...profile, max_area_needed: e.target.value })}
                  className="w-full bg-black/40 border border-green-900/40 rounded-2xl px-6 py-4 text-xs text-green-100 outline-none focus:border-green-500 transition-all font-black" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-green-800 mb-3 tracking-widest">Budget Capacity (₹/Season)</label>
              <div className="relative">
                 <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-green-900" size={16} />
                 <input type="number" value={profile.max_budget_per_season} onChange={(e) => setProfile({ ...profile, max_budget_per_season: e.target.value })}
                   className="w-full bg-black/40 border border-green-900/40 rounded-2xl pl-16 pr-6 py-4 text-sm font-black text-green-100 outline-none focus:border-green-500 transition-all" />
              </div>
            </div>
            <div className="flex items-center gap-6 bg-black/40 border border-green-900/40 rounded-[2rem] p-6 group cursor-pointer" onClick={() => setProfile({...profile, needs_irrigation: !profile.needs_irrigation})}>
               <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${profile.needs_irrigation ? 'bg-green-600 border-green-500 text-black shadow-lg shadow-green-500/20' : 'border-green-900/40'}`}>
                  {profile.needs_irrigation && <Shield size={16} />}
               </div>
               <label className="text-xs font-black uppercase text-green-600 tracking-widest cursor-pointer">Irrigation Priority</label>
            </div>
          </div>
        </section>

        <section className="md:col-span-2 bg-green-950/20 border border-green-900/10 rounded-[3.5rem] p-12 space-y-10 shadow-2xl backdrop-blur-md">
           <label className="block text-[10px] font-black uppercase text-green-800 tracking-[0.4em] mb-4">Tactical Introduction (Visible to Stakeholders)</label>
           <textarea 
             placeholder="Outline your cultivation methodologies and reliability metrics..."
             value={profile.about}
             onChange={(e) => setProfile({ ...profile, about: e.target.value })}
             className="w-full h-48 bg-black/40 border border-green-900/40 rounded-[2.5rem] px-10 py-8 text-green-100 outline-none focus:border-green-500 transition-all font-medium resize-none leading-relaxed text-sm shadow-inner"
           />
           <div className="flex justify-end">
             <button type="submit" disabled={saving}
               className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-black font-black text-[10px] uppercase tracking-[0.3em] px-16 py-6 rounded-2xl transition-all shadow-2xl shadow-green-600/10 active:scale-95 flex items-center gap-4"
             >
               {saving && <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />}
               Sync Profile Data
             </button>
           </div>
        </section>
      </form>
    </div>
  );
}
