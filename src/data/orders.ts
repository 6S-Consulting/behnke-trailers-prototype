export type OrderStatus = "received" | "confirmed" | "in-production" | "dispatched";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  trackingNumber?: string;
}

export const orders: Order[] = [
  {
    id: "ORD-2024-0145",
    customerId: "cust-005",
    customerName: "David Thompson",
    companyName: "Thompson Industrial",
    items: [
      { productId: "PVP16", productName: "PVP16 Hydraulic Piston Pump", quantity: 10, unitPrice: 510 },
      { productId: "505A", productName: "PGP505A Hydraulic Gear Pump", quantity: 20, unitPrice: 245 },
    ],
    totalAmount: 10000,
    status: "dispatched",
    orderDate: "2024-03-12",
    estimatedDelivery: "2024-03-18",
    shippingAddress: "4521 Industrial Blvd, Phoenix, AZ 85034",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "ORD-2024-0144",
    customerId: "cust-006",
    customerName: "Michael Brown",
    companyName: "Brown Mining Equipment",
    items: [
      { productId: "F112", productName: "F1-12 Hydraulic Pump", quantity: 8, unitPrice: 980 },
    ],
    totalAmount: 7840.00,
    status: "in-production",
    orderDate: "2024-03-11",
    estimatedDelivery: "2024-03-22",
    shippingAddress: "890 Mining Road, Salt Lake City, UT 84101",
  },
  {
    id: "ORD-2024-0143",
    customerId: "cust-007",
    customerName: "Lisa Anderson",
    companyName: "Anderson Fleet Services",
    items: [
      { productId: "315A", productName: "PGP315A Gear Pump", quantity: 30, unitPrice: 315 },
      { productId: "F225", productName: "F2-25 Twin Flow Pump", quantity: 15, unitPrice: 1550 },
    ],
    totalAmount: 32700,
    status: "confirmed",
    orderDate: "2024-03-14",
    estimatedDelivery: "2024-03-28",
    shippingAddress: "2100 Transport Way, Denver, CO 80202",
  },
  {
    id: "ORD-2024-0142",
    customerId: "cust-008",
    customerName: "Kevin Martinez",
    companyName: "Martinez Fabrication",
    items: [
      { productId: "PD018", productName: "PD018 Hydraulic Piston Pump", quantity: 20, unitPrice: 690 },
    ],
    totalAmount: 13800.00,
    status: "received",
    orderDate: "2024-03-15",
    shippingAddress: "567 Fabrication Dr, El Paso, TX 79901",
  },
];
