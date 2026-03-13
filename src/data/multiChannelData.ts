// Multi-Channel Ingestion - Mock Data
// Frontend-only simulation data for the Multi-Channel Inventory Integration Dashboard

import sixesLogo from "@/assets/images/logo.png";
import amazonLogo from "@/assets/images/channellogo/amazon.png";
import flipkartLogo from "@/assets/images/channellogo/flipkart.png";
import ebayLogo from "@/assets/images/channellogo/ebay.png";
import warehouseLogo from "@/assets/images/channellogo/warehouse.png";

export type ChannelStatus = "connected" | "syncing" | "error" | "disabled";

export interface Channel {
  id: string;
  name: string;
  shortName: string;
  status: ChannelStatus;
  lastSync: string;
  ordersToday: number;
  billedAmount: number;
  syncAccuracy: number;
  enabled: boolean;
  logo?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: Date;
  channel: string;
  message: string;
  type: "success" | "syncing" | "error";
}

export interface ConflictEntry {
  id: string;
  product: string;
  channel: string;
  issue: string;
  severity: "high" | "medium" | "low";
}

export const initialChannels: Channel[] = [
  {
    id: "website",
    name: "Website (HYDRAULIC Store)",
    shortName: "Website",
    status: "connected",
    lastSync: "2 mins ago",
    ordersToday: 32,
    billedAmount: 4800,
    syncAccuracy: 98,
    enabled: true,
    logo: sixesLogo,
  },
  {
    id: "amazon",
    name: "Amazon",
    shortName: "Amazon",
    status: "connected",
    lastSync: "1 min ago",
    ordersToday: 41,
    billedAmount: 6150,
    syncAccuracy: 96,
    enabled: true,
    logo: amazonLogo,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    shortName: "Flipkart",
    status: "syncing",
    lastSync: "5 mins ago",
    ordersToday: 18,
    billedAmount: 2700,
    syncAccuracy: 91,
    enabled: true,
    logo: flipkartLogo,
  },
  {
    id: "ebay",
    name: "eBay",
    shortName: "eBay",
    status: "error",
    lastSync: "12 mins ago",
    ordersToday: 21,
    billedAmount: 3150,
    syncAccuracy: 84,
    enabled: true,
    logo: ebayLogo,
  },
  {
    id: "pos",
    name: "Warehouse",
    shortName: "Warehouse",
    status: "connected",
    lastSync: "30 secs ago",
    ordersToday: 14,
    billedAmount: 2100,
    syncAccuracy: 99,
    enabled: true,
    logo: warehouseLogo,
  },
];

export const syncLogTemplates: { message: string; channel: string; type: "success" | "syncing" | "error" }[] = [
  { message: "Order #2041 received (-2 stock)", channel: "Amazon", type: "success" },
  { message: "eBay order received (-1 stock)", channel: "eBay", type: "success" },
  { message: "Warehouse stock added (+20 units)", channel: "POS", type: "success" },
  { message: "Flipkart sync completed", channel: "Flipkart", type: "syncing" },
  { message: "Website order cancelled (+1 stock)", channel: "Website", type: "success" },
  { message: "Auto reorder triggered for Pump PVP16", channel: "POS", type: "syncing" },
  { message: "Stock mismatch detected for 505A", channel: "eBay", type: "error" },
  { message: "Order #2058 dispatched", channel: "Amazon", type: "success" },
  { message: "Bulk inventory update applied (+150)", channel: "POS", type: "success" },
  { message: "Price sync completed", channel: "Flipkart", type: "success" },
  { message: "SKU mapping updated for F112", channel: "Amazon", type: "syncing" },
  { message: "Listing sync in progress", channel: "eBay", type: "syncing" },
  { message: "Order #2063 from Website (-3 stock)", channel: "Website", type: "success" },
  { message: "Low stock alert: Pump Valve Kit V2", channel: "POS", type: "error" },
  { message: "Return processed (+2 stock)", channel: "Amazon", type: "success" },
  { message: "Inventory snapshot exported", channel: "Website", type: "success" },
  { message: "API rate limit warning", channel: "Flipkart", type: "error" },
  { message: "Order #2070 confirmed (-1 stock)", channel: "eBay", type: "success" },
  { message: "Barcode scan batch uploaded (+35)", channel: "POS", type: "success" },
  { message: "Category mapping synced", channel: "Amazon", type: "syncing" },
];

export const conflictData: ConflictEntry[] = [
  { id: "1", product: "Hydraulic Pump PVP16", channel: "Amazon", issue: "Overselling risk", severity: "high" },
  { id: "2", product: "Hydraulic Pump 505A", channel: "eBay", issue: "Sync delay", severity: "medium" },
  { id: "3", product: "Piston Motor PD018", channel: "Flipkart", issue: "Stock mismatch", severity: "high" },
  { id: "4", product: "Hydraulic Pump F112", channel: "Website", issue: "Update pending", severity: "low" },
  { id: "5", product: "Hydraulic Pump OIL300", channel: "Amazon", issue: "Price discrepancy", severity: "medium" },
  { id: "6", product: "Hydraulic Pump 315A", channel: "Flipkart", issue: "Listing inactive", severity: "low" },
  { id: "7", product: "Hydraulic Pump GCP6", channel: "eBay", issue: "Overselling risk", severity: "high" },
  { id: "8", product: "Hydraulic Pump F225", channel: "POS", issue: "Barcode mismatch", severity: "medium" },
];

export const orderFlowData = [
  { channel: "Website", orders: 32, color: "#a879c6" },
  { channel: "Amazon", orders: 41, color: "#975fc4" },
  { channel: "Flipkart", orders: 18, color: "#4f6aaf" },
  { channel: "eBay", orders: 21, color: "#5551af" },
  { channel: "POS", orders: 14, color: "#766dc4" },
];

export const dummyLogEntries = [
  "[2026-02-23 09:14:22] INFO  Sync initiated for Amazon channel",
  "[2026-02-23 09:14:23] INFO  Fetching inventory delta from Amazon API...",
  "[2026-02-23 09:14:25] OK    Retrieved 41 new orders",
  "[2026-02-23 09:14:26] OK    Stock levels updated for 63 SKUs",
  "[2026-02-23 09:14:27] WARN  SKU PVP16 stock mismatch: local=24, remote=22",
  "[2026-02-23 09:14:28] OK    Auto-reconciliation applied for SKU PVP16",
  "[2026-02-23 09:14:29] INFO  Price sync: 245 listings verified",
  "[2026-02-23 09:14:30] OK    Sync completed. Accuracy: 96%",
  "[2026-02-23 09:15:01] INFO  Webhook received: Order #2041 from Amazon",
  "[2026-02-23 09:15:02] OK    Inventory decremented: Hydraulic Pump PVP16 (-2)",
  "[2026-02-23 09:15:03] INFO  Cross-channel stock broadcast sent",
  "[2026-02-23 09:16:10] WARN  eBay API response delayed (2.3s)",
  "[2026-02-23 09:16:12] ERR   eBay sync timeout — retrying in 30s",
  "[2026-02-23 09:16:42] OK    eBay sync retry successful",
  "[2026-02-23 09:17:00] INFO  Scheduled full inventory reconciliation started",
  "[2026-02-23 09:17:15] OK    Reconciliation complete: 4 discrepancies resolved",
];
