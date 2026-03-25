import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import SettingsPage from "./pages/Settings.tsx";
import NotificationsPage from "./pages/Notifications.tsx";
import { TrailersPage } from "./trailers/pages/TrailersPage.tsx";
import { TrailerDetailLoader } from "./trailers/pages/TrailerDetailLoader.tsx";
import { Trailer3DLoader } from "./trailers/pages/Trailer3DLoader.tsx";
import { WalkingTandemGooseneckWagonDetails } from "./trailers/pages/WalkingTandemGooseneckWagonDetails.tsx";
import { WalkingTandemGooseneckWagon3DPage } from "./trailers/pages/WalkingTandemGooseneckWagon3DPage.tsx";
import { SingleConeTrailerDetails } from "./trailers/pages/SingleConeTrailerDetails.tsx";
import { SingleConeTrailer3DPage } from "./trailers/pages/SingleConeTrailer3DPage.tsx";
import { UserRole } from "./types";

import AdminDashboard from "./admin/AdminDashboard";
import InventoryManagement from "./admin/InventoryManagement";
import DealerManagement from "./admin/DealerManagement";
import DealerDetail from "./admin/DealerDetail";
import TrailerHealthOverview from "./admin/TrailerHealthOverview";
import SensorDataDetail from "./admin/SensorDataDetail";
import MaintenanceSlotManager from "./admin/MaintenanceSlotManager";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";

// Dealer Pages
import DealerDashboard from "./dealer/DealerDashboard";
import DealerOrders from "./dealer/DealerOrders";
import DealerQuotes from "./dealer/DealerQuotes";
import DealerStock from "./dealer/DealerStock";

// Customer Pages
import CustomerDashboard from "./customer/CustomerDashboard";
import CustomerHealth from "./customer/CustomerHealth";
import CustomerQuotes from "./customer/CustomerQuotes";
import CustomerOrders from "./customer/CustomerOrders";
import ContactDealer from "./customer/ContactDealer";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const ProtectedRoleRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: UserRole;
}) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== requiredRole) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Site */}
      <Route path="/" element={<Index />} />
      <Route path="/trailers" element={<TrailersPage />} />
      {/* Specific trailer routes (must come before :slug routes) */}
      <Route path="/trailers/walking-tandem-gooseneck-wagon" element={<WalkingTandemGooseneckWagonDetails />} />
      <Route path="/trailers/walking-tandem-gooseneck-wagon/3d" element={<WalkingTandemGooseneckWagon3DPage />} />
      <Route path="/trailers/single-cone-trailer" element={<SingleConeTrailerDetails />} />
      <Route path="/trailers/single-cone-trailer/3d" element={<SingleConeTrailer3DPage />} />
      {/* Generic trailer routes */}
      <Route path="/trailers/:slug" element={<TrailerDetailLoader />} />
      <Route path="/trailers/:slug/3d" element={<Trailer3DLoader />} />
      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoleRoute requiredRole="admin"><AdminDashboard /></ProtectedRoleRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoleRoute requiredRole="admin"><InventoryManagement /></ProtectedRoleRoute>} />
      <Route path="/admin/dealers" element={<ProtectedRoleRoute requiredRole="admin"><DealerManagement /></ProtectedRoleRoute>} />
      <Route path="/admin/dealers/:id" element={<ProtectedRoleRoute requiredRole="admin"><DealerDetail /></ProtectedRoleRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoleRoute requiredRole="admin"><AdminCustomers /></ProtectedRoleRoute>} />
      <Route path="/admin/health" element={<ProtectedRoleRoute requiredRole="admin"><TrailerHealthOverview /></ProtectedRoleRoute>} />
      <Route path="/admin/health/:vin" element={<ProtectedRoleRoute requiredRole="admin"><SensorDataDetail /></ProtectedRoleRoute>} />
      <Route path="/admin/maintenance" element={<ProtectedRoleRoute requiredRole="admin"><MaintenanceSlotManager /></ProtectedRoleRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoleRoute requiredRole="admin"><AdminOrders /></ProtectedRoleRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoleRoute requiredRole="admin"><NotificationsPage /></ProtectedRoleRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoleRoute requiredRole="admin"><SettingsPage /></ProtectedRoleRoute>} />

      {/* Dealer */}
      <Route path="/dealer" element={<ProtectedRoleRoute requiredRole="dealer"><DealerDashboard /></ProtectedRoleRoute>} />
      <Route path="/dealer/orders" element={<ProtectedRoleRoute requiredRole="dealer"><DealerOrders /></ProtectedRoleRoute>} />
      <Route path="/dealer/quotes" element={<ProtectedRoleRoute requiredRole="dealer"><DealerQuotes /></ProtectedRoleRoute>} />
      <Route path="/dealer/stock" element={<ProtectedRoleRoute requiredRole="dealer"><DealerStock /></ProtectedRoleRoute>} />
      <Route path="/dealer/notifications" element={<ProtectedRoleRoute requiredRole="dealer"><NotificationsPage /></ProtectedRoleRoute>} />
      <Route path="/dealer/settings" element={<ProtectedRoleRoute requiredRole="dealer"><SettingsPage /></ProtectedRoleRoute>} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoleRoute requiredRole="customer"><CustomerDashboard /></ProtectedRoleRoute>} />
      <Route path="/customer/health" element={<ProtectedRoleRoute requiredRole="customer"><CustomerHealth /></ProtectedRoleRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoleRoute requiredRole="customer"><CustomerOrders /></ProtectedRoleRoute>} />
      <Route path="/customer/quotes" element={<ProtectedRoleRoute requiredRole="customer"><CustomerQuotes /></ProtectedRoleRoute>} />
      <Route path="/customer/contact" element={<ProtectedRoleRoute requiredRole="customer"><ContactDealer /></ProtectedRoleRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoleRoute requiredRole="customer"><NotificationsPage /></ProtectedRoleRoute>} />
      <Route path="/customer/settings" element={<ProtectedRoleRoute requiredRole="customer"><SettingsPage /></ProtectedRoleRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppDataProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </AppDataProvider>
  </QueryClientProvider>
);

export default App;

