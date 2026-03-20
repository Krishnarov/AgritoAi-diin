import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import * as turf from "@turf/turf";
import toast from "react-hot-toast";
import { Loader2, Trash2, PenLine, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../utils/api.js";

L.drawLocal.draw.handlers.polygon.tooltip.start = "Click to start drawing boundary";
L.drawLocal.draw.handlers.polygon.tooltip.cont  = "Click to continue drawing";
L.drawLocal.draw.handlers.polygon.tooltip.end   = "Click first point to close boundary";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const STATUS = {
  available: { color: "#22c55e", fill: "#22c55e", label: "Available",           opacity: 0.35 },
  booked:    { color: "#f97316", fill: "#f97316", label: "Booked",              opacity: 0.35 },
  pending:   { color: "#94a3b8", fill: "#94a3b8", label: "Pending Verification",opacity: 0.30 },
  rejected:  { color: "#ef4444", fill: "#ef4444", label: "Rejected",            opacity: 0.25 },
};

const calcAreaHa = (latLngs) => {
  if (!latLngs || latLngs.length < 3) return "0.0000";
  const coords = latLngs.map((ll) => [ll.lng, ll.lat]);
  coords.push(coords[0]);
  return (turf.area(turf.polygon([coords])) / 10000).toFixed(4);
};

const makeLabel = (gataNo, status) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${STATUS[status]?.color || "#64748b"};color:#fff;font-size:11px;font-weight:900;padding:2px 7px;border-radius:5px;white-space:nowrap;box-shadow:0 3px 10px #0009;pointer-events:none;border:1px solid #fff4;">Gata ${gataNo}</div>`,
    iconAnchor: [28, 10],
  });

const inp = "w-full bg-green-950/60 border border-green-900/40 rounded-xl px-3 py-2.5 text-green-100 text-sm outline-none focus:border-green-500 placeholder:text-green-800";
const sel = `${inp} cursor-pointer`;

const EMPTY_FORM = {
  gata_number: "", village: "", tehsil: "", district: "", state: "Maharashtra",
  survey_number: "", khata_number: "", khatauni_number: "",
  land_type: "", ownership_type: "", soil_type: "", last_crop_grown: "",
  price_per_season: "", price_per_year: "", advance_amount: "",
  price_negotiable: true, available_from: new Date().toISOString().split("T")[0],
  minimum_lease_months: 3,
  crop_types_allowed: "", crops_not_allowed: "", irrigation: "",
  khasaraFile: null,
};

