/**
 * Context:
 * - Manufactures hydraulic pumps in India
 * - Ships to USA with 4 third-party warehouses
 * - Optimizes for regional demand, shipping costs, and storage
 */

export interface Warehouse {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  };
  capacity: {
    totalPallets: number;
    usedPallets: number;
    freePallets: number;
  };
  costs: {
    inboundPerPallet: number;
    storagePerPalletMonth: number;
    outboundPerOrder: number;
    outboundPerUnit: number;
  };
  coverage: {
    primaryStates: string[];
    shippingZones: string[];
  };
}

export interface ShippingZone {
  zone: string;
  label: string;
  states: string[];
  baseRate: number;
  perMileRate: number;
  avgDeliveryDays: number;
}

export interface InventoryItem {
  warehouseId: string;
  sku: string;
  onHand: number;
  inbound: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  optimalLevel: number;
  daysOfSupply: number;
  lastRestockDate: string;
  nextRestockETA: string | null;
}

export const warehouses: Warehouse[] = [
  {
    id: "WH-EAST",
    name: "North Carolina Warehouse",
    location: {
      city: "Charlotte",
      state: "NC",
      zipCode: "28208",
      coordinates: { lat: 35.2271, lng: -80.8431 },
    },
    capacity: {
      totalPallets: 250,
      usedPallets: 180,
      freePallets: 70,
    },
    costs: {
      inboundPerPallet: 45.0,
      storagePerPalletMonth: 28.5,
      outboundPerOrder: 8.5,
      outboundPerUnit: 1.2,
    },
    coverage: {
      primaryStates: ["NC", "SC", "VA", "GA", "FL", "TN", "AL", "MS"],
      shippingZones: ["Zone-1-East", "Zone-2-Southeast", "Zone-3-MidAtlantic"],
    },
  },
  {
    id: "WH-WEST",
    name: "Las Vegas Warehouse",
    location: {
      city: "Las Vegas",
      state: "NV",
      zipCode: "89101",
      coordinates: { lat: 36.1699, lng: -115.1398 },
    },
    capacity: {
      totalPallets: 220,
      usedPallets: 165,
      freePallets: 55,
    },
    costs: {
      inboundPerPallet: 42.0,
      storagePerPalletMonth: 32.0,
      outboundPerOrder: 9.0,
      outboundPerUnit: 1.35,
    },
    coverage: {
      primaryStates: ["NV", "CA", "OR", "WA", "AZ", "UT", "ID", "CO"],
      shippingZones: ["Zone-1-West", "Zone-2-Mountain", "Zone-3-Pacific"],
    },
  },
  {
    id: "WH-SOUTH",
    name: "Texas Warehouse",
    location: {
      city: "Dallas",
      state: "TX",
      zipCode: "75234",
      coordinates: { lat: 32.7767, lng: -96.797 },
    },
    capacity: {
      totalPallets: 280,
      usedPallets: 245,
      freePallets: 35,
    },
    costs: {
      inboundPerPallet: 43.5,
      storagePerPalletMonth: 26.0,
      outboundPerOrder: 8.0,
      outboundPerUnit: 1.15,
    },
    coverage: {
      primaryStates: ["TX", "OK", "AR", "LA", "NM", "KS", "MO"],
      shippingZones: ["Zone-1-South", "Zone-2-SouthCentral", "Zone-4-Midwest"],
    },
  },
  {
    id: "WH-PACIFIC",
    name: "California Warehouse",
    location: {
      city: "Los Angeles",
      state: "CA",
      zipCode: "90058",
      coordinates: { lat: 34.0522, lng: -118.2437 },
    },
    capacity: {
      totalPallets: 300,
      usedPallets: 230,
      freePallets: 70,
    },
    costs: {
      inboundPerPallet: 48.0,
      storagePerPalletMonth: 35.0,
      outboundPerOrder: 9.5,
      outboundPerUnit: 1.4,
    },
    coverage: {
      primaryStates: ["CA", "AZ", "OR", "WA", "HI"],
      shippingZones: ["Zone-1-Pacific", "Zone-3-Pacific", "Zone-2-Mountain"],
    },
  },
];

export const shippingZones: ShippingZone[] = [
  {
    zone: "Zone-1-East",
    label: "Local (NC, SC, VA)",
    states: ["NC", "SC", "VA"],
    baseRate: 8.5,
    perMileRate: 0.12,
    avgDeliveryDays: 1,
  },
  {
    zone: "Zone-2-Southeast",
    label: "Southeast (GA, FL, TN, AL)",
    states: ["GA", "FL", "TN", "AL", "MS"],
    baseRate: 12.0,
    perMileRate: 0.15,
    avgDeliveryDays: 2,
  },
  // ... (truncating for brevity, but including core data)
];
export const manufacturingLeadTime = {
    production: 14,
    shipping: 35,
    customs: 5,
    delivery: 3,
    total: 57,
    bufferDays: 7,
};

export interface ManufacturingOrder {
  id: string;
  sku: string;
  warehouseId: string;
  quantity: number;
  status: "pending" | "in-progress" | "completed";
  createdDate: string;
  completedDate?: string;
  estimatedCompletion?: string;
  notes?: string;
  alertId?: string;
}
