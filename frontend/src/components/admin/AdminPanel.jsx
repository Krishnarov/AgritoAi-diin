import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { CheckCircle, XCircle, Clock, Eye, BarChart3, Loader2, AlertTriangle, Users, Map as MapIcon, Search, ShieldCheck, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import api, { API_BASE_URL } from "../../utils/api.js";
import { STATUS } from "../map/FarmerMap.jsx";

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-green-950/20 border border-green-900/30 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all hover:border-green-500/30">
    <div className="flex items-center justify-between mb-2">
      <p className="text-green-700 text-[10px] uppercase font-black tracking-widest">{label}</p>
      {Icon && <Icon size={16} className="text-green-800 opacity-50" />}
    </div>
    <p className="font-black text-3xl" style={{ color }}>{value}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [tab, setTab]               = useState("pending"); // pending|all|stats|kyc|disputes
  const [plots, setPlots]           = useState([]);
  const [kycPending, setKycPending] = useState([]);
  const [disputes, setDisputes]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [selected, setSelected]     = useState(null);   
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mini-map for selected plot
  const miniMapRef  = useRef(null);
  const miniMapInst = useRef(null);

  // ── Load data ─────────────────────────────────────────────────────────
  const loadPending = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/plots/pending");
      setPlots(data.plots);
    } catch { toast.error("Failed to load plots"); }
    finally { setLoading(false); }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/plots");
      setPlots(data.plots);
    } catch { toast.error("Failed to load plots"); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.stats);
    } catch { /* silent */ }
  };

  const loadKyc = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/kyc/pending");
      setKycPending(data.reviews || []);
    } catch { toast.error("Failed to load KYC queue"); }
    finally { setLoading(false); }
  };

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/disputes");
      setDisputes(data.disputes || []);
    } catch { toast.error("Failed to load disputes"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadStats();
    if (tab === "pending") loadPending();
    else if (tab === "all") loadAll();
    else if (tab === "kyc") loadKyc();
    else if (tab === "disputes") loadDisputes();
  }, [tab]);

  // ── Mini-map: render selected plot polygon ─────────────────────────
  useEffect(() => {
    if (!selected || !miniMapRef.current) return;

    // Standard Leaflet React fix: Manually clear the container's internal Leaflet state 
    // to prevent "Map container is being reused" error.
    if (miniMapInst.current) {
        miniMapInst.current.remove();
        miniMapInst.current = null;
    }
    
    // Safety check: sometimes remove() doesn't clear the property from the DOM node
    if (miniMapRef.current._leaflet_id) {
        miniMapRef.current._leaflet_id = null;
    }

    const map = L.map(miniMapRef.current, { zoomControl: true, attributionControl: false });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { 
      maxZoom: 20,
      maxNativeZoom: 18 
    }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 20
    }).addTo(map);

    const poly = L.geoJSON(selected.geometry, {
      style: { color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2, weight: 3 },
    }).addTo(map);

    map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    miniMapInst.current = map;

    return () => { 
        if (map) {
            map.remove();
            if (miniMapInst.current === map) miniMapInst.current = null;
        }
    };
  }, [selected]);

  const handleVerify = async (action) => {
    if (action === "reject" && !rejectReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/plots/${selected._id}/verify`, { action, reason: rejectReason });
      toast.success(`Plot ${action === "approve" ? "approved" : "rejected"} successfully`);
      setSelected(null);
      setRejectReason("");
      tab === "pending" ? loadPending() : loadAll();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setActionLoading(false); }
  };

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

  const filteredPlots = plots.filter(p => 
    p.gataNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.farmer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredKyc = kycPending.filter(r => 
    r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doc_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDisputes = disputes.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.raised_by?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#050a05] text-green-100 font-sans">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <div className="w-85 flex-shrink-0 border-r border-green-900/30 flex flex-col bg-[#0a150a]/40">
        
        {/* Navigation Tabs */}
        <div className="flex p-2 gap-1 bg-[#0a150a]/60">
          {[
            { key: "pending",   icon: <Clock size={14} />,         label: "Plots" },
            { key: "kyc",       icon: <ShieldCheck size={14} />,  label: "KYC" },
            { key: "disputes",  icon: <MessageCircle size={14} />, label: "Dispute" },
            { key: "all",       icon: <Eye size={14} />,           label: "Archive" },
            { key: "stats",     icon: <BarChart3 size={14} />,     label: "Stats" },
          ].map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest
                transition-all ${tab === t.key
                  ? "bg-green-600 text-[#0a150a] shadow-lg shadow-green-900/40"
                  : "text-green-700 hover:bg-green-900/30 hover:text-green-500"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab !== "stats" && (
          <div className="px-4 py-3 border-b border-green-900/20">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-800 transition-colors group-focus-within:text-green-500" size={14} />
              <input 
                type="text" 
                placeholder="Search Gata, District, Farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-green-950/40 border border-green-900/40 rounded-xl pl-9 pr-4 py-2 text-xs 
                         outline-none focus:border-green-600 transition-all placeholder:text-green-900"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-900">
          {tab === "stats" && stats ? (
            <div className="p-4 grid grid-cols-1 gap-4">
              <StatCard label="Total Users"     value={stats.totalUsers}  color="#86efac" icon={Users} />
              <StatCard label="Total Land"      value={stats.totalPlots}  color="#86efac" icon={MapIcon} />
              <StatCard label="Pending Review"  value={stats.pending}     color="#94a3b8" icon={Clock} />
              <StatCard label="Approved/Live"   value={stats.available}   color="#22c55e" icon={CheckCircle} />
              <StatCard label="Booked/Rented"   value={stats.booked}      color="#f97316" icon={Eye} />
              <StatCard label="Rejected"        value={stats.rejected}    color="#ef4444" icon={XCircle} />
            </div>
          ) : (
            <div className="flex flex-col">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={24} className="animate-spin text-green-600" />
                  <p className="text-green-800 text-[10px] font-bold uppercase tracking-widest">Fetching {tab}...</p>
                </div>
              ) : (
                <>
                  {/* Plot List */}
                  {(tab === "pending" || tab === "all") && filteredPlots.map((plot) => (
                    <button key={plot._id}
                      onClick={() => { setSelected({ ...plot, type: 'plot' }); setRejectReason(""); }}
                      className={`w-full text-left px-5 py-4 border-b border-green-900/10
                        transition-all hover:bg-green-900/10 flex flex-col gap-2
                        ${selected?._id === plot._id ? "bg-green-600/10 border-l-4 border-l-green-500" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-green-300 font-black text-sm">Gata {plot.gataNo}</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full"
                          style={{
                            background: (STATUS[plot.status]?.color || "#64748b") + "20",
                            color: STATUS[plot.status]?.color || "#64748b"
                          }}>
                          {STATUS[plot.status]?.label || plot.status}
                        </span>
                      </div>
                      <div className="text-green-700 text-[10px] font-bold">
                        {plot.district} • {plot.area_ha} ha
                      </div>
                    </button>
                  ))}

                  {/* KYC List */}
                  {tab === "kyc" && filteredKyc.map((kyc) => (
                    <button key={kyc._id}
                      onClick={() => { setSelected({ ...kyc, type: kyc.type }); setRejectReason(""); }}
                      className={`w-full text-left px-5 py-4 border-b border-green-900/10
                        transition-all hover:bg-green-900/10 flex flex-col gap-2
                        ${selected?._id === kyc._id ? "bg-green-600/10 border-l-4 border-l-green-500" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-green-200 font-black text-sm italic">{kyc.user?.name}</span>
                        <div className="flex gap-2">
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-green-950/40 text-green-500 rounded-full border border-green-500/20">{kyc.type}</span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full border border-yellow-500/20">{kyc.doc_type}</span>
                        </div>
                      </div>
                      <div className="text-green-800 text-[10px] font-bold uppercase tracking-tight">
                        Submitted {new Date(kyc.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                  ))}

                   {/* Disputes List */}
                   {tab === "disputes" && filteredDisputes.map((d) => (
                    <button key={d._id}
                      onClick={() => { setSelected({ ...d, type: 'dispute' }); setRejectReason(""); }}
                      className={`w-full text-left px-5 py-4 border-b border-green-900/10
                        transition-all hover:bg-green-900/10 flex flex-col gap-2
                        ${selected?._id === d._id ? "bg-green-600/10 border-l-4 border-l-green-500" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-red-400 font-black text-sm truncate pr-4">{d.title}</span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-[#050a05] to-[#0a150a]">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-3xl opacity-10 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-3xl bg-green-950/40 border border-green-900/30 flex items-center justify-center shadow-2xl">
                <MapIcon size={48} className="text-green-800" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-green-300 font-black text-lg">Admin Inspection Terminal</p>
              <p className="text-green-700 text-sm mt-1">Select a plot from the sidebar to begin verification</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Premium Header */}
            <header className="px-8 py-6 border-b border-green-900/20 bg-[#0a150a]/40 backdrop-blur-md flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-green-100 tracking-tight">
                    {selected.type === 'plot' && `Plot: Gata ${selected.gataNo}`}
                    {selected.type === 'farmer' && `KYC: ${selected.user?.name}`}
                    {selected.type === 'renter' && `ID: ${selected.user?.name}`}
                    {selected.type === 'dispute' && `Dispute: ${selected.title}`}
                  </h2>
                  <span className="text-[10px] font-black bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-widest">
                    {selected.type?.toUpperCase()} Review
                  </span>
                </div>
                <p className="text-green-700 text-xs mt-1 font-medium italic">
                  {selected.type === 'plot' && `${selected.district}, ${selected.state} • Submitted by ${selected.farmer?.name}`}
                  {(selected.type === 'farmer' || selected.type === 'renter') && `Reviewing ${selected.doc_type} • Joined ${new Date(selected.createdAt).toLocaleDateString()}`}
                  {selected.type === 'dispute' && `Involving ${selected.raised_by?.name} vs ${selected.against_user?.name}`}
                </p>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-xl bg-green-950/40 flex items-center justify-center text-green-600 hover:text-red-400 hover:bg-red-500/10 transition-all border border-green-900/30"
              >✕</button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col xl:flex-row gap-8 scrollbar-thin scrollbar-thumb-green-900">
              
              {/* Plot Specific View */}
              {selected.type === 'plot' && (
                <>
                  <div className="w-full xl:w-2/3 space-y-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">Satellite Inspection</p>
                        <span className="text-green-800 text-[10px] font-bold">Polygon Layer Active</span>
                      </div>
                      <div ref={miniMapRef}
                        className="w-full h-96 rounded-3xl overflow-hidden border border-green-900/40 shadow-2xl z-10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#0a150a]/40 border border-green-900/20 rounded-2xl p-6">
                         <p className="text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Eye size={12} /> Claimed Details
                         </p>
                         <div className="space-y-4">
                            {[
                              ["Gata Number",   selected.gataNo],
                              ["Claimed Area",  selected.area_ha_claimed ? `${selected.area_ha_claimed} ha` : "—"],
                              ["Price/Season",  selected.pricePerSeason ? `₹${selected.pricePerSeason}` : "Not listed"],
                              ["District/Village", `${selected.district} / ${selected.village || '—'}`],
                            ].map(([label, val]) => (
                              <div key={label} className="flex flex-col border-b border-green-900/10 pb-3">
                                <span className="text-green-800 text-[9px] font-black uppercase">{label}</span>
                                <span className="text-green-200 text-sm font-bold mt-0.5">{val}</span>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-[#0a150a]/40 border border-green-900/20 rounded-2xl p-6">
                         <p className="text-green-600 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                           <BarChart3 size={12} /> Server Statistics
                         </p>
                         <div className="space-y-4">
                            {[
                              ["Computed Area",   `${selected.area_ha} ha`],
                              ["Submission Time", new Date(selected.createdAt).toLocaleString()],
                            ].map(([label, val]) => (
                              <div key={label} className="flex flex-col border-b border-green-900/10 pb-3">
                                <span className="text-green-800 text-[9px] font-black uppercase">{label}</span>
                                <span className="text-green-200 text-sm font-bold mt-0.5">{val}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    {(selected.status === "pending") && (
                      <div className="bg-green-600/5 border border-green-500/20 rounded-3xl p-6 space-y-4 shadow-2xl">
                        <textarea
                          placeholder="Rejection reason or notes..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="w-full h-24 bg-black/40 border border-green-900/40 rounded-2xl px-4 py-3 text-sm text-green-100 outline-none focus:border-green-500 transition-all placeholder:text-green-900 resize-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleVerify("reject")} className="bg-red-900/20 border border-red-900/30 text-red-500 h-14 rounded-xl text-[10px] uppercase font-black tracking-widest">Reject</button>
                          <button onClick={() => handleVerify("approve")} className="bg-green-600 text-black h-14 rounded-xl text-[10px] uppercase font-black tracking-widest">Approve</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

               {/* KYC Review Details */}
              {(selected.type === 'farmer' || selected.type === 'renter') && (
                <div className="w-full flex flex-col lg:flex-row gap-10">
                   <div className="flex-1 space-y-6">
                      <div className="bg-green-950/20 border border-green-900/30 rounded-[3rem] p-10 h-[550px] flex items-center justify-center overflow-hidden relative">
                         <img src={selected.doc_url} alt="Identity Document" className="w-full h-full object-contain" />
                         <div className="absolute top-8 left-8 bg-black/60 px-4 py-2 rounded-full border border-green-500/20">
                            <p className="text-[10px] font-black text-green-500 tracking-widest uppercase">{selected.doc_type} ORIGINAL SCAN</p>
                         </div>
                      </div>
                   </div>
                   <div className="w-full lg:w-96 space-y-8">
                      <div className="bg-[#0a150a]/60 border border-green-900/40 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                         <div className="text-center">
                            <h4 className="text-green-300 font-black text-2xl mb-1">{selected.user?.name}</h4>
                            <p className="text-green-700 text-[10px] font-black uppercase tracking-widest">Awaiting Verification</p>
                         </div>
                         
                         <textarea
                            placeholder="Reason for rejection (mandatory if rejecting)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full h-32 bg-black/40 border border-green-900/40 rounded-3xl px-6 py-4 text-sm text-green-100 outline-none focus:border-green-500 transition-all placeholder:text-green-900 resize-none font-medium"
                         />
                         <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleKycReview("rejected")} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 h-16 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all">Reject</button>
                            <button onClick={() => handleKycReview("approved")} className="bg-green-600 hover:bg-green-500 text-black h-16 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-xl shadow-green-900/20">Verify</button>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* Dispute Resolution View */}
              {selected.type === 'dispute' && (
                <div className="w-full flex flex-col lg:flex-row gap-10">
                   <div className="flex-1 bg-[#0a150a]/40 border border-green-900/20 rounded-[3rem] p-10 space-y-10">
                      <div>
                         <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Conflict Log</p>
                         <h3 className="text-4xl font-black text-white leading-tight">{selected.title}</h3>
                         <p className="mt-8 text-green-300 text-xl font-medium leading-relaxed italic border-l-4 border-green-500/20 pl-8">"{selected.description}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                         <div className="bg-green-950/20 rounded-3xl p-8 border border-green-900/10">
                            <p className="text-green-800 text-[10px] font-black uppercase tracking-widest mb-4">Raised By</p>
                            <h4 className="text-green-100 font-bold text-lg">{selected.raised_by?.name}</h4>
                         </div>
                         <div className="bg-red-950/20 rounded-3xl p-8 border border-red-900/10">
                            <p className="text-red-900 text-[10px] font-black uppercase tracking-widest mb-4">Against</p>
                            <h4 className="text-red-400 font-bold text-lg">{selected.against_user?.name}</h4>
                         </div>
                      </div>
                   </div>

                   <div className="w-full lg:w-96 flex flex-col gap-6">
                      <div className="bg-[#0a150a]/80 border border-green-500/20 rounded-[2.5rem] p-10 shadow-2xl space-y-8 flex flex-col">
                         <h4 className="text-green-500 font-black text-[10px] uppercase tracking-[0.3em] text-center">Judicial Terminal</h4>
                         <textarea
                            placeholder="Decision summary..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full h-48 bg-black/60 border border-green-900/40 rounded-3xl px-6 py-6 text-green-100 text-sm outline-none focus:border-green-500 transition-all placeholder:text-green-900 resize-none font-medium leading-relaxed"
                         />
                         <div className="space-y-3">
                            <button onClick={() => handleResolveDispute("farmer_wins")} className="w-full h-14 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">Farmer Wins</button>
                            <button onClick={() => handleResolveDispute("renter_wins")} className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">Renter Wins</button>
                            <button onClick={() => handleResolveDispute("mutual_settlement")} className="w-full h-14 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all">Mutual Settlement</button>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}