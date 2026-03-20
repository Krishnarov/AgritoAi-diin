import { useState, useRef } from "react";
import Navbar from "../components/shared/Navbar.jsx";
import Sidebar from "../components/shared/Sidebar.jsx";
import FarmerMap from "../components/map/FarmerMap.jsx";
import { Search, MapPin, Loader2, Navigation, ChevronLeft, ChevronRight, Filter, Map as MapIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api.js";

export default function RenterMapPage() {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Search using Nominatim (Free OSM Geocoding)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const q = searchQuery.includes("India") ? searchQuery : `${searchQuery}, India`;
      const { data } = await api.get("/map/geocoding/search", { params: { q } });
      setResults(data);
      if (data.length === 0) toast.error("Location not found");
    } catch (err) {
      toast.error("Failed to fetch location");
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = async (item) => {
    const { lat, lon, osm_id, osm_type } = item;

    // First fly to the point
    mapRef.current?.flyTo(parseFloat(lat), parseFloat(lon), 12);
    setResults([]);

    // Then try to fetch high-res boundary if it's an administrative area
    if (osm_id && osm_type) {
      try {
        const { data } = await api.get("/map/geocoding/boundary", {
          params: { osm_id, osm_type }
        });
        if (data?.geojson) {
          mapRef.current?.displayBoundary(data.geojson);
        }
      } catch (err) {
        // Silent fail
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050a05] text-green-100 font-sans">
      <Navbar />

      <div className="flex flex-1 pt-14 overflow-hidden relative">
        <Sidebar />

        {/* ── MAP CONTAINER ── */}
        <div className="flex-1 relative overflow-hidden flex h-full">

          {/* ── ACTUAL MAP (Bottom Layer) ── */}
          <div className="absolute inset-0 z-0">
            <FarmerMap ref={mapRef} farmerMode={false} />
          </div>

          {/* ── FLOATING SEARCH PANEL ── */}
          <div
            className={`absolute top-4 left-4 z-[1001] transition-all duration-500 ease-in-out flex flex-col h-[calc(100%-48px)] max-h-[850px]
              ${isExpanded ? "w-85 translate-x-0" : "w-14 -translate-x-2"}`}
          >
            {/* Panel Body */}
            <div className={`h-full bg-[#0a150a]/85 backdrop-blur-3xl border border-green-500/20 rounded-bl-4xl rounded-tr-4xl flex flex-col overflow-hidden shadow-[0_0_50px_-12px_rgba(34,197,94,0.2)] transition-all duration-500 relative
              ${isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            >
              <div className="p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                      <Navigation size={20} className="text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-green-300">Discovery</h2>
                      <p className="text-[10px] text-green-800 font-bold uppercase tracking-widest mt-0.5 italic">Real-time Land Search</p>
                    </div>
                  </div>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="relative group mb-6">
                  <input
                    type="text"
                    placeholder="Search City, District..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-14 bg-black/40 border border-green-900/40 rounded-2xl pl-12 pr-4 text-xs font-semibold
                             focus:border-green-500 outline-none placeholder:text-green-900 transition-all text-green-100 shadow-inner"
                  />
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800 group-focus-within:text-green-400 transition-colors" />
                </form>

                {/* Quick Filters */}
                <div className="space-y-4 mb-8">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-800 px-1 border-l-2 border-green-900 ml-1">Popular Hubs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pune', 'Sangli', 'Nashik', 'Mumbai'].map(loc => (
                      <button
                        key={loc}
                        onClick={() => { setSearchQuery(loc); handleSearch(); }}
                        className="py-3 px-3 bg-green-900/10 border border-green-900/20 rounded-xl text-[10px] font-black uppercase text-green-600 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all active:scale-95"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                  {searching ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4 opacity-50">
                      <Loader2 size={32} className="animate-spin text-green-500" />
                      <span className="text-[10px] font-black uppercase text-green-700 tracking-[0.3em] text-center">Locating Plots...</span>
                    </div>
                  ) : results.length > 0 ? (
                    results.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectLocation(item)}
                        className="w-full text-left p-4 bg-black/40 border border-green-900/30 rounded-2xl flex items-start gap-4 hover:border-green-400/50 hover:bg-green-500/10 transition-all group animate-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${idx * 70}ms` }}
                      >
                        <MapPin size={18} className="text-green-900 mt-1 shrink-0 group-hover:text-green-400 transition-colors" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-black text-green-200 truncate tracking-tight">{item.display_name.split(',')[0]}</p>
                          <p className="text-[9px] text-green-800 truncate font-bold mt-1 uppercase tracking-tighter">{item.display_name.split(',').slice(1, 3).join(',')}</p>
                        </div>
                      </button>
                    ))
                  ) : searchQuery && !searching ? (
                    <div className="py-20 text-center px-10">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-green-900 flex items-center justify-center mx-auto mb-4">
                        <Search size={20} className="text-green-900" />
                      </div>
                      <p className="text-green-900 text-[10px] font-black uppercase tracking-widest leading-relaxed text-center italic">Try a different city</p>
                    </div>
                  ) : (
                    <div className="py-30 flex flex-col items-center justify-center gap-6 opacity-30 grayscale saturate-0 pointer-events-none">
                      <Filter size={56} className="text-green-900" />
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-green-900 text-center">Filter Terminal</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── TOGGLE BUTTON (Moved to be independent and centered on the edge) ── */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`absolute top-5 -translate-y-1/2 w-10 h-10 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center transition-all duration-500 z-[1002] border-2 border-[#050a05] active:scale-90
                ${isExpanded
                  ? "right-[-10px] bg-green-500 text-black hover:bg-green-400"
                  : "left-40 bg-[#0a150a]/90 text-green-500 hover:bg-green-600 hover:text-black border-green-500/30"}`}
            >
              {isExpanded ? <ChevronLeft size={20} /> : <Search size={18} />}
            </button>
          </div>

          {/* ── OVERLAYS ── */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 pointer-events-none lg:pointer-events-auto">
            <div className="px-6 py-4 bg-black/60 backdrop-blur-xl border border-green-500/20 rounded-2xl flex items-center gap-4 shadow-2xl">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-100 block">Live Terminal Active</span>
                <span className="text-[8px] text-green-800 font-bold uppercase tracking-widest">Global Discovery Synced</span>
              </div>
            </div>
            {!isExpanded && (
              <div className="px-4 py-3 bg-green-500/10 backdrop-blur-md border border-green-500/20 rounded-xl text-green-500 text-[9px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                Map Mode Extended
              </div>
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-2.5 bg-[#0a150a]/80 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-green-600 italic">AgritoAI Discovery Engine • Multi-Region Support</p>
          </div>

        </div>
      </div>
    </div>
  );
}