import { memo, useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { ProductFamily, CylinderConfiguration, MountingType } from '../types/cylinder';
import { productCatalog } from '../data/productCatalog';
import Cylinder3DViewer from './Cylinder3DViewer';
import { calculateRodDiameter, calculateDimensions } from '../utils/engineering';

interface CatalogListProps {
  onSelectProduct: (product: ProductFamily) => void;
}

const Mini3DPreview = memo(({ product }: { product: ProductFamily }) => {
  const { defaultConfig, dimensions } = useMemo(() => {
    const config: CylinderConfiguration = {
      id: `default-${product.id}`,
      productFamilyId: product.id,
      bore: product.defaultBore,
      stroke: product.defaultStroke,
      rodDiameter: calculateRodDiameter(product.defaultBore, product.type),
      cylinderType: product.type,
      operatingPressure: product.defaultPressure,
      portType: product.defaultPortType,
      mountingType: (product.type.includes('eye') || product.type === 'pin-eye' || product.type === 'swivel-eye')
        ? 'eye'
        : (product.type.includes('clevis') || product.type.includes('cross-tube'))
          ? 'clevis'
          : product.type === 'tie-rod'
            ? 'trunnion'
            : 'tang' as MountingType,
      sealType: 'polyurethane',
      rodMaterial: '1045-carbon-steel',
      rodFinish: 'chrome',
      barrelMaterial: '1045-carbon-steel',
      barrelFinish: 'honed',
      pistonMaterial: 'ductile-iron',
      headCapType: 'standard',
      baseCapType: 'standard',
    };
    return {
      defaultConfig: config,
      dimensions: calculateDimensions(config)
    };
  }, [product]);

  return (
    <div className="h-full w-full bg-white relative overflow-hidden">
      <Cylinder3DViewer config={defaultConfig} dimensions={dimensions} isMini />
     
    </div>
  );
});

Mini3DPreview.displayName = 'Mini3DPreview';

export default function CatalogList({ onSelectProduct }: CatalogListProps) {
  const [sortOrder, setSortOrder] = useState("Featured");
  const [gridView, setGridView] = useState(4);

  const sortedProducts = useMemo(() => {
    const result = [...productCatalog];
    if (sortOrder === "Price: Low to High") {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortOrder === "Price: High to Low") {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (sortOrder === "Alphabetically, A-Z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "Alphabetically, Z-A") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === "Type") {
      result.sort((a, b) => a.type.localeCompare(b.type));
    }
    return result;
  }, [sortOrder]);

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Custom Configurator
            </h1>
           
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
              <button
                onClick={() => setGridView(3)}
                className={`p-2 rounded-lg transition-all ${gridView === 3 ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setGridView(4)}
                className={`p-2 rounded-lg transition-all ${gridView === 4 ? 'bg-white text-black shadow-sm' : 'text-gray-300 hover:text-gray-500'}`}
              >
                <div className="flex gap-0.5">
                  <div className="w-1 h-3.5 bg-current rounded-full" />
                  <div className="w-1 h-3.5 bg-current rounded-full" />
                  <div className="w-1 h-3.5 bg-current rounded-full" />
                  <div className="w-1 h-3.5 bg-current rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-50">
          <div className="text-[13px] font-normal text-gray-400">
            Showing <span className="text-black font-bold">{sortedProducts.length}</span> Product Families
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-normal text-gray-500">Sort by:</span>
              <select
                className="border-0 bg-transparent text-[13px] font-normal focus:ring-0 cursor-pointer text-black"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option>Featured</option>
                <option>Alphabetically, A-Z</option>
                <option>Alphabetically, Z-A</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Type</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`grid gap-6 ${gridView === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group relative bg-white border border-gray-300 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-[#4567a4]/30 transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="h-64 relative bg-gray-50">
                <Mini3DPreview product={product} />
                <div className="absolute inset-x-0 bottom-0 h-24 " />
              </div>

              <div className="px-6 pb-6 pt-2 flex-1 flex flex-col relative bg-white">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% rounded-full" />
                    <span className="text-[11px] italic   text-gray-400">
                      {product.type.replace('-', ' ')}
                    </span>
                  </div>
                  <h2 className="text-[19px] font-bold text-black group-hover:text-[#da789b] transition-colors leading-tight mb-2">
                    {product.name}
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {product.applications.slice(0, 2).map((app, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-50 text-[11.5px] font-normal text-gray-400 rounded transition-colors group-hover:bg-[#da789b]/10 group-hover:text-black"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50">
                  <div>
                    <div className="text-[11px] text-gray-400 font-normal leading-none mb-1">Starting at</div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm font-bold text-black">$</span>
                      <span className="text-2xl font-bold text-black">
                        {product.basePrice.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <button className="px-4 py-2 bg-black text-white rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#da789b] group-hover:from-0% group-hover:via-[#cb44a8] group-hover:via-20% group-hover:via-[#4567a4] group-hover:via-50% group-hover:to-[#00a1d0] group-hover:to-100% group-hover:text-white shadow-lg shadow-black/10 text-xs font-bold">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


