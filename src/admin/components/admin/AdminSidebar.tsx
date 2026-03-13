import { NavLink, useLocation, Link } from "react-router-dom";
import { useAdmin } from "@/admin/context/AdminContext";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileQuestion,
  ShoppingCart,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  SlidersHorizontal,
  LayoutGrid,
  Layers,
} from "lucide-react";
import { cn } from "@/admin/lib/utils";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/categories", label: "Categories", icon: FolderTree },
  { path: "/admin/quotes", label: "Quote Requests", icon: FileQuestion },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  {
    path: "/admin/inventory",
    label: "Inventory",
    icon: Package,
  },
  {
    path: "/admin/warehouse",
    label: "Warehouse",
    icon: Warehouse,
  },
  { path: "/admin/multi-channel", label: "Multi-Channel Ingestion", icon: Layers },
  { path: "/admin/customers", label: "Customers", icon: Users },
 // { path: "/admin/intelligence", label: "Simulator", icon: SlidersHorizontal },
  { path: "/admin/reports", label: "Reports", icon: BarChart3 },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useAdmin();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(90deg, #9b5796, #a879c6, #4f6aaf)' }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold" style={{ color: '#e5e5e5' }}>
                HYDRAULIC
              </span>
              <span className="text-xs" style={{ color: '#a0b3c2' }}>Pumps</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 mt-2">
        {navItems.map((item) => {
          // Use exact match for Dashboard (/admin), startsWith for others
          const isExactDashboard = item.path === "/admin";
          const isActive = isExactDashboard
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={isExactDashboard}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                !isActive && "text-[#e5e5e5] hover:bg-[#233548]",
              )}
              style={
                isActive
                  ? {
                    background: 'linear-gradient(90deg, #9b5796, #a879c6, #4f6aaf)',
                    color: '#ffffff',
                  }
                  : undefined
              }
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-white" : "text-[#e5e5e5]",
                )}
              />
              {!sidebarCollapsed && <span>{item.label}</span>}
              {isActive && !sidebarCollapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
          <div className="text-xs" style={{ color: '#a0b3c2' }}>
            <p>Admin Panel v1.0</p>
            <p className="mt-1">© 2024 HYDRAULIC pumps</p>
          </div>
        </div>
      )}
    </aside>
  );
}
