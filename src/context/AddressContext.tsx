import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Address {
  id: string;
  name: string; // Label e.g. "Home", "Office"
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault?: boolean;
}

interface AddressContextType {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('addresses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }, [addresses]);

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress = {
      ...addressData,
      id: `addr_${Date.now()}`,
    };
    
    // If it's the first address, make it default
    if (addresses.length === 0) {
      newAddress.isDefault = true;
    }

    setAddresses(prev => [...prev, newAddress]);
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses(prev => prev.map(addr => 
      addr.id === id ? { ...addr, ...updates } : addr
    ));
  };

  return (
    <AddressContext.Provider value={{ addresses, addAddress, removeAddress, updateAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAddress() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
}
