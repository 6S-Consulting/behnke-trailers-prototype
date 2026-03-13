import { useState, useEffect } from 'react';
import { products as productsData } from '../data/products';
import { Product } from '../types/Product';

// Clean spec values to be consistent (remove "inch", quotes, etc.)
// Examples: "1.5 inch" -> "1.5", "2\"" -> "2", "8 ASAE" -> "8"
function cleanSpecValue(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/"/g, '').replace(/ inch/gi, '').split(' ')[0];
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const parsedProducts: Product[] = productsData.map((p) => {
        // Map data/products.ts structure to types/Product.ts structure
        return {
          id: p.id,
          title: p.name, // Map name to title
          category: p.category,
          vendor: 'HYDRAULIC pumps', // Hardcoded as per data
          sku: p.id, // ID acts as SKU in the new data
          variantSku: p.id,
          price: p.price,
          description: p.description,
          productType: p.category, // Use category as product type
          mounting: p.specs.mounting,
          psi: p.specs.maxPressure,
          // Clean specs for consistency
          bore: cleanSpecValue(p.specs.boreSize),
          stroke: cleanSpecValue(p.specs.stroke),
          rod: cleanSpecValue(p.specs.rodDiameter),
          
          imageUrl: p.primaryImage,
          barcode: '',
          groupId: p.groupId
        };
      });

      // Use a microtask to batch the state updates
      queueMicrotask(() => {
        setProducts(parsedProducts);
        setLoading(false);
      });
    } catch (err: unknown) {
      console.error('Error processing product data:', err);
      queueMicrotask(() => {
        setError('Error processing product data');
        setLoading(false);
      });
    }
  }, []);

  return { products, loading, error };
}
