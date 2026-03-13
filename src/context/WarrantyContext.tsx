import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WarrantyRegistration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string; // e.g., +1
  orderNumber: string;
  orderedFrom: string;
  registrationDate: string;
  productName?: string; // Optional, might infer from order
  status: 'Pending' | 'Active' | 'Expired';
}

interface WarrantyContextType {
  warranties: WarrantyRegistration[];
  addWarranty: (registration: Omit<WarrantyRegistration, 'id' | 'registrationDate' | 'status'>) => void;
}

const WarrantyContext = createContext<WarrantyContextType | undefined>(undefined);

export function WarrantyProvider({ children }: { children: React.ReactNode }) {
  const [warranties, setWarranties] = useState<WarrantyRegistration[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('warranties');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('warranties', JSON.stringify(warranties));
  }, [warranties]);

  const addWarranty = (data: Omit<WarrantyRegistration, 'id' | 'registrationDate' | 'status'>) => {
    const newWarranty: WarrantyRegistration = {
      ...data,
      id: `WR-${Math.floor(Math.random() * 100000)}`,
      registrationDate: new Date().toISOString(),
      status: 'Active', // Auto-active for prototype
    };
    setWarranties(prev => [newWarranty, ...prev]);
  };

  return (
    <WarrantyContext.Provider value={{ warranties, addWarranty }}>
      {children}
    </WarrantyContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWarranty() {
  const context = useContext(WarrantyContext);
  if (context === undefined) {
    throw new Error('useWarranty must be used within a WarrantyProvider');
  }
  return context;
}
