import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PaymentMethod {
  id: string;
  cardName: string;
  cardNumber: string; // Storing strictly for prototype auto-fill demo purposes
  expiry: string;
  cvc: string; // Storing strictly for prototype auto-fill demo purposes
  isDefault?: boolean;
}

interface PaymentMethodContextType {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
}

const PaymentMethodContext = createContext<PaymentMethodContextType | undefined>(undefined);

export function PaymentMethodProvider({ children }: { children: React.ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('paymentMethods');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const addPaymentMethod = (methodData: Omit<PaymentMethod, 'id'>) => {
    const newMethod = {
      ...methodData,
      id: `card_${Date.now()}`,
    };
    
    if (paymentMethods.length === 0) {
      newMethod.isDefault = true;
    }

    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  return (
    <PaymentMethodContext.Provider value={{ paymentMethods, addPaymentMethod, removePaymentMethod }}>
      {children}
    </PaymentMethodContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePaymentMethods() {
  const context = useContext(PaymentMethodContext);
  if (context === undefined) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodProvider');
  }
  return context;
}
