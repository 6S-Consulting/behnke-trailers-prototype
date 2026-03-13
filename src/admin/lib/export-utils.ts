/**
 * Excel Export Utilities
 * Export inventory data, replenishment recommendations, and warehouse analytics
 */

export interface ExportInventoryData {
  sku: string;
  productName: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
  inbound: number;
  reorderPoint: number;
  optimalLevel: number;
  daysOfSupply: number;
  unitCost: number;
  inventoryValue: number;
  status: string;
}

export interface ExportReplenishmentData {
  sku: string;
  productName: string;
  warehouse: string;
  currentStock: number;
  reorderPoint: number;
  optimalLevel: number;
  recommendedOrderQty: number;
  estimatedCost: number;
  priority: string;
  leadTimeDays: number;
  estimatedArrival: string;
}

export interface ExportWarehouseData {
  warehouseName: string;
  location: string;
  usedPallets: number;
  totalPalletCostPerMonth: number;
  storageCostPerPalletPerMonth: number;
  coverageStates: string;
  alertsCount: number;
}

/**
 * Convert JSON data to CSV format
 */
function convertToCSV(data: any[], headers: string[]): string {
  const headerRow = headers.join(",");
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Handle values that contain commas, quotes, or newlines
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Trigger download of CSV file
 */
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export current inventory to Excel/CSV
 */
export function exportCurrentInventory(
  inventory: any[],
  warehouses: any[],
): void {
  const exportData: ExportInventoryData[] = inventory.map((item) => {
    const warehouse = warehouses.find((w) => w.id === item.warehouseId);

    return {
      sku: item.sku,
      productName: item.productName || item.sku,
      warehouse: warehouse?.name || item.warehouseId,
      onHand: item.onHand,
      reserved: item.reserved,
      available: item.available,
      inbound: item.inbound,
      reorderPoint: item.reorderPoint,
      optimalLevel: item.optimalLevel,
      daysOfSupply: Math.floor(item.daysOfSupply),
      unitCost: item.unitCost || 0,
      inventoryValue: item.inventoryValue || 0,
      status: item.status,
    };
  });

  const headers: (keyof ExportInventoryData)[] = [
    "sku",
    "productName",
    "warehouse",
    "onHand",
    "reserved",
    "available",
    "inbound",
    "reorderPoint",
    "optimalLevel",
    "daysOfSupply",
    "unitCost",
    "inventoryValue",
    "status",
  ];

  const csvContent = convertToCSV(exportData, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csvContent, `inventory-snapshot-${timestamp}.csv`);
}

/**
 * Export replenishment recommendations to Excel/CSV
 */
export function exportReplenishmentRecommendations(
  inventory: any[],
  warehouses: any[],
): void {
  // Filter items that need reordering
  const needsReorder = inventory.filter(
    (item) => item.available <= item.reorderPoint && item.inbound === 0,
  );

  const exportData: ExportReplenishmentData[] = needsReorder.map((item) => {
    const warehouse = warehouses.find((w) => w.id === item.warehouseId);
    const recommendedOrderQty = Math.ceil(
      item.optimalLevel - item.onHand - item.inbound,
    );
    const estimatedCost = recommendedOrderQty * (item.unitCost || 0);

    // Determine priority based on current stock level
    let priority: string;
    if (item.available <= item.reorderPoint * 0.5) {
      priority = "URGENT";
    } else if (item.available <= item.reorderPoint * 0.75) {
      priority = "HIGH";
    } else {
      priority = "MEDIUM";
    }

    // Calculate estimated arrival (45 days lead time from India)
    const estimatedArrival = new Date();
    estimatedArrival.setDate(estimatedArrival.getDate() + 45);

    return {
      sku: item.sku,
      productName: item.productName || item.sku,
      warehouse: warehouse?.name || item.warehouseId,
      currentStock: item.available,
      reorderPoint: item.reorderPoint,
      optimalLevel: item.optimalLevel,
      recommendedOrderQty,
      estimatedCost,
      priority,
      leadTimeDays: 45,
      estimatedArrival: estimatedArrival.toISOString().split("T")[0],
    };
  });

  // Sort by priority (URGENT -> HIGH -> MEDIUM)
  exportData.sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      URGENT: 1,
      HIGH: 2,
      MEDIUM: 3,
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const headers: (keyof ExportReplenishmentData)[] = [
    "sku",
    "productName",
    "warehouse",
    "currentStock",
    "reorderPoint",
    "optimalLevel",
    "recommendedOrderQty",
    "estimatedCost",
    "priority",
    "leadTimeDays",
    "estimatedArrival",
  ];

  const csvContent = convertToCSV(exportData, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csvContent, `replenishment-recommendations-${timestamp}.csv`);
}

/**
 * Export warehouse analytics to Excel/CSV
 */
export function exportWarehouseAnalytics(
  warehouses: any[],
  inventory: any[],
  alerts: any[],
): void {
  const PUMPS_PER_PALLET = 12;

  const exportData: ExportWarehouseData[] = warehouses.map((warehouse) => {
    const warehouseInventory = inventory.filter(
      (item) => item.warehouseId === warehouse.id,
    );
    const warehouseAlerts = alerts.filter(
      (alert) => alert.warehouseId === warehouse.id,
    );

    // Match Warehouse Allocation view: pallet count is computed by SKU rows in inventory.
    const usedPallets = warehouseInventory.reduce(
      (sum, item) => sum + Math.ceil((item.onHand || 0) / PUMPS_PER_PALLET),
      0,
    );

    const totalPalletCostPerMonth =
      usedPallets * (warehouse.costs?.storagePerPalletMonth || 0);

    const location =
      `${warehouse.location?.city || ""}, ${warehouse.location?.state || ""}`.trim();
    const coverageStates = (warehouse.coverage?.primaryStates || []).join(", ");

    return {
      warehouseName: warehouse.name,
      location,
      usedPallets,
      totalPalletCostPerMonth: Math.round(totalPalletCostPerMonth),
      storageCostPerPalletPerMonth: warehouse.costs?.storagePerPalletMonth || 0,
      coverageStates,
      alertsCount: warehouseAlerts.length,
    };
  });

  const headers: (keyof ExportWarehouseData)[] = [
    "warehouseName",
    "location",
    "usedPallets",
    "totalPalletCostPerMonth",
    "storageCostPerPalletPerMonth",
    "coverageStates",
    "alertsCount",
  ];

  const csvContent = convertToCSV(exportData, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csvContent, `warehouse-analytics-${timestamp}.csv`);
}

/**
 * Export all data (combined)
 */
export function exportAllData(
  inventory: any[],
  warehouses: any[],
  alerts: any[],
): void {
  exportCurrentInventory(inventory, warehouses);
  setTimeout(
    () => exportReplenishmentRecommendations(inventory, warehouses),
    500,
  );
  setTimeout(
    () => exportWarehouseAnalytics(warehouses, inventory, alerts),
    1000,
  );
}
