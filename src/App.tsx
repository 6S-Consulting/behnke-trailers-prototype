import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";
import { TrailersPage } from "./trailers/pages/TrailersPage.tsx";
import { DirectionalDrillTiltTrailerDetails } from "./trailers/pages/DirectionalDrillTiltTrailerDetails.tsx";
import { DirectionalDrillTiltTrailer3DPage } from "./trailers/pages/DirectionalDrillTiltTrailer3DPage.tsx";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard";
import InventoryManagement from "./admin/InventoryManagement";
import DealerManagement from "./admin/DealerManagement";
import TrailerHealthOverview from "./admin/TrailerHealthOverview";
import SensorDataDetail from "./admin/SensorDataDetail";
import MaintenanceSlotManager from "./admin/MaintenanceSlotManager";
import AdminOrders from "./admin/AdminOrders";

// Dealer Pages
import DealerDashboard from "./dealer/DealerDashboard";
import DealerOrders from "./dealer/DealerOrders";
import DealerQuotes from "./dealer/DealerQuotes";
import DealerStock from "./dealer/DealerStock";

// Customer Pages
import CustomerDashboard from "./customer/CustomerDashboard";
import CustomerHealth from "./customer/CustomerHealth";
import CustomerQuotes from "./customer/CustomerQuotes";
import ContactDealer from "./customer/ContactDealer";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Site */}
      <Route path="/" element={<Index />} />
      <Route path="/trailers" element={<TrailersPage />} />
      <Route path="/trailers/:slug" element={<DirectionalDrillTiltTrailerDetails />} />
      <Route path="/trailers/:slug/3d" element={<DirectionalDrillTiltTrailer3DPage />} />
      
      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
      <Route path="/admin/dealers" element={<ProtectedRoute><DealerManagement /></ProtectedRoute>} />
      <Route path="/admin/health" element={<ProtectedRoute><TrailerHealthOverview /></ProtectedRoute>} />
      <Route path="/admin/health/:vin" element={<ProtectedRoute><SensorDataDetail /></ProtectedRoute>} />
      <Route path="/admin/maintenance" element={<ProtectedRoute><MaintenanceSlotManager /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />

      {/* Dealer */}
      <Route path="/dealer" element={<ProtectedRoute><DealerDashboard /></ProtectedRoute>} />
      <Route path="/dealer/orders" element={<ProtectedRoute><DealerOrders /></ProtectedRoute>} />
      <Route path="/dealer/quotes" element={<ProtectedRoute><DealerQuotes /></ProtectedRoute>} />
      <Route path="/dealer/stock" element={<ProtectedRoute><DealerStock /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/health" element={<ProtectedRoute><CustomerHealth /></ProtectedRoute>} />
      <Route path="/customer/quotes" element={<ProtectedRoute><CustomerQuotes /></ProtectedRoute>} />
      <Route path="/customer/contact" element={<ProtectedRoute><ContactDealer /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

