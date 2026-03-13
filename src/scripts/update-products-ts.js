import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mergedCatalogPath = path.join(__dirname, '../data/merged-catalog.json');
const productsOutputPath = path.join(__dirname, '../data/products.ts');

console.log('Reading merged catalog...');
const mergedCatalog = JSON.parse(fs.readFileSync(mergedCatalogPath, 'utf8'));

console.log(`Found ${mergedCatalog.products.length} products`);

// Helper function to convert catalog product to TypeScript product format
function convertToTsProduct(product) {
  const stockStatusMap = {
    'In Stock': 'In Stock',
    'Out of Stock': 'Out of Stock',
    'Low Stock': 'Low Stock',
    'Made to Order': 'Made to Order'
  };

  // Helper to ensure value is a string
  const toString = (val) => val ? String(val) : '';

  // Use CSV image if available, otherwise use a placeholder
  const primaryImage = product.csvData?.imageSrc || 'img1510_1';
  
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    primaryImage: primaryImage,
    secondaryImage: primaryImage, // Use same image for now
    image: primaryImage,
    description: product.description || '',
    specs: {
      boreSize: toString(product.specifications?.boreSize),
      stroke: toString(product.specifications?.stroke),
      rodDiameter: toString(product.specifications?.rodDiameter),
      maxPressure: toString(product.specifications?.maxPressure) || '3500 PSI',
      mounting: toString(product.specifications?.mounting) || product.category,
      retractedLength: product.specifications?.retractedLength ? toString(product.specifications.retractedLength) : undefined,
      extendedLength: product.specifications?.extendedLength ? toString(product.specifications.extendedLength) : undefined,
      portSize: product.specifications?.portSize ? toString(product.specifications.portSize) : undefined,
      pinHole: product.specifications?.pinHole ? toString(product.specifications.pinHole) : undefined,
      columnLoad: product.specifications?.columnLoad ? toString(product.specifications.columnLoad) : undefined
    },
    features: product.features || [],
    stockStatus: stockStatusMap[product.stockStatus] || 'In Stock',
    groupId: product.groupId || undefined,
    isBestSeller: product.isBestSeller || undefined,
    discountPercentage: product.discountPercentage || undefined,
    collections: product.collections || ['shop-all']
  };
}

