import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  Clock, Eye, Map as MapIcon, Search, CheckCircle, XCircle,
  User, FileText, ShieldCheck, AlertTriangle, ChevronLeft,
  Loader2, ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api.js";

// ── Helpers ────────────────────────────────────────────────────────────────
const statusColor = {
  pending:   "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  booked:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  rejected:  "bg-red-500/10 text-red-400 border-red-500/20",
};

const scoreColor = (s) =>
  s >= 70 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400";

const scoreBg = (s) =>
  s >= 70 ? "bg-green-500" : s >= 50 ? "bg-yellow-500" : "bg-red-500";

const Row = ({ label, value, icon, warn }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-green-900/10 last:border-0">
    <span className="text-base w-5 shrink-0">{icon}</span>
    <span className="text-green-700 text-xs font-bold w-36 shrink-0">{label}</span>
    <span className={`text-xs font-bold flex-1 ${warn ? "text-yellow-400" : "text-green-100"}`}>{value || "—"}</span>
  </div>
);

const Check = ({ ok, label }) => (
  <div className="flex items-center gap-2.5 py-1.5">
    <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${ok ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
      {ok ? "✓" : "✗"}
    </div>
    <span className="text-green-300 text-xs">{label}</span>
  </div>
);

// ── Mini Map ───────────────────────────────────────────────────────────────
function MiniMap({ geometry }) {
  const ref = useRef(null);
  const inst = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ref.current || !geometry) return;
    // Prevent double-init in React strict mode
    if (initialized.current) return;
    initialized.current = true;

    // Clean up any stale leaflet state on the DOM node
    if (ref.current._leaflet_id) {
      delete ref.current._leaflet_id;
    }

    const map = L.map(ref.current, { zoomControl: true, attributionControl: false });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }).addTo(map);
    const poly = L.geoJSON(geometry, {
      style: { color: "#facc15", fillColor: "#facc15", fillOpacity: 0.2, weight: 3 },
    }).addTo(map);
    map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    inst.current = map;

    return () => {
      initialized.current = false;
      if (inst.current) {
        inst.current.remove();
        inst.current = null;
      }
    };
  }, [geometry]);

  return <div ref={ref} className="w-full h-full" />;
}

