import { useMemo, useState } from "react";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
  Warehouse,
  DollarSign,
  Activity,
  Truck,
  Calculator,
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  PackageCheck,
  PackageX,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/admin/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/admin/components/ui/tooltip";
// removed Table imports for standard HTML tables
import {
  selectFulfillmentWarehouse,
  HYDRAULICWarehouse,
} from "@/data/sixes-warehouse-data";
import { cn } from "@/admin/lib/utils";
import { exportWarehouseAnalytics } from "@/admin/lib/export-utils";
import { useInventoryState } from "@/admin/context/InventoryStateContext";

const PUMPS_PER_PALLET = 12;

// Hardcoded presentation data to ensure meaningful non-zero values across all columns
const MOCK_WAREHOUSES = [
  {
    id: "WH-EAST",
    name: "North Carolina Warehouse",
    location: { city: "Charlotte", state: "NC", zipCode: "28208" },
    capacity: { totalPallets: 250 },
    costs: {
      storagePerPalletMonth: 28.5,
      outboundPerOrder: 8.5,
      outboundPerUnit: 1.2,
    },
    coverage: {
      primaryStates: ["NC", "SC", "VA", "GA", "FL", "TN", "AL", "MS"],
    },
  },
  {
    id: "WH-WEST",
    name: "Las Vegas Warehouse",
    location: { city: "Las Vegas", state: "NV", zipCode: "89101" },
    capacity: { totalPallets: 220 },
    costs: {
      storagePerPalletMonth: 32.0,
      outboundPerOrder: 9.0,
      outboundPerUnit: 1.35,
    },
    coverage: {
      primaryStates: ["NV", "CA", "OR", "WA", "AZ", "UT", "ID", "CO"],
    },
  },
  {
    id: "WH-SOUTH",
    name: "Texas Warehouse",
    location: { city: "Dallas", state: "TX", zipCode: "75234" },
    capacity: { totalPallets: 280 },
    costs: {
      storagePerPalletMonth: 26.0,
      outboundPerOrder: 8.0,
      outboundPerUnit: 1.15,
    },
    coverage: { primaryStates: ["TX", "OK", "AR", "LA", "NM", "KS", "MO"] },
  },
  {
    id: "WH-PACIFIC",
    name: "California Warehouse",
    location: { city: "Los Angeles", state: "CA", zipCode: "90058" },
    capacity: { totalPallets: 300 },
    costs: {
      storagePerPalletMonth: 35.0,
      outboundPerOrder: 9.5,
      outboundPerUnit: 1.4,
    },
    coverage: { primaryStates: ["CA", "AZ", "OR", "WA", "HI"] },
  },
];

interface WarehouseAllocationProps {
  initialWarehouse?: string;
  initialStatus?: string;
  inventory?: any[]; // Re-add inventory prop to fix consumer error, though we use context internally
}

