import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock, Trash2, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import api from "../utils/api.js";
import toast from "react-hot-toast";

const ICON_MAP = {
  plot_verified:   { icon: <CheckCircle size={20} className="text-green-500" />, bg: "bg-green-500/10" },
  plot_rejected:   { icon: <XCircle size={20} className="text-red-500" />,     bg: "bg-red-500/10" },
  new_interest:    { icon: <Bell size={20} className="text-blue-500" />,      bg: "bg-blue-500/10" },
  agreement_signed: { icon: <ShieldCheck size={20} className="text-purple-500" />, bg: "bg-purple-500/10" },
  payment_received: { icon: <CreditCard size={20} className="text-yellow-500" />, bg: "bg-yellow-500/10" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success("All caught up!");
    } catch (err) {}
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex items-end justify-between border-b border-green-950 pb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">System Alerts</h1>
            <p className="text-green-800 text-[10px] uppercase font-black tracking-[0.3em] mt-2">Latest updates from the AgritoAI ecosystem</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button onClick={markAllRead} className="text-[10px] font-black uppercase text-green-500 border border-green-500/20 px-8 py-3 rounded-2xl hover:bg-green-500 hover:text-black transition-all active:scale-95 shadow-lg shadow-green-500/5">
                Clear All New
            </button>
          )}
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-40 animate-pulse">
           <Loader2 size={40} className="text-green-600 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-32 text-center bg-green-950/5 border border-dashed border-green-900/10 rounded-[4rem] flex flex-col items-center justify-center">
            <Bell size={60} className="text-green-900 mb-6 opacity-30" />
            <p className="text-green-800 text-xs font-black uppercase tracking-widest">Inbox is empty</p>
            <p className="text-green-900 text-[10px] mt-2 max-w-xs font-medium uppercase tracking-tight">You're all set! Check back later for system pulses and status updates.</p>
        </div>
      ) : (
        <div className="space-y-6">
            {notifications.map((n) => (
              <div 
                  key={n._id} 
                  onMouseEnter={() => !n.is_read && markRead(n._id)}
                  className={`group relative flex items-start gap-8 p-10 rounded-[3rem] border transition-all ${n.is_read ? 'bg-[#0a150a]/20 border-green-900/5 opacity-50' : 'bg-green-600/5 border-green-500/10 shadow-xl shadow-green-500/5'}`}
              >
                  {!n.is_read && <div className="absolute top-10 right-10 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e]" />}
                  
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-inner ${ICON_MAP[n.type]?.bg || 'bg-green-950/40'}`}>
                    {ICON_MAP[n.type]?.icon || <Bell size={24} className="text-green-700" />}
                  </div>

                  <div className="flex-1 space-y-2">
                    <h4 className="font-black text-xl italic text-white uppercase tracking-tight leading-tight">{n.title}</h4>
                    <p className="text-green-700 text-sm leading-relaxed font-medium">{n.message}</p>
                    <div className="flex items-center gap-6 pt-4 border-t border-green-900/10">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase text-green-900">
                          <Clock size={12} /> {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </div>

                  <button onClick={() => deleteNotif(n._id)} className="w-12 h-12 rounded-2xl bg-red-500/5 hover:bg-red-500/20 text-red-900 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl active:scale-90">
                    <Trash2 size={18} />
                  </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
