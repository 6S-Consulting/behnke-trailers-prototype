/**
 * Manufacturing Order Tracker
 * Export alerts, create manufacturing orders, and track completion to update inventory
 */

import { useState, useMemo } from "react";
import {
  Package,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/admin/components/ui/button";
import { Badge } from "@/admin/components/ui/badge";
// removed Table UI component imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import { Checkbox } from "@/admin/components/ui/checkbox";
import type {
  StockAlert,
  HYDRAULICWarehouse,
  ManufacturingOrder,
} from "@/data/sixes-warehouse-data";
import { cn } from "@/admin/lib/utils";

interface ManufacturingOrderTrackerProps {
  alerts: StockAlert[];
  warehouses: HYDRAULICWarehouse[];
  inventory: any[];
  onInventoryUpdate?: (
    sku: string,
    warehouseId: string,
    quantity: number,
  ) => void;
  orders?: ManufacturingOrder[];
  onOrdersChange?: (orders: ManufacturingOrder[]) => void;
}

export function ManufacturingOrderTracker({
  alerts,
  warehouses,
  inventory,
  onInventoryUpdate,
  orders: externalOrders,
  onOrdersChange,
}: ManufacturingOrderTrackerProps) {
  // Use external orders if provided, otherwise use local state
  const [localOrders, setLocalOrders] = useState<ManufacturingOrder[]>([]);
  const orders = externalOrders || localOrders;
  const setOrders = onOrdersChange || setLocalOrders;
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [orderQuantity, setOrderQuantity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ALERTS_PER_PAGE = 10;

  // Filter shortage and urgent reorder alerts
  const criticalAlerts = useMemo(() => {
    return alerts.filter(
      (alert) => alert.type === "shortage" || alert.type === "urgent-reorder",
    );
  }, [alerts]);

  // Pagination for critical alerts
  const totalPages = Math.ceil(criticalAlerts.length / ALERTS_PER_PAGE);
  const paginatedAlerts = useMemo(() => {
    return criticalAlerts.slice(
      (currentPage - 1) * ALERTS_PER_PAGE,
      currentPage * ALERTS_PER_PAGE,
    );
  }, [criticalAlerts, currentPage]);

  // Export alerts to CSV
  const handleExportAlerts = () => {
    const csvContent = [
      [
        "Alert ID",
        "Type",
        "Severity",
        "SKU",
        "Warehouse",
        "Current Stock",
        "Message",
        "Recommended Action",
      ].join(","),
      ...criticalAlerts.map((alert) =>
        [
          alert.id,
          alert.type,
          alert.severity,
          alert.sku,
          warehouses.find((w) => w.id === alert.warehouseId)?.name ||
            alert.warehouseId,
          alert.currentStock,
          `"${alert.message}"`,
          `"${alert.recommendedAction}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-alerts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create manufacturing order from alert
  const handleCreateOrder = (alert: StockAlert) => {
    setSelectedAlert(alert);
    // Suggest quantity based on inventory item
    const item = inventory.find(
      (inv) => inv.sku === alert.sku && inv.warehouseId === alert.warehouseId,
    );
    const suggestedQty = item
      ? Math.max(item.reorderPoint - alert.currentStock, item.reorderPoint)
      : 100;
    setOrderQuantity(suggestedQty.toString());
    setIsCreateOrderOpen(true);
  };

  // Save manufacturing order
  const handleSaveOrder = () => {
    if (!selectedAlert || !orderQuantity) return;

    const newOrder: ManufacturingOrder = {
      id: `MO-${Date.now()}`,
      sku: selectedAlert.sku,
      warehouseId: selectedAlert.warehouseId,
      quantity: parseInt(orderQuantity),
      status: "pending",
      createdDate: new Date().toISOString(),
      alertId: selectedAlert.id,
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    setIsCreateOrderOpen(false);
    setSelectedAlert(null);
    setOrderQuantity("");
  };

  // Mark order as completed and update inventory
  const handleCompleteOrder = (orderId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId && order.status === "pending") {
        // Update inventory count
        if (onInventoryUpdate) {
          onInventoryUpdate(order.sku, order.warehouseId, order.quantity);
        }
        return {
          ...order,
          status: "completed" as const,
          completedDate: new Date().toISOString(),
        };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Stock Alerts & Manufacturing Orders
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {criticalAlerts.length} critical alerts • {pendingOrders.length}{" "}
            pending orders
          </p>
        </div>
        <Button onClick={handleExportAlerts} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Alerts
        </Button>
      </div>

      {/* Critical Alerts */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-gradient-to-r from-red-500/10 to-orange-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Critical Stock Alerts
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Items requiring immediate manufacturing orders
              </p>
            </div>
          </div>
        </div>

        {criticalAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No critical alerts
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All stock levels are healthy
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th>Current Stock</th>
                  <th>Alert</th>
                  <th>Recommended Action</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlerts.map((alert) => {
                  const hasOrder = orders.some((o) => o.alertId === alert.id);
                  return (
                    <tr key={alert.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{alert.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">
                          {warehouses.find((w) => w.id === alert.warehouseId)
                            ?.name || alert.warehouseId}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant="secondary"
                          className={cn(
                            alert.severity === "critical"
                              ? "bg-red-500/10 text-red-700"
                              : "bg-orange-500/10 text-orange-700",
                          )}
                        >
                          {alert.currentStock} units
                        </Badge>
                      </td>
                      <td>
                        <p className="text-sm text-foreground">
                          {alert.message}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm text-muted-foreground">
                          {alert.recommendedAction}
                        </p>
                      </td>
                      <td className="text-right">
                        {hasOrder ? (
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/10 text-blue-700"
                          >
                            Order Created
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCreateOrder(alert)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Create Order
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && criticalAlerts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ALERTS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ALERTS_PER_PAGE, criticalAlerts.length)}{" "}
              of {criticalAlerts.length} alerts
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

      {/* Manufacturing Orders */}
      {orders.length > 0 && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Manufacturing Orders
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track order completion and inventory updates
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>SKU</th>
                  <th>Warehouse</th>
                  <th>Quantity</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="font-mono text-sm">{order.id}</span>
                    </td>
                    <td>
                      <span className="font-medium">{order.sku}</span>
                    </td>
                    <td>
                      <span className="text-sm">
                        {warehouses.find((w) => w.id === order.warehouseId)
                          ?.name || order.warehouseId}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium">
                        {order.quantity} units
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      {order.status === "completed" ? (
                        <Badge className="bg-green-500/10 text-green-700">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-orange-500/10 text-orange-700"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="text-right">
                      {order.status === "pending" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteOrder(order.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {order.completedDate &&
                            new Date(order.completedDate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {completedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-sm p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-sm">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Manufacturing Orders Completed
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {completedOrders.length} order
                {completedOrders.length !== 1 ? "s" : ""} completed • Inventory
                updated
              </p>
              <div className="space-y-2">
                {completedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-card rounded p-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{order.sku}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {order.quantity} units added
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/10 text-green-700"
                    >
                      ✓ Inventory Updated
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manufacturing Order</DialogTitle>
            <DialogDescription>
              Create a manufacturing order to replenish stock for{" "}
              {selectedAlert?.sku}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs mb-1.5 block">SKU</Label>
              <Input value={selectedAlert?.sku || ""} disabled />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Warehouse</Label>
              <Input
                value={
                  warehouses.find((w) => w.id === selectedAlert?.warehouseId)
                    ?.name || ""
                }
                disabled
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Current Stock</Label>
              <Input value={selectedAlert?.currentStock || 0} disabled />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Order Quantity</Label>
              <Input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="Enter quantity to manufacture"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOrderOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveOrder} disabled={!orderQuantity}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
