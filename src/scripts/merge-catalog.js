import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the existing products-catalog.json
const catalogPath = path.join(__dirname, '../data/products-catalog.json');
const csvJsonPath = path.join(__dirname, '../data/csvjson.json');
const outputPath = path.join(__dirname, '../data/merged-catalog.json');

console.log('Reading files...');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const csvData = JSON.parse(fs.readFileSync(csvJsonPath, 'utf8'));

console.log(`Loaded ${catalog.products.length} products from catalog`);
console.log(`Loaded ${csvData.length} products from CSV JSON`);

// Create a map of CSV products by various identifiers for quick lookup
const csvProductsMap = new Map();
csvData.forEach(csvProduct => {
  const sku = csvProduct['Variant SKU'];
  const handle = csvProduct.Handle;
  const title = csvProduct.Title;
  
  if (sku) csvProductsMap.set(sku, csvProduct);
  if (handle) csvProductsMap.set(handle, csvProduct);
  if (title) csvProductsMap.set(title, csvProduct);
});

// Helper function to find matching CSV product
function findMatchingCsvProduct(catalogProduct) {
  // Try matching by SKU
  if (catalogProduct.sku && csvProductsMap.has(catalogProduct.sku)) {
    return csvProductsMap.get(catalogProduct.sku);
  }
  
  // Try matching by ID
  if (catalogProduct.id && csvProductsMap.has(catalogProduct.id)) {
    return csvProductsMap.get(catalogProduct.id);
  }
  
  // Try matching by name
  if (catalogProduct.name && csvProductsMap.has(catalogProduct.name)) {
    return csvProductsMap.get(catalogProduct.name);
  }
  
  return null;
}

// Merge CSV data into catalog products
let mergedCount = 0;
const mergedProducts = catalog.products.map(product => {
  const csvProduct = findMatchingCsvProduct(product);
  
  if (csvProduct) {
    mergedCount++;
    // Merge the data - add CSV data as additional properties
    return {
      ...product,
      // Add CSV-specific data
      csvData: {
        handle: csvProduct.Handle,
        variantSKU: csvProduct['Variant SKU'],
        vendor: csvProduct.Vendor,
        productCategory: csvProduct['Product Category'],
        type: csvProduct.Type,
        published: csvProduct.Published,
        variantPrice: csvProduct['Variant Price'],
        variantGrams: csvProduct['Variant Grams'],
        variantInventoryTracker: csvProduct['Variant Inventory Tracker'],
        variantInventoryPolicy: csvProduct['Variant Inventory Policy'],
        variantFulfillmentService: csvProduct['Variant Fulfillment Service'],
        variantRequiresShipping: csvProduct['Variant Requires Shipping'],
        variantTaxable: csvProduct['Variant Taxable'],
        imageSrc: csvProduct['Image Src'],
        imagePosition: csvProduct['Image Position'],
        giftCard: csvProduct['Gift Card'],
        seoTitle: csvProduct['SEO Title'],
        seoDescription: csvProduct['SEO Description'],
        googleShoppingCategory: csvProduct['Google Shopping / Google Product Category'],
        googleShoppingMPN: csvProduct['Google Shopping / MPN'],
        googleShoppingCondition: csvProduct['Google Shopping / Condition'],
        bore: csvProduct['Bore (product.metafields.custom.bore)'],
        hydraulicCylinderType: csvProduct['Hydraulic Cylinder (product.metafields.custom.categories)'],
        extendedLength: csvProduct['Extended Length (product.metafields.custom.extended_length)'],
        portSize: csvProduct['Port Size (product.metafields.custom.port_size)'],
        retractedLength: csvProduct['Retracted Length (product.metafields.custom.retracted_length)'],
        rod: csvProduct['Rod (product.metafields.custom.rod)'],
        stroke: csvProduct['Stroke (product.metafields.custom.stroke)'],
        color: csvProduct['Color (product.metafields.shopify.color-pattern)'],
        variantWeightUnit: csvProduct['Variant Weight Unit'],
        status: csvProduct.Status,
        bodyHTML: csvProduct['Body (HTML)']
      }
    };
  }
  
  return product;
});

// Add new products from CSV that don't exist in catalog
const newProducts = [];
csvData.forEach(csvProduct => {
  const sku = csvProduct['Variant SKU'] || csvProduct.Handle;
  const existsInCatalog = catalog.products.some(p => 
    p.sku === sku || p.id === sku || p.id === csvProduct.Handle
  );
  
  if (!existsInCatalog && csvProduct.Status === 'active') {
    // Convert CSV product to catalog format
    const newProduct = {
      id: csvProduct.Handle || csvProduct['Variant SKU'],
      sku: csvProduct['Variant SKU'] || csvProduct.Handle,
      name: csvProduct.Title,
      shortName: csvProduct.Title,
      category: csvProduct.Type || 'Hydraulic Cylinder',
      price: csvProduct['Variant Price'] || 0,
      currency: 'USD',
      stockStatus: csvProduct.Status === 'active' ? 'In Stock' : 'Out of Stock',
      isBestSeller: false,
      discountPercentage: 0,
      groupId: csvProduct.Type?.toLowerCase().replace(/\s+/g, '-') || 'hydraulic-cylinder',
      collections: ['shop-all'],
      description: csvProduct['Body (HTML)'] || '',
      specifications: {
        boreSize: csvProduct['Bore (product.metafields.custom.bore)'] || null,
        stroke: csvProduct['Stroke (product.metafields.custom.stroke)'] || null,
        rodDiameter: csvProduct['Rod (product.metafields.custom.rod)'] || null,
        maxPressure: null,
        mounting: csvProduct.Type || null,
        portSize: csvProduct['Port Size (product.metafields.custom.port_size)'] || null,
        pinHole: null,
        retractedLength: csvProduct['Retracted Length (product.metafields.custom.retracted_length)'] || null,
        extendedLength: csvProduct['Extended Length (product.metafields.custom.extended_length)'] || null,
        columnLoad: null
      },
      features: [],
      applications: [],
      csvData: csvProduct // Include full CSV data
    };
    
    newProducts.push(newProduct);
  }
});

console.log(`Found ${newProducts.length} new products from CSV`);
console.log(`Merged CSV data into ${mergedCount} existing products`);

// Create the merged catalog
const mergedCatalog = {
  catalog: {
    ...catalog.catalog,
    totalProducts: mergedProducts.length + newProducts.length,
    lastUpdated: new Date().toISOString().split('T')[0],
    version: '2.0'
  },
  products: [...mergedProducts, ...newProducts]
};

// Write the merged catalog
console.log('Writing merged catalog...');
fs.writeFileSync(outputPath, JSON.stringify(mergedCatalog, null, 2));

console.log(`✅ Merge complete!`);
console.log(`Total products in merged catalog: ${mergedCatalog.products.length}`);
console.log(`Products with CSV data: ${mergedCount}`);
console.log(`New products from CSV: ${newProducts.length}`);
console.log(`Output file: ${outputPath}`);
