import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success("Welcome back!");
      if (res.role === "admin")  navigate("/admin");
      else if (res.role === "renter") navigate("/renter/dashboard");
      else navigate("/farmer/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  const inputCls = "w-full bg-green-950/50 border border-green-800/50 rounded-xl px-4 py-3 text-green-100 text-sm placeholder-green-800 outline-none focus:border-green-500 transition-colors";

  return (
    <div className="min-h-screen bg-[#0a150a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
            <span className="text-[#0a150a] font-black text-xl">A</span>
          </div>
          <h1 className="text-green-300 font-bold text-xl tracking-tight">Welcome Back</h1>
          <p className="text-green-700 text-sm mt-1">Sign in to AgritoAI Control Terminal</p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-green-950/30 border border-green-900/40 rounded-[2rem] p-8 space-y-5 shadow-2xl backdrop-blur-sm">
          <div>
            <label className="text-green-700 text-[10px] font-black uppercase tracking-[0.2em] block mb-1.5 pl-1">Email Terminal</label>
            <input type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="farmer@agrito.com"
              className={inputCls} />
          </div>

          <div>
            <label className="text-green-700 text-[10px] font-black uppercase tracking-[0.2em] block mb-1.5 pl-1">Access Key</label>
            <div className="relative">
              <input type={show ? "text" : "password"} required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={inputCls + " pr-11"} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-700 hover:text-green-400 p-2">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50
                       text-[#0a150a] font-black py-4 rounded-2xl transition-all
                       flex items-center justify-center gap-2 mt-2 shadow-xl shadow-green-500/10 active:scale-[0.98]">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : "Initialize Session"}
          </button>
        </form>

        <p className="text-center text-green-800 text-sm mt-6">
          No access credentials?{" "}
          <Link to="/register" className="text-green-400 hover:text-green-300 font-black decoration-2 underline-offset-4 hover:underline">
            Register Agent
          </Link>
        </p>

        {/* Demo credentials hint */}
        <div className="mt-8 bg-green-950/20 border border-green-900/30 rounded-2xl p-4 text-[10px] text-green-800 backdrop-blur-md">
          <p className="font-black text-green-600 mb-1 tracking-widest uppercase">System Gateways:</p>
          <div className="flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity">
            <span>Admin: admin@agritoak.com / admin123</span>
          </div>
          <div className="flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity mt-1">
            <span>Farmer: farmer@test.com / farmer123</span>
          </div>
          <div className="flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity mt-1">
            <span>renter: r@gmail.com / 1234567890</span>
          </div>
        </div>
      </div>
    </div>
  );
}