// Generate the TypeScript file content
function generateProductsTs(products) {
  const header = `// Auto-generated from merged-catalog.json
// Last updated: ${new Date().toISOString()}

// Welded Cross Tube Cylinder Images
import img1510_1 from '@/assets/images/products/welded/1.5x10 Hydraulic Cylinder/1.png';
import img1510_2 from '@/assets/images/products/welded/1.5x10 Hydraulic Cylinder/2.png';
import img1510_3 from '@/assets/images/products/welded/1.5x10 Hydraulic Cylinder/3.png';

import img2510_1 from '@/assets/images/products/welded/2.5x10 Hydraulic Cylinder/1.png';
import img2510_2 from '@/assets/images/products/welded/2.5x10 Hydraulic Cylinder/2.png';
import img2510_3 from '@/assets/images/products/welded/2.5x10 Hydraulic Cylinder/3.png';

import img1514_1 from '@/assets/images/products/welded/1.5x14 Hydraulic Cylinder/1.png';
import img1514_2 from '@/assets/images/products/welded/1.5x14 Hydraulic Cylinder/2.png';
import img1514_3 from '@/assets/images/products/welded/1.5x14 Hydraulic Cylinder/3.png';

import img2010_1 from '@/assets/images/products/welded/2x10 Hydraulic Cylinder/1.png';
import img2010_2 from '@/assets/images/products/welded/2x10 Hydraulic Cylinder/2.png';
import img2010_3 from '@/assets/images/products/welded/2x10 Hydraulic Cylinder/3.png';

import img3018_1 from '@/assets/images/products/welded/3x18 Hydraulic Cylinder/1.png';
import img3018_2 from '@/assets/images/products/welded/3x18 Hydraulic Cylinder/2.png';
import img3018_3 from '@/assets/images/products/welded/3x18 Hydraulic Cylinder/3.png';

// Tie-Rod Cylinder Images
import imgTieRod2010_1 from '@/assets/images/products/tie-rod/2x10 Hydraulic Cylinder/1.png';
import imgTieRod2010_2 from '@/assets/images/products/tie-rod/2x10 Hydraulic Cylinder/2.webp';
import imgTieRod2010_3 from '@/assets/images/products/tie-rod/2x10 Hydraulic Cylinder/3.webp';

// Tang Cylinder Images
import imgTang2016_1 from '@/assets/images/products/tang/2x16 Hydraulic Cylinder /1.webp';
import imgTang2016_2 from '@/assets/images/products/tang/2x16 Hydraulic Cylinder /2.webp';
import imgTang2016_3 from '@/assets/images/products/tang/2x16 Hydraulic Cylinder /3.webp';

// Log Splitter Cylinder Images
import imgLogSplitter4024_1 from '@/assets/images/products/log-splitter/4x24 Hydraulic Log Splitter Cylinder/1.webp';
import imgLogSplitter4024_2 from '@/assets/images/products/log-splitter/4x24 Hydraulic Log Splitter Cylinder/2.webp';
import imgLogSplitter4024_3 from '@/assets/images/products/log-splitter/4x24 Hydraulic Log Splitter Cylinder/3.webp';


export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  
  // Image handling: primary shows by default, secondary shows on hover
  primaryImage: string;
  secondaryImage: string;
  image: string; // Deprecated: kept for backward compatibility, use primaryImage instead
  gallery?: string[]; // Additional images beyond primary and secondary
  
  description: string;
  specs: {
    boreSize: string;
    stroke: string;
    rodDiameter: string;
    maxPressure: string;
    mounting: string;
    retractedLength?: string;
    extendedLength?: string;
    portSize?: string;
    pinHole?: string;
    columnLoad?: string;
  };
  features?: string[];
  stockStatus: 'In Stock' | 'Low Stock' | 'Made to Order' | 'Out of Stock';
  groupId?: string;
  
  // New properties
  isBestSeller?: boolean; // Tag product as best seller
  discountPercentage?: number; // Discount percentage (e.g., 15 for 15% off)
  collections: string[]; // Which pages/collections to show this product in
  // Collections can include: 'shop-all', 'welded-cross-tube', 'tie-rod', 'tang', 
  // 'welded-clevis', 'log-splitter', 'swivel-eye', 'pin-eye', 'telescopic',
  // 'construction', 'agriculture', 'industrial', 'marine', etc.
}

export const categories = [
  "All",
  "Welded Cross Tubes Cylinder",
  "Tie-Rod Cylinder",
  "Tang Cylinder",
  "Welded Clevis Cylinder",
  "Log Splitter Hydraulic Cylinder",
  "Swivel Eye Cylinder",
  "Pin Eye Cylinder",
  "Telescopic Cylinder"
];

`;

  // Helper to determine which image import to use based on product category and ID
  function getImageImport(product) {
    const category = product.category;
    const productId = product.id;
    
    // Log Splitter Cylinders
    if (category.includes('Log Splitter') || productId.includes('4x24')) {
      return 'imgLogSplitter4024_1';
    }
    
    // Tang Cylinders
    if (category.includes('Tang') || productId.includes('2x16') || productId.includes('2x18')) {
      return 'imgTang2016_1';
    }
    
    // Tie-Rod Cylinders
    if (category.includes('Tie-Rod') || category.includes('Tie Rod')) {
      return 'imgTieRod2010_1';
    }
    
    // Welded Cross Tube Cylinders (default for welded products)
    if (productId.startsWith('1510')) return 'img1510_1';
    if (productId.startsWith('1514')) return 'img1514_1';
    if (productId.startsWith('151')) return 'img1510_1'; // Other 1.5" products
    if (productId.startsWith('251')) return 'img2510_1'; // 2.5" products
    if (productId.startsWith('2010')) return 'img2010_1';
    if (productId.startsWith('201')) return 'img2010_1'; // Other 2.0" products
    if (productId.startsWith('3018')) return 'img3018_1';
    if (productId.startsWith('301')) return 'img3018_1'; // Other 3.0" products
    
    return 'img1510_1'; // Default fallback
  }

  function getSecondaryImageImport(product) {
    const category = product.category;
    const productId = product.id;
    
    // Log Splitter Cylinders
    if (category.includes('Log Splitter') || productId.includes('4x24')) {
      return 'imgLogSplitter4024_2';
    }
    
    // Tang Cylinders
    if (category.includes('Tang') || productId.includes('2x16') || productId.includes('2x18')) {
      return 'imgTang2016_2';
    }
    
    // Tie-Rod Cylinders
    if (category.includes('Tie-Rod') || category.includes('Tie Rod')) {
      return 'imgTieRod2010_2';
    }
    
    // Welded Cross Tube Cylinders
    if (productId.startsWith('1510')) return 'img1510_2';
    if (productId.startsWith('1514')) return 'img1514_2';
    if (productId.startsWith('151')) return 'img1510_2';
    if (productId.startsWith('251')) return 'img2510_2';
    if (productId.startsWith('2010')) return 'img2010_2';
    if (productId.startsWith('201')) return 'img2010_2';
    if (productId.startsWith('3018')) return 'img3018_2';
    if (productId.startsWith('301')) return 'img3018_2';
    
    return 'img1510_2';
  }

  function getGalleryImports(product) {
    const category = product.category;
    const productId = product.id;
    
    // Log Splitter Cylinders (has 3 images)
    if (category.includes('Log Splitter') || productId.includes('4x24')) {
      return '[imgLogSplitter4024_1, imgLogSplitter4024_2, imgLogSplitter4024_3]';
    }
    
    // Tang Cylinders
    if (category.includes('Tang') || productId.includes('2x16') || productId.includes('2x18')) {
      return '[imgTang2016_1, imgTang2016_2, imgTang2016_3]';
    }
    
    // Tie-Rod Cylinders
    if (category.includes('Tie-Rod') || category.includes('Tie Rod')) {
      return '[imgTieRod2010_1, imgTieRod2010_2, imgTieRod2010_3]';
    }
    
    // Welded Cross Tube Cylinders
    const base = getImageImport(product).replace('_1', '');
    return `[${base}_1, ${base}_2, ${base}_3]`;
  }

  // Generate product entries using JSON.stringify for proper escaping
  const productEntries = products.map(product => {
    const primaryImg = getImageImport(product);
    const secondaryImg = getSecondaryImageImport(product);
    const gallery = getGalleryImports(product);
    
    let entry = `  {\n`;
    entry += `    id: ${JSON.stringify(product.id)},\n`;
    entry += `    name: ${JSON.stringify(product.name)},\n`;
    entry += `    category: ${JSON.stringify(product.category)},\n`;
    entry += `    price: ${product.price},\n`;
    entry += `    primaryImage: ${primaryImg},\n`;
    entry += `    secondaryImage: ${secondaryImg},\n`;
    entry += `    image: ${primaryImg},\n`;
    entry += `    gallery: ${gallery},\n`;
    entry += `    description: ${JSON.stringify(product.description)},\n`;
    entry += `    specs: {\n`;
    entry += `      boreSize: ${JSON.stringify(product.specs.boreSize)},\n`;
    entry += `      stroke: ${JSON.stringify(product.specs.stroke)},\n`;
    entry += `      rodDiameter: ${JSON.stringify(product.specs.rodDiameter)},\n`;
    entry += `      maxPressure: ${JSON.stringify(product.specs.maxPressure)},\n`;
    entry += `      mounting: ${JSON.stringify(product.specs.mounting)},\n`;
    if (product.specs.portSize) entry += `      portSize: ${JSON.stringify(product.specs.portSize)},\n`;
    if (product.specs.pinHole) entry += `      pinHole: ${JSON.stringify(product.specs.pinHole)},\n`;
    if (product.specs.retractedLength) entry += `      retractedLength: ${JSON.stringify(product.specs.retractedLength)},\n`;
    if (product.specs.extendedLength) entry += `      extendedLength: ${JSON.stringify(product.specs.extendedLength)},\n`;
    if (product.specs.columnLoad) entry += `      columnLoad: ${JSON.stringify(product.specs.columnLoad)},\n`;
    entry += `    },\n`;
    
    if (product.features && product.features.length > 0) {
      entry += `    features: ${JSON.stringify(product.features)},\n`;
    }
    
    entry += `    stockStatus: ${JSON.stringify(product.stockStatus)},\n`;
    if (product.groupId) entry += `    groupId: ${JSON.stringify(product.groupId)},\n`;
    if (product.isBestSeller) entry += `    isBestSeller: true,\n`;
    if (product.discountPercentage) entry += `    discountPercentage: ${product.discountPercentage},\n`;
    entry += `    collections: ${JSON.stringify(product.collections)}\n`;
    entry += `  }`;
    
    return entry;
  });

  const productsArray = `export const products: Product[] = [\n${productEntries.join(',\n')}\n];\n`;

  return header + productsArray;
}

// Convert all products
const convertedProducts = mergedCatalog.products.map(convertToTsProduct);

// Generate the TypeScript file
const tsContent = generateProductsTs(convertedProducts);

// Write to file
console.log('Writing products.ts...');
fs.writeFileSync(productsOutputPath, tsContent);

console.log(`✅ Successfully updated products.ts with ${convertedProducts.length} products!`);
console.log(`Output file: ${productsOutputPath}`);