export function WarehouseAllocation({
  initialWarehouse = "all",
  initialStatus = "all",
}: WarehouseAllocationProps = {}) {
  const context = useInventoryState();
  const inventory = context.inventory;
  const getWarehouseUtilization = context.getWarehouseUtilization;

  // Calculate dynamic warehouse utilization
  const warehouseUtilization = useMemo(() => {
    return getWarehouseUtilization();
  }, [inventory, getWarehouseUtilization]);

  // Calculate total units across all warehouses
  const totalUnitsAllWarehouses = useMemo(() => {
    return Array.from(warehouseUtilization.values()).reduce(
      (sum, util) => sum + util.totalUnits,
      0,
    );
  }, [warehouseUtilization]);

  const [warehouses, setWarehouses] = useState<any[]>(MOCK_WAREHOUSES);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<HYDRAULICWarehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] =
    useState<HYDRAULICWarehouse | null>(null);

  // Filters State
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<string>(initialWarehouse);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting State
  const [sortField, setSortField] = useState<string>("sku");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Form State
  const [formData, setFormData] = useState<Partial<HYDRAULICWarehouse>>({
    name: "",
    location: {
      city: "",
      state: "",
      zipCode: "",
      coordinates: { lat: 0, lng: 0 },
    },
    capacity: { totalPallets: 0, usedPallets: 0, freePallets: 0 },
    costs: {
      inboundPerPallet: 0,
      storagePerPalletMonth: 0,
      outboundPerOrder: 0,
      outboundPerUnit: 0,
    },
    coverage: { primaryStates: [], shippingZones: [] },
  });

  // Shipping Calculator State
  const [orderSKU, setOrderSKU] = useState("");
  const [orderQty, setOrderQty] = useState("");
  const [orderState, setOrderState] = useState("");
  const [shippingResult, setShippingResult] = useState<{
    warehouseId: string;
    cost: number;
    deliveryDays: number;
    reasoning: string;
  } | null>(null);

  const allSKUs = useMemo(() => {
    return Array.from(new Set(inventory.map((inv) => inv.sku))).sort();
  }, [inventory]);

  // Filter inventory based on selected warehouse and status
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    if (selectedWarehouse !== "all") {
      filtered = filtered.filter(
        (inv) => inv.warehouseId === selectedWarehouse,
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => {
        switch (statusFilter) {
          case "in-stock":
            return inv.available > inv.reorderPoint;
          case "low-stock":
            return inv.available <= inv.reorderPoint && inv.available > 0;
          case "out-of-stock":
            return inv.available === 0;
          case "surplus":
            return inv.available > inv.optimalLevel * 1.5;
          default:
            return true;
        }
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((inv) =>
        inv.sku.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort logic
    filtered = [...filtered].sort((a, b) => {
      let valA = (a as any)[sortField];
      let valB = (b as any)[sortField];

      // Special case for warehouse name if sorting by warehouseId
      if (sortField === "warehouseId") {
        valA =
          warehouses.find((w) => w.id === a.warehouseId)?.name || a.warehouseId;
        valB =
          warehouses.find((w) => w.id === b.warehouseId)?.name || b.warehouseId;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    inventory,
    selectedWarehouse,
    statusFilter,
    searchQuery,
    sortField,
    sortOrder,
    warehouses,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInventory.slice(startIndex, endIndex);
  }, [filteredInventory, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setFormData({
      name: "",
      location: {
        city: "",
        state: "",
        zipCode: "",
        coordinates: { lat: 0, lng: 0 },
      },
      capacity: { totalPallets: 0, usedPallets: 0, freePallets: 0 },
      costs: {
        inboundPerPallet: 0,
        storagePerPalletMonth: 0,
        outboundPerOrder: 0,
        outboundPerUnit: 0,
      },
      coverage: { primaryStates: [], shippingZones: [] },
    });
    setIsAddEditOpen(true);
  };

  const handleEditWarehouse = (warehouse: HYDRAULICWarehouse) => {
    setEditingWarehouse(warehouse);
    setFormData(warehouse);
    setIsAddEditOpen(true);
  };

  const handleDeleteWarehouse = (warehouse: HYDRAULICWarehouse) => {
    setDeletingWarehouse(warehouse);
    setIsDeleteOpen(true);
  };

  const handleSaveWarehouse = () => {
    if (editingWarehouse) {
      // Edit existing
      setWarehouses((prev) =>
        prev.map((w) =>
          w.id === editingWarehouse.id
            ? { ...editingWarehouse, ...formData }
            : w,
        ),
      );
    } else {
      // Add new
      const newWarehouse: HYDRAULICWarehouse = {
        ...(formData as HYDRAULICWarehouse),
        id: `WH-${Date.now()}`,
      };
      setWarehouses((prev) => [...prev, newWarehouse]);
    }
    setIsAddEditOpen(false);
  };

  const confirmDelete = () => {
    if (deletingWarehouse) {
      setWarehouses((prev) =>
        prev.filter((w) => w.id !== deletingWarehouse.id),
      );
      setIsDeleteOpen(false);
      setDeletingWarehouse(null);
    }
  };

  const handleCalculateShipping = () => {
    if (!orderSKU || !orderQty || !orderState) return;

    const inventoryMap = new Map<string, number>();
    inventory.forEach((inv) => {
      inventoryMap.set(`${inv.warehouseId}-${inv.sku}`, inv.available);
    });

    const result = selectFulfillmentWarehouse(
      orderState,
      orderSKU,
      parseInt(orderQty),
      inventoryMap,
    );

    setShippingResult(result);
  };

  const handleExportWarehouseData = () => {
    exportWarehouseAnalytics(warehouses, inventory, []);
  };

  const handleExportFilteredInventory = () => {
    // Add status to inventory items for export
    const inventoryWithStatus = filteredInventory.map((item) => {
      let status = "In Stock";
      if (item.available === 0) status = "Out of Stock";
      else if (item.available <= item.reorderPoint) status = "Low Stock";
      else if (item.available > item.optimalLevel * 1.5) status = "Surplus";

      return { ...item, status };
    });

    import("@/admin/lib/export-utils").then((module) => {
      module.exportCurrentInventory(inventoryWithStatus, warehouses);
    });
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getStatusBadge = (item: any) => {
    if (item.available === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (item.available <= item.reorderPoint) {
      return (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
          Low Stock
        </Badge>
      );
    } else if (item.available > item.optimalLevel * 1.5) {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
          Surplus
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-700">
        In Stock
      </Badge>
    );
  };

  const USStates = [
    { code: "AL", name: "Alabama" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        {/* Warehouse Management Section */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Warehouse Management
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {warehouses.length} active warehouse
                  {warehouses.length !== 1 ? "s" : ""} •{" "}
                  {totalUnitsAllWarehouses.toLocaleString()} total units
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportWarehouseData}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={handleAddWarehouse} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="admin-table w-full">
              <thead>
                <tr>
                   <th>Warehouse</th>
                  <th>Location</th>
                  <th>Total Units</th>
                  <th>Pallets Used</th>
                  <th>Total Pallet Cost / Month</th>
                  <th>Coverage</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((warehouse) => {
                  const util = warehouseUtilization.get(warehouse.id);
                  const usedPallets = util?.usedPallets || 0;
                  const totalPalletCost =
                    usedPallets * warehouse.costs.storagePerPalletMonth;

                  return (
                    <tr key={warehouse.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded">
                            <Warehouse className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {warehouse.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {warehouse.id}
                            </p>
                          </div>
                        </div>
                      </td>
                       <td>
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {warehouse.location.city},{" "}
                            {warehouse.location.state}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {warehouse.location.zipCode}
                        </p>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {(util?.totalUnits || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">units</p>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{usedPallets}</p>
                          <p className="text-xs text-muted-foreground">
                            pallet{usedPallets !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            ${totalPalletCost.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${warehouse.costs.storagePerPalletMonth.toFixed(2)}{" "}
                            x {usedPallets} pallets
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {warehouse.coverage.primaryStates
                            .slice(0, 3)
                            .map((stateCode: string) => {
                              const stateName =
                                USStates.find((s) => s.code === stateCode)
                                  ?.name || stateCode;
                              return (
                                <Tooltip key={stateCode}>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-pointer border-b border-dotted border-primary/60 hover:text-primary transition-colors uppercase font-bold text-xs">
                                      {stateCode}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>{stateName}</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          {warehouse.coverage.primaryStates.length > 3 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer border-b border-dotted border-primary/60 hover:text-primary transition-colors text-xs font-bold text-muted-foreground">
                                  +{warehouse.coverage.primaryStates.length - 3}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="flex flex-col gap-1">
                                  {warehouse.coverage.primaryStates
                                    .slice(3)
                                    .map((stateCode: string) => (
                                      <p key={stateCode}>
                                        {USStates.find(
                                          (s) => s.code === stateCode,
                                        )?.name || stateCode}
                                      </p>
                                    ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditWarehouse(warehouse)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWarehouse(warehouse)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-card border border-border rounded-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">
              Filter Products by Warehouse
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs mb-1.5 block font-medium">
                Warehouse
              </Label>
              <Select
                value={selectedWarehouse}
                onValueChange={(value) => {
                  setSelectedWarehouse(value);
                  resetPagination();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block font-medium">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  resetPagination();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="surplus">Surplus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label className="text-xs mb-1.5 block font-medium">
                Search SKU
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    resetPagination();
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block font-medium">
                Sort By
              </Label>
              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-");
                  setSortField(field);
                  setSortOrder(order as "asc" | "desc");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sku-asc">SKU (A-Z)</SelectItem>
                  <SelectItem value="sku-desc">SKU (Z-A)</SelectItem>
                  <SelectItem value="available-asc">
                    Available (Low-High)
                  </SelectItem>
                  <SelectItem value="available-desc">
                    Available (High-Low)
                  </SelectItem>
                  <SelectItem value="reserved-asc">
                    Reserved (Low-High)
                  </SelectItem>
                  <SelectItem value="reserved-desc">
                    Reserved (High-Low)
                  </SelectItem>
                  <SelectItem value="inbound-asc">
                    Inbound (Low-High)
                  </SelectItem>
                  <SelectItem value="inbound-desc">
                    Inbound (High-Low)
                  </SelectItem>
                  <SelectItem value="warehouseId-asc">
                    Warehouse (A-Z)
                  </SelectItem>
                  <SelectItem value="warehouseId-desc">
                    Warehouse (Z-A)
                  </SelectItem>
                  <SelectItem value="daysOfSupply-asc">
                    Days Supply (Low-High)
                  </SelectItem>
                  <SelectItem value="daysOfSupply-desc">
                    Days Supply (High-Low)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Product Inventory Table */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Product Inventory</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing{" "}
                  {paginatedInventory.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                  -
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredInventory.length,
                  )}{" "}
                  of {filteredInventory.length} items
                  {selectedWarehouse !== "all" &&
                    ` in ${warehouses.find((w) => w.id === selectedWarehouse)?.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Items per page:</Label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleExportFilteredInventory}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  Export CSV
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSort("sku")}
                  >
                    <div className="flex items-center gap-1">
                      SKU
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "sku" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSort("warehouseId")}
                  >
                    <div className="flex items-center gap-1">
                      Warehouse
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "warehouseId" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-center"
                    onClick={() => toggleSort("available")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Available
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "available" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-center">Pallet Count</th>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-center"
                    onClick={() => toggleSort("reserved")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Reserved
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "reserved" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-center"
                    onClick={() => toggleSort("inbound")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Inbound
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "inbound" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-center">Status</th>
                  <th
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-center"
                    onClick={() => toggleSort("daysOfSupply")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Days of Supply
                      <div className="w-5 h-5 flex items-center justify-center">
                        {sortField === "daysOfSupply" ? (
                          sortOrder === "asc" ? (
                            <ChevronUp className="h-4 w-4 text-primary" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-primary" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <PackageX className="h-8 w-8" />
                        <p className="text-sm">No products found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item, idx) => (
                    <tr key={`${item.warehouseId}-${item.sku}-${idx}`}>
                      <td>
                        <div className="flex items-center gap-2">
                          <PackageCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            {item.sku}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">
                          {warehouses.find((w) => w.id === item.warehouseId)
                            ?.name || item.warehouseId}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="font-medium text-sm">
                          {item.available}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {Math.ceil(item.available / PUMPS_PER_PALLET)}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {item.reserved}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {item.inbound}
                        </span>
                      </td>
                      <td>{getStatusBadge(item)}</td>
                      <td className="text-center">
                        <span
                          className={cn(
                            "text-sm",
                            item.daysOfSupply < 30
                              ? "text-red-600 font-medium"
                              : item.daysOfSupply < 60
                                ? "text-yellow-600"
                                : "text-green-600",
                          )}
                        >
                          {Math.round(item.daysOfSupply)} days
                        </span>
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
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Optimization Simulator */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Shipping Cost Calculator
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Find the optimal warehouse for order fulfillment
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label className="text-xs mb-1.5 block font-medium">SKU</Label>
                <Select value={orderSKU} onValueChange={setOrderSKU}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SKU" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSKUs.map((sku) => (
                      <SelectItem key={sku} value={sku}>
                        {sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs mb-1.5 block font-medium">
                  Quantity
                </Label>
                <Input
                  type="number"
                  placeholder="Enter qty"
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  min="1"
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block font-medium">
                  Destination State
                </Label>
                <Select value={orderState} onValueChange={setOrderState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {USStates.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleCalculateShipping}
                  disabled={!orderSKU || !orderQty || !orderState}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate
                </Button>
              </div>
            </div>

            {shippingResult && (
              <div className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-sm">
                    <Warehouse className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      Optimal Fulfillment Warehouse
                    </h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      {warehouses.find(
                        (w) => w.id === shippingResult.warehouseId,
                      )?.name || shippingResult.warehouseId}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-card rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">
                            Total Cost
                          </p>
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          ${shippingResult.cost.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-card rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">
                            Delivery Time
                          </p>
                          <Truck className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {shippingResult.deliveryDays} days
                        </p>
                      </div>
                      <div className="bg-card rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-muted-foreground">
                            Order Details
                          </p>
                          <Package className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          {orderQty}x {orderSKU}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-card/50 rounded-sm border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Analysis:
                      </p>
                      <p className="text-sm text-foreground">
                        {shippingResult.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Warehouse Dialog */}
        <Dialog open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
              </DialogTitle>
              <DialogDescription>
                {editingWarehouse
                  ? "Update warehouse information and settings"
                  : "Add a new warehouse location to your network"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Warehouse Name</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., North Carolina Warehouse"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">City</Label>
                  <Input
                    value={formData.location?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Charlotte"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">State</Label>
                  <Input
                    value={formData.location?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="NC"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">ZIP Code</Label>
                  <Input
                    value={formData.location?.zipCode || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location!,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    placeholder="28208"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">
                    Storage Cost ($/pallet/month)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costs?.storagePerPalletMonth || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costs: {
                          ...formData.costs!,
                          storagePerPalletMonth:
                            parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">
                    Outbound Cost ($/order)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costs?.outboundPerOrder || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        costs: {
                          ...formData.costs!,
                          outboundPerOrder: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveWarehouse}>
                {editingWarehouse ? "Update" : "Add"} Warehouse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Warehouse</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingWarehouse?.name}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
