import { warehouses, InventoryItem, Warehouse, ManufacturingOrder } from "./warehouse";

export type HYDRAULICWarehouse = Warehouse;

// Re-export ManufacturingOrder for consumers that import from this module
export type { ManufacturingOrder };

export interface HYDRAULICInventoryItem extends InventoryItem {
  sku: string;
}

export interface StockAlert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  sku: string;
  warehouseId: string;
  currentStock: number;
  message: string;
  recommendedAction: string;
  estimatedImpact: {
    lostSales?: number;
    excessHolding?: number;
  };
}

export const sixesWarehouses = warehouses;

/**
 * Selects the best fulfillment warehouse for an order based on
 * inventory availability and proximity to the destination state.
 */
export function selectFulfillmentWarehouse(
  destinationState: string,
  sku: string,
  quantity: number,
  inventoryMap: Map<string, number>
): { warehouseId: string; cost: number; deliveryDays: number; reasoning: string } {
  // Coverage map: which warehouses serve which states
  const coverageMap: Record<string, string[]> = {
    "WH-EAST":   ["NC", "SC", "VA", "GA", "FL", "TN", "AL", "MS", "MD", "DE", "NJ", "NY", "CT", "RI", "MA", "VT", "NH", "ME", "WV", "PA"],
    "WH-WEST":   ["NV", "CA", "OR", "WA", "AZ", "UT", "ID", "CO", "MT", "WY"],
    "WH-SOUTH":  ["TX", "OK", "AR", "LA", "NM", "KS", "MO", "NE", "SD", "ND", "IA", "MN", "WI", "IL", "IN", "MI", "OH"],
    "WH-PACIFIC":["CA", "AZ", "OR", "WA", "HI", "AK"],
  };

  // Find warehouses that cover the destination state AND have sufficient stock
  const candidates = Object.entries(coverageMap)
    .filter(([whId, states]) => {
      const hasState = states.includes(destinationState.toUpperCase());
      const available = inventoryMap.get(`${whId}-${sku}`) ?? 0;
      return hasState && available >= quantity;
    })
    .map(([whId]) => whId);

  // Pick the first candidate, or pick the highest-stock warehouse as fallback
  if (candidates.length > 0) {
    const warehouseId = candidates[0];
    const isPrimary = coverageMap[warehouseId]?.slice(0, 3).includes(destinationState.toUpperCase());
    return {
      warehouseId,
      cost: isPrimary ? 8.5 : 12.0,
      deliveryDays: isPrimary ? 2 : 4,
      reasoning: `${warehouseId} has stock and covers ${destinationState}`,
    };
  }

  // Fallback: warehouse with most stock for this SKU
  let bestWarehouse = "WH-EAST";
  let bestStock = 0;
  for (const whId of Object.keys(coverageMap)) {
    const stock = inventoryMap.get(`${whId}-${sku}`) ?? 0;
    if (stock > bestStock) {
      bestStock = stock;
      bestWarehouse = whId;
    }
  }

  return {
    warehouseId: bestWarehouse,
    cost: 15.0,
    deliveryDays: 5,
    reasoning: `Fallback: ${bestWarehouse} has the most available stock (${bestStock} units)`,
  };
}