export default function FarmerMap({ farmerMode = true }) {
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const drawFG    = useRef(null);
  const drawCtrl  = useRef(null);
  const plotLayers = useRef({});
  const initRef   = useRef(false);
  const isFitting = useRef(false);

  const [step, setStep]               = useState("idle"); // idle | drawing | form | submitting | done
  const [drawnLatLngs, setDrawnLatLngs] = useState(null);
  const [calcArea, setCalcArea]       = useState("0");
  const [myPlots, setMyPlots]         = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [plotCount, setPlotCount]     = useState(0);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fc = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  // ── Render Plots ──────────────────────────────────────────────────────
  const renderPlots = useCallback((plots, isPersonal = false) => {
    if (!mapInst.current) return;
    const scope = isPersonal ? "personal" : "public";
    Object.keys(plotLayers.current).forEach((id) => {
      if (plotLayers.current[id].scope === scope) {
        plotLayers.current[id].poly.remove();
        plotLayers.current[id].label?.remove();
        delete plotLayers.current[id];
      }
    });
    if (!plots.length) { if (!isPersonal) setPlotCount(0); return; }
    plots.forEach((plot) => {
      if (!plot.geometry?.coordinates) return;
      const st = STATUS[plot.status] || STATUS.pending;
      const poly = L.geoJSON(plot.geometry, {
        style: { color: st.color, fillColor: st.fill, fillOpacity: st.opacity, weight: 3, dashArray: plot.status === "pending" ? "5,10" : null },
      }).addTo(mapInst.current);
      poly.on("mouseover", function () { this.setStyle({ fillOpacity: 0.7, weight: 4 }); });
      poly.on("mouseout",  function () { this.setStyle({ fillOpacity: st.opacity, weight: 3 }); });
      poly.on("click", (e) => { L.DomEvent.stopPropagation(e); setSelectedPlot(plot); });
      try {
        const center = poly.getBounds().getCenter();
        const lbl = L.marker(center, { icon: makeLabel(plot.gata_number || plot.gataNo, plot.status) }).addTo(mapInst.current);
        plotLayers.current[plot._id || Math.random()] = { poly, label: lbl, scope };
      } catch {}
    });
    if (!isPersonal) setPlotCount(plots.length);
  }, []);

  // ── Load Plots ────────────────────────────────────────────────────────
  const loadMapPlots = useCallback(async (useBounds = true) => {
    if (!mapInst.current || isFitting.current) return;
    let params = {};
    if (useBounds) {
      const b = mapInst.current.getBounds();
      params = { swLat: b.getSouth(), swLng: b.getWest(), neLat: b.getNorth(), neLng: b.getEast() };
    }
    try {
      setLoadingPlots(true);
      const { data } = await api.get("/plots/map", { params });
      if (useBounds && data.plots.length === 0 && plotCount > 0) return;
      renderPlots(data.plots, false);
    } catch {} finally { setLoadingPlots(false); }
  }, [renderPlots, plotCount]);

  const loadMyPlots = useCallback(async () => {
    if (!farmerMode) return;
    try { const { data } = await api.get("/plots/my"); setMyPlots(data.plots); } catch {}
  }, [farmerMode]);

  // ── Map Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const map = L.map(mapRef.current, { center: [16.8298, 74.8664], zoom: 16, zoomControl: false });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const fg = new L.FeatureGroup().addTo(map);
    drawFG.current = fg;

    if (farmerMode) {
      const ctrl = new L.Control.Draw({
        position: "topright",
        draw: {
          polygon: { shapeOptions: { color: "#facc15", fillOpacity: 0.3 } },
          polyline: false, rectangle: false, circle: false, marker: false, circlemarker: false,
        },
        edit: { featureGroup: fg },
      });
      // Hide default toolbar — we use our own button
      ctrl.addTo(map);
      const toolbarEl = document.querySelector(".leaflet-draw-toolbar");
      if (toolbarEl) toolbarEl.style.display = "none";
      drawCtrl.current = ctrl;

      map.on(L.Draw.Event.DRAWSTART, () => { setStep("drawing"); setSelectedPlot(null); });
      map.on(L.Draw.Event.CREATED, (e) => {
        fg.clearLayers(); fg.addLayer(e.layer);
        let lls = e.layer.getLatLngs();
        if (Array.isArray(lls[0])) lls = lls[0];
        setDrawnLatLngs(lls);
        setCalcArea(calcAreaHa(lls));
        setStep("form");
      });
      map.on(L.Draw.Event.DRAWSTOP, () => setStep((s) => (s === "drawing" ? "idle" : s)));
    }

    map.on("moveend", () => loadMapPlots(true));
    mapInst.current = map;
    setTimeout(() => { loadMapPlots(false); if (farmerMode) loadMyPlots(); }, 500);
    return () => { map.remove(); mapInst.current = null; initRef.current = false; };
  }, [loadMapPlots, loadMyPlots, farmerMode]);

  useEffect(() => {
    if (farmerMode && myPlots.length) renderPlots(myPlots, true);
  }, [myPlots, farmerMode, renderPlots]);

  // ── Actions ───────────────────────────────────────────────────────────
  const startDrawing = () => {
    if (!mapInst.current) return;
    new L.Draw.Polygon(mapInst.current, {
      shapeOptions: { color: "#facc15", fillOpacity: 0.25, weight: 2 },
    }).enable();
  };

  const resetDraw = () => {
    drawFG.current?.clearLayers();
    setDrawnLatLngs(null);
    setForm(EMPTY_FORM);
    setStep("idle");
  };

  const handleSubmit = async () => {
    if (!form.gata_number) return toast.error("Gata number is required");
    if (!form.khasaraFile) return toast.error("Khasara document is required");
    setStep("submitting");
    try {
      const geometry = {
        type: "Polygon",
        coordinates: [[...drawnLatLngs.map((l) => [l.lng, l.lat]), [drawnLatLngs[0].lng, drawnLatLngs[0].lat]]],
      };
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, v); });
      fd.set("geometry", JSON.stringify(geometry));
      fd.append("area_ha", calcArea);
      // legacy field support
      fd.append("gataNo", form.gata_number);
      await api.post("/plots", fd);
      toast.success("Plot submitted for review!");
      setStep("done");
      loadMyPlots();
      resetDraw();
    } catch {
      toast.error("Submission failed");
      setStep("form");
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050a05]">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#0a150a]/90 backdrop-blur-md border border-green-900/40 rounded-xl p-3 flex flex-col gap-2 shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${loadingPlots ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
          <span className="text-[10px] font-black text-green-500 uppercase">Live Index • {plotCount}</span>
        </div>
        {Object.entries(STATUS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: v.color }} />
            <span className="text-[10px] text-green-700 font-bold">{v.label}</span>
          </div>
        ))}
        <button onClick={() => loadMapPlots(false)} className="mt-2 text-[10px] bg-green-900/30 hover:bg-green-500 hover:text-black py-1 rounded text-green-400 font-black transition-all">
          REFRESH
        </button>
      </div>

      {/* ── DRAW BOUNDARY BUTTON ── */}
      {farmerMode && step === "idle" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2">
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full backdrop-blur-sm">
            Click below to mark your field boundary on the map
          </div>
          <button
            onClick={startDrawing}
            className="flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm uppercase tracking-widest px-8 py-4 rounded-2xl shadow-2xl shadow-yellow-400/30 active:scale-95 transition-all"
          >
            <PenLine size={20} />
            Draw Boundary
          </button>
        </div>
      )}

      {/* Drawing hint */}
      {step === "drawing" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-md px-6 py-3 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-yellow-300 text-xs font-black uppercase tracking-widest">Click on map to mark corners • Click first point to close</span>
          <button onClick={resetDraw} className="ml-4 text-red-400 hover:text-red-300 text-[10px] font-black uppercase border border-red-500/30 px-3 py-1 rounded-lg">Cancel</button>
        </div>
      )}

      {/* ── FULL FORM ── */}
      {step === "form" && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] max-h-[75vh] overflow-y-auto bg-[#060e06]/98 border-t border-green-800/40 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="max-w-4xl mx-auto p-5 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-300 font-black text-sm uppercase tracking-widest">Plot Registration</h3>
                <p className="text-green-700 text-[10px] mt-0.5">Boundary marked • Area: <span className="text-yellow-400 font-black">{calcArea} Ha</span></p>
              </div>
              <button onClick={resetDraw} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-[10px] font-black uppercase border border-red-500/30 px-3 py-1.5 rounded-lg transition-all">
                <Trash2 size={12} /> Clear & Redraw
              </button>
            </div>

            {/* Land Identity */}
            <div>
              <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mb-2">Land Identity</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <input placeholder="Gata Number *" className={inp} value={form.gata_number} onChange={f("gata_number")} />
                <input placeholder="Survey Number"  className={inp} value={form.survey_number} onChange={f("survey_number")} />
                <input placeholder="Khata Number"   className={inp} value={form.khata_number} onChange={f("khata_number")} />
                <input placeholder="Khatauni Number" className={inp} value={form.khatauni_number} onChange={f("khatauni_number")} />
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mb-2">Location</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <input placeholder="Village"  className={inp} value={form.village}  onChange={f("village")} />
                <input placeholder="Tehsil"   className={inp} value={form.tehsil}   onChange={f("tehsil")} />
                <input placeholder="District" className={inp} value={form.district} onChange={f("district")} />
                <input placeholder="State"    className={inp} value={form.state}    onChange={f("state")} />
              </div>
            </div>

            {/* Land Details */}
            <div>
              <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mb-2">Land Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <select className={sel} value={form.land_type} onChange={f("land_type")}>
                  <option value="">Land Type</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="horticultural">Horticultural</option>
                  <option value="fallow">Fallow</option>
                  <option value="forest">Forest</option>
                  <option value="wasteland">Wasteland</option>
                </select>
                <select className={sel} value={form.ownership_type} onChange={f("ownership_type")}>
                  <option value="">Ownership Type</option>
                  <option value="private">Private</option>
                  <option value="joint">Joint Family</option>
                  <option value="government">Government Lease</option>
                  <option value="patta">Patta Land</option>
                </select>
                <select className={sel} value={form.soil_type} onChange={f("soil_type")}>
                  <option value="">Soil Type</option>
                  <option value="black_cotton">Black Cotton</option>
                  <option value="red_laterite">Red Laterite</option>
                  <option value="alluvial">Alluvial</option>
                  <option value="sandy_loam">Sandy Loam</option>
                  <option value="clay">Clay</option>
                  <option value="loamy">Loamy</option>
                </select>
                <select className={sel} value={form.irrigation} onChange={f("irrigation")}>
                  <option value="">Irrigation</option>
                  <option value="canal">Canal</option>
                  <option value="borewell">Borewell</option>
                  <option value="drip">Drip</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="rainfed">Rainfed Only</option>
                  <option value="well">Well</option>
                </select>
                <input placeholder="Last Crop Grown" className={inp} value={form.last_crop_grown} onChange={f("last_crop_grown")} />
                <input placeholder="Crops Allowed (comma sep)" className={`${inp} col-span-2`} value={form.crop_types_allowed} onChange={f("crop_types_allowed")} />
                <input placeholder="Crops NOT Allowed" className={inp} value={form.crops_not_allowed} onChange={f("crops_not_allowed")} />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mb-2">Pricing & Availability</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                <input type="number" placeholder="Price / Season (₹)" className={inp} value={form.price_per_season} onChange={f("price_per_season")} />
                <input type="number" placeholder="Price / Year (₹)"   className={inp} value={form.price_per_year}   onChange={f("price_per_year")} />
                <input type="number" placeholder="Advance Amount (₹)" className={inp} value={form.advance_amount}   onChange={f("advance_amount")} />
                <input type="number" placeholder="Min Lease (months)"  className={inp} value={form.minimum_lease_months} onChange={f("minimum_lease_months")} />
                <div className="flex flex-col gap-1">
                  <label className="text-green-700 text-[9px] font-black uppercase tracking-widest ml-1">Available From</label>
                  <input type="date" className={inp} value={form.available_from} onChange={f("available_from")} />
                </div>
                <label className="flex items-center gap-2 bg-green-950/60 border border-green-900/40 rounded-xl px-3 py-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.price_negotiable} onChange={fc("price_negotiable")} className="accent-green-500" />
                  <span className="text-green-400 text-[10px] font-black uppercase">Price Negotiable</span>
                </label>
              </div>
            </div>

            {/* Khasara Upload */}
            <div>
              <p className="text-green-600 text-[9px] font-black uppercase tracking-widest mb-2">Document Upload</p>
              <label className="relative block w-full h-14 cursor-pointer">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                  onChange={(e) => setForm((p) => ({ ...p, khasaraFile: e.target.files[0] || null }))} />
                <div className="w-full h-full bg-green-900/20 border-2 border-dashed border-green-900/40 hover:border-green-500/50 rounded-xl flex items-center justify-center text-[10px] text-green-700 font-black tracking-widest uppercase transition-all">
                  {form.khasaraFile ? `✓ ${form.khasaraFile.name}` : "Upload Khasara / 7-12 Document *  (PDF, JPG, PNG)"}
                </div>
              </label>
            </div>

            <button onClick={handleSubmit} disabled={step === "submitting"}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black h-14 rounded-xl transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {step === "submitting" ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : "Submit Plot for Review"}
            </button>
          </div>
        </div>
      )}

      {/* Selected Plot Popup */}
      {selectedPlot && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-green-950/90 backdrop-blur-xl border border-green-500/30 rounded-3xl px-8 py-5 flex items-center gap-12 shadow-2xl shadow-green-500/10">
          <div><p className="text-green-500 text-[9px] uppercase font-black mb-1">Gata</p><p className="text-white font-black text-xl">#{selectedPlot.gata_number || selectedPlot.gataNo}</p></div>
          <div><p className="text-green-500 text-[9px] uppercase font-black mb-1">Area</p><p className="text-white font-black text-xl">{selectedPlot.area_ha} <span className="text-sm font-normal opacity-50">Ha</span></p></div>
          {!farmerMode && selectedPlot.status === "available" && (
            <button onClick={async () => {
              try { await api.post(`/plots/${selectedPlot._id}/request`, { message: "Interested" }); toast.success("Request sent!"); setSelectedPlot(null); }
              catch { toast.error("Failed"); }
            }} className="bg-green-500 text-black font-black px-8 py-3 rounded-2xl hover:bg-green-400 shadow-xl shadow-green-500/20 active:scale-95 transition-all">
              SECURE THIS LAND
            </button>
          )}
          <button onClick={() => setSelectedPlot(null)} className="p-2 text-green-800 hover:text-white transition-colors">✕</button>
        </div>
      )}
    </div>
  );
}
