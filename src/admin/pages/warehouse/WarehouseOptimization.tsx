/**
 * Warehouse Optimization Dashboard
 * HYDRAULIC pumps - Warehouse network optimization and analytics
 *
 * Complete Workflow Cycle:
 * 1. Stock Management (Inventory Page): View current stock allocation
 * 2. Demand Forecasting (Inventory Page): See low stock alerts and demand predictions
 * 3. MANUFACTURING ORDERS (Inventory Page): Create manufacturing orders from demand forecasts
 * 4. WAREHOUSE OPTIMIZATION (This Page): Optimize warehouse placement for manufactured items
 * 5. PALLET OPTIMIZATION (This Page): Move overstock to cheaper warehouses
 *
 * Tab Navigation:
 * - Overview: Map view with warehouse locations and performance metrics
 * - Warehouse Allocation: CRUD operations for warehouse management + product filters
 * - Warehouse Optimization: Warehouse placement recommendations for manufactured orders with Excel export
 * - Pallet Optimization: Identify overstock items to move to lower-cost warehouses
 *
 * Features:
 * - US map with warehouse locations
 * - Multi-warehouse allocation and rebalancing
 * - Cost optimization for new orders (shipping + pallet costs)
 * - Pallet optimization (20 pumps/pallet, $26-35/pallet)
 * - Network analytics
 * - AI Chatbot for insights
 * - Excel export functionality
 */

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import {
  Warehouse,
  Download,
  Search,
  Package,
  DollarSign,
  Activity,
  Calculator,
  AlertTriangle,
} from "lucide-react";
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
import { useInventoryState } from "@/admin/context/InventoryStateContext";

// Data imports
import { products as sixesProductMaster } from "@/data/products";
import { warehouses as sixesWarehouses } from "@/data/warehouse";
import { ManufacturingOrder } from "@/data/warehouse"; // Explicitly from warehouse.ts if defined there

// Component imports
import { WarehouseMap } from "./components/WarehouseMap";
import { WarehouseChatbot } from "./components/WarehouseChatbot";
import { PalletOptimization } from "./components/PalletOptimization";
import { NewOrderOptimization } from "./components/NewOrderOptimization";
import { WarehouseAllocation } from "../inventory/components/WarehouseAllocation";
import { InventoryStateProvider } from "@/admin/context/InventoryStateContext";

// Export utilities
import {
  exportWarehouseAnalytics,
  exportAllData,
} from "@/admin/lib/export-utils";

type WarehouseTab = "overview" | "allocation" | "neworders" | "pallets";