// ══════════════════════════════════════════════════════════════════════════
// DETAIL PAGE
// ══════════════════════════════════════════════════════════════════════════
function PlotDetail({ plotId, onBack, onAction }) {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing]       = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/plots/${plotId}`)
      .then(({ data: d }) => setData(d))
      .catch(() => toast.error("Failed to load plot details"))
      .finally(() => setLoading(false));
  }, [plotId]);

  const handleAction = async (action) => {
    if (action === "reject" && !rejectReason.trim())
      return toast.error("Rejection reason required");
    setActing(true);
    try {
      await api.patch(`/admin/plots/${plotId}/verify`, { action, reason: rejectReason });
      toast.success(`Plot ${action === "approve" ? "approved ✅" : "rejected ❌"}`);
      onAction();
    } catch { toast.error("Action failed"); }
    finally { setActing(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 size={32} className="text-green-700 animate-spin" />
    </div>
  );

  if (!data) return null;

  const { plot, farmerIntel, verification } = data;
  const { score, hasOverlap, areaOk, kycDone } = verification;
  const { trustScore, accountAgeMonths, approvedCount, rejectedCount, kycStatus } = farmerIntel;
  const isPending = plot.status === "pending";

  // area diff
  const areaDiff = plot.area_ha_claimed
    ? Math.abs(plot.area_ha - plot.area_ha_claimed).toFixed(4)
    : null;
  const areaPct = plot.area_ha_claimed
    ? ((Math.abs(plot.area_ha - plot.area_ha_claimed) / plot.area_ha_claimed) * 100).toFixed(1)
    : null;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#060e06]/95 backdrop-blur-md border-b border-green-900/20 px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-green-600 hover:text-green-400 text-xs font-black uppercase transition-all">
          <ChevronLeft size={16} /> Back to List
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusColor[plot.status]}`}>
            {plot.status}
          </span>
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full bg-green-900/20 ${scoreColor(score)}`}>
            Score: {score}/100
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">

        {/* ── SECTION A — Farmer Info ── */}
        <section className="bg-green-950/20 border border-green-900/20 rounded-3xl p-8">
          <h2 className="text-white font-black text-base uppercase tracking-widest mb-6 flex items-center gap-3">
            <User size={18} className="text-green-500" /> Section A — Farmer Ki Jankari
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div>
              <Row icon="✅" label="Name"         value={plot.farmer?.name} />
              <Row icon="✅" label="Phone"        value={plot.farmer?.phone} />
              <Row icon={kycDone ? "✅" : "⚠️"}  label="KYC Status"    value={kycStatus === "verified" ? "Aadhaar Verified" : kycStatus === "approved" ? "Approved" : kycStatus === "pending" ? "Under Review" : "Not Submitted"} warn={!kycDone} />
              <Row icon="✅" label="Account Age"  value={`${accountAgeMonths} month${accountAgeMonths !== 1 ? "s" : ""} old`} />
            </div>
            <div>
              <Row icon="✅" label="Past Plots"   value={`${approvedCount} approved, ${rejectedCount} rejected`} />
              <Row icon="⚠️" label="Flag History" value="None" />
              <div className="flex items-start gap-3 py-2.5">
                <span className="text-base w-5 shrink-0">📊</span>
                <span className="text-green-700 text-xs font-bold w-36 shrink-0">Trust Score</span>
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1 h-2 bg-green-950 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${scoreBg(trustScore)}`} style={{ width: `${trustScore}%` }} />
                  </div>
                  <span className={`text-xs font-black ${scoreColor(trustScore)}`}>{trustScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION B — Plot Data ── */}
        <section className="bg-green-950/20 border border-green-900/20 rounded-3xl p-8">
          <h2 className="text-white font-black text-base uppercase tracking-widest mb-6 flex items-center gap-3">
            <MapIcon size={18} className="text-green-500" /> Section B — Plot Ka Submitted Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            <div>
              <Row icon="📋" label="Gata Number"    value={plot.gata_number || plot.gataNo} />
              <Row icon="📋" label="Survey No."     value={plot.survey_number} />
              <Row icon="📋" label="Khata No."      value={plot.khata_number} />
              <Row icon="📋" label="Khatauni No."   value={plot.khatauni_number} />
              <Row icon="📍" label="Village"        value={plot.village} />
              <Row icon="📍" label="Tehsil"         value={plot.tehsil} />
              <Row icon="📍" label="District"       value={plot.district} />
              <Row icon="📍" label="State"          value={plot.state} />
            </div>
            <div>
              <Row icon="📐" label="Area (submitted)" value={plot.area_ha_claimed ? `${plot.area_ha_claimed} ha` : "—"} />
              <Row icon="🗺️" label="Area (map/turf)"  value={`${plot.area_ha} ha`} />
              {areaDiff && (
                <Row
                  icon={areaOk ? "✅" : "⚠️"}
                  label="Difference"
                  value={`${areaDiff} ha = ${areaPct}% ${areaOk ? "✅ within ±10%" : "⚠️ exceeds ±10%"}`}
                  warn={!areaOk}
                />
              )}
              <Row icon="🌱" label="Land Type"      value={plot.land_type} />
              <Row icon="🪨" label="Soil Type"      value={plot.soil_type} />
              <Row icon="💧" label="Irrigation"     value={plot.irrigation} />
              <Row icon="🌾" label="Last Crop"      value={plot.last_crop_grown} />
              <Row icon="💰" label="Price/Season"   value={plot.price_per_season ? `₹${plot.price_per_season.toLocaleString()}` : null} />
              <Row icon="💰" label="Price/Year"     value={plot.price_per_year ? `₹${plot.price_per_year.toLocaleString()}` : null} />
              <Row icon="📅" label="Available From" value={plot.available_from ? new Date(plot.available_from).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : null} />
              <Row icon="🤝" label="Negotiable"     value={plot.price_negotiable ? "Yes" : "No"} />
            </div>
          </div>
        </section>

        {/* ── SECTION C — Documents ── */}
        <section className="bg-green-950/20 border border-green-900/20 rounded-3xl p-8">
          <h2 className="text-white font-black text-base uppercase tracking-widest mb-6 flex items-center gap-3">
            <FileText size={18} className="text-green-500" /> Section C — Documents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Khasara Doc */}
            <div className="bg-green-950/30 border border-green-900/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-green-900/20">
                <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">Khasara / 7-12 Document</p>
              </div>
              {plot.khasaraDoc ? (
                plot.khasaraDoc.match(/\.(jpg|jpeg|png)$/i) ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${plot.khasaraDoc}`}
                    alt="Khasara"
                    className="w-full object-contain max-h-72 bg-black/40"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <FileText size={40} className="text-green-700" />
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${plot.khasaraDoc}`}
                      target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-green-400 text-xs font-black uppercase hover:text-green-300 transition-all"
                    >
                      <ExternalLink size={14} /> Open PDF Document
                    </a>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center py-12 text-green-900 text-xs font-bold">No document uploaded</div>
              )}
            </div>

            {/* Map Preview */}
            <div className="bg-green-950/30 border border-green-900/20 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-green-900/20">
                <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">Boundary Map (Satellite)</p>
              </div>
              <div className="h-72">
                {plot.geometry ? <MiniMap geometry={plot.geometry} /> : (
                  <div className="flex items-center justify-center h-full text-green-900 text-xs font-bold">No geometry</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION D — Auto Score ── */}
        <section className="bg-green-950/20 border border-green-900/20 rounded-3xl p-8">
          <h2 className="text-white font-black text-base uppercase tracking-widest mb-6 flex items-center gap-3">
            <ShieldCheck size={18} className="text-green-500" /> Section D — Auto Verification Score
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <div className="flex justify-between items-center py-2 border-b border-green-900/10">
                <span className="text-green-300 text-xs">Gata number filled</span>
                <span className={`text-xs font-black ${(plot.gata_number || plot.gataNo) ? "text-green-400" : "text-red-400"}`}>
                  {(plot.gata_number || plot.gataNo) ? "+40 pts ✅" : "+0 pts ✗"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-900/10">
                <span className="text-green-300 text-xs">Area within ±10%</span>
                <span className={`text-xs font-black ${areaOk ? "text-green-400" : "text-red-400"}`}>
                  {areaOk ? "+30 pts ✅" : "+0 pts ✗"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-green-900/10">
                <span className="text-green-300 text-xs">No boundary overlap</span>
                <span className={`text-xs font-black ${!hasOverlap ? "text-green-400" : "text-red-400"}`}>
                  {!hasOverlap ? "+20 pts ✅" : "+0 pts ⚠️ OVERLAP"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-green-300 text-xs">KYC completed</span>
                <span className={`text-xs font-black ${kycDone ? "text-green-400" : "text-red-400"}`}>
                  {kycDone ? "+10 pts ✅" : "+0 pts ✗"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-green-700/30">
                <span className="text-white text-sm font-black uppercase">Total Score</span>
                <span className={`text-xl font-black ${scoreColor(score)}`}>{score}/100</span>
              </div>
              <div className="w-full h-2 bg-green-950 rounded-full overflow-hidden mt-2">
                <div className={`h-full rounded-full transition-all ${scoreBg(score)}`} style={{ width: `${score}%` }} />
              </div>
              <p className={`text-[10px] font-black uppercase mt-2 ${scoreColor(score)}`}>
                {score >= 70 ? "✅ Admin can approve" : score >= 50 ? "⚠️ Review carefully" : "❌ Reject recommended"}
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-green-950/30 border border-green-900/20 rounded-2xl p-6 space-y-1">
              <p className="text-green-600 text-[10px] font-black uppercase tracking-widest mb-4">Admin Checklist</p>
              <p className="text-green-700 text-[9px] font-black uppercase tracking-widest mb-1">Farmer</p>
              <Check ok={kycDone}           label="KYC verified hai?" />
              <Check ok={rejectedCount === 0} label="Pehle koi fraud nahi kiya?" />
              <Check ok={accountAgeMonths >= 1} label="Account genuine lagta hai?" />
              <p className="text-green-700 text-[9px] font-black uppercase tracking-widest mt-3 mb-1">Document</p>
              <Check ok={!!(plot.gata_number || plot.gataNo)} label="Gata number filled hai?" />
              <Check ok={areaOk}            label="Area ±10% ke andar hai?" />
              <Check ok={!!plot.khasaraDoc} label="Khasara document uploaded hai?" />
              <p className="text-green-700 text-[9px] font-black uppercase tracking-widest mt-3 mb-1">Map</p>
              <Check ok={!!plot.geometry}   label="Boundary drawn hai?" />
              <Check ok={!hasOverlap}       label="Koi existing plot se overlap nahi?" />
            </div>
          </div>
        </section>

        {/* ── DECISION ── */}
        {isPending && (
          <section className="bg-[#0a150a] border border-green-900/30 rounded-3xl p-8 space-y-6">
            <h2 className="text-white font-black text-base uppercase tracking-widest flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-500" /> Decision
            </h2>
            <div>
              <label className="text-green-700 text-[10px] font-black uppercase tracking-widest mb-2 block">
                Rejection Reason (required if rejecting)
              </label>
              <textarea
                placeholder="Explain why this plot is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-green-950/40 border border-green-900/30 rounded-2xl px-5 py-4 text-sm text-green-100 outline-none focus:border-green-500 resize-none placeholder:text-green-900"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleAction("approve")}
                disabled={acting}
                className="bg-green-600 hover:bg-green-500 text-black h-14 rounded-2xl text-xs font-black uppercase active:scale-95 transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {acting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Approve Plot
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={acting}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 h-14 rounded-2xl text-xs font-black uppercase active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {acting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Reject Plot
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ══════════════════════════════════════════════════════════════════════════
function PlotList({ onSelect }) {
  const [tab, setTab]         = useState("pending");
  const [plots, setPlots]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch]   = useState("");

  const load = async (t) => {
    setLoading(true);
    try {
      let endpoint;
      if (t === "pending")  endpoint = "/admin/plots/pending";
      else if (t === "history")  endpoint = "/admin/plots?status=available";
      else endpoint = "/admin/plots?status=rejected";

      const { data } = await api.get(endpoint);
      setPlots(data.plots);
    } catch { toast.error("Failed to load plots"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const filtered = plots.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.gata_number || p.gataNo || "").toLowerCase().includes(q) ||
      (p.district || "").toLowerCase().includes(q) ||
      (p.village || "").toLowerCase().includes(q) ||
      (p.farmer?.name || "").toLowerCase().includes(q)
    );
  });

  const tabs = [
    { key: "pending", label: "Pending",  color: "text-yellow-400" },
    { key: "history", label: "History",  color: "text-green-400"  },
    { key: "rejected",label: "Rejected", color: "text-red-400"    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6 gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Plot Verifier Queue</h2>
          <p className="text-green-800 text-[10px] font-black uppercase tracking-widest mt-1">Admin • Land Verification</p>
        </div>
        <div className="flex bg-green-950/20 rounded-xl p-1 border border-green-900/30 shadow-inner">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${tab === t.key ? `bg-green-600 text-black shadow-lg` : `${t.color} hover:text-white`}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800" />
        <input
          placeholder="Search by Gata No, Village, District, Farmer..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-green-950/10 border border-green-900/30 rounded-2xl h-12 pl-12 pr-4 text-xs font-semibold focus:border-green-500 outline-none placeholder:text-green-900 transition-all"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="text-green-700 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-40">
          <MapIcon size={48} className="text-green-900" />
          <p className="text-green-700 text-sm font-bold">No {tab} plots found</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start pr-1">
          {filtered.map(plot => (
            <button key={plot._id} onClick={() => onSelect(plot._id)}
              className="text-left bg-green-950/10 hover:bg-green-950/30 border border-green-900/30 hover:border-green-600/40 rounded-3xl p-5 transition-all group active:scale-95 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-700 text-[9px] font-black uppercase tracking-widest">Gata No.</p>
                  <p className="text-white font-black text-xl tracking-tight">{plot.gata_number || plot.gataNo || "—"}</p>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusColor[plot.status]}`}>
                  {plot.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-green-600 text-xs font-bold">{[plot.village, plot.tehsil, plot.district].filter(Boolean).join(", ")}</p>
                <p className="text-green-800 text-xs">{plot.area_ha} ha • {plot.farmer?.name}</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-green-900 text-[10px]">{new Date(plot.createdAt).toLocaleDateString("en-IN")}</p>
                <div className="flex items-center gap-1 text-green-700 group-hover:text-green-400 transition-colors">
                  <Eye size={13} />
                  <span className="text-[10px] font-black uppercase">View Details</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════
export default function AdminPlots() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="flex flex-col h-full bg-[#050a05] text-green-100 overflow-hidden">
      {selectedId ? (
        <PlotDetail
          plotId={selectedId}
          onBack={() => setSelectedId(null)}
          onAction={() => setSelectedId(null)}
        />
      ) : (
        <PlotList onSelect={setSelectedId} />
      )}
    </div>
  );
}
