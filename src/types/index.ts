// ==================== TYPES ====================

export type TrailerCategory =
  | 'Agricultural'
  | 'Construction'
  | 'Heavy Haul'
  | 'Commercial'
  | 'Utility/Telecom'
  | 'OEM';

export interface TrailerSpec {
  label: string;
  value: string;
}

export interface TrailerOption {
  id: string;
  name: string;
  description: string;
  priceAdd: number;
  category: 'Axle' | 'Hitch' | 'Deck' | 'Brakes' | 'Fenders' | 'Hydraulics' | 'Other';
}

export interface Trailer {
  id: string;
  modelNumber: string;
  name: string;
  category: TrailerCategory;
  subType: string;
  gvw: number;
  price: number;
  description: string;
  specs: TrailerSpec[];
  options: TrailerOption[];
  inStock: number;
  leadTimeDays: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Custom Order';
}

export interface SensorData {
  lastUpdated: string;
  axleTemp: number;
  tirePressure: number[];
  brakePadWear: number;
  frameMicrofractures: boolean;
  loadWeight: number;
  mileage: number;
  batteryVoltage: number;
  overallHealth: 'Good' | 'Warning' | 'Critical';
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Scheduled' | 'Emergency' | 'Inspection';
  description: string;
  technicianName: string;
  cost: number;
  dealerId: string;
}

export interface SoldTrailer {
  id: string;
  vin: string;
  trailerId: string;
  modelNumber: string;
  name: string;
  category: TrailerCategory;
  soldDate: string;
  customerId: string;
  dealerId: string;
  warrantyExpiry: string;
  sensorData: SensorData;
  maintenanceHistory: MaintenanceRecord[];
  nextMaintenanceDue: string;
}

export interface MaintenanceSlot {
  id: string;
  trailerId: string;
  customerId: string;
  dealerId: string;
  requestedDate: string;
  confirmedDate?: string;
  status: 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';
  type: 'Scheduled' | 'Emergency' | 'Inspection';
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  state: string;
  ownedTrailers: string[];
  assignedDealerId: string;
  joinDate: string;
}

export interface Dealer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  territory: string[];
  status: 'Active' | 'Inactive' | 'Pending';
  inventoryCount: number;
  totalSales: number;
  joinDate: string;
  customersServed: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'Standard' | 'Custom';
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'In Production' | 'Shipped' | 'Delivered' | 'Cancelled';
  fromId: string;
  fromType: 'Customer' | 'Dealer';
  toId: string;
  toType: 'Dealer' | 'Admin';
  trailerId?: string;
  modelNumber?: string;
  trailerName?: string;
  customSpecs?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdDate: string;
  updatedDate: string;
  estimatedDelivery?: string;
  notes: string;
  // Optional linkage used by the prototype to keep lifecycle synced.
  quoteId?: string;
  customerId?: string;
}

export interface QuoteItem {
  trailerId: string;
  modelNumber: string;
  name: string;
  basePrice: number;
  selectedOptions: TrailerOption[];
  optionsTotal: number;
  quantity: number;
  lineTotal: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired';
  fromId: string;
  toId: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  createdDate: string;
  notes: string;
  customizations: string[];
}

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: 'Customer' | 'Dealer' | 'Admin';
  type: 'MaintenanceAlert' | 'OrderUpdate' | 'QuoteReceived' | 'HealthWarning' | 'StockAlert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export type UserRole = 'admin' | 'dealer' | 'customer';
