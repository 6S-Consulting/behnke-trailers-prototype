export interface Product {
  id: string;
  title: string;
  category: string;
  vendor: string;
  sku: string;
  variantSku?: string;
  price: number;
  description: string;
  productType?: string;  
  mounting?: string;    
  bore?: string;
  stroke?: string;
  rod?: string;
  psi?: string;
  imageUrl?: string;
  barcode?: string;
  groupId?: string;
}

export interface Filters {
  categories: string[];
  vendors: string[];
  priceRange: [number, number];
  bore: string[];
  stroke: string[];
  rod: string[];
  psi: string[];
}

export type ViewMode = 'grid' | 'table';

export type SearchMode = 'text' | 'voice' | 'image' | 'barcode';
