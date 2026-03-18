import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RouterProvider } from "@/lib/router";
import { Layout } from "@/components/layout/Layout";
import { CartProvider } from "@/context/CartContext";
import { SearchProvider } from "@/context/SearchContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import { AddressProvider } from "@/context/AddressContext";
import { PaymentMethodProvider } from "@/context/PaymentMethodContext";
import { QuoteProvider } from "@/context/QuoteContext";
import { WarrantyProvider } from "@/context/WarrantyContext";
import { CompareProvider } from "@/context/CompareContext";

// Eagerly load critical pages
import { Home } from "@/pages/Home";

// Lazy load non-critical pages
const Catalog = lazy(() =>
  import("@/pages/Catalog").then((m) => ({ default: m.Catalog })),
);
const ProductDetails = lazy(() =>
  import("@/pages/ProductDetails").then((m) => ({ default: m.ProductDetails })),
);
const RequestQuote = lazy(() =>
  import("@/pages/RequestQuote").then((m) => ({ default: m.RequestQuote })),
);
const Login = lazy(() =>
  import("@/pages/Login").then((m) => ({ default: m.Login })),
);
const Register = lazy(() =>
  import("@/pages/Register").then((m) => ({ default: m.Register })),
);
const Wishlist = lazy(() =>
  import("@/pages/Wishlist").then((m) => ({ default: m.Wishlist })),
);
const Account = lazy(() =>
  import("@/pages/Account").then((m) => ({ default: m.Account })),
);
const Checkout = lazy(() =>
  import("@/pages/Checkout").then((m) => ({ default: m.Checkout })),
);
const Warranty = lazy(() =>
  import("@/pages/Warranty").then((m) => ({ default: m.Warranty })),
);
const Contact = lazy(() =>
  import("@/pages/Contact").then((m) => ({ default: m.Contact })),
);
const SupportChat = lazy(() =>
  import("./pages/SupportChat").then((m) => ({ default: m.SupportChat })),
);

const Compare = lazy(() =>
  import("@/pages/Compare").then((m) => ({ default: m.Compare })),
);
const TrailersPage = lazy(() =>
  import("@/trailer/TrailersPage").then((m) => ({ default: m.TrailersPage })),
);
const DirectionalDrillTiltTrailerDetails = lazy(() =>
  import("@/trailer/DirectionalDrillTiltTrailerDetails").then((m) => ({
    default: m.DirectionalDrillTiltTrailerDetails,
  })),
);
const DirectionalDrillTiltTrailer3DPage = lazy(() =>
  import("@/trailer/DirectionalDrillTiltTrailer3DPage").then((m) => ({
    default: m.DirectionalDrillTiltTrailer3DPage,
  })),
);

// Admin Imports
import "@/App.css"; // Import Admin scoped styles
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/admin/components/ui/toaster";
import { Toaster as Sonner } from "@/admin/components/ui/sonner";
import { TooltipProvider } from "@/admin/components/ui/tooltip";
import { AdminProvider } from "@/admin/context/AdminContext";
import { MultiChannelProvider } from "@/admin/context/MultiChannelContext";

// Lazy load admin pages
const Dashboard = lazy(() => import("@/admin/pages/Dashboard"));
const Products = lazy(() => import("@/admin/pages/Products"));
const ProductForm = lazy(() => import("@/admin/pages/ProductForm"));
const Categories = lazy(() => import("@/admin/pages/Categories"));
const Quotes = lazy(() => import("@/admin/pages/Quotes"));
const QuoteDetails = lazy(() => import("@/admin/pages/QuoteDetails"));
const Orders = lazy(() => import("@/admin/pages/Orders"));
const Inventory = lazy(() => import("@/admin/pages/inventory/Inventory"));
const InventoryManagement = lazy(
  () => import("@/admin/pages/inventory/InventoryManagement"),
);
const WarehouseOptimization = lazy(
  () => import("@/admin/pages/warehouse/WarehouseOptimization"),
);
const Customers = lazy(() => import("@/admin/pages/Customers"));
const Reports = lazy(() => import("@/admin/pages/Reports"));
const Settings = lazy(() => import("@/admin/pages/Settings"));
const IntelligenceLayer = lazy(() => import("@/admin/pages/IntelligenceLayer"));
const MultiChannelIngestion = lazy(
  () => import("@/admin/pages/MultiChannelIngestion"),
);
const AddCustomChannel = lazy(() => import("@/admin/pages/AddCustomChannel"));
const ChannelDetail = lazy(() => import("@/admin/pages/ChannelDetail"));

import { ErrorBoundary } from "@/components/system/ErrorBoundary";
// Under Construction component
function UnderConstruction() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-4">Under Construction</h1>
      <p className="text-slate-500">This page is coming soon.</p>
    </div>
  );
}

const queryClient = new QueryClient();

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

// Helper layout for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <Layout>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </Layout>
);

// Admin Route Wrapper for scoping CSS
const AdminRouteWrapper = () => (
  <div className="admin-theme min-h-screen">
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  </div>
);

// Multi-Channel layout route — shares provider state across sub-routes
const MultiChannelWrapper = () => (
  <MultiChannelProvider>
    <Outlet />
  </MultiChannelProvider>
);

