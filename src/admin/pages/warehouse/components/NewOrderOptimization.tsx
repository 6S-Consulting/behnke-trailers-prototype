/**
 * New Order Optimization Component
 * Shows warehouse placement recommendations for manufactured orders
 * Exports recommendations to Excel
 *
 * Pallet Logic: Each SKU/variety must be on separate pallet(s) - no mixing
 * Even 1 unit of a different SKU requires its own pallet
 */

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HYDRAULICWarehouse,
  HYDRAULICInventoryItem,
} from "@/data/sixes-warehouse-data";
import { useInventoryState } from "@/admin/context/InventoryStateContext";
// removed Table UI component imports
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  TrendingDown,
  Package,
  DollarSign,
  MapPin,
  CheckCircle,
  AlertCircle,
  FileDown,
  ArrowRight,
} from "lucide-react";

const PUMPS_PER_PALLET = 12;

interface NewOrderOptimizationProps {
  warehouses: HYDRAULICWarehouse[];
  inventory: HYDRAULICInventoryItem[];
  onInventoryUpdate?: (
    sku: string,
    warehouseId: string,
    quantity: number,
  ) => void;
}

interface PendingOrder {
  id: string;
  sku: string;
  quantity: number;
  currentWarehouse: string;
  createdDate: string;
  status: string;
}

interface OptimizationRecommendation {
  orderId: string;
  sku: string;
  quantity: number;
  palletsNeeded: number;
  recommendedWarehouse: HYDRAULICWarehouse;
  totalCost: number;
  shippingCost: number;
  storageCost: number;
  reasoningScore: number;
  reasoning: string;
  freePallets: number; // Dynamic free pallets
  alternativeWarehouses: {
    warehouse: HYDRAULICWarehouse;
    totalCost: number;
  }[];
}