function WarehouseOptimizationContent() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as WarehouseTab) || "overview";
  const [warehouseTab, setWarehouseTab] = useState<WarehouseTab>(initialTab);

  // Update tab if URL param changes
  useEffect(() => {
    const tab = searchParams.get("tab") as WarehouseTab;
    if (
      tab &&
      (tab === "overview" ||
        tab === "allocation" ||
        tab === "neworders" ||
        tab === "pallets")
    ) {
      setWarehouseTab(tab);
    }
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [localInventory, setLocalInventory] = useState<any[]>([]);

  // Use inventory state context for shared state across pages
  const { updateInventory, inventory, alerts, getWarehouseUtilization } =
    useInventoryState();

  const warehouseUtilization = useMemo(
    () => getWarehouseUtilization(),
    [getWarehouseUtilization, inventory],
  );

  // Status filter for jumping from map
  const [allocationStatusFilter, setAllocationStatusFilter] = useState("all");

  // Compute analytics dynamically for chatbot and exports
  const analytics = useMemo(() => {
    return {
      inventory,
      alerts,
      warehouseStats: sixesWarehouses.map((w) => {
        const util = warehouseUtilization.get(w.id);
        const palletsUsed = util?.usedPallets || 0;
        return {
          warehouse: w,
          palletsUsed,
          utilizationPercent: util?.utilizationPercent || 0,
          monthlyCost: palletsUsed * w.costs.storagePerPalletMonth,
        };
      }),
    };
  }, [inventory, alerts, warehouseUtilization]);

  // Compute metrics dynamically based on shared inventory state
  const metrics = useMemo(() => {
    const totalStockCount = inventory.reduce((sum, inv) => sum + inv.onHand, 0);

    const totalInventoryValue = inventory.reduce((sum, inv) => {
      const product = sixesProductMaster.find((p) => p.id === inv.sku);
      return sum + inv.onHand * (product?.baseCost || 100);
    }, 0);

    // Calculate alerts based on low stock definition (available <= reorderPoint)
    // This ensures consistency between metric counts and the items seen in the Allocation tab
    const lowStockItems = inventory.filter(inv => inv.available <= inv.reorderPoint);
    
    const criticalAlerts = lowStockItems.filter(
      (item) => item.available <= item.reorderPoint * 0.3,
    ).length;
    
    const warningAlerts = lowStockItems.length - criticalAlerts;

    let totalPallets = 0;
    let monthlyStorageCost = 0;

    sixesWarehouses.forEach((warehouse) => {
      const util = warehouseUtilization.get(warehouse.id);
      if (util) {
        totalPallets += util.usedPallets;
        monthlyStorageCost +=
          util.usedPallets * warehouse.costs.storagePerPalletMonth;
      }
    });

    return {
      totalStockCount,
      totalInventoryValue,
      criticalAlerts,
      warningAlerts,
      totalAlerts: lowStockItems.length,
      totalPallets,
      monthlyStorageCost,
      warehouseCount: sixesWarehouses.length,
    };
  }, [inventory, alerts, warehouseUtilization]);

  // Initialize local inventory from context (use context inventory, not analytics)
  useMemo(() => {
    setLocalInventory(inventory);
  }, [inventory]);

  // Handle inventory update from manufacturing orders
  const handleInventoryUpdate = (
    sku: string,
    warehouseId: string,
    quantity: number,
  ) => {
    setLocalInventory((prev) =>
      prev.map((item) =>
        item.sku === sku && item.warehouseId === warehouseId
          ? {
              ...item,
              onHand: item.onHand + quantity,
              available: item.available + quantity,
            }
          : item,
      ),
    );
  };

  // Prepare warehouse summary for map
  const warehouseSummary = useMemo(() => {
    return sixesWarehouses.map((warehouse) => {
      const utilization = warehouseUtilization.get(warehouse.id);
      const warehouseAlerts = inventory.filter(
        (item) => item.warehouseId === warehouse.id && item.available <= item.reorderPoint,
      );

      return {
        warehouseId: warehouse.id,
        totalUnits: utilization?.totalUnits || 0,
        palletsUsed: utilization?.usedPallets || 0,
        monthlyStorageCost:
          (utilization?.usedPallets || 0) *
          warehouse.costs.storagePerPalletMonth,
        alerts: warehouseAlerts.length,
      };
    });
  }, [warehouseUtilization, alerts]);

  const handleExport = (type: string) => {
    switch (type) {
      case "warehouse":
        exportWarehouseAnalytics(
          sixesWarehouses,
          analytics.inventory,
          analytics.alerts,
        );
        break;
      case "all":
        exportAllData(sixesWarehouses, analytics.inventory, analytics.alerts);
        break;
    }
  };

  return (
    <AdminLayout
      title="Warehouse Optimization"
      subtitle="Network management • Warehouse allocation • Pallet optimization • Analytics"
      hideAIAssistant={true}
    >
      {/* Chatbot Assistant */}
      <WarehouseChatbot
        warehouseData={{ warehouses: sixesWarehouses }}
        inventoryData={analytics}
      />

      <div className="space-y-6 pb-18">
        {/* Tab Navigation - Button Style like Reports */}
        <div className="flex gap-2">
          <Button
            variant={warehouseTab === "overview" ? "default" : "outline"}
            onClick={() => {
              setWarehouseTab("overview");
              setAllocationStatusFilter("all");
            }}
            className="gap-2"
          >
            <Warehouse className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={warehouseTab === "allocation" ? "default" : "outline"}
            onClick={() => setWarehouseTab("allocation")}
            className="gap-2"
          >
            <Warehouse className="h-4 w-4" />
            Warehouse Allocation
          </Button>
          <Button
            variant={warehouseTab === "neworders" ? "default" : "outline"}
            onClick={() => setWarehouseTab("neworders")}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Warehouse Optimization
          </Button>
          <Button
            variant={warehouseTab === "pallets" ? "default" : "outline"}
            onClick={() => setWarehouseTab("pallets")}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Pallet Optimization
          </Button>
        </div>

        {/* Warehouse Content */}
        {warehouseTab === "overview" && (
          <div className="space-y-6">
            {/* Network Analytics summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Total Stock Count
                  </h4>
                  <Package className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">
                  {metrics.totalStockCount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Units across all warehouses
                </p>
              </div>

              <div className="bg-card border border-border rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Network Value
                  </h4>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold">
                  $
                  {metrics.totalInventoryValue.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {metrics.warehouseCount} warehouses
                </p>
              </div>

              <div className="bg-card border border-border rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Monthly Storage
                  </h4>
                  <Calculator className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold">
                  $
                  {metrics.monthlyStorageCost.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.totalPallets.toLocaleString()} pallets in storage
                </p>
              </div>

              <div className="bg-card border border-border rounded-sm p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    Stock Alerts
                  </h4>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">
                  {metrics.totalAlerts}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.criticalAlerts} critical, {metrics.warningAlerts}{" "}
                  warning alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-4 pt-4 border-t border-border">
              <Warehouse className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">
                Individual Warehouse Performance
              </h3>
            </div>

            {/* Warehouse Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sixesWarehouses.map((warehouse) => {
                const summary = warehouseSummary.find(
                  (s) => s.warehouseId === warehouse.id,
                );
                const utilization = warehouseUtilization.get(warehouse.id);
                return (
                  <div
                    key={warehouse.id}
                    className="bg-card border border-border rounded-sm p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {warehouse.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {warehouse.location.city}, {warehouse.location.state}
                        </p>
                      </div>
                      <Warehouse className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Units:
                        </span>
                        <span className="text-foreground font-medium">
                          {summary?.totalUnits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pallets Used:
                        </span>
                        <span className="text-foreground font-medium">
                          {summary?.palletsUsed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Storage Cost:
                        </span>
                        <span className="text-foreground font-medium">
                          ${(summary?.monthlyStorageCost || 0).toFixed(0)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alerts:</span>
                        <span
                          className={cn(
                            "font-medium",
                            (summary?.alerts || 0) > 0
                              ? "text-red-400"
                              : "text-emerald-400",
                          )}
                        >
                          {summary?.alerts || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map View */}
            <WarehouseMap
              warehouses={sixesWarehouses}
              inventorySummary={warehouseSummary}
              onWarehouseClick={(id) => {
                setWarehouseFilter(id);
                setAllocationStatusFilter("low-stock");
                setWarehouseTab("allocation");
              }}
            />
          </div>
        )}

        {warehouseTab === "allocation" && (
          <WarehouseAllocation
            initialWarehouse={warehouseFilter}
            initialStatus={allocationStatusFilter}
          />
        )}

        {warehouseTab === "neworders" && (
          <NewOrderOptimization
            warehouses={sixesWarehouses}
            inventory={localInventory}
            onInventoryUpdate={updateInventory}
          />
        )}

        {warehouseTab === "pallets" && (
          <PalletOptimization
            warehouses={sixesWarehouses}
            inventory={localInventory}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export default function WarehouseOptimization() {
  return (
    <InventoryStateProvider>
      <WarehouseOptimizationContent />
    </InventoryStateProvider>
  );
}
