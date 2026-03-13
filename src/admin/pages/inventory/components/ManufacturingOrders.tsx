/**
 * Manufacturing Orders Component
 * Bulk order creation from pump demand forecasting alerts
 * Exports selected orders as Excel and sends to Warehouse Optimization
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Download,
  CheckSquare,
  Square,
  Check,
  AlertTriangle,
  Send,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Clock,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import { Button } from "@/admin/components/ui/button";
import { Badge } from "@/admin/components/ui/badge";
import { Input } from "@/admin/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import { Switch } from "@/admin/components/ui/switch";
// removed Table UI component imports
import type {
  StockAlert,
  HYDRAULICWarehouse,
  HYDRAULICInventoryItem,
} from "@/data/sixes-warehouse-data";
import { cn } from "@/admin/lib/utils";
import { useInventoryState } from "@/admin/context/InventoryStateContext";

interface ManufacturingOrdersProps {
  alerts: StockAlert[];
  warehouses: HYDRAULICWarehouse[];
  inventory: HYDRAULICInventoryItem[];
}

type Priority = "P1" | "P2" | "P3" | "P4";

interface OrderItem {
  alertId: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  reorderPoint: number;
  recommendedQuantity: number;
  editableQuantity: number;
  last3MonthSales: number;
  monthlyDemand: number;
  severity: string;
  type: string;
  message: string;
  priority: Priority;
}

// Synced JSON from Demand Forecasting (Prototype Data)
const SYNCED_FORECASTING_DATA = [
  {
    sku: "PVP16",
    m3: 12,
    m2: 15,
    m1: 18,
    pred: 20,
    avg6m: 14,
    region: "TX",
    regPct: 45,
    trend: "increasing",
    confidence: 0.92,
    currentStock: 8,
    severity: "critical",
    type: "urgent-reorder",
  },
  {
    sku: "505A",
    m3: 18,
    m2: 16,
    m1: 14,
    pred: 12,
    avg6m: 16,
    region: "CA",
    regPct: 38,
    trend: "decreasing",
    confidence: 0.88,
    currentStock: 45,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "PD018",
    m3: 10,
    m2: 12,
    m1: 15,
    pred: 18,
    avg6m: 12,
    region: "FL",
    regPct: 25,
    trend: "increasing",
    confidence: 0.85,
    currentStock: 12,
    severity: "warning",
    type: "shortage",
  },
  {
    sku: "OIL500",
    m3: 15,
    m2: 14,
    m1: 16,
    pred: 17,
    avg6m: 15,
    region: "NY",
    regPct: 30,
    trend: "stable",
    confidence: 0.9,
    currentStock: 30,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH1510-WCT",
    m3: 14,
    m2: 18,
    m1: 20,
    pred: 18,
    avg6m: 16,
    region: "TX",
    regPct: 42,
    trend: "decreasing",
    confidence: 0.82,
    currentStock: 35,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH2512-WCT",
    m3: 11,
    m2: 13,
    m1: 12,
    pred: 15,
    avg6m: 12,
    region: "GA",
    regPct: 28,
    trend: "increasing",
    confidence: 0.87,
    currentStock: 9,
    severity: "critical",
    type: "urgent-reorder",
  },
  {
    sku: "AH3008-WTC",
    m3: 16,
    m2: 15,
    m1: 14,
    pred: 16,
    avg6m: 15,
    region: "IL",
    regPct: 22,
    trend: "stable",
    confidence: 0.89,
    currentStock: 40,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH1512-WCT",
    m3: 13,
    m2: 12,
    m1: 15,
    pred: 19,
    avg6m: 14,
    region: "NC",
    regPct: 35,
    trend: "increasing",
    confidence: 0.91,
    currentStock: 14,
    severity: "warning",
    type: "shortage",
  },
  {
    sku: "AH1514-WCT",
    m3: 17,
    m2: 19,
    m1: 18,
    pred: 16,
    avg6m: 17,
    region: "AZ",
    regPct: 20,
    trend: "decreasing",
    confidence: 0.84,
    currentStock: 38,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH1506-WCT",
    m3: 12,
    m2: 11,
    m1: 14,
    pred: 15,
    avg6m: 12,
    region: "WA",
    regPct: 26,
    trend: "increasing",
    confidence: 0.86,
    currentStock: 25,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH2014-TR2",
    m3: 20,
    m2: 18,
    m1: 19,
    pred: 18,
    avg6m: 19,
    region: "OH",
    regPct: 24,
    trend: "stable",
    confidence: 0.88,
    currentStock: 10,
    severity: "critical",
    type: "urgent-reorder",
  },
  {
    sku: "AH2530-WCT",
    m3: 14,
    m2: 15,
    m1: 17,
    pred: 21,
    avg6m: 16,
    region: "PA",
    regPct: 32,
    trend: "increasing",
    confidence: 0.93,
    currentStock: 11,
    severity: "critical",
    type: "urgent-reorder",
  },
  {
    sku: "AH1518-WCT",
    m3: 16,
    m2: 14,
    m1: 12,
    pred: 11,
    avg6m: 14,
    region: "MI",
    regPct: 18,
    trend: "decreasing",
    confidence: 0.81,
    currentStock: 22,
    severity: "info",
    type: "replenishment",
  },
  {
    sku: "AH4024-LSP",
    m3: 10,
    m2: 12,
    m1: 15,
    pred: 18,
    avg6m: 12,
    region: "NJ",
    regPct: 27,
    trend: "increasing",
    confidence: 0.85,
    currentStock: 13,
    severity: "warning",
    type: "shortage",
  },
  {
    sku: "AH3030-WCT",
    m3: 19,
    m2: 16,
    m1: 18,
    pred: 17,
    avg6m: 18,
    region: "VA",
    regPct: 21,
    trend: "stable",
    confidence: 0.87,
    currentStock: 28,
    severity: "info",
    type: "replenishment",
  },
];

// Calculate priority based on severity and stock level
const calculatePriority = (severity: string, type: string): Priority => {
  if (severity === "critical") return "P1";
  if (severity === "warning") return "P2";
  if (severity === "info" && type !== "surplus") return "P3";
  return "P4";
};

export function ManufacturingOrders({
  alerts,
  warehouses,
  inventory,
}: ManufacturingOrdersProps) {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [priorityFilters, setPriorityFilters] = useState<Set<Priority>>(
    new Set(["P1", "P2", "P3", "P4"]),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const {
    updateInventory,
    optimizedOrders,
    addSubmittedOrders,
    clearRecentlyOptimized,
    toggleOrderReceived,
    updateOrderWarehouse,
  } = useInventoryState();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [manufacturingOrderFilter, setManufacturingOrderFilter] =
    useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  // Build order items based on synced JSON data
  const orderItems = useMemo((): OrderItem[] => {
    // Get list of SKUs already in manufacturing or pending (not received yet)
    const activeOrderSkus = new Set(
      optimizedOrders.filter((o) => o.status !== "received").map((o) => o.sku),
    );

    return SYNCED_FORECASTING_DATA.map((data, idx) => {
      // Logic for manufacturing needs based on forecasting
      const monthlyDemand = data.pred;
      const threeMonthSupply = monthlyDemand * 3;

      // Recommended: 3 month supply minus current stock, rounded to nice number
      let recommendedQuantity = Math.max(
        0,
        threeMonthSupply - data.currentStock,
      );
      recommendedQuantity = Math.ceil(recommendedQuantity / 5) * 5;

      const priority = calculatePriority(data.severity, data.type);

      return {
        alertId: `alert-${data.sku}-${idx}`,
        sku: data.sku,
        warehouseId: "WH-EAST",
        warehouseName: "North Carolina Warehouse",
        currentStock: data.currentStock,
        reorderPoint: Math.round(data.avg6m * 1.5),
        recommendedQuantity,
        editableQuantity:
          quantities[`alert-${data.sku}-${idx}`] || recommendedQuantity,
        last3MonthSales: data.m1 + data.m2 + data.m3,
        monthlyDemand,
        severity: data.severity as any,
        type: data.type,
        message:
          data.severity === "critical"
            ? `Urgent: Forecast projects ${data.pred} units this month`
            : `High demand growth trend in ${data.region}`,
        priority,
      };
    })
      .filter(
        (item) =>
          item.recommendedQuantity > 0 && !activeOrderSkus.has(item.sku),
      )
      .sort((a, b) => {
        const pMap = { P1: 1, P2: 2, P3: 3, P4: 4 };
        return pMap[a.priority] - pMap[b.priority];
      });
  }, [quantities, optimizedOrders]);

  // Filter by selected priorities
  const filteredOrderItems = useMemo(() => {
    return orderItems.filter((item) => priorityFilters.has(item.priority));
  }, [orderItems, priorityFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredOrderItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    return filteredOrderItems.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filteredOrderItems, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [priorityFilters]);

  // Toggle priority filter (ensure at least one is selected)
  const togglePriorityFilter = (priority: Priority) => {
    const newFilters = new Set(priorityFilters);
    if (newFilters.has(priority)) {
      // Don't allow removing if it's the last one
      if (newFilters.size > 1) {
        newFilters.delete(priority);
      }
    } else {
      newFilters.add(priority);
    }
    setPriorityFilters(newFilters);
    // Clear selections when filter changes
    setSelectedOrders(new Set());
  };

  // Toggle individual order selection
  const toggleOrderSelection = (alertId: string) => {
    const newSelection = new Set(selectedOrders);
    if (newSelection.has(alertId)) {
      newSelection.delete(alertId);
    } else {
      newSelection.add(alertId);
    }
    setSelectedOrders(newSelection);
  };

  // Toggle all orders (only filtered ones)
  const toggleAllOrders = () => {
    if (
      selectedOrders.size === filteredOrderItems.length &&
      filteredOrderItems.length > 0
    ) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(
        new Set(filteredOrderItems.map((item) => item.alertId)),
      );
    }
  };

  // Update quantity
  const updateQuantity = (alertId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [alertId]: Math.max(1, quantity) }));
  };

  // Calculate totals (using editable quantities)
  const selectedItems = filteredOrderItems.filter((item) =>
    selectedOrders.has(item.alertId),
  );
  const totalQuantity = selectedItems.reduce(
    (sum, item) => sum + item.editableQuantity,
    0,
  );

  const getPriorityBadgeClass = (priority: Priority) =>
    cn(
      "font-mono",
      (priority === "P1" || priority === "P2") &&
        "bg-red-600 text-white border-red-600",
      priority === "P3" && "bg-amber-500/10 text-amber-700 border-amber-500/30",
      priority === "P4" && "bg-muted text-muted-foreground border-border",
    );

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    optimizedOrders.forEach((order) => {
      const d = new Date(order.timestamp);
      const monthStr = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      months.add(monthStr);
    });
    return Array.from(months);
  }, [optimizedOrders]);

  // Submitted Orders should show only manufacturing submissions,
  // not internal optimization history rows created by inventory updates.
  const submittedOrders = optimizedOrders.filter(
    (order) => !order.id.startsWith("opt-"),
  );

  const ordersToDisplay = submittedOrders.filter((order) => {
    if (manufacturingOrderFilter === "received" && order.status !== "received")
      return false;
    if (
      manufacturingOrderFilter === "manufacturing" &&
      order.status !== "completed"
    )
      return false;

    if (monthFilter !== "all") {
      const d = new Date(order.timestamp);
      const monthStr = d.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (monthStr !== monthFilter) return false;
    }

    return true;
  });

  // Submit selected orders
  const handleSubmitOrders = () => {
    if (selectedOrders.size === 0) return;

    const timestamp = new Date().toISOString();

    const csvContent = [
      // Header
      [
        "Order ID",
        "SKU",
        "Current Warehouse",
        "Current Stock",
        "Reorder Point",
        "Last 3M Sales",
        "Target (3M Supply)",
        "Order Quantity",
        "Priority",
        "Severity",
      ].join(","),
      // Data rows
      ...selectedItems.map((item, index) => {
        const id = `MO-${Date.now()}-${index + 1}`;
        return [
          id,
          item.sku,
          item.warehouseName,
          item.currentStock,
          item.reorderPoint,
          item.last3MonthSales,
          item.monthlyDemand * 3,
          item.editableQuantity,
          item.priority,
          item.severity,
        ].join(",");
      }),
      // Summary
      "",
      "SUMMARY",
      `Total Items,${selectedItems.length}`,
      `Total Units to Manufacture,${totalQuantity}`,
      `Submit Date,${new Date().toISOString()}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manufacturing-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Save orders to localStorage for Warehouse Optimization to pick up
    const ordersData = selectedItems.map((item, index) => ({
      id: `MO-${Date.now()}-${index + 1}`,
      sku: item.sku,
      quantity: item.editableQuantity,
      priority: item.priority,
      currentWarehouse: item.warehouseId,
      createdDate: timestamp,
      status: "pending-placement",
    }));

    const existingOrders = JSON.parse(
      localStorage.getItem("pendingWarehousePlacements") || "[]",
    );
    const combinedOrders = [...existingOrders, ...ordersData];
    localStorage.setItem(
      "pendingWarehousePlacements",
      JSON.stringify(combinedOrders),
    );

    // Add to submitted orders timeline as "Not allocated"
    addSubmittedOrders(
      ordersData.map((o) => ({
        id: o.id,
        sku: o.sku,
        quantity: o.quantity,
      })),
    );

    // Clear selection after submit
    setSelectedOrders(new Set());

    setSubmittedCount(selectedItems.length);
    setShowSuccessDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Manufacturing Orders
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select items to manufacture and submit orders
          </p>
        </div>
        <div className="flex gap-2">
          {selectedOrders.size > 0 && (
            <Button
              onClick={handleSubmitOrders}
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit {selectedOrders.size} Order
              {selectedOrders.size > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>

      {/* Priority Filters */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Filter by Priority:
            </span>
          </div>
          <div className="flex items-center gap-4">
            {(["P1", "P2", "P3", "P4"] as Priority[]).map((priority) => {
              const count = orderItems.filter(
                (item) => item.priority === priority,
              ).length;
              const isChecked = priorityFilters.has(priority);
              const isDisabled = isChecked && priorityFilters.size === 1;

              return (
                <div key={priority} className="flex items-center gap-2">
                  <button
                    id={`priority-${priority}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => togglePriorityFilter(priority)}
                    aria-label={`Toggle ${priority} filter`}
                    className={cn(
                      "h-4 w-4 rounded-[2px] border border-muted-foreground/50 bg-transparent inline-flex items-center justify-center",
                      isChecked && "border-primary text-primary",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                  </button>
                  <label
                    htmlFor={`priority-${priority}`}
                    className={cn(
                      "text-sm cursor-pointer",
                      isDisabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <Badge
                      variant="outline"
                      className={getPriorityBadgeClass(priority)}
                    >
                      {priority}
                    </Badge>
                    <span className="ml-1.5 text-muted-foreground">
                      ({count})
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          At least one priority must be selected. P1 = Highest priority
          (Critical & Low Stock)
        </p>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Items Requiring Manufacturing
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filteredOrderItems.length} items match current filters
                </p>
                {selectedOrders.size > 0 && (
                  <p className="text-xs text-primary mt-1 font-medium">
                    {selectedOrders.size} selected •{" "}
                    {totalQuantity.toLocaleString()} total units
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedOrders.size > 0 && (
                <Button
                  onClick={() => setSelectedOrders(new Set())}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Clear Selection
                </Button>
              )}
              <Button
                onClick={toggleAllOrders}
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={filteredOrderItems.length === 0}
              >
                {selectedOrders.size === filteredOrderItems.length &&
                filteredOrderItems.length > 0 ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <Square className="h-3 w-3 mr-1" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {filteredOrderItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No manufacturing orders match filters
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust priority filters to see more items
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="w-12">
                    <span className="sr-only">Select</span>
                  </th>
                  <th>SKU</th>
                  <th>Past 3M Sales</th>
                  <th>Forecast (3M)</th>
                  <th>Current Stock</th>
                  <th>Order Quantity</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const isSelected = selectedOrders.has(item.alertId);
                  return (
                    <tr
                      key={item.alertId}
                      onClick={() => toggleOrderSelection(item.alertId)}
                      className={cn(
                        "transition-colors hover:bg-muted/50 cursor-pointer",
                        isSelected && "bg-muted/30 border-l-4 border-l-primary",
                      )}
                    >
                      <td>
                        <button
                          type="button"
                          aria-label={`Select ${item.sku}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOrderSelection(item.alertId);
                          }}
                          className={cn(
                            "h-4 w-4 rounded-[2px] border border-muted-foreground/50 bg-transparent inline-flex items-center justify-center",
                            isSelected && "border-primary text-primary",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.sku}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {item.last3MonthSales} units
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(item.last3MonthSales / 3)} avg/mo
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-blue-700">
                            {item.monthlyDemand * 3} units
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Target Inv
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1 items-start">
                          <Badge
                            variant={
                              item.currentStock < item.reorderPoint * 0.3
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {item.currentStock} units
                          </Badge>
                          {item.reorderPoint > item.currentStock ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                              <AlertTriangle className="h-3 w-3" />
                              Reorder Now
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">
                              Reorder at: {item.reorderPoint}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.editableQuantity}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              updateQuantity(item.alertId, parseInt(val) || 1);
                            }}
                            className={cn(
                              "w-28 h-9 text-sm font-semibold text-center border-2",
                              isSelected
                                ? "border-primary bg-muted/50"
                                : "border-muted-foreground/20",
                            )}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant="outline"
                          className={getPriorityBadgeClass(item.priority)}
                        >
                          {item.priority}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                filteredOrderItems.length,
              )}{" "}
              of {filteredOrderItems.length} items
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submitted Orders (Warehouse Allocation History) */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Submitted Orders
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {submittedOrders.length} total orders (
                {submittedOrders.filter((o) => o.status === "completed").length}{" "}
                in manufacturing,{" "}
                {submittedOrders.filter((o) => o.status === "received").length}{" "}
                received)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={manufacturingOrderFilter}
                onValueChange={setManufacturingOrderFilter}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="All Orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="manufacturing">
                    In Manufacturing
                  </SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {ordersToDisplay.length > 0 ? (
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="w-[140px]">Ordered Time</th>
                  <th className="w-[200px]">SKU</th>
                  <th className="w-[100px]">Quantity</th>
                  <th className="w-[220px]">Warehouse Allocated</th>
                  <th className="w-[180px] text-center !text-center">
                    Status Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersToDisplay.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/50 transition-colors group"
                  >
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(order.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{order.sku}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-lg">
                        {order.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">
                        units
                      </span>
                    </td>
                    <td>
                      {order.warehouseId === "UNALLOCATED" ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate("/admin/warehouse?tab=neworders")
                          }
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                          <WarehouseIcon className="h-3.5 w-3.5" />
                          Not allocated
                        </button>
                      ) : (
                        <Select
                          value={order.warehouseId}
                          onValueChange={(val) =>
                            updateOrderWarehouse(order.id, val)
                          }
                          disabled={order.status === "received"}
                        >
                          <SelectTrigger className="h-8 w-full min-w-[160px] max-w-[200px] inline-flex items-center gap-2 px-3 bg-slate-900 border border-slate-700 text-slate-50 hover:bg-slate-800 rounded-sm focus:ring-1 focus:ring-slate-500 text-xs font-medium transition-colors shadow-sm">
                            <WarehouseIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                            <SelectValue placeholder="Select warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((wh) => (
                              <SelectItem
                                key={wh.id}
                                value={wh.id}
                                className="text-xs"
                              >
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center justify-center min-h-[40px] gap-1.5">
                        <div className="flex items-center justify-center gap-3">
                          <span
                            className={cn(
                              "text-xs font-semibold tracking-wide uppercase",
                              order.warehouseId === "UNALLOCATED"
                                ? "text-muted-foreground"
                                : order.status === "received"
                                  ? "text-emerald-600"
                                  : "text-amber-500",
                            )}
                          >
                            {order.warehouseId === "UNALLOCATED"
                              ? "PENDING OPTIMIZATION"
                              : order.status === "received"
                                ? "RECEIVED"
                                : "MANUFACTURING"}
                          </span>
                          <Switch
                            checked={order.status === "received"}
                            onCheckedChange={(checked) =>
                              toggleOrderReceived([order.id], checked)
                            }
                            disabled={order.warehouseId === "UNALLOCATED"}
                            className={cn(
                              "border-2 border-white shadow-sm transition-all duration-300",
                              order.status === "received"
                                ? "data-[state=checked]:bg-emerald-500"
                                : "data-[state=unchecked]:bg-amber-500"
                            )}
                            thumbClassName="bg-white shadow-md data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
                          />
                        </div>
                        {order.receivedAt && order.status === "received" && (
                          <div className="text-[10px] whitespace-nowrap text-muted-foreground mr-1">
                            {new Date(order.receivedAt).toLocaleDateString()}{" "}
                            {new Date(order.receivedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>
              {optimizedOrders.length > 0
                ? "No orders match the current filter."
                : "Click 'Optimize' in Warehouse Optimization to create orders"}
            </p>
          </div>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-500" />
              Orders Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Your manufacturing orders have been submitted and exported.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 border border-border rounded-md p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium mb-2">
                    {submittedCount} manufacturing order
                    {submittedCount !== 1 ? "s" : ""} submitted successfully!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The orders have been saved and exported as CSV. Go to the
                    "Warehouse Optimization" tab to optimize warehouse placement
                    and update inventory.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                navigate("/admin/warehouse?tab=neworders");
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Go to Warehouse Optimization
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
