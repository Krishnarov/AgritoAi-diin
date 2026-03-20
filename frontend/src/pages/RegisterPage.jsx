import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";

const STATES = [
  "Maharashtra", "Karnataka", "Uttar Pradesh", "Madhya Pradesh",
  "Rajasthan", "Punjab", "Haryana", "Gujarat", "Andhra Pradesh", "Telangana", "Bihar"
];

// Moving component OUTSIDE to prevent re-renders on every keystroke
const Field = ({ label, children }) => (
  <div>
    <label className="text-green-700 text-xs uppercase tracking-wider block mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-green-950/50 border border-green-800/50 rounded-xl px-4 py-2.5 text-green-100 text-sm placeholder-green-800 outline-none focus:border-green-500 transition-colors";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    role: "farmer", state: "Maharashtra", district: "",
  });
  
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password min 6 characters");
    
    const res = await register(form);
    if (res.success) {
      toast.success("Account created!");
      navigate(form.role === "renter" ? "/renter/dashboard" : "/farmer/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a150a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
            <span className="text-[#0a150a] font-black text-xl">A</span>
          </div>
          <h1 className="text-green-300 font-bold text-xl tracking-tight">Create Account</h1>
          <p className="text-green-700 text-sm mt-1">Join AgritoAI — India's Land Rental Platform</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-green-950/30 border border-green-900/40 rounded-3xl p-8 space-y-5 shadow-2xl backdrop-blur-sm">

          {/* Role selector */}
          <div>
            <label className="text-green-700 text-[10px] font-black uppercase tracking-[0.2em] block mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {["farmer", "renter"].map((r) => (
                <button key={r} type="button" onClick={() => set("role", r)}
                  className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all
                    ${form.role === r
                      ? "bg-green-500 text-[#0a150a] shadow-lg shadow-green-500/20"
                      : "bg-green-950/50 border border-green-800/30 text-green-700 hover:border-green-600"}`}>
                  {r === "farmer" ? "🌾 Farmer" : "🏡 Renter"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Full Name">
            <input type="text" required value={form.name} autoComplete="name"
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ramesh Patil" className={inputCls} />
          </Field>

          <Field label="Email Address">
            <input type="email" required value={form.email} autoComplete="email"
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com" className={inputCls} />
          </Field>

          <Field label="Phone Number">
            <input type="tel" required value={form.phone} autoComplete="tel"
              onChange={(e) => set("phone", e.target.value)}
              placeholder="9876543210" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="State">
              <select value={form.state} onChange={(e) => set("state", e.target.value)}
                autoComplete="address-level1" className={inputCls}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="District">
              <input type="text" value={form.district} autoComplete="address-level2"
                onChange={(e) => set("district", e.target.value)}
                placeholder="District" className={inputCls} />
            </Field>
          </div>

          <Field label="Security Password">
            <input type="password" required value={form.password} autoComplete="new-password"
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min 6 characters" className={inputCls} />
          </Field>

          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50
                       text-[#0a150a] font-black py-4 rounded-2xl transition-all
                       flex items-center justify-center gap-3 mt-2 shadow-xl shadow-green-500/10 active:scale-[0.98]">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : "Join AgritoAI"}
          </button>
        </form>

        <p className="text-center text-green-800 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-black decoration-2 underline-offset-4 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}