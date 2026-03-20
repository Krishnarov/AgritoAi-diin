import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  List, 
  MessageSquare, 
  Settings, 
  Info, 
  Search,
  History,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CreditCard,
  Bell,
  Wallet,
  Target
} from "lucide-react";
import useAuthStore from "../../store/authStore.js";

const SidebarItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        isActive
          ? "bg-green-600 text-[#0a150a] shadow-lg shadow-green-900/20"
          : "text-green-700 hover:bg-green-900/20 hover:text-green-400"
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const isFarmer = user?.role === "farmer";
  const isRenter = user?.role === "renter";
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-64 h-full bg-[#050a05] border-r border-green-900/30 p-5 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
      
      {/* ── Farmer Navigation ────────────────────────────────────────── */}
      {isFarmer && (
        <>
          <div className="mb-4 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Farmer Control Panel</p>
          </div>
          <SidebarItem to="/farmer/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <SidebarItem to="/farmer/notifications" icon={<Bell size={18} />} label="Notifications" />
          <SidebarItem to="/farmer/map"       icon={<Plus icon={MapIcon} size={18}/>} label="Register Land" />
          <SidebarItem to="/farmer/plots"     icon={<List size={18} />}           label="My Listings" />
          <SidebarItem to="/farmer/requests"  icon={<MessageSquare size={18} />}  label="Rental Requests" />
          <SidebarItem to="/farmer/earnings"  icon={<Wallet size={18} />}         label="My Earnings" />
          <div className="my-4 border-t border-green-900/10 pt-4 px-4">
             <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Account Security</p>
          </div>
          <SidebarItem to="/farmer/kyc"       icon={<ShieldCheck size={18} />}    label="KYC & Identity" />
          <SidebarItem to="/farmer/bank"      icon={<CreditCard size={18} />}      label="Bank & Payouts" />
        </>
      )}

      {/* ── Renter Navigation ────────────────────────────────────────── */}
      {isRenter && (
        <>
          <div className="mb-2 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Renter Operations</p>
          </div>
          <SidebarItem to="/renter/dashboard" icon={<LayoutDashboard size={18} />} label="Overview" />
          <SidebarItem to="/renter/notifications" icon={<Bell size={18} />} label="Notifications" />
          
          <div className="my-3 border-t border-green-900/10 pt-3 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Discovery</p>
          </div>
          <SidebarItem to="/browse"           icon={<Search size={18} />}          label="Explore Lands" />
          <SidebarItem to="/renter/saved"     icon={<List size={18} />}            label="Saved & Wishes" />
          <SidebarItem to="/renter/preferences" icon={<Target size={18} />}        label="Crop Planning" />

          <div className="my-3 border-t border-green-900/10 pt-3 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Operational Deals</p>
          </div>
          <SidebarItem to="/renter/interests" icon={<MessageSquare size={18} />}   label="Negotiations" />
          <SidebarItem to="/renter/rentals"   icon={<History size={18} />}         label="Agreement Monitor" />

          <div className="my-3 border-t border-green-900/10 pt-3 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Identity & Proof</p>
          </div>
          <SidebarItem to="/renter/profile"   icon={<UserIcon size={18} />}        label="Business Profile" />
          <SidebarItem to="/renter/identity"  icon={<ShieldCheck size={18} />}     label="Identity Vault" />
        </>
      )}

      {/* ── Admin Navigation ─────────────────────────────────────────── */}
      {isAdmin && (
        <>
          <div className="mb-4 px-4">
            <p className="text-green-800 text-[10px] uppercase font-black tracking-widest">Administrator</p>
          </div>
          <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Terminal Overview" />
          <SidebarItem to="/admin/plots"     icon={<MapIcon size={18} />}         label="Land Verifications" />
          <SidebarItem to="/admin/kyc"       icon={<ShieldCheck size={18} />}    label="Identity Reviews" />
          <SidebarItem to="/admin/disputes"  icon={<MessageSquare size={18} />}  label="Dispute Terminal" />
          <SidebarItem to="/admin/notifications" icon={<Bell size={18} />}        label="System Alerts" />
        </>
      )}

      {/* ── Shared Footer ────────────────────────────────────────────── */}
      <div className="mt-auto pt-6 flex flex-col gap-1 border-t border-green-900/10">
        <SidebarItem to="/settings" icon={<Settings size={18} />} label="Preferences" />
        <SidebarItem to="/help"     icon={<Info size={18} />}     label="Support Center" />
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-red-900 hover:bg-red-500/10 hover:text-red-500 mt-2"
        >
          <LogOut size={18} />
          <span>Exit Account</span>
        </button>
      </div>
    </aside>
  );
}

// Small helper to avoid icon import confusion if Plus used incorrectly
function Plus({icon: Icon, size}) {
  return (
    <div className="relative">
      <Icon size={size} />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full flex items-center justify-center border border-[#050a05]">
        <span className="text-[8px] text-[#050a05] mb-0.5">+</span>
      </div>
    </div>
  )
}
