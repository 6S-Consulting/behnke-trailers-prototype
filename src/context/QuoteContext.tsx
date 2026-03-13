import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';

export interface Quote {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Reviewing' | 'Approved' | 'Rejected';
}

interface QuoteContextType {
  quotes: Quote[];
  addQuote: (quote: Omit<Quote, 'id' | 'date' | 'status'>) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quotes');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('quotes', JSON.stringify(quotes));
  }, [quotes]);

  const addQuote = (quoteData: Omit<Quote, 'id' | 'date' | 'status'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: `QT-${Math.floor(Math.random() * 100000)}`,
      date: new Date().toISOString(),
      status: 'Pending',
    };
    setQuotes(prev => [newQuote, ...prev]);
  };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote }}>
      {children}
    </QuoteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuotes() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuotes must be used within a QuoteProvider');
  }
  return context;
}
