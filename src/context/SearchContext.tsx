import { createContext, useContext, useState, type ReactNode } from 'react';
import { products, type Product } from '@/data/products';

export type SearchMode = 'text' | 'voice' | 'image' | 'barcode';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  searchResults: Product[];
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  performSearch: (query: string, mode?: SearchMode) => void;
  clearSearch: () => void;
  highlightText: (text: string, query: string) => React.ReactNode;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('text');
  const [searchResults, setSearchResults] = useState<Product[]>(products);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (query: string, mode: SearchMode = 'text') => {
    setSearchQuery(query);
    setSearchMode(mode);
    
    if (!query.trim()) {
      setSearchResults(products);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const filtered = products.filter(product => {
      // Create searchable text from all product fields
      const searchableText = [
        product.name,
        product.id,
        product.sku,
        product.description,
        product.category,
        product.price.toString(),
        product.specs.boreSize || '',
        product.specs.stroke || '',
        product.specs.rodDiameter || '',
        product.specs.maxPressure || '',
        product.specs.mounting || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.specs as any).retractedLength || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.specs as any).extendedLength || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.specs as any).portSize || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.specs as any).pinHole || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (product.specs as any).columnLoad || '',
        ...(product.features || [])
      ].join(' ').toLowerCase();

      // For barcode/SKU mode, do exact match on ID
      if (mode === 'barcode') {
        return product.id.toLowerCase() === lowerQuery;
      }

      // For other modes, do substring match
      return searchableText.includes(lowerQuery);
    });

    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(products);
    setSearchMode('text');
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-slate-200 text-slate-900">{part}</mark>
        : part
    );
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      searchMode,
      setSearchMode,
      searchResults,
      isSearching,
      setIsSearching,
      performSearch,
      clearSearch,
      highlightText
    }}>
      {children}
    </SearchContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
