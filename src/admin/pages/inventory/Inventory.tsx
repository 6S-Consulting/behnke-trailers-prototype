import { useState } from "react";
import { AdminLayout } from "@/admin/components/admin/AdminLayout";
import { DataTable } from "@/admin/components/admin/DataTable";
import { StatusBadge } from "@/admin/components/admin/StatusBadge";
import { InventoryAIInsights } from "@/admin/components/admin/InventoryAIInsights";
import { useAdmin } from "@/admin/context/AdminContext";
import { Product } from "@/data/products";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/admin/components/ui/dialog";
import { Label } from "@/admin/components/ui/label";
import {
  Search,
  AlertTriangle,
  Plus,
  Minus,
  Package,
  Brain,
} from "lucide-react";
import { WarehouseChatbot } from "../warehouse/components/WarehouseChatbot";
import { warehouses as sixesWarehouses } from "@/data/warehouse";

export default function Inventory() {
  const { products, setProducts } = useAdmin();
  const [activeTab, setActiveTab] = useState<"inventory" | "ai-insights">(
    "inventory",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);

  // Get warehouse analytics for chatbot
  // Mock analytics for now as initializer was removed
  const analytics = {
    warehouseStats: sixesWarehouses.map(w => ({ warehouse: w, palletsUsed: 100, utilizationPercent: 50, monthlyCost: 1000 })),
    inventory: products.map(p => ({ sku: p.id, warehouseId: "WH-EAST", onHand: p.stock, available: p.stock, reorderPoint: 10 })),
    alerts: []
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === "out" && product.stock === 0) ||
      (stockFilter === "good" && product.stock > 10);
    return matchesSearch && matchesStock;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return "out-of-stock";
    if (product.stock <= 10) return "low-stock";
    return "in-stock";
  };

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= 10,
  ).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const handleAdjustStock = () => {
    if (adjustProduct && adjustAmount !== 0) {
      setProducts(
        products.map((p) =>
          p.id === adjustProduct.id
            ? {
                ...p,
                stock: Math.max(0, p.stock + adjustAmount),
                inStock: p.stock + adjustAmount > 0,
              }
            : p,
        ),
      );
      setAdjustProduct(null);
      setAdjustAmount(0);
    }
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (product: Product) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-muted flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product: Product) => (
        <span className="text-sm text-muted-foreground">
          {product.category}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Current Stock",
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          {product.stock <= 10 && product.stock > 0 && (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          {product.stock === 0 && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          <span className="font-bold text-lg">{product.stock}</span>
          <span className="text-xs text-muted-foreground">units</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product: Product) => (
        <StatusBadge status={getStockStatus(product)} />
      ),
    },
    {
      key: "actions",
      header: "Adjust",
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setAdjustProduct(product);
              setAdjustAmount(-1);
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setAdjustProduct(product);
              setAdjustAmount(1);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="Inventory"
      subtitle="Monitor and manage stock levels"
      hideAIAssistant={true}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "inventory" ? "default" : "outline"}
          onClick={() => setActiveTab("inventory")}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Stock Management
        </Button>
        <Button
          variant={activeTab === "ai-insights" ? "default" : "outline"}
          onClick={() => setActiveTab("ai-insights")}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Insights
          <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-500 rounded">
            NEW
          </span>
        </Button>
      </div>

      {activeTab === "ai-insights" ? (
        <InventoryAIInsights />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="kpi-card">
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-2xl font-bold">
                {totalStock.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                units across all products
              </p>
            </div>
            <div className="kpi-card">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">in catalog</p>
            </div>
            <div className="kpi-card border-warning/30">
              <p className="text-sm text-warning">Low Stock</p>
              <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground">need restocking</p>
            </div>
            <div className="kpi-card border-destructive/30">
              <p className="text-sm text-destructive">Out of Stock</p>
              <p className="text-2xl font-bold text-destructive">
                {outOfStockCount}
              </p>
              <p className="text-xs text-muted-foreground">unavailable</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={stockFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("all")}
              >
                All
              </Button>
              <Button
                variant={stockFilter === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("low")}
                className="gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Button>
              <Button
                variant={stockFilter === "out" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("out")}
              >
                Out of Stock
              </Button>
              <Button
                variant={stockFilter === "good" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("good")}
              >
                In Stock
              </Button>
            </div>
          </div>

          {/* Inventory Table */}
          <DataTable
            columns={columns}
            data={filteredProducts}
            emptyMessage="No products found"
          />

          {/* Adjust Stock Dialog */}
          <Dialog
            open={!!adjustProduct}
            onOpenChange={() => setAdjustProduct(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Stock</DialogTitle>
              </DialogHeader>
              {adjustProduct && (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{adjustProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current stock: {adjustProduct.stock} units
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adjustAmount">Adjustment Amount</Label>
                    <Input
                      id="adjustAmount"
                      type="number"
                      value={adjustAmount}
                      onChange={(e) =>
                        setAdjustAmount(parseInt(e.target.value) || 0)
                      }
                      placeholder="Enter positive or negative number"
                    />
                    <p className="text-xs text-muted-foreground">
                      New stock will be:{" "}
                      {Math.max(0, adjustProduct.stock + adjustAmount)} units
                    </p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAdjustProduct(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAdjustStock}>Apply Adjustment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Warehouse AI Assistant */}
      <WarehouseChatbot
        warehouseData={{ warehouses: sixesWarehouses }}
        inventoryData={analytics}
      />
    </AdminLayout>
  );
}
