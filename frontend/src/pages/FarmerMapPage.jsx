import FarmerMap from "../components/map/FarmerMap.jsx";

export default function FarmerMapPage() {
  return (
    <div className="h-full w-full">
      <FarmerMap farmerMode={true} />
    </div>
  );
}