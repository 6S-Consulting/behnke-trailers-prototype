export type QuoteStatus = "new" | "in-review" | "quoted" | "negotiation" | "closed";

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice?: number;
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  items: QuoteItem[];
  status: QuoteStatus;
  customRequirements?: string;
  internalNotes?: string;
  quotedPrice?: number;
  requestedDate: string;
  updatedAt: string;
}

export const mockQuotes: Quote[] = [
  {
    id: "QR-2024-001",
    customerId: "cust-001",
    customerName: "Robert Mitchell",
    companyName: "Mitchell Heavy Equipment",
    email: "r.mitchell@mitchellequip.com",
    phone: "(555) 234-5678",
    items: [
      { productId: "prod-001", productName: "Heavy Duty Gear Pump HP-100", quantity: 15 },
      { productId: "prod-005", productName: "Industrial Piston Pump PP-50", quantity: 8 },
    ],
    status: "new",
    customRequirements: "Need nitrided shafts for all units. Delivery to job site in Houston, TX.",
    requestedDate: "2024-03-15",
    updatedAt: "2024-03-15",
  },
  {
    id: "QR-2024-002",
    customerId: "cust-002",
    customerName: "Sarah Chen",
    companyName: "Pacific Northwest Logging",
    email: "schen@pnwlogging.com",
    phone: "(555) 345-6789",
    items: [
      { productId: "prod-005", productName: "Industrial Piston Pump PP-50", quantity: 25 },
    ],
    status: "in-review",
    customRequirements: "Bulk order for fleet maintenance. Need staggered delivery over 3 months.",
    internalNotes: "Good customer - previous orders totaled $45k. Consider 15% volume discount.",
    requestedDate: "2024-03-14",
    updatedAt: "2024-03-15",
  },
  {
    id: "QR-2024-003",
    customerId: "cust-003",
    customerName: "James Williams",
    companyName: "Williams Agricultural Supply",
    email: "jwilliams@wagrisupply.com",
    phone: "(555) 456-7890",
    items: [
      { productId: "prod-002", productName: "Gear Pump GP-30 Standard", quantity: 50 },
      { productId: "prod-010", productName: "Compact Gear Pump GP-10", quantity: 100 },
    ],
    status: "quoted",
    customRequirements: "Agricultural equipment OEM order. Need certificates of conformance.",
    internalNotes: "Quoted at 12% discount. Awaiting response.",
    quotedPrice: 28500.00,
    requestedDate: "2024-03-10",
    updatedAt: "2024-03-14",
  },
  {
    id: "QR-2024-004",
    customerId: "cust-004",
    customerName: "Maria Garcia",
    companyName: "Southwest Construction Corp",
    email: "mgarcia@swconstruction.com",
    phone: "(555) 567-8901",
    items: [
      { productId: "prod-008", productName: "Piston Pump 3-Stage PP-150", quantity: 4 },
    ],
    status: "negotiation",
    customRequirements: "Custom displacement rate required - 7.2 GPM.",
    internalNotes: "Engineering confirmed custom spec is feasible. Additional $180 per unit.",
    quotedPrice: 5720.00,
    requestedDate: "2024-03-08",
    updatedAt: "2024-03-14",
  },
  {
    id: "QR-2024-005",
    customerId: "cust-005",
    customerName: "David Thompson",
    companyName: "Thompson Industrial",
    email: "dthompson@thompsonindustrial.com",
    phone: "(555) 678-9012",
    items: [
      { productId: "prod-003", productName: "Piston Pump P-80", quantity: 10 },
      { productId: "prod-004", productName: "Gear Pump GP-25", quantity: 20 },
    ],
    status: "closed",
    customRequirements: "Standard specifications acceptable.",
    internalNotes: "Order converted - PO #TI-2024-0892",
    quotedPrice: 11150.00,
    requestedDate: "2024-03-01",
    updatedAt: "2024-03-12",
  },
];
