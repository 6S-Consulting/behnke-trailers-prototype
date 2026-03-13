import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { useAdmin } from "@/admin/context/AdminContext";
import { PUMP_CATEGORIES } from "@/data/products";
import { Package, TrendingUp, DollarSign } from "lucide-react";

export default function Categories() {
  const { products } = useAdmin();

  const categoryStats = PUMP_CATEGORIES.map((category) => {
    const categoryProducts = products.filter((p) => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
    const avgPrice =
      categoryProducts.length > 0
        ? categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length
        : 0;
    const activeCount = categoryProducts.filter((p) => p.status === "active").length;

    return {
      name: category,
      productCount: categoryProducts.length,
      activeCount,
      totalStock,
      avgPrice,
    };
  });

  return (
    <AdminLayout
      title="Categories"
      subtitle="Overview of hydraulic pump categories"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryStats.map((cat) => (
          <div
            key={cat.name}
            className="bg-card border border-border rounded-[16px] p-4 hover:border-[#a879c6] hover:shadow-[0_0_15px_rgba(168,121,198,0.1)] transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'linear-gradient(135deg, rgba(86,72,153,0.3), rgba(155,87,150,0.3))' }}
              >
                <Package className="h-5 w-5 text-[#a879c6]" />
              </div>
              <span className="text-xs text-muted-foreground font-medium bg-muted/20 px-2 py-1 rounded-full border border-border/50">
                {cat.activeCount} active
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-3 line-clamp-2">
              {cat.name}
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="font-bold text-lg">{cat.productCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-bold text-lg">{cat.totalStock}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Avg. Price
                </span>
                <span className="font-medium text-[#e5e5e5]">${cat.avgPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 p-6 bg-[#1b2a3a] border border-[#a879c6]/20 rounded-[16px] relative overflow-hidden">
        {/* Decorative gradient blur */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#9b5796]/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <h3 className="font-semibold text-[#e5e5e5] mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#a879c6]" />
          Category Guidelines
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2.5 relative z-10">
          <li className="flex items-start gap-2">
            <span className="text-[#975fc4] mt-1">•</span>
            <span><strong className="text-[#a0b3c2] font-semibold">Industrial Piston Pumps</strong> - Variable and fixed displacement pumps for heavy industrial machinery</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#975fc4] mt-1">•</span>
            <span><strong className="text-[#a0b3c2] font-semibold">Industrial Gear Pumps</strong> - Simple, robust pumps for low-to-medium pressure industrial circuits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#975fc4] mt-1">•</span>
            <span><strong className="text-[#a0b3c2] font-semibold">Mobile Piston Pumps</strong> - High-pressure pumps optimized for construction and agricultural vehicles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#975fc4] mt-1">•</span>
            <span><strong className="text-[#a0b3c2] font-semibold">Mobile Gear Pumps</strong> - Compact pumps for utility and light mobile hydraulic applications</span>
          </li>
        </ul>
      </div>
    </AdminLayout>
  );
}
