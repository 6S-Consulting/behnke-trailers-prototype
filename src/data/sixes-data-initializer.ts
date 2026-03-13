import { warehouses } from "./warehouse";
import { products } from "./products";
import type { StockAlert } from "./sixes-warehouse-data";

export const getHYDRAULICWarehouseAnalytics = () => {
  // Use all products for the prototype display
  const activeProducts = products;

  const inventory = warehouses.flatMap(wh => 
    activeProducts.map(p => ({
      warehouseId: wh.id,
      sku: p.id, // Standardized to use product.id
      onHand: Math.floor(Math.random() * 100),
      inbound: Math.floor(Math.random() * 20),
      reserved: Math.floor(Math.random() * 10),
      available: Math.floor(Math.random() * 80),
      reorderPoint: 20,
      optimalLevel: 100,
      daysOfSupply: Math.floor(Math.random() * 150),
      lastRestockDate: "2024-03-01",
      nextRestockETA: null
    }))
  );

  const forecasts = activeProducts.map(p => {
    // Determine trend based on SKU patterns (for demo consistency)
    const isPVP = p.id.startsWith("PVP");
    const trend = isPVP ? (Math.random() > 0.3 ? "increasing" : "stable") : (Math.random() > 0.5 ? "increasing" : "decreasing");
    
    return {
      sku: p.id,
      trend,
      confidence: 0.8 + Math.random() * 0.15,
      next3MonthsTotal: Math.floor(Math.random() * 300) + 50,
      // Adding fields expected by DemandForecasting.tsx
      m3: Math.floor(Math.random() * 20),
      m2: Math.floor(Math.random() * 25),
      m1: Math.floor(Math.random() * 30),
      pred: Math.floor(Math.random() * 35),
      avg6m: Math.floor(Math.random() * 25),
      region: ["TX", "CA", "FL", "NY", "IL"][Math.floor(Math.random() * 5)],
      regPct: 20 + Math.floor(Math.random() * 30)
    };
  });

  const alerts: StockAlert[] = inventory
    .filter(inv => inv.available <= inv.reorderPoint)
    .map((inv, idx) => ({
      id: `alert-${idx}`,
      type: inv.available === 0 ? "out-of-stock" : "low-stock",
      severity: (inv.available === 0 ? "critical" : "warning") as "critical" | "warning" | "info",
      sku: inv.sku,
      warehouseId: inv.warehouseId,
      currentStock: inv.available,
      message: inv.available === 0 ? `${inv.sku} is out of stock in ${inv.warehouseId}` : `${inv.sku} is below reorder point in ${inv.warehouseId}`,
      recommendedAction: inv.available === 0 ? "Emergency restock" : "Schedule replenishment",
      estimatedImpact: { lostSales: Math.floor(Math.random() * 1000) }
    }));

  return {
    inventory,
    alerts,
    forecasts,
    warehouses: warehouses.map(wh => ({
      ...wh,
      performance: 85 + Math.random() * 10
    }))
  };
};

export const getHYDRAULICDashboardMetrics = () => {
  return {
    totalValue: 4250000,
    outOfStockItems: 8,
    lowStockItems: 24,
    pendingInbound: 1250
  };
};
