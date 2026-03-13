import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Badge } from "@/admin/components/ui/badge";
import { Checkbox } from "@/admin/components/ui/checkbox";
import { sixesWarehouses } from "@/data/sixes-warehouse-data";
import { useInventoryState } from "@/admin/context/InventoryStateContext";
import { exportCurrentInventory } from "@/admin/lib/export-utils";
import {
  Search,
  AlertTriangle,
  Package,
  PackageCheck,
  PackageX,
  Boxes,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/admin/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/admin/components/ui/dialog";
import { Label } from "@/admin/components/ui/label";
import { cn } from "@/admin/lib/utils";
// removed Table UI component imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/admin/components/ui/tooltip";

export function StockManagement() {
  const [searchParams] = useSearchParams();
  const mfgSectionRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Scroll to manufacturing section if requested in URL
  useEffect(() => {
    if (searchParams.get("section") === "manufacturing" && mfgSectionRef.current) {
      setTimeout(() => {
        mfgSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [searchParams]);

  // Add Stock Dialog State
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [addStockSku, setAddStockSku] = useState("");
  const [addStockWarehouseId, setAddStockWarehouseId] = useState("");
  const [addStockQuantity, setAddStockQuantity] = useState("10");

  // Load inventory from context (synced across all tabs)
  const context = useInventoryState();
  const { inventory, alerts, updateInventory } = context;

  const handleExportStock = () => {
    exportCurrentInventory(inventory, sixesWarehouses);
  };

  const handleAddStockSubmit = () => {
    if (!addStockSku || !addStockWarehouseId || !addStockQuantity) return;
    const qty = parseInt(addStockQuantity);
    if (isNaN(qty) || qty <= 0) return;

    // Use updateInventory context function
    updateInventory(addStockSku, addStockWarehouseId, qty);
    setShowAddStockDialog(false);

    // Reset form
    setAddStockSku("");
    setAddStockWarehouseId("");
    setAddStockQuantity("10");
  };

  const uniqueSkus = useMemo(() => {
    return Array.from(new Set(inventory.map((item) => item.sku))).sort();
  }, [inventory]);

  // Group inventory by SKU across warehouses
  const inventoryBySKU = useMemo(() => {
    const grouped = new Map<
      string,
      {
        sku: string;
        totalStock: number;
        warehouses: {
          id: string;
          name: string;
          stock: number;
          available: number;
        }[];
        daysOfSupply: number;
        status: string;
      }
    >();

    inventory.forEach((item) => {
      if (!grouped.has(item.sku)) {
        grouped.set(item.sku, {
          sku: item.sku,
          totalStock: 0,
          warehouses: [],
          daysOfSupply: 0,
          status: "good",
        });
      }
      const entry = grouped.get(item.sku)!;
      entry.totalStock += item.onHand;
      const warehouse = sixesWarehouses.find((w) => w.id === item.warehouseId);
      entry.warehouses.push({
        id: item.warehouseId,
        name: warehouse?.location.state || item.warehouseId,
        stock: item.onHand,
        available: item.available,
      });
      entry.daysOfSupply = Math.max(entry.daysOfSupply, item.daysOfSupply);
    });

    // Determine status after all warehouses are processed
    grouped.forEach((entry) => {
      if (entry.totalStock === 0) {
        entry.status = "out-of-stock";
      } else {
        // Check if any warehouse location has low stock
        const hasLowStock = entry.warehouses.some(
          (wh) => wh.available > 0 && wh.available <= 50, // Using default reorder point of 50
        );
        const totalAvailable = entry.warehouses.reduce(
          (sum, wh) => sum + wh.available,
          0,
        );
        if (totalAvailable <= 100 || hasLowStock) {
          // Low stock threshold
          entry.status = "low-stock";
        } else {
          entry.status = "good";
        }
      }
    });

    return Array.from(grouped.values());
  }, [inventory]);

  const filteredInventory = inventoryBySKU.filter((item) => {
    const matchesSearch = item.sku
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "in-stock" && item.status === "good") ||
      (statusFilter === "low-stock" && item.status === "low-stock") ||
      (statusFilter === "out-of-stock" && item.status === "out-of-stock");
    return (
      matchesSearch && matchesStatus
    );
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  // Calculate metrics
  const totalUnits = inventory.reduce((sum, item) => sum + item.onHand, 0);
  const totalSKUs = inventoryBySKU.length;
  const lowStockItems = inventory.filter(
    (item) => item.available <= item.reorderPoint && item.available > 0,
  ).length;
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "critical",
  ).length;
  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Total Stock
              </p>
              <Boxes className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {totalUnits.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              units across all warehouses
            </p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Active SKUs
              </p>
              <PackageCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{totalSKUs}</p>
            <p className="text-xs text-muted-foreground mt-1">unique products</p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Low Stock Items
              </p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{lowStockItems}</p>
            <p className="text-xs text-muted-foreground mt-1">need reorder</p>
          </div>
          <div className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">
                Critical Alerts
              </p>
              <PackageX className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
            <p className="text-xs text-muted-foreground mt-1">urgent attention</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="whitespace-nowrap"
                onClick={() => setShowAddStockDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Current Stock Allocation
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Inventory distributed across {sixesWarehouses.length} warehouses
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span>Items per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-16 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="whitespace-nowrap h-8 text-xs"
                onClick={handleExportStock}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Total Stock</th>
                  <th>Days of Supply</th>
                  {sixesWarehouses.map((wh) => (
                    <th key={wh.id} className="text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer border-b border-dotted border-primary/60 hover:text-primary transition-colors uppercase font-semibold">
                            {wh.location.state}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{wh.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4 + sixesWarehouses.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item) => (
                    <tr key={item.sku}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{item.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-bold text-lg">
                          {item.totalStock}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          units
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant="secondary"
                          className={
                            item.daysOfSupply < 30
                              ? "bg-red-500/10 text-red-700"
                              : item.daysOfSupply < 60
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-emerald-500/10 text-emerald-700"
                          }
                        >
                          {Math.round(item.daysOfSupply)} days
                        </Badge>
                      </td>
                      {sixesWarehouses.map((warehouseDef) => {
                        const whData = item.warehouses.find(
                          (w) => w.id === warehouseDef.id,
                        );
                        const stockValue = whData ? whData.stock : 0;
                        return (
                          <td key={warehouseDef.id} className="text-center">
                            {stockValue === 0 ? (
                              <span className="text-muted-foreground">-</span>
                            ) : (
                              <span className="font-medium">{stockValue}</span>
                            )}
                          </td>
                        );
                      })}
                      <td>
                        {item.status === "out-of-stock" && (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                        {item.status === "low-stock" && (
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-300">
                            Low Stock
                          </Badge>
                        )}
                        {item.status === "good" && (
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300">
                            In Stock
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredInventory.length > 0 && totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of{" "}
                {filteredInventory.length} SKUs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Only show first, last, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-muted-foreground px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add Stock Dialog */}
        <Dialog open={showAddStockDialog} onOpenChange={setShowAddStockDialog}>
          <DialogContent className="sm:max-w-[425px] bg-[#0A0F1C] border-[#1E293B] shadow-2xl text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight p-1">Add New Stock</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4 px-1">
              <div className="grid gap-2">
                <Label htmlFor="sku-select" className="text-slate-300 font-medium">SKU</Label>
                <Select value={addStockSku} onValueChange={setAddStockSku}>
                  <SelectTrigger id="sku-select" className="bg-transparent border-[#2A3441] text-slate-200 h-10">
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-[#1e293b] text-slate-200">
                    {uniqueSkus.map((sku) => (
                      <SelectItem key={sku} value={sku} className="focus:bg-blue-500/20 focus:text-blue-200 cursor-pointer">
                        {sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="warehouse-select" className="text-slate-300 font-medium">Warehouse</Label>
                <Select value={addStockWarehouseId} onValueChange={setAddStockWarehouseId}>
                  <SelectTrigger id="warehouse-select" className="bg-transparent border-[#2A3441] text-slate-200 h-10">
                    <SelectValue placeholder="Select Destination Warehouse" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-[#1e293b] text-slate-200">
                    {sixesWarehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id} className="focus:bg-blue-500/20 focus:text-blue-200 cursor-pointer">
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity-input" className="text-slate-300 font-medium">Quantity to Add</Label>
                <Input
                  id="quantity-input"
                  type="number"
                  min="1"
                  value={addStockQuantity}
                  onChange={(e) => setAddStockQuantity(e.target.value)}
                  className="bg-transparent border-[#2A3441] text-slate-200 h-10"
                />
              </div>
            </div>
            <DialogFooter className="mt-2 pr-1">
              <Button variant="outline" className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800" onClick={() => setShowAddStockDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium" onClick={handleAddStockSubmit} disabled={!addStockSku || !addStockWarehouseId || !addStockQuantity}>
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
