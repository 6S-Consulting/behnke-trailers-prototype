/**
 * Inventory Management Dashboard
 * HYDRAULIC pumps - Complete inventory tracking and optimization
 *
 * Complete Workflow Cycle:
 * 1. STOCK MANAGEMENT (This Page): View current stock allocation across all warehouses
 * 2. DEMAND FORECASTING (This Page): Identify items with low stock and high demand
 * 3. MANUFACTURING ORDERS (This Page): Create manufacturing orders based on demand forecasts
 * 4. WAREHOUSE OPTIMIZATION (Warehouse Page): Optimize which warehouse to send new orders to
 * 5. WAREHOUSE ALLOCATION (Warehouse Page): View and manage stock distribution
 * 6. PALLET OPTIMIZATION (Warehouse Page): Move excess stock to lower-cost warehouses
 *
 * Features:
 * - Stock Management: Real-time inventory tracking and adjustments
 * - Demand Forecasting: 6-month predictions with AI-powered insights
 * - Manufacturing Orders: Bulk order creation and Excel export
 * - AI Insights: Advanced analytics and recommendations
 * - AI Chatbot for insights
 * - Excel export functionality
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { Package, TrendingUp, Search, Plus, Brain } from "lucide-react";
import { cn } from "@/admin/lib/utils";
import { Button } from "@/admin/components/ui/button";
import { Badge } from "@/admin/components/ui/badge";
import { Input } from "@/admin/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";

// Data imports
import {
  getHYDRAULICWarehouseAnalytics,
  getHYDRAULICDashboardMetrics,
} from "@/data/sixes-data-initializer";
import { sixesWarehouses } from "@/data/sixes-warehouse-data";

// Import sub-components
import { StockManagement } from "./components/StockManagement";
import { DemandForecasting } from "./components/DemandForecasting";
import { ManufacturingOrders } from "./components/ManufacturingOrders";
import { WarehouseChatbot } from "../warehouse/components/WarehouseChatbot";
import { InventoryStateProvider, useInventoryState } from "@/admin/context/InventoryStateContext";

// Export utilities
import {
  exportCurrentInventory,
  exportReplenishmentRecommendations,
  exportAllData,
} from "@/admin/lib/export-utils";

type InventoryView = "stock" | "forecasting" | "manufacturing";

function InventoryManagementContent() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as InventoryView) || "stock";
  const [activeView, setActiveView] = useState<InventoryView>(initialTab);

  // Update active view if URL param changes
  useEffect(() => {
    const tab = searchParams.get("tab") as InventoryView;
    if (
      tab &&
      (tab === "stock" || tab === "forecasting" || tab === "manufacturing")
    ) {
      setActiveView(tab);
    }
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load data from context
  const { inventory, alerts } = useInventoryState();
  const analytics = useMemo(() => getHYDRAULICWarehouseAnalytics(), []); // Still needed for some static data if context doesn't have it
  const metrics = useMemo(() => getHYDRAULICDashboardMetrics(), []);

  const tabs = [
    {
      id: "stock" as InventoryView,
      label: "Stock Management",
      icon: Package,
    },
    {
      id: "forecasting" as InventoryView,
      label: "Demand Forecasting",
      icon: TrendingUp,
    },
    {
      id: "manufacturing" as InventoryView,
      label: "Manufacturing Orders",
      icon: Plus,
    },
  ];

  const handleExport = (type: string) => {
    switch (type) {
      case "current":
        exportCurrentInventory(analytics.inventory, sixesWarehouses);
        break;
      case "replenishment":
        exportReplenishmentRecommendations(analytics.inventory, sixesWarehouses);
        break;
      case "all":
        exportAllData(sixesWarehouses, analytics.inventory, analytics.alerts);
        break;
    }
  };

  return (
    <AdminLayout
      title="Inventory Management"
      subtitle="Pump stock monitoring • Demand forecasting • AI insights"
      hideAIAssistant={true}
    >
      <div className="space-y-6 pb-18">
        {/* Tab Navigation - Button Style like Reports */}
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => setActiveView(tab.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div>
          {activeView === "stock" && <StockManagement />}
          {activeView === "forecasting" && <DemandForecasting />}
          {activeView === "manufacturing" && (
            <ManufacturingOrders
              alerts={alerts}
              warehouses={sixesWarehouses}
              inventory={inventory}
            />
          )}
        </div>
      </div>

      {/* Warehouse AI Assistant */}
      <WarehouseChatbot
        warehouseData={{ warehouses: sixesWarehouses }}
        inventoryData={analytics}
      />
    </AdminLayout>
  );
}

export default function InventoryManagement() {
  return (
    <InventoryStateProvider>
      <InventoryManagementContent />
    </InventoryStateProvider>
  );
}
