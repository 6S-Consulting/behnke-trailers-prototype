import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product, products as mockProducts } from "@/data/products";
import { Order, orders as mockOrders } from "@/data/orders";
import { Customer, customers as mockCustomers } from "@/data/customers";
// Note: mockQuotes is still local as it wasn't requested for centralization yet, 
// but I will keep it for now or move if needed. 
import { Quote, mockQuotes } from "@/data/quotes"; 

// Margin thresholds
export const HEALTHY_MARGIN = 0.20; // 20%
export const CRITICAL_MARGIN = 0.15; // 15%
export const OPTIMAL_MARGIN = 0.25; // 25% - target for optimization

interface AdminContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  // Intelligence Layer state
  globalSteelIndex: number;
  setGlobalSteelIndex: React.Dispatch<React.SetStateAction<number>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Global Steel Price Index: 1.0 = 0%, 1.5 = +50%
  const [globalSteelIndex, setGlobalSteelIndex] = useState(1.0);

  return (
    <AdminContext.Provider
      value={{
        products,
        setProducts,
        quotes,
        setQuotes,
        orders,
        setOrders,
        customers,
        setCustomers,
        sidebarCollapsed,
        setSidebarCollapsed,
        globalSteelIndex,
        setGlobalSteelIndex,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
