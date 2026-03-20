import Navbar from "../components/shared/Navbar.jsx";
import Sidebar from "../components/shared/Sidebar.jsx";
import FarmerMap from "../components/map/FarmerMap.jsx";

export default function RenterMapPage() {
  return (
    <div className="flex flex-col h-screen bg-[#050a05]">
      <Navbar />
      <div className="flex flex-1 pt-14 overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative overflow-hidden">
          {/* farmerMode=false → renter view: no draw tools, loads public plots */}
          <FarmerMap farmerMode={false} />
        </div>
      </div>
    </div>
  );
}