export interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Robert Mitchell",
    companyName: "Mitchell Heavy Equipment",
    email: "r.mitchell@mitchellequip.com",
    phone: "(555) 234-5678",
    address: "1234 Equipment Lane, Houston, TX 77001",
    totalOrders: 12,
    totalSpent: 67500.00,
    lastOrderDate: "2024-02-28",
    createdAt: "2022-06-15",
  },
  {
    id: "cust-002",
    name: "Sarah Chen",
    companyName: "Pacific Northwest Logging",
    email: "schen@pnwlogging.com",
    phone: "(555) 345-6789",
    address: "5678 Forest Road, Seattle, WA 98101",
    totalOrders: 8,
    totalSpent: 45200.00,
    lastOrderDate: "2024-03-05",
    createdAt: "2023-01-20",
  },
  {
    id: "cust-003",
    name: "James Williams",
    companyName: "Williams Agricultural Supply",
    email: "jwilliams@wagrisupply.com",
    phone: "(555) 456-7890",
    address: "910 Farm Equipment Dr, Des Moines, IA 50301",
    totalOrders: 25,
    totalSpent: 125800.00,
    lastOrderDate: "2024-03-10",
    createdAt: "2021-03-08",
  },
  {
    id: "cust-004",
    name: "Maria Garcia",
    companyName: "Southwest Construction Corp",
    email: "mgarcia@swconstruction.com",
    phone: "(555) 567-8901",
    address: "234 Construction Blvd, Phoenix, AZ 85001",
    totalOrders: 6,
    totalSpent: 34500.00,
    lastOrderDate: "2024-02-15",
    createdAt: "2023-05-12",
  },
  {
    id: "cust-005",
    name: "David Thompson",
    companyName: "Thompson Industrial",
    email: "dthompson@thompsonindustrial.com",
    phone: "(555) 678-9012",
    address: "4521 Industrial Blvd, Phoenix, AZ 85034",
    totalOrders: 18,
    totalSpent: 89200.00,
    lastOrderDate: "2024-03-12",
    createdAt: "2021-09-22",
  },
  {
    id: "cust-006",
    name: "Michael Brown",
    companyName: "Brown Mining Equipment",
    email: "mbrown@brownmining.com",
    phone: "(555) 789-0123",
    address: "890 Mining Road, Salt Lake City, UT 84101",
    totalOrders: 15,
    totalSpent: 78400.00,
    lastOrderDate: "2024-03-11",
    createdAt: "2022-02-14",
  },
  {
    id: "cust-007",
    name: "Lisa Anderson",
    companyName: "Anderson Fleet Services",
    email: "landerson@andersonfleet.com",
    phone: "(555) 890-1234",
    address: "2100 Transport Way, Denver, CO 80202",
    totalOrders: 22,
    totalSpent: 112500.00,
    lastOrderDate: "2024-03-14",
    createdAt: "2021-07-30",
  },
  {
    id: "cust-008",
    name: "Kevin Martinez",
    companyName: "Martinez Fabrication",
    email: "kmartinez@martinezfab.com",
    phone: "(555) 901-2345",
    address: "567 Fabrication Dr, El Paso, TX 79901",
    totalOrders: 9,
    totalSpent: 52300.00,
    lastOrderDate: "2024-03-15",
    createdAt: "2023-03-18",
  },
];