function App() {
  return (
    <BrowserRouter>
      {/* 
         RouterProvider (shim) is used here to provide compatibility for components 
         using the old custom router hooks (useRouter, Link).
      */}
      <RouterProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SearchProvider>
              <WishlistProvider>
                <CartProvider>
                  <OrderProvider>
                    <AddressProvider>
                      <PaymentMethodProvider>
                        <QuoteProvider>
                          <WarrantyProvider>
                            <CompareProvider>
                              <TooltipProvider>
                                <AdminProvider>
                                  <ErrorBoundary>
                                    <Routes>
                                      {/* Public Routes */}
                                      <Route
                                        path="/"
                                        element={
                                          <PublicLayout>
                                            <Home />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/catalog"
                                        element={
                                          <PublicLayout>
                                            <Catalog />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/product/:id"
                                        element={
                                          <PublicLayout>
                                            <ProductDetails />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/request-quote"
                                        element={
                                          <PublicLayout>
                                            <RequestQuote />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/login"
                                        element={
                                          <PublicLayout>
                                            <Login />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/register"
                                        element={
                                          <PublicLayout>
                                            <Register />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/wishlist"
                                        element={
                                          <PublicLayout>
                                            <Wishlist />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/account"
                                        element={
                                          <PublicLayout>
                                            <Account />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/checkout"
                                        element={
                                          <PublicLayout>
                                            <Checkout />
                                          </PublicLayout>
                                        }
                                      />

                                      {/* Pages */}
                                      <Route
                                        path="/warranty"
                                        element={
                                          <PublicLayout>
                                            <Warranty />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/contact"
                                        element={
                                          <PublicLayout>
                                            <Contact />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/support-chat"
                                        element={
                                          <PublicLayout>
                                            <SupportChat />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/compare"
                                        element={
                                          <PublicLayout>
                                            <Compare />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/trailers"
                                        element={
                                          <PublicLayout>
                                            <TrailersPage />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/trailers/directional-drill-tilt-trailer"
                                        element={
                                          <PublicLayout>
                                            <DirectionalDrillTiltTrailerDetails />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/trailers/directional-drill-tilt-trailer/3d"
                                        element={
                                          <PublicLayout>
                                            <DirectionalDrillTiltTrailer3DPage />
                                          </PublicLayout>
                                        }
                                      />

                                      {/* Under Construction Pages */}
                                      <Route
                                        path="/about"
                                        element={
                                          <PublicLayout>
                                            <UnderConstruction />
                                          </PublicLayout>
                                        }
                                      />
                                      <Route
                                        path="/industries"
                                        element={
                                          <PublicLayout>
                                            <UnderConstruction />
                                          </PublicLayout>
                                        }
                                      />

                                      {/* Admin Routes Wrapped in Theme Scope */}
                                      <Route element={<AdminRouteWrapper />}>
                                        <Route
                                          path="/admin"
                                          element={<Dashboard />}
                                        />
                                        <Route
                                          path="/admin/products"
                                          element={<Products />}
                                        />
                                        <Route
                                          path="/admin/products/new"
                                          element={<ProductForm />}
                                        />
                                        <Route
                                          path="/admin/products/:id"
                                          element={<ProductForm />}
                                        />
                                        <Route
                                          path="/admin/products/:id/edit"
                                          element={<ProductForm />}
                                        />
                                        <Route
                                          path="/admin/categories"
                                          element={<Categories />}
                                        />
                                        <Route
                                          path="/admin/quotes"
                                          element={<Quotes />}
                                        />
                                        <Route
                                          path="/admin/quotes/:id"
                                          element={<QuoteDetails />}
                                        />
                                        <Route
                                          path="/admin/orders"
                                          element={<Orders />}
                                        />
                                        <Route
                                          path="/admin/inventory"
                                          element={<InventoryManagement />}
                                        />
                                        <Route
                                          path="/admin/warehouse"
                                          element={<WarehouseOptimization />}
                                        />
                                        <Route
                                          path="/admin/inventory/old"
                                          element={<Inventory />}
                                        />
                                        <Route
                                          path="/admin/inventory/legacy"
                                          element={<Inventory />}
                                        />
                                        <Route
                                          element={<MultiChannelWrapper />}
                                        >
                                          <Route
                                            path="/admin/multi-channel"
                                            element={<MultiChannelIngestion />}
                                          />
                                          <Route
                                            path="/admin/multi-channel/add-custom"
                                            element={<AddCustomChannel />}
                                          />
                                          <Route
                                            path="/admin/multi-channel/channel/:channelName"
                                            element={<ChannelDetail />}
                                          />
                                        </Route>
                                        <Route
                                          path="/admin/customers"
                                          element={<Customers />}
                                        />
                                        <Route
                                          path="/admin/reports"
                                          element={<Reports />}
                                        />
                                        <Route
                                          path="/admin/settings"
                                          element={<Settings />}
                                        />
                                        <Route
                                          path="/admin/intelligence"
                                          element={<IntelligenceLayer />}
                                        />
                                        <Route
                                          path="/admin/intelligence/:quoteId"
                                          element={<IntelligenceLayer />}
                                        />
                                      </Route>

                                      {/* Fallback */}
                                      <Route
                                        path="*"
                                        element={
                                          <div className="flex h-screen flex-col items-center justify-center">
                                            <h1 className="text-4xl font-bold">
                                              404
                                            </h1>
                                            <p className="mb-4">
                                              Page Not Found
                                            </p>
                                            <Link
                                              to="/"
                                              className="text-blue-500 hover:underline"
                                            >
                                              Go Home
                                            </Link>
                                          </div>
                                        }
                                      />
                                    </Routes>
                                  </ErrorBoundary>
                                  <Toaster />
                                  <Sonner />
                                </AdminProvider>
                              </TooltipProvider>
                            </CompareProvider>
                          </WarrantyProvider>
                        </QuoteProvider>
                      </PaymentMethodProvider>
                    </AddressProvider>
                  </OrderProvider>
                </CartProvider>
              </WishlistProvider>
            </SearchProvider>
          </AuthProvider>
        </QueryClientProvider>
      </RouterProvider>
    </BrowserRouter>
  );
}

export default App;
