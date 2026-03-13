/**
 * Inventory State Context
 * Shared state management for inventory, products, and orders across all tabs
 * Frontend-only state - resets on page refresh
 *
 * Pallet Rule: Each SKU must be on separate pallet(s) - no mixing varieties
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  getHYDRAULICWarehouseAnalytics,
  getHYDRAULICDashboardMetrics,
} from "@/data/sixes-data-initializer";
import { sixesWarehouses } from "@/data/sixes-warehouse-data";
import type {
  HYDRAULICInventoryItem,
  StockAlert,
} from "@/data/sixes-warehouse-data";

export interface OptimizedOrder {
  id: string;
  sku: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  timestamp: string;
  status: "completed" | "received";
  receivedAt?: string;
}

export interface WarehouseUtilization {
  warehouseId: string;
  totalUnits: number;
  usedPallets: number;
  totalPallets: number;
  freePallets: number;
  utilizationPercent: number;
}

const PUMPS_PER_PALLET = 12; // Standardized to match NewOrderOptimization.tsx

interface InventoryState {
  inventory: HYDRAULICInventoryItem[];
  alerts: StockAlert[];
  recentlyOptimized: Set<string>;
  optimizedOrders: OptimizedOrder[];
  updateInventory: (sku: string, warehouseId: string, quantity: number) => void;
  addSubmittedOrders: (orders: { id: string; sku: string; quantity: number }[]) => void;
  setInventory: React.Dispatch<React.SetStateAction<HYDRAULICInventoryItem[]>>;
  refreshData: () => void;
  clearRecentlyOptimized: () => void;
  toggleOrderReceived: (orderIds: string[], isReceived: boolean) => void;
  updateOrderWarehouse: (orderId: string, warehouseId: string) => void;
  getWarehouseUtilization: () => Map<string, WarehouseUtilization>;
}

const InventoryStateContext = createContext<InventoryState | undefined>(
  undefined,
);

export function InventoryStateProvider({ children }: { children: ReactNode }) {
  // Initialize state from HYDRAULIC data
  const initialAnalytics = getHYDRAULICWarehouseAnalytics();

  const [inventory, setInventory] = useState<HYDRAULICInventoryItem[]>(() => {
    const saved = localStorage.getItem("sixes-inventory");
    if (saved) return JSON.parse(saved);
    return initialAnalytics.inventory;
  });

  const [alerts, setAlerts] = useState<StockAlert[]>(() => {
    const saved = localStorage.getItem("sixes-alerts");
    if (saved) return JSON.parse(saved);
    return initialAnalytics.alerts;
  });

  const [recentlyOptimized, setRecentlyOptimized] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("sixes-recently-optimized");
    if (saved) return new Set(JSON.parse(saved));
    return new Set();
  });

  const [optimizedOrders, setOptimizedOrders] = useState<OptimizedOrder[]>(() => {
    const saved = localStorage.getItem("sixes-optimized-orders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OptimizedOrder[];
        const realOnly = parsed.filter((o) => !o.id.startsWith("sample-"));
        if (realOnly.length > 0) return realOnly;
      } catch {
        // ignore parse errors and fall back to sample
      }
    }
    // Single inline sample row for Submitted Orders (no external data)
    return [
      {
        id: "sample-opt-001",
        sku: "PVP16",
        quantity: 120,
        warehouseId: "WH-EAST",
        warehouseName: "North Carolina Warehouse",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "completed",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("sixes-inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("sixes-alerts", JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem("sixes-recently-optimized", JSON.stringify(Array.from(recentlyOptimized)));
  }, [recentlyOptimized]);

  useEffect(() => {
    localStorage.setItem("sixes-optimized-orders", JSON.stringify(optimizedOrders));
  }, [optimizedOrders]);

  // Auto-clear inventory & warehouse-related data from localStorage after 5 minutes
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.removeItem("sixes-inventory");
        localStorage.removeItem("sixes-alerts");
        localStorage.removeItem("sixes-recently-optimized");
        localStorage.removeItem("sixes-optimized-orders");
        localStorage.removeItem("pendingWarehousePlacements");
      } catch (e) {
        console.warn("Failed to clear inventory/warehouse data from localStorage", e);
      }
    }, 30 * 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Add submitted manufacturing orders that are not yet warehouse-optimized
  const addSubmittedOrders = (orders: { id: string; sku: string; quantity: number }[]) => {
    const timestamp = new Date().toISOString();
    setOptimizedOrders((prev) => [
      ...prev,
      ...orders.map((o) => ({
        id: o.id,
        sku: o.sku,
        quantity: o.quantity,
        warehouseId: "UNALLOCATED",
        warehouseName: "Not allocated",
        timestamp,
        status: "completed" as const,
      })),
    ]);
  };

  // Update inventory quantity for a specific SKU at a warehouse
  const updateInventory = (
    sku: string,
    warehouseId: string,
    quantity: number,
  ) => {
    // Add to optimized orders history
    const warehouse = sixesWarehouses.find((w) => w.id === warehouseId);

    const newOrder: OptimizedOrder = {
      id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sku,
      quantity,
      warehouseId,
      warehouseName: warehouse?.name || warehouseId,
      timestamp: new Date().toISOString(),
      status: "completed",
    };

    console.log("Adding optimized order:", newOrder);
    setOptimizedOrders((prev) => {
      // Filter out duplicate instances to prevent strict mode double-firing from adding two orders
      if (prev.some(o => o.id === newOrder.id || (o.sku === newOrder.sku && o.quantity === newOrder.quantity && o.timestamp === newOrder.timestamp))) return prev;
      
      const nonSampleOrders = prev.filter(
        (order) => !order.id.startsWith("sample-"),
      );
      const sampleOrders = prev.filter((order) =>
        order.id.startsWith("sample-"),
      );
      // New orders go between samples and existing real orders
      return [...sampleOrders, newOrder, ...nonSampleOrders];
    });
  };

  // Update alerts based on current inventory (separate function to be called independently)
  const updateAlertsForInventory = (currentInventory: HYDRAULICInventoryItem[]) => {
    const newAlerts: StockAlert[] = [];

    currentInventory.forEach((item) => {
      // Calculate daily usage from days of supply
      const daysOfSupply = Math.round(item.daysOfSupply);
      const avgDailyUsage = daysOfSupply > 0 ? item.available / daysOfSupply : 0;

      // Calculate reorder quantity
      const reorderQuantity = Math.max(
        item.optimalLevel - item.available,
        item.reorderPoint,
      );

      // CRITICAL ALERT: Out of stock (0) or extremely low (< 3 units)
      if (item.available <= 3 && item.reorderPoint > 0) {
        newAlerts.push({
          id: `alert-${item.sku}-${item.warehouseId}-critical`,
          type: "shortage",
          severity: "critical",
          sku: item.sku,
          warehouseId: item.warehouseId,
          currentStock: item.available,
          message: item.available === 0 
            ? `Stock Out: Product is currently unavailable`
            : `Extremely Low Stock: Only ${item.available} units remaining`,
          recommendedAction: `Order ${reorderQuantity} units immediately`,
          estimatedImpact: {
            lostSales: avgDailyUsage * 50,
          },
        });
      }
      // WARNING ALERT: Below or at reorder point (Standard "Low Stock")
      else if (item.available <= item.reorderPoint) {
        newAlerts.push({
          id: `alert-${item.sku}-${item.warehouseId}-warning`,
          type: "urgent-reorder",
          severity: "warning",
          sku: item.sku,
          warehouseId: item.warehouseId,
          currentStock: item.available,
          message: `Low Stock: Below reorder point (${item.reorderPoint})`,
          recommendedAction: `Schedule order for ${reorderQuantity} units`,
          estimatedImpact: {
            lostSales: avgDailyUsage * 25,
          },
        });
      }
      // INFO ALERT: Health depletion or upcoming need (Within 1.5x reorder point or < 30 days)
      else if (item.available <= item.reorderPoint * 1.5 || daysOfSupply < 30) {
        newAlerts.push({
          id: `alert-${item.sku}-${item.warehouseId}-info`,
          type: "urgent-reorder",
          severity: "info",
          sku: item.sku,
          warehouseId: item.warehouseId,
          currentStock: item.available,
          message: `Replenishment Suggestion: ${daysOfSupply} days of supply remaining`,
          recommendedAction: `Plan replenishment for ${reorderQuantity} units`,
          estimatedImpact: {
            lostSales: 0,
          },
        });
      }
      // SURPLUS ALERT: Excess inventory (more than 180 days)
      else if (daysOfSupply > 180 && item.available > 50) {
        const excessUnits = Math.round(item.available - (item.optimalLevel || 100));
        newAlerts.push({
          id: `alert-${item.sku}-${item.warehouseId}-overstock`,
          type: "surplus",
          severity: "info",
          sku: item.sku,
          warehouseId: item.warehouseId,
          currentStock: item.available,
          message: `Excess Inventory: ${daysOfSupply} days of supply`,
          recommendedAction: `Consider redistribution or promotion`,
          estimatedImpact: {
            excessHolding: excessUnits * 2.5,
          },
        });
      }
    });

    setAlerts(newAlerts);
  };

  // Refresh data from initial state (simulates data reset)
  const refreshData = () => {
    const freshAnalytics = getHYDRAULICWarehouseAnalytics();
    setInventory(freshAnalytics.inventory);
    setAlerts(freshAnalytics.alerts);
    setRecentlyOptimized(new Set());
    // Reset to sample orders only
    setOptimizedOrders([
      {
        id: "sample-opt-001",
        sku: "PVP16",
        quantity: 120,
        warehouseId: "WH-EAST",
        warehouseName: "North Carolina Warehouse",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "completed" as const,
      },
      {
        id: "sample-opt-002",
        sku: "505A",
        quantity: 180,
        warehouseId: "WH-SOUTH",
        warehouseName: "Texas Warehouse",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: "completed" as const,
      },
      {
        id: "sample-opt-003",
        sku: "PD018",
        quantity: 120,
        warehouseId: "WH-WEST",
        warehouseName: "Las Vegas Warehouse",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: "received" as const,
      },
      {
        id: "sample-opt-004",
        sku: "PVP16",
        quantity: 85,
        warehouseId: "WH-PACIFIC",
        warehouseName: "California Warehouse",
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: "received" as const,
      },
    ]);
  };

  // Clear recently optimized tracking
  const clearRecentlyOptimized = () => {
    setRecentlyOptimized(new Set());
    // Keep only sample orders when clearing
    setOptimizedOrders((prev) =>
      prev.filter((order) => order.id.startsWith("sample-")),
    );
  };

  // Toggle orders as received or manufacturing
  const toggleOrderReceived = (orderIds: string[], isReceived: boolean) => {
    const timestamp = new Date().toISOString();
    
    // First figure out which orders actually changed
    const changingOrders = optimizedOrders.filter(o => 
       orderIds.includes(o.id) && 
       ((isReceived && o.status !== "received") || (!isReceived && o.status === "received"))
    );

    if (changingOrders.length === 0) return;

    setOptimizedOrders((prev) =>
      prev.map((order) =>
        orderIds.includes(order.id)
          ? { 
              ...order, 
              status: isReceived ? "received" : "completed",
              receivedAt: isReceived ? timestamp : undefined 
            }
          : order,
      ),
    );

    // Now apply changes to inventory
    setInventory((prevInv) => {
       const newInv = [...prevInv];
       
       changingOrders.forEach(order => {
          const qtyDelta = isReceived ? order.quantity : -order.quantity;
          const idx = newInv.findIndex(i => i.sku === order.sku && i.warehouseId === order.warehouseId);
           if (idx >= 0) {
              const existing = newInv[idx];
              const newOnHand = Math.max(0, existing.onHand + qtyDelta);
              const newAvailable = Math.max(0, existing.available + qtyDelta);
              
              const monthlyDemand = Math.max(existing.reorderPoint * 2, 20);
              const calculatedDays = monthlyDemand > 0 ? Math.round(Math.min((newAvailable / monthlyDemand) * 30, 300)) : 0;
              
              newInv[idx] = {
                 ...existing,
                 onHand: newOnHand,
                 available: newAvailable,
                 daysOfSupply: calculatedDays
              };
           } else if (isReceived) {
              const monthlyDemand = 20; // default for unknown item
              const calculatedDays = Math.round(Math.min((order.quantity / monthlyDemand) * 30, 300));
              newInv.push({
                 warehouseId: order.warehouseId,
                 sku: order.sku,
                 onHand: order.quantity,
                 inbound: 0,
                 reserved: 0,
                 available: order.quantity,
                 reorderPoint: 50,
                 optimalLevel: 100,
                 daysOfSupply: calculatedDays,
                 lastRestockDate: timestamp.split("T")[0],
                 nextRestockETA: null,
              });
           }
       });
       
       updateAlertsForInventory(newInv);
       return newInv;
    });

    if (isReceived) {
       setRecentlyOptimized(prev => {
          const next = new Set(prev);
          changingOrders.forEach(o => next.add(`${o.sku}-${o.warehouseId}`));
          return next;
       });
    }
  };

  // Update warehouse for a specific order
  const updateOrderWarehouse = (orderId: string, newWarehouseId: string) => {
     const warehouse = sixesWarehouses.find(w => w.id === newWarehouseId);
     if (!warehouse) return;

     setOptimizedOrders(prev => prev.map(o => o.id === orderId ? {
        ...o,
        warehouseId: newWarehouseId,
        warehouseName: warehouse.name
     } : o));
  };

  // Calculate warehouse utilization dynamically based on current inventory
  const getWarehouseUtilization = (): Map<string, WarehouseUtilization> => {
    const utilizationMap = new Map<string, WarehouseUtilization>();

    // Initialize with all warehouses
    sixesWarehouses.forEach((wh) => {
      utilizationMap.set(wh.id, {
        warehouseId: wh.id,
        totalUnits: 0,
        usedPallets: 0,
        totalPallets: wh.capacity.totalPallets,
        freePallets: wh.capacity.totalPallets,
        utilizationPercent: 0,
      });
    });

    // Calculate pallets per SKU (no mixing varieties on pallets)
    inventory.forEach((item) => {
      const util = utilizationMap.get(item.warehouseId);
      if (util) {
        util.totalUnits += item.onHand;
        // Each SKU gets its own pallet(s) - no mixing
        const palletsForThisSKU = Math.ceil(item.onHand / PUMPS_PER_PALLET);
        util.usedPallets += palletsForThisSKU;
      }
    });

    // Calculate free pallets and utilization percentage
    utilizationMap.forEach((util) => {
      util.freePallets = Math.max(0, util.totalPallets - util.usedPallets);
      util.utilizationPercent = (util.usedPallets / util.totalPallets) * 100;
    });

    return utilizationMap;
  };

  return (
    <InventoryStateContext.Provider
      value={{
        inventory,
        alerts,
        recentlyOptimized,
        optimizedOrders,
        updateInventory,
        addSubmittedOrders,
        setInventory,
        refreshData,
        clearRecentlyOptimized,
        toggleOrderReceived,
        updateOrderWarehouse,
        getWarehouseUtilization,
      }}
    >
      {children}
    </InventoryStateContext.Provider>
  );
}

export function useInventoryState() {
  const context = useContext(InventoryStateContext);
  if (context === undefined) {
    throw new Error(
      "useInventoryState must be used within an InventoryStateProvider",
    );
  }
  return context;
}
