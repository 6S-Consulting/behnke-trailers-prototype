/**
 * Pallet Optimization Component
 * Identifies overstock items with low demand and recommends moving them to lower-cost warehouses
 * Max 12 pumps per pallet
 */

import { useMemo, useState } from "react";
import {
  Package,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/admin/components/ui/badge";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Label } from "@/admin/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/admin/components/ui/select";
// removed Table UI component imports
import type { HYDRAULICWarehouse } from "@/data/sixes-warehouse-data";

const PUMPS_PER_PALLET = 20;

interface PalletOptimizationProps {
  warehouses: HYDRAULICWarehouse[];
  inventory: any[];
}

export function PalletOptimization({
  warehouses,
  inventory,
}: PalletOptimizationProps) {
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [daysOfSupplyFilter, setDaysOfSupplyFilter] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Find the cheapest warehouse
  const cheapestWarehouse = useMemo(() => {
    return warehouses.reduce((min, wh) =>
      wh.costs.storagePerPalletMonth < min.costs.storagePerPalletMonth
        ? wh
        : min,
    );
  }, [warehouses]);

  // Identify overstock items with low/no demand
  // Note: Days of supply is capped at 300 days maximum
  const overstockItems = useMemo(() => {
    return inventory
      .filter((item) => {
        // Overstock: More than 180 days of supply (6 months)
        const isOverstock = item.daysOfSupply > 180;
        // High stock: Between 120-180 days indicates slower movement
        const hasHighStock = item.daysOfSupply > 120;
        return isOverstock || hasHighStock;
      })
      .map((item) => {
        const currentWarehouse = warehouses.find(
          (w) => w.id === item.warehouseId,
        );
        if (!currentWarehouse) return null;

        // Calculate pallets needed for this item
        const palletsNeeded = Math.ceil(item.onHand / PUMPS_PER_PALLET);

        // Calculate current monthly cost
        const currentMonthlyCost =
          palletsNeeded * currentWarehouse.costs.storagePerPalletMonth;

        // Calculate cost if moved to cheapest warehouse
        const optimizedMonthlyCost =
          palletsNeeded * cheapestWarehouse.costs.storagePerPalletMonth;

        // Calculate savings
        const monthlySavings = currentMonthlyCost - optimizedMonthlyCost;

        // Only recommend if there's savings and it's not already in the cheapest warehouse
        const shouldMove =
          monthlySavings > 0 && currentWarehouse.id !== cheapestWarehouse.id;

        return {
          sku: item.sku,
          quantity: item.onHand,
          daysOfSupply: item.daysOfSupply,
          currentWarehouse,
          recommendedWarehouse: shouldMove
            ? cheapestWarehouse
            : currentWarehouse,
          palletsNeeded,
          currentMonthlyCost,
          optimizedMonthlyCost: shouldMove
            ? optimizedMonthlyCost
            : currentMonthlyCost,
          monthlySavings: shouldMove ? monthlySavings : 0,
          shouldMove,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.monthlySavings || 0) - (a?.monthlySavings || 0)); // Sort by highest savings first
  }, [inventory, warehouses, cheapestWarehouse]);

  // Apply filters to overstock items
  const filteredItems = useMemo(() => {
    let filtered = overstockItems;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item?.sku.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Warehouse filter
    if (warehouseFilter !== "all") {
      filtered = filtered.filter(
        (item) => item?.currentWarehouse.id === warehouseFilter,
      );
    }

    // Days of supply filter
    if (daysOfSupplyFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (!item) return false;
        switch (daysOfSupplyFilter) {
          case "180+":
            return item.daysOfSupply > 180;
          case "120-180":
            return item.daysOfSupply >= 120 && item.daysOfSupply <= 180;
          case "should-move":
            return item.shouldMove;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [overstockItems, searchQuery, warehouseFilter, daysOfSupplyFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const resetPagination = () => setCurrentPage(1);

  const totalSavings = filteredItems.reduce(
    (sum, item) => sum + (item?.monthlySavings || 0),
    0,
  );
  const totalPalletsToMove = filteredItems
    .filter((item) => item?.shouldMove)
    .reduce((sum, item) => sum + (item?.palletsNeeded || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-sm p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/20 rounded-sm">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Overstock Items with Low Demand
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {filteredItems.length} items
              {filteredItems.length !== overstockItems.length &&
                ` (filtered from ${overstockItems.length} total)`}{" "}
              with excess inventory and minimal sales movement
            </p>
            {totalSavings > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-600">
                    Potential Savings: ${totalSavings.toFixed(0)}/month
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">
                    {totalPalletsToMove} pallets to relocate
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Filter Overstock Items</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs mb-1.5 block font-medium">
              Search SKU
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU..."
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
              Current Warehouse
            </Label>
            <Select
              value={warehouseFilter}
              onValueChange={(value) => {
                setWarehouseFilter(value);
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
            <Label className="text-xs mb-1.5 block font-medium">
              Days of Supply
            </Label>
            <Select
              value={daysOfSupplyFilter}
              onValueChange={(value) => {
                setDaysOfSupplyFilter(value);
                resetPagination();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="180+">180+ days</SelectItem>
                <SelectItem value="120-180">120-180 days</SelectItem>
                <SelectItem value="should-move">Should Move</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setWarehouseFilter("all");
                setDaysOfSupplyFilter("all");
                resetPagination();
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Overstock Items Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                Cost Optimization Recommendations
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredItems.length > 0 ? (
                  <>
                    Showing{" "}
                    {paginatedItems.length > 0
                      ? (currentPage - 1) * itemsPerPage + 1
                      : 0}
                    -
                    {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                    of {filteredItems.length} items
                    {" • "}Move overstock to {cheapestWarehouse.name} ($
                    {cheapestWarehouse.costs.storagePerPalletMonth}/pallet)
                  </>
                ) : (
                  "No items match the current filters"
                )}
              </p>
            </div>
            {filteredItems.length > 0 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs font-medium">Items per page:</Label>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
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
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium text-foreground">
              No overstock items found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {overstockItems.length === 0
                ? "All inventory levels are optimized"
                : "Try adjusting your filters"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Days of Supply</th>
                  <th>Current Warehouse</th>
                  <th>Pallets</th>
                  <th>Current Cost</th>
                  <th>Recommendation</th>
                  <th className="text-right">Monthly Savings</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, idx) => (
                  <tr key={`${item?.sku}-${idx}`}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item?.sku}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{item?.quantity}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        units
                      </span>
                    </td>
                    <td>
                      <Badge
                        variant="secondary"
                        className={
                          item && item.daysOfSupply > 180
                            ? "bg-red-500/10 text-red-700"
                            : "bg-orange-500/10 text-orange-700"
                        }
                      >
                        {Math.round(item?.daysOfSupply || 0)} days
                      </Badge>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-medium">
                          {item?.currentWarehouse.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item?.currentWarehouse.costs.storagePerPalletMonth}
                          /pallet
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="font-medium">{item?.palletsNeeded}</span>
                    </td>
                    <td>
                      <span className="font-medium">
                        ${item?.currentMonthlyCost.toFixed(2)}/mo
                      </span>
                    </td>
                    <td>
                      {item?.shouldMove ? (
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-600">
                              {item.recommendedWarehouse.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              $
                              {
                                item.recommendedWarehouse.costs
                                  .storagePerPalletMonth
                              }
                              /pallet
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-700"
                        >
                          Already Optimal
                        </Badge>
                      )}
                    </td>
                    <td className="text-right">
                      {item?.shouldMove ? (
                        <div>
                          <p className="font-bold text-emerald-600">
                            ${item.monthlySavings.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ${(item.monthlySavings * 12).toFixed(0)}/year
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredItems.length > 0 && totalPages > 1 && (
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
                      variant={currentPage === pageNum ? "default" : "outline"}
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

      {/* Total Savings Summary */}
      {totalSavings > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">
                Total Cost Optimization
              </h4>
              <p className="text-xs text-muted-foreground">
                By moving {totalPalletsToMove} pallets of overstock to{" "}
                {cheapestWarehouse.name}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
              
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalSavings.toFixed(0)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">per month</p>
              <p className="text-sm font-semibold text-foreground mt-1">
                ${(totalSavings * 12).toFixed(0)} annual savings
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