export function NewOrderOptimization({
  warehouses,
  inventory,
  onInventoryUpdate,
}: NewOrderOptimizationProps) {
  const navigate = useNavigate();
  const {
    updateOrderWarehouse,
    addSubmittedOrders,
    optimizedOrders: submittedOrders,
  } = useInventoryState();
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [optimizedOrders, setOptimizedOrders] = useState<
    OptimizationRecommendation[]
  >([]);

  // Load pending orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      const stored = localStorage.getItem("pendingWarehousePlacements");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as PendingOrder[];
          const realOnly = parsed.filter(
            (o) => !o.id.startsWith("MFG-SAMPLE"),
          );
          setPendingOrders(
            realOnly.length > 0
              ? realOnly
              : [
                {
                  id: "MFG-SAMPLE-001",
                  sku: "PMP-G2.5-2500",
                  quantity: 120,
                  currentWarehouse: "Manufacturing (India)",
                  createdDate: new Date(
                    Date.now() - 2 * 60 * 60 * 1000,
                  ).toISOString(),
                  status: "Pending",
                },
              ],
          );
        } catch {
          // fall back to single sample if parsing fails
          setPendingOrders([
            {
              id: "MFG-SAMPLE-001",
              sku: "PMP-G2.5-2500",
              quantity: 120,
              currentWarehouse: "Manufacturing (India)",
              createdDate: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              status: "Pending",
            },
          ]);
        }
      } else {
        // Single inline sample order for Warehouse Optimization (no external data)
        const sampleOrders: PendingOrder[] = [
          {
            id: "MFG-SAMPLE-001",
            sku: "PMP-G2.5-2500",
            quantity: 120,
            currentWarehouse: "Manufacturing (India)",
            createdDate: new Date(
              Date.now() - 2 * 60 * 60 * 1000,
            ).toISOString(),
            status: "Pending",
          },
        ];
        setPendingOrders(sampleOrders);
      }
    };
    loadOrders();
  }, [refreshKey]);

  // Calculate optimal warehouse for each pending order
  const recommendations = useMemo(() => {
    // First, calculate current warehouse utilization dynamically
    const warehouseUtilization = new Map<
      string,
      { usedPallets: number; freePallets: number; utilizationRate: number }
    >();

    warehouses.forEach((warehouse) => {
      const warehouseInventory = inventory.filter(
        (item) => item.warehouseId === warehouse.id,
      );
      // Calculate pallets per SKU (no mixing varieties on pallets)
      const usedPallets = warehouseInventory.reduce((totalPallets, item) => {
        // Each SKU gets its own pallet(s)
        const palletsForThisSKU = Math.ceil(item.onHand / PUMPS_PER_PALLET);
        return totalPallets + palletsForThisSKU;
      }, 0);
      const freePallets = Math.max(
        0,
        warehouse.capacity.totalPallets - usedPallets,
      );
      const utilizationRate = usedPallets / warehouse.capacity.totalPallets;

      warehouseUtilization.set(warehouse.id, {
        usedPallets,
        freePallets,
        utilizationRate,
      });
    });

    return pendingOrders
      .map((order): OptimizationRecommendation | null => {
        const palletsNeeded = Math.ceil(order.quantity / PUMPS_PER_PALLET);

        // Calculate total cost for each warehouse
        const warehouseCosts = warehouses.map((warehouse) => {
          // Get dynamic utilization
          const util = warehouseUtilization.get(warehouse.id)!;

          // Storage cost per month for required pallets
          const storageCost =
            palletsNeeded * warehouse.costs.storagePerPalletMonth;

          // Estimate shipping cost
          const inventoryInWarehouse = inventory.filter(
            (item) =>
              item.warehouseId === warehouse.id && item.sku === order.sku,
          );
          const currentStock =
            inventoryInWarehouse.reduce((sum, item) => sum + item.onHand, 0) ||
            0;

          const hasExistingStock = currentStock > 0;
          const utilizationRate = util.utilizationRate;

          // Base shipping cost estimate
          let shippingCost =
            order.quantity * warehouse.costs.outboundPerUnit +
            warehouse.costs.outboundPerOrder;

          // Adjust based on existing presence
          if (hasExistingStock) {
            shippingCost *= 0.8; // 20% discount for existing SKU
          }
          if (utilizationRate < 0.5) {
            shippingCost *= 1.1; // 10% penalty for underutilized warehouse
          }

          const totalCost = storageCost + shippingCost;
          const hasSpace = util.freePallets >= palletsNeeded;

          // Calculate reasoning score (0-100)
          const costScore = Math.max(
            0,
            100 -
            (totalCost /
              Math.max(
                ...warehouses.map(
                  (w) => w.costs.storagePerPalletMonth * palletsNeeded + 500,
                ),
              )) *
            100,
          );
          const utilizationScore = utilizationRate * 30;
          const existingStockScore = hasExistingStock ? 20 : 0;
          const capacityScore = hasSpace ? 20 : -20;

          const reasoningScore = Math.max(
            0,
            Math.min(
              100,
              costScore + utilizationScore + existingStockScore + capacityScore,
            ),
          );

          return {
            warehouse,
            totalCost,
            storageCost,
            shippingCost,
            reasoningScore,
            hasSpace,
            hasExistingStock,
            utilizationRate,
          };
        });

        // Sort by reasoning score (best first)
        warehouseCosts.sort((a, b) => b.reasoningScore - a.reasoningScore);

        // Find best warehouse that isn't over 90% utilized
        let best = warehouseCosts[0];
        if (best && best.utilizationRate > 0.9) {
          // If best option is over 90% utilized, find next best with lower utilization
          const alternative = warehouseCosts.find(
            (wc) => wc.utilizationRate <= 0.9 && wc.hasSpace,
          );
          if (alternative) {
            best = alternative;
          }
        }

        if (!best) return null;

        // Get dynamic free pallets for the best warehouse
        const bestWarehouseUtil = warehouseUtilization.get(best.warehouse.id)!;

        // Build reasoning text
        let reasoning = `Recommended warehouse based on regional demand. Optimized monthly pallet storage cost ($${best.storageCost.toFixed(0)}) with lowest shipping rates to destination.`;
        if (best.hasExistingStock) {
          reasoning += ` Consolidation: SKU already exists in ${best.warehouse.location.state}.`;
        }
        if (!best.hasSpace) {
          reasoning = `⚠️ Capacity Warning: ` + reasoning;
        }

        return {
          orderId: order.id,
          sku: order.sku,
          quantity: order.quantity,
          palletsNeeded,
          recommendedWarehouse: best.warehouse,
          totalCost: best.totalCost,
          shippingCost: best.shippingCost,
          storageCost: best.storageCost,
          reasoningScore: Math.round(best.reasoningScore),
          reasoning,
          freePallets: bestWarehouseUtil.freePallets,
          alternativeWarehouses: warehouseCosts.slice(1, 3).map((alt) => ({
            warehouse: alt.warehouse,
            totalCost: alt.totalCost,
          })),
        };
      })
      .filter((rec): rec is OptimizationRecommendation => rec !== null);
  }, [pendingOrders, warehouses, inventory]);

  // Calculate totals
  const totalPalletsToPlace = recommendations.reduce(
    (sum, rec) => sum + rec.palletsNeeded,
    0,
  );
  const totalMonthlyCost = recommendations.reduce(
    (sum, rec) => sum + rec.totalCost,
    0,
  );

  // Optimize: Assign products to warehouses and update inventory
  const handleOptimize = () => {
    if (recommendations.length === 0) return;

    // Ensure any orders that originated only in Warehouse Optimization
    // also appear in Submitted Orders
    const missingSubmitted = recommendations.filter(
      (rec) => !submittedOrders.some((o) => o.id === rec.orderId),
    );
    if (missingSubmitted.length > 0) {
      addSubmittedOrders(
        missingSubmitted.map((rec) => ({
          id: rec.orderId,
          sku: rec.sku,
          quantity: rec.quantity,
        })),
      );
    }

    // Update inventory with optimized placements
    recommendations.forEach((rec) => {
      if (onInventoryUpdate) {
        // Add inventory to the RECOMMENDED warehouse (not current warehouse)
        onInventoryUpdate(rec.sku, rec.recommendedWarehouse.id, rec.quantity);
      }

      // Mark submitted orders as allocated in the shared optimized orders timeline
      updateOrderWarehouse(rec.orderId, rec.recommendedWarehouse.id);
    });

    // Clear orders from localStorage
    localStorage.removeItem("pendingWarehousePlacements");
    setPendingOrders([]);

    setOptimizedOrders(recommendations);
    setShowSuccessDialog(true);
  };

  // Download: Export recommendations to CSV only
  const handleDownload = () => {
    if (recommendations.length === 0) return;

    const csvContent = [
      // Header
      [
        "Order ID",
        "SKU",
        "Quantity",
        "Pallets Needed",
        "Recommended Warehouse",
        "Warehouse City",
        "Warehouse State",
        "Storage Cost/Month",
        "Shipping Cost/Month",
        "Total Cost/Month",
        "Confidence Score",
        "Reason",
      ].join(","),
      // Data rows
      ...recommendations.map((rec) =>
        [
          rec.orderId,
          rec.sku,
          rec.quantity,
          rec.palletsNeeded,
          rec.recommendedWarehouse.name,
          rec.recommendedWarehouse.location.city,
          rec.recommendedWarehouse.location.state,
          rec.storageCost.toFixed(2),
          rec.shippingCost.toFixed(2),
          rec.totalCost.toFixed(2),
          rec.reasoningScore,
          `"${rec.reasoning}"`,
        ].join(","),
      ),
      // Summary
      "",
      "SUMMARY",
      `Total Orders,${recommendations.length}`,
      `Total Pallets to Place,${totalPalletsToPlace}`,
      `Total Monthly Cost,$${totalMonthlyCost.toFixed(2)}`,
      `Export Date,${new Date().toISOString()}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warehouse-placement-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-border rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              New Order Warehouse Placement
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {recommendations.length} orders awaiting warehouse assignment
            </p>
          </div>
          <div className="flex gap-2">
            {recommendations.length > 0 && (
              <>
                <Button
                  onClick={handleOptimize}
                  variant="default"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Optimize
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-emerald-600">
                Optimized Cost: ${totalMonthlyCost.toFixed(0)}/month
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-muted-foreground">
                {totalPalletsToPlace} pallets to allocate
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Warehouse Placement Optimization
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Optimized for lowest shipping + pallet storage costs
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No pending orders
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create manufacturing orders from the Inventory page to see
              warehouse placement optimization here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Order / SKU</th>
                  <th>Quantity</th>
                  <th>Pallets</th>
                  <th>Recommended Warehouse</th>
                  <th>Storage Cost</th>
                  <th>Shipping Cost</th>
                  <th className="text-right">Total Cost</th>
                  <th className="text-center align-middle">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => {
                  const hasSpace = rec.freePallets >= rec.palletsNeeded;

                  return (
                    <tr key={rec.orderId}>
                      <td>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            #{rec.orderId.slice(0, 12)}
                          </p>
                          <p className="font-medium text-sm">{rec.sku}</p>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium">{rec.quantity}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          units
                        </span>
                      </td>
                      <td>
                        <Badge variant="secondary" className="font-medium">
                          {rec.palletsNeeded}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-start gap-2">
                          <MapPin
                            className={`h-4 w-4 mt-0.5 ${hasSpace ? "text-emerald-600" : "text-amber-600"}`}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {rec.recommendedWarehouse.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {rec.recommendedWarehouse.location.city},{" "}
                              {rec.recommendedWarehouse.location.state}
                            </p>
                            <p
                              className={`text-xs mt-0.5 ${hasSpace ? "text-emerald-600" : "text-amber-600"}`}
                            >
                              {rec.freePallets} pallets free
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-medium text-sm">
                          ${rec.storageCost.toFixed(2)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          $
                          {rec.recommendedWarehouse.costs.storagePerPalletMonth.toFixed(
                            2,
                          )}<br />
                          /pallet/month
                        </p>
                      </td>
                      <td>
                        <span className="font-medium text-sm">
                          ${rec.shippingCost.toFixed(2)}
                        </span>

                      </td>
                      <td className="text-right">
                        <div>
                          <p className="font-bold text-foreground">
                            ${rec.totalCost.toFixed(2)}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Score: {rec.reasoningScore}%
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-start gap-2 max-w-xs">
                          {hasSpace ? (
                            <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {rec.reasoning}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alternative Warehouse Comparison */}
      {recommendations.length > 0 && (
        <div className="bg-card border border-border rounded-sm p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Cost Comparison Across Warehouses
          </h4>
          <div className="space-y-3">
            {recommendations.slice(0, 2).map((rec) => (
              <div
                key={rec.orderId}
                className="bg-muted/50 rounded p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{rec.sku}</span>
                  <Badge variant="outline" className="text-xs">
                    {rec.quantity} units
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-emerald-900/20 border border-emerald-700/50 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      <p className="text-xs font-semibold text-emerald-400">
                        Recommended
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">
                      {rec.recommendedWarehouse.location.state}
                    </p>
                    <p className="text-xs text-emerald-600">
                      ${rec.totalCost.toFixed(0)}/mo
                    </p>
                  </div>
                  {rec.alternativeWarehouses.map((alt, idx) => (
                    <div
                      key={alt.warehouse.id}
                      className="bg-muted border border-border rounded p-2"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Alternative {idx + 1}
                      </p>
                      <p className="text-sm font-medium">
                        {alt.warehouse.location.state}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${alt.totalCost.toFixed(0)}/mo
                      </p>
                      <p className="text-xs text-red-600">
                        +${(alt.totalCost - rec.totalCost).toFixed(0)} more
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Orders Optimized Successfully
            </DialogTitle>
            <DialogDescription>
              Warehouse placement has been optimized and inventory updated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/30 border border-border rounded-md p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">
                    ✓ {optimizedOrders.length} order
                    {optimizedOrders.length !== 1 ? "s" : ""} optimized and
                    assigned to warehouses!
                  </p>
                </div>
              </div>
              <div className="space-y-2 ml-11">
                <p className="text-xs font-semibold text-foreground">
                  Inventory Updated:
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {optimizedOrders.map((rec, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-muted-foreground flex items-start gap-1.5"
                    >
                      <span className="text-emerald-600">•</span>
                      <span>
                        {rec.quantity} units of {rec.sku} →{" "}
                        {rec.recommendedWarehouse.location.state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 ml-11">
                Check Stock Management to see updated inventory and warehouse
                allocations.
              </p>
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
                navigate("/admin/inventory?tab=manufacturing");
              }}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Go to Submitted Orders
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
