import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore.js";

import LoginPage      from "./pages/LoginPage.jsx";
import RegisterPage   from "./pages/RegisterPage.jsx";
import FarmerMapPage  from "./pages/FarmerMapPage.jsx";
import AdminPage      from "./pages/AdminPage.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import FarmerPlotsPage  from "./pages/FarmerPlotsPage.jsx";
import FarmerRequestsPage from "./pages/FarmerRequestsPage.jsx";
import RenterMapPage  from "./pages/RenterMapPage.jsx";
import RenterDashboard from "./pages/RenterDashboard.jsx";
import RenterBookings  from "./pages/RenterBookings.jsx";
import RenterProfile   from "./pages/RenterProfile.jsx";
import RenterPreferences from "./pages/RenterPreferences.jsx";
import RenterIdentity  from "./pages/RenterIdentity.jsx";
import RenterSaved     from "./pages/RenterSaved.jsx";
import RenterInterests from "./pages/RenterInterests.jsx";
import RenterRentals   from "./pages/RenterRentals.jsx";
import LandingPage       from "./pages/LandingPage.jsx";
import FarmerKYC         from "./pages/FarmerKYC.jsx";
import FarmerBank        from "./pages/FarmerBank.jsx";
import FarmerEarnings    from "./pages/FarmerEarnings.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import FarmerPage from "./pages/FarmerPage.jsx";
import RenterPage from "./pages/RenterPage.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminPlots     from "./pages/admin/AdminPlots.jsx";
import AdminKyc       from "./pages/admin/AdminKyc.jsx";
import AdminDisputes  from "./pages/admin/AdminDisputes.jsx";

// ── Route guards ──────────────────────────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { initAuth } = useAuthStore();
  useEffect(() => { initAuth(); }, []);

  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

        {/* Farmer Dashboard */}
        <Route path="/farmer" element={
          <PrivateRoute roles={["farmer"]}>
            <FarmerPage />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboard />} />
          <Route path="map"       element={<FarmerMapPage />} />
          <Route path="plots"     element={<FarmerPlotsPage />} />
          <Route path="requests"  element={<FarmerRequestsPage />} />
          <Route path="kyc"       element={<FarmerKYC />} />
          <Route path="bank"      element={<FarmerBank />} />
          <Route path="earnings"  element={<FarmerEarnings />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

      {/* Admin */}
      <Route path="/admin" element={
        <PrivateRoute roles={["admin"]}>
          <AdminPage />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="plots"     element={<AdminPlots />} />
        <Route path="kyc"       element={<AdminKyc />} />
        <Route path="disputes"  element={<AdminDisputes />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Renter */}
      <Route path="/renter" element={
        <PrivateRoute roles={["renter"]}>
          <RenterPage />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<RenterDashboard />} />
        <Route path="my-plots"  element={<RenterBookings />} />
        <Route path="profile"   element={<RenterProfile />} />
        <Route path="preferences" element={<RenterPreferences />} />
        <Route path="identity"  element={<RenterIdentity />} />
        <Route path="saved"     element={<RenterSaved />} />
        <Route path="interests" element={<RenterInterests />} />
        <Route path="rentals"   element={<RenterRentals />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="/browse" element={
        <PrivateRoute roles={["renter", "farmer"]}>
          <RenterMapPage />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